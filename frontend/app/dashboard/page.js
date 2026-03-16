import BackendStatus from "@/Components/BackendStatus";
import BridgeForm from "@/Components/BridgeForm";
import BridgeStatusTracker from "@/Components/BridgeStatusTracker";
import DepositForm from "@/Components/DepositForm";
import PositionCard from "@/Components/PositionCard";
import TxStatusList from "@/Components/TxStatusList";
import VaultStats from "@/Components/VaultStats";
import WalletConnect from "@/Components/WalletConnect";
import WithdrawForm from "@/Components/WithdrawForm";

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
      <BridgeStatusTracker />
      <TxStatusList />
      <BackendStatus />
    </main>
  );
}
