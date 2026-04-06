"use client";

import UnifiedTransactionTable from "@/components/tables/UnifiedTransactionTable";

export default function TotalPaidPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <UnifiedTransactionTable title="Total Paid MASTER LEDGER" filterStatus="paid" />
    </div>
  );
}
