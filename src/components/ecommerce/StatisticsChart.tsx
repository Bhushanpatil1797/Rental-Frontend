/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import dynamic from "next/dynamic";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Define interfaces for API response data
interface TransactionSummary {
  total_count: number;
  total_amount: number;
  daily: DailyData[];
  weekly: WeeklyData[];
  monthly: MonthlyData[];
  yearly: YearlyData[];
}

interface DailyData {
  date: string;
  count: number;
  total_amount: number;
}

interface WeeklyData {
  week: string;
  count: number;
  total_amount: number;
}

interface MonthlyData {
  month: string;
  count: number;
  total_amount: number;
}

interface YearlyData {
  year: string;
  count: number;
  total_amount: number;
}

export default function StatisticsChart() {
  const [summaryData, setSummaryData] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/rent/summary`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        console.log("API Response:", response);

        console.log("API Response Status:", response.status);

        if (!response.ok) {
          if (response.status === 401) {
            setError("Unauthorized. Please login again.");
          } else {
            setError("Failed to load data. Please try again later.");
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setSummaryData(data);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data based on the selected timeframe
  const getChartData = () => {
    if (!summaryData) return { categories: [], countData: [], amountData: [] };

    let categories: string[] = [];
    let countData: number[] = [];
    let amountData: number[] = [];

    switch (timeFrame) {
      case 'daily':
        const sortedDaily = [...summaryData.daily].sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        categories = sortedDaily.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        countData = sortedDaily.map(item => item.count);
        amountData = sortedDaily.map(item => item.total_amount); // <-- full amount
        break;
      case 'weekly':
        const sortedWeekly = [...summaryData.weekly].sort((a, b) => a.week.localeCompare(b.week));
        categories = sortedWeekly.map(item => {
          const [year, week] = item.week.split('-W');
          return `W${week}`;
        });
        countData = sortedWeekly.map(item => item.count);
        amountData = sortedWeekly.map(item => item.total_amount); // <-- full amount
        break;
      case 'yearly':
        const sortedYearly = [...summaryData.yearly].sort((a, b) => a.year.localeCompare(b.year));
        categories = sortedYearly.map(item => item.year);
        countData = sortedYearly.map(item => item.count);
        amountData = sortedYearly.map(item => item.total_amount); // <-- full amount
        break;
      case 'monthly':
      default:
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const monthDataMap = new Map();
        summaryData.monthly.forEach(item => {
          const [year, month] = item.month.split('-');
          const monthIndex = parseInt(month) - 1;
          monthDataMap.set(monthIndex, item);
        });
        categories = monthNames;
        countData = monthNames.map((_, idx) => {
          const monthData = monthDataMap.get(idx);
          return monthData ? monthData.count : 0;
        });
        amountData = monthNames.map((_, idx) => {
          const monthData = monthDataMap.get(idx);
          return monthData ? monthData.total_amount : 0;
        });
        break;
    }
    return { categories, countData, amountData };
  };

  const { categories, countData, amountData } = getChartData();

  // Chart options
  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "bar",
      toolbar: {
        show: false,
      },
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
      },
    },
    colors: ["#465FFF", "#9CB9FF"],
    dataLabels: {
      enabled: false,
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      y: {
        formatter: function (val, opts) {
          if (opts.seriesIndex === 1) {
            return `₹${val}`;
          }
          return val.toString();
        }
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: [
      {
        seriesName: 'Transaction Count',
        title: {
          text: "Count",
          style: {
            fontSize: '12px',
            fontWeight: 400,
          }
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: ["#6B7280"],
          },
        },
      },
      {
        seriesName: 'Total Paid Amount',
        opposite: true,
        title: {
          text: "Paid Amount (₹)", // <-- full amount, no k
          style: {
            fontSize: '12px',
            fontWeight: 400,
          }
        },
        labels: {
          style: {
            fontSize: "12px",
            colors: ["#6B7280"],
          },
          formatter: function (val) {
            return `₹${val}`; // <-- full amount, no k
          }
        },
      },
    ],
  };

  const series = [
    {
      name: "Transaction Count",
      data: countData,
      type: "column",
    },
    {
      name: "Total Paid Amount (₹)",
      data: amountData,
      type: "column",
    },
  ];

  const handleTimeFrameChange = (newTimeFrame: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setTimeFrame(newTimeFrame);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03] ">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            Transaction Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            {summaryData && `Total: ${summaryData.total_count} transactions | ₹${summaryData.total_amount} Total Amount`}
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab onTabChange={handleTimeFrameChange} />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {loading ? (
            <div className="flex justify-center items-center h-[310px]">
              <p>Loading transaction data...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-[310px]">
              <p className="text-red-500">{error}</p>
            </div>
          ) : summaryData ? (
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={310}
            />
          ) : (
            <div className="flex justify-center items-center h-[310px]">
              <p>No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}