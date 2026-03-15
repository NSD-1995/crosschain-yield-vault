const db = require("../db");
const logger = require("../logger");
const config = require("../config");
const {
  provider,
  vaultRead,
  bridgeSender,
  bridgeReceiver,
} = require("../Contract");

async function getCursor(chainName) {
  const result = await db.query(
    "SELECT last_processed_block FROM chain_cursors WHERE chain_name = $1",
    [chainName],
  );

  if (result.rows.length === 0) {
    await db.query(
      "INSERT INTO chain_cursors(chain_name, last_processed_block) VALUES($1, $2)",
      [chainName, 0],
    );
    return 0;
  }

  return Number(result.rows[0].last_processed_block);
}

async function setCursor(chainName, blockNumber) {
  await db.query(
    `INSERT INTO chain_cursors(chain_name, last_processed_block)
     VALUES($1, $2)
     ON CONFLICT(chain_name)
     DO UPDATE SET last_processed_block = EXCLUDED.last_processed_block`,
    [chainName, blockNumber],
  );
}

function makeEventId(log) {
  return `${log.transactionHash}-${log.index}`;
}

async function saveEvent(chainName, contractAddress, eventName, log, payload) {
  const eventId = makeEventId(log);

  await db.query(
    `INSERT INTO processed_events
    (event_id, chain_name, contract_address, tx_hash, log_index, block_number, block_hash, event_name, payload)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT(event_id) DO NOTHING`,
    [
      eventId,
      chainName,
      contractAddress,
      log.transactionHash,
      log.index,
      log.blockNumber,
      log.blockHash,
      eventName,
      payload,
    ],
  );
}

async function updateVaultStats() {
  const totalAssets = await vaultRead.totalAssets();
  const totalSupply = await vaultRead.totalSupply();

  await db.query(
    `INSERT INTO vault_stats(tvl, total_shares, apy)
     VALUES($1,$2,$3)`,
    [totalAssets.toString(), totalSupply.toString(), 12.5],
  );
}

async function updateUserPosition(address, assetDelta, shareDelta) {
  await db.query(
    `
    INSERT INTO user_positions(user_address, asset_balance, share_balance)
    VALUES($1, $2, $3)
    ON CONFLICT(user_address)
    DO UPDATE SET
      asset_balance = user_positions.asset_balance + EXCLUDED.asset_balance,
      share_balance = user_positions.share_balance + EXCLUDED.share_balance,
      updated_at = NOW()
    `,
    [address.toLowerCase(), assetDelta, shareDelta],
  );
}

async function processVaultDeposit(log) {
  const parsed = vaultRead.interface.parseLog(log);
  const owner = parsed.args.owner.toLowerCase();
  const assets = parsed.args.assets.toString();
  const shares = parsed.args.shares.toString();

  await saveEvent("local", await vaultRead.getAddress(), "Deposit", log, {
    owner,
    assets,
    shares,
  });

  await db.query(
    `INSERT INTO transactions(user_address, tx_hash, type, amount, chain_name, metadata)
     VALUES($1,$2,$3,$4,$5,$6)`,
    [
      owner,
      log.transactionHash,
      "deposit",
      assets,
      "local",
      JSON.stringify({ shares }),
    ],
  );

  await updateUserPosition(owner, assets, shares);
  await updateVaultStats();
}

async function processVaultWithdraw(log) {
  const parsed = vaultRead.interface.parseLog(log);
  const owner = parsed.args.owner.toLowerCase();
  const assets = parsed.args.assets.toString();
  const shares = parsed.args.shares.toString();

  await saveEvent("local", await vaultRead.getAddress(), "Withdraw", log, {
    owner,
    assets,
    shares,
  });

  await db.query(
    `INSERT INTO transactions(user_address, tx_hash, type, amount, chain_name, metadata)
     VALUES($1,$2,$3,$4,$5,$6)`,
    [
      owner,
      log.transactionHash,
      "withdraw",
      assets,
      "local",
      JSON.stringify({ shares }),
    ],
  );

  await updateUserPosition(owner, `-${assets}`, `-${shares}`);
  await updateVaultStats();
}

async function processBridgeInitiated(log) {
  const parsed = bridgeSender.interface.parseLog(log);
  const user = parsed.args.user.toLowerCase();
  const amount = parsed.args.amount.toString();
  const nonce = parsed.args.nonce.toString();

  await saveEvent(
    "local",
    await bridgeSender.getAddress(),
    "BridgeInitiated",
    log,
    {
      user,
      amount,
      nonce,
    },
  );

  await db.query(
    `INSERT INTO bridge_status(tx_hash, user_address, amount, nonce, status, source_chain, destination_chain)
     VALUES($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT(tx_hash) DO NOTHING`,
    [
      log.transactionHash,
      user,
      amount,
      nonce,
      "initiated",
      "sepolia",
      "arbitrum-sepolia",
    ],
  );
}

async function processBridgeCompleted(log) {
  const parsed = bridgeReceiver.interface.parseLog(log);
  const user = parsed.args.user.toLowerCase();
  const amount = parsed.args.amount.toString();
  const nonce = parsed.args.nonce.toString();

  await saveEvent(
    "local",
    await bridgeReceiver.getAddress(),
    "BridgeCompleted",
    log,
    {
      user,
      amount,
      nonce,
    },
  );

  await db.query(
    `UPDATE bridge_status
     SET status = 'completed', updated_at = NOW()
     WHERE nonce = $1`,
    [nonce],
  );
}

async function poll() {
  const latest = await provider.getBlockNumber();
  const safeLatest = latest - config.confirmations;
  if (safeLatest < 0) return;

  let fromBlock = await getCursor("local");
  if (fromBlock === 0) fromBlock = safeLatest > 50 ? safeLatest - 50 : 0;

  const toBlock = safeLatest;
  if (fromBlock > toBlock) return;

  logger.info({ fromBlock, toBlock }, "Polling logs");

  const vaultAddress = await vaultRead.getAddress();
  const senderAddress = await bridgeSender.getAddress();
  const receiverAddress = await bridgeReceiver.getAddress();

  const depositTopic = vaultRead.interface.getEvent("Deposit").topicHash;
  const withdrawTopic = vaultRead.interface.getEvent("Withdraw").topicHash;
  const bridgeInitiatedTopic =
    bridgeSender.interface.getEvent("BridgeInitiated").topicHash;
  const bridgeCompletedTopic =
    bridgeReceiver.interface.getEvent("BridgeCompleted").topicHash;

  const logs = await provider.getLogs({
    fromBlock,
    toBlock,
    address: [vaultAddress, senderAddress, receiverAddress],
  });

  for (const log of logs) {
    try {
      if (log.topics[0] === depositTopic) await processVaultDeposit(log);
      else if (log.topics[0] === withdrawTopic) await processVaultWithdraw(log);
      else if (log.topics[0] === bridgeInitiatedTopic)
        await processBridgeInitiated(log);
      else if (log.topics[0] === bridgeCompletedTopic)
        await processBridgeCompleted(log);
    } catch (err) {
      logger.error({ err, tx: log.transactionHash }, "Failed processing log");
    }
  }

  await setCursor("local", toBlock + 1);
}

function startIndexer() {
  setInterval(async () => {
    try {
      await poll();
    } catch (err) {
      logger.error({ err }, "Indexer loop failed");
    }
  }, config.pollMs);
}

module.exports = { startIndexer };
