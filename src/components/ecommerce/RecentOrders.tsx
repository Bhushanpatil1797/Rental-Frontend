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
  id: string; // Updated to string for siteId
  siteName: string;
  location: string;
  monthlyRent: number;
  paymentDay: string;
  status: "pending" | "paid" | "partial" | string;
}

export default function UpcomingRentSitesTable() {
  const [rentSites, setRentSites] = useState<RentSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchRentSites = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/rent/dashboard/upcoming-rents`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();
        console.log("Upcoming Rents Response:", data);
        if (data.success) {
          setRentSites(data.data || []);
          setSummary(data.summary);
        }
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
      site.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.code.toString().includes(searchTerm) ||
      site.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.paymentDay.toString().includes(searchTerm.toLowerCase()) ||
      (site.status && site.status.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [rentSites, searchTerm]);

  return (
    <div className="w-full rounded-2xl border shadow-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] overflow-hidden">
      {/* Summary Section */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{summary?.total ?? 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Paid</span>
            <span className="text-lg font-bold text-emerald-600">{summary?.paid ?? 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-amber-500 uppercase tracking-wider">Pending</span>
            <span className="text-lg font-bold text-amber-600">{summary?.pending ?? 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-purple-500 uppercase tracking-wider">Partial</span>
            <span className="text-lg font-bold text-purple-600">{summary?.partial ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4">
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
                    ? `No rent sites found matching ${searchTerm}.`
                    : "No upcoming rent payments found."}
                </TableCell>
              </TableRow>
            ) : (
              filteredRentSites.map((site) => (
                <TableRow key={`${site.id}-${site.code}`}>
                  <TableCell className="py-2 px-2 text-center">{site.code}</TableCell>
                  <TableCell className="py-2 px-2 text-center">{site.siteName}</TableCell>
                  <TableCell className="py-2 px-2 text-center">{site.location}</TableCell>
                  <TableCell className="py-2 px-2 text-center">{site.paymentDay}</TableCell>
                  <TableCell className="py-2 px-2 text-center">
                    <Badge
                      size="sm"
                      color={
                        site.status === "paid"
                          ? "success"
                          : site.status === "pending"
                            ? "error"
                            : "warning"
                      }
                    >
                      {site.status || "N/A"}
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
