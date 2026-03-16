import Link from "next/link";

export default function Page() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Cross-Chain Yield Vault</h1>

      <p className="text-gray-600">
        Production-style DeFi dashboard prototype.
      </p>

      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="rounded-xl border px-4 py-2 hover:bg-gray-50"
        >
          User Dashboard
        </Link>

        <Link
          href="/admin"
          className="rounded-xl border px-4 py-2 hover:bg-gray-50"
        >
          Admin Dashboard
        </Link>
      </div>
    </main>
  );
}
