"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DashboardMenuCards from "@/components/DashboardMenuCards";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";

export default function EcommerceClient() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
    }
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* ── Menu Cards ── */}
      <DashboardMenuCards />

      {/* ── Two-column layout: Upcoming Rent's (left) + Summary (right) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Left: Upcoming Rent's table */}
        <div className="min-w-0">
          <h2 className="text-base font-semibold mb-3 text-gray-800 dark:text-white/90">
            Upcoming Rent&apos;s
          </h2>
          <RecentOrders />
        </div>

        {/* Right: Summary chart */}
        <div className="min-w-0">
          <h2 className="text-base font-semibold mb-3 text-gray-800 dark:text-white/90">
            Summary
          </h2>
          <StatisticsChart />
        </div>
      </div>
    </div>
  );
}