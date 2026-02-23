"use client";
import React, { useEffect, useState } from "react";
import { BoxIconLine, GroupIcon, } from "@/icons";
import { ReceiptCentIcon } from "lucide-react";

export const EcommerceMetrics = () => {
  const [stats, setStats] = useState<{
    totalSites: number;
    upcomingRentSitesCount: number;
    totalPaidRentSites?: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats?daysAhead=10`);
        const data = await res.json();
        setStats({
          totalSites: data.totalSites,
          upcomingRentSitesCount: data.upcomingRentSitesCount,
          totalPaidRentSites: data.totalPaidRentSites,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const MetricCard = ({
    icon: Icon,
    title,
    value,
    description,
    gradient,
    iconBg
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    description: string;
    gradient: string;
    iconBg: string;
  }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm border border-gray-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 dark:bg-[#121212]/50 dark:border-gray-800/70">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient}`} />

      {/* Content */}
      <div className="relative">
        {/* Icon container */}
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2 transition-transform duration-300 group-hover:scale-110 ${iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Metrics */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <div className="flex items-baseline space-x-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? (
                <div className="flex items-center space-x-1">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
                  <div className="w-10 h-6 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
                </div>
              ) : (
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                  {value.toLocaleString()}
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full opacity-20 group-hover:opacity-60 transition-opacity duration-300 ${gradient.split(' ')[1]}`} />
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div onClick={() => window.location.href = "/basic-tables"} className="cursor-pointer">
          <MetricCard
            icon={GroupIcon}
            title="Total Sites"
            value={stats?.totalSites ?? 0}
            description="Active rental sites"
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25 shadow-lg"
          />
        </div>

        <div onClick={() => window.location.href = "/blank"} className="cursor-pointer">
          <MetricCard
            icon={BoxIconLine}
            title="Upcoming Payments"
            value={stats?.upcomingRentSitesCount ?? 0}
            description="Sites with rent due (Monthly)"
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25 shadow-lg"
          />
        </div>

        {/* <div onClick={() => window.location.href = "/basic-tables"} className="cursor-pointer"> */}
        <MetricCard
          icon={ReceiptCentIcon}
          title="Total Paid Rent Sites"
          value={stats?.totalPaidRentSites ?? 0}
          description="Sites with rent paid (Monthly)"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25 shadow-lg"
        />
        <div onClick={() => window.location.href = "/electricity"} className="cursor-pointer">
          <MetricCard
            icon={ReceiptCentIcon}
            title="Electricity Bill's"
            value={stats?.totalPaidRentSites ?? 0}
            description="Sites with rent paid (Monthly)"
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25 shadow-lg" />
        </div>
        {/* </div> */}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-[#121212]/50 backdrop-blur-sm rounded-3xl flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Loading metrics...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
