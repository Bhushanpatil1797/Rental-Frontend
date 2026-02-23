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
    <div className="flex flex-col gap-6">
          
          <div>
            <DashboardMenuCards />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white/90">
              Summary
            </h2>
            <StatisticsChart />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white/90">
              Upcoming Rent&apos;s
            </h2>
            <RecentOrders />
          </div>
    </div>
  );
}