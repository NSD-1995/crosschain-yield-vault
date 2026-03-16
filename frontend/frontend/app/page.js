import WalletConnect from "../Components/WalletConnect";
import VaultStats from "../Components/VaultStats";
import PositionCard from "../Components/PositionCard";
import DepositForm from "../Components/DepositForm";
import WithdrawForm from "../Components/WithdrawForm";
import BridgeForm from "../Components/BridgeForm";
import TxStatusList from "../Components/TxStatusList";

export default function DashboardPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">User Dashboard</h1>

      <WalletConnect />
      <VaultStats />
      <PositionCard />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DepositForm />
        <WithdrawForm />
      </div>

      <BridgeForm />
      <TxStatusList />
    </main>
  );
}
