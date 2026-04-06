import React from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import MaintenanceTransactionsTable from "@/components/tables/MaintenanceTransactions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance History | Rent & Electricity Management",
  description: "Comprehensive history of all maintenance upkeep and repair transactions across all sites.",
};

export default function MaintenanceTransactionsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50/50 dark:bg-[#09090b] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <PageBreadCrumb pageTitle="Maintenance History" />
          <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mt-1">Transaction Ledger</h1>
        </div>
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center sm:text-right mb-0.5 opacity-70 italic">Accounting View</p>
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 text-center sm:text-right">Monitoring site upkeep & repair expenses</p>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <MaintenanceTransactionsTable />
      </div>
    </div>
  );
}
