"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Search } from "lucide-react";

interface RentSite {
  code: number;
  id: number;
  site_name: string;
  property_location: string;
  monthly_rent: number;
  payment_day: string;
  paid_status: "Pending" | "Delivered" | "Canceled" | string | null;
}

export default function UpcomingRentSitesTable() {
  const [rentSites, setRentSites] = useState<RentSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRentSites = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/rental-dashboard/stats`
        );
        console.log("API Response:", res);
        console.log("API Response Status:", res.status);
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        setRentSites(data.upcomingRentSites || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }

    };

    fetchRentSites();
  }, []);
  const filteredRentSites = useMemo(() => {
    if (!searchTerm) return rentSites;
    return rentSites.filter((site) =>
      site.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.code.toString().includes(searchTerm) ||
      site.property_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.payment_day.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.paid_status && site.paid_status.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [rentSites, searchTerm]);

  return (
    <div className="w-full rounded-lg border shadow-sm border-gray-200 dark:border-gray-700">
      {/* Search Bar */}
      <div className="p-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400 " />
          </div>
          <input
            type="text"
            placeholder="Search by site name, location, payment day, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-100 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs
                        placeholder:text-gray-400 
                        focus:border-gray-400 focus:outline-hidden focus:ring-3 focus:ring-gray-200
                        dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 
                        dark:focus:border-white dark:focus:ring-white/10
                        xl:w-[445px]"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300">
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <Table className="min-w-full text-xs text-gray-600 dark:text-gray-300">
          <TableHeader className="text-xs text-white uppercase bg-[#6F5FE7] tracking-wider sticky top-0 z-10">
            <TableRow>
              <TableCell isHeader className="px-6 py-4 font-bold text-center whitespace-nowrap">Site Code</TableCell>
              <TableCell isHeader className="px-6 py-4 font-bold text-center whitespace-nowrap">Site Name</TableCell>
              <TableCell isHeader className="px-6 py-4 font-bold text-center whitespace-nowrap">Location</TableCell>
              <TableCell isHeader className="px-6 py-4 font-bold text-center whitespace-nowrap">Payment Day</TableCell>
              <TableCell isHeader className="px-6 py-4 font-bold text-center whitespace-nowrap">Status</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-3 text-center">Loading upcoming rent sites...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="py-3 text-center text-red-500">{error}</TableCell>
              </TableRow>
            ) : filteredRentSites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-3 text-center">
                  {searchTerm
                    ? `No rent sites found matching "${searchTerm}".`
                    : "No upcoming rent payments found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredRentSites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="py-2 px-2 text-center">{site.code}</TableCell>
                  <TableCell className="py-2 px-2 text-center">{site.site_name}</TableCell>
                  <TableCell className="py-2 px-2 text-center">{site.property_location}</TableCell>
                  <TableCell className="py-2 px-2 text-center">{site.payment_day}</TableCell>
                  <TableCell className="py-2 px-2 text-center">
                    <Badge
                      size="sm"
                      color={
                        site.paid_status === "Delivered" || site.paid_status === "Paid"
                          ? "success"
                          : site.paid_status === "Pending"
                            ? "error"
                            : "warning"
                      }
                    >
                      {site.paid_status || "N/A"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
