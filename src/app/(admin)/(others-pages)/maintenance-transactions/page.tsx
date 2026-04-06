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
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 bg-gray-50/50 dark:bg-[#09090b] min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/[0.05] pb-4">
        <div>
          <PageBreadCrumb pageTitle="All Sites" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-1">Maintenance History</h1>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <MaintenanceTransactionsTable />
      </div>
    </div>
  );
}
