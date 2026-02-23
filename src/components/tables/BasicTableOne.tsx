"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface Owner {
  id: number;
  owner_name: string;
  owner_details: string;
  owner_monthly_rent: number;
}

interface Site {
  paid_status: string; // Changed from 'any' to 'string'
  manage_by: ReactNode;
  id: number;
  code: string;
  site_name: string;
  property_type: string;
  property_location: string;
  tenant_name: string;
  monthly_rent: number;
  status: string;
  owners: Owner[];
}

export default function BasicTableOne() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sites`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSites(Array.isArray(data.sites) ? data.sites : []);

        setError(null);
      } catch (error) {
        console.error("Error fetching sites:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch sites"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  const filteredSites = sites
    .filter((site) => {
      const searchString = searchTerm.toLowerCase();
      return (
        (site.code?.toLowerCase() ?? '').includes(searchString) ||
        (site.site_name?.toLowerCase() ?? '').includes(searchString) ||
        (site.property_type?.toLowerCase() ?? '').includes(searchString) ||
        (site.property_location?.toLowerCase() ?? '').includes(searchString) ||
        (site.tenant_name?.toLowerCase() ?? '').includes(searchString) ||
        (site.status?.toLowerCase() ?? '').includes(searchString)
      );
    })
    .sort((a, b) => (a.code ?? "").localeCompare(b.code ?? ""))
// Sort by site code in ascending order

  const navigateToSite = (siteId: number) => {
    router.push(`/sites/${siteId}`);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-2">
      {/* Search bar with sticky positioning */}
      <div className="flex items-center px-1 sticky top-0 z-20   py-1 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search sites..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-3 py-1.5 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white"
        />
      </div>

      {/* Table container with fixed height for scrolling */}
      <div className="relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Fixed Header */}
                  <TableHeader className="sticky top-0 z-10 bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-700">
                    <TableRow>
                      {[
                        { width: "w-16", label: "Sr No." },
                        { width: "w-24", label: "Site Code" },
                        { width: "w-40", label: "Site Name" },
                        // { width: "w-32", label: "Property Type" },
                        { width: "w-40", label: "Location" },
                        { width: "w-32", label: "Owner" },
                        // { width: "w-32", label: "Monthly Rent" },
                        { width: "w-24", label: "Status" },
                        { width: "w-24", label: "Action" }
                      ].map(({ width, label }) => (
                        <TableCell
                          key={label}
                          className={`${width} px-6 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap bg-gray-50 dark:bg-[#4f46e5]`}
                        >
                          {label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>

                  {/* Scrollable Body */}
                  <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSites.map((site, index) => (
                      <TableRow
                        key={site.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <TableCell className="w-16 px-6 py-4 text-gray-900 dark:text-gray-100">{index + 1}</TableCell>
                        <TableCell className="w-24 px-6 py-4 text-gray-900 dark:text-gray-100">{site.code}</TableCell>
                        <TableCell className="w-40 px-6 py-4 text-gray-900 dark:text-gray-100">{site.site_name}</TableCell>
                        {/* <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100">{site.property_type}</TableCell> */}
                        <TableCell className="w-40 px-6 py-4 text-gray-900 dark:text-gray-100">{site.property_location}</TableCell>
                        <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100">
                          {typeof site.manage_by === "string"
                            ? site.manage_by
                            : site.manage_by ?? "N/A"}
                        </TableCell>
                        {/* <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100">
                          ₹{site.monthly_rent.toLocaleString()}
                        </TableCell> */}
                        <TableCell className="w-24 px-6 py-4 text-gray-900 dark:text-gray-100">
                          <Badge
                            size="sm"
                            color={
                              site.paid_status?.toLowerCase() === "paid"
                                ? "success"
                                : site.paid_status?.toLowerCase() === "pending"
                                  ? "warning"
                                  : "error"
                            }
                          >
                            {site.paid_status ?? "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-24 px-6 py-4 text-gray-900 dark:text-gray-100">
                          <button
                            onClick={() => navigateToSite(site.id)}
                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            View
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        {filteredSites.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No results found for &quot;{searchTerm}&quot;
          </div>
        )}
      </div>
    </div>
  );
}