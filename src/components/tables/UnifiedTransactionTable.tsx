"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { Download, Search, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface Transaction {
  id: string;
  category: "Rent" | "Electricity" | "Maintenance";
  siteCode: string;
  siteName: string;
  monthYear: string;
  paymentDate: string;
  amount: number;
  status: string;
  reference: string;
  description: string;
}

interface Props {
  title: string;
  filterStatus?: string;
}

export default function UnifiedTransactionTable({ title, filterStatus }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const fetchCategory = async (path: string, categoryName: string) => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, { headers });
          if (!res.ok) {
            console.error(`❌ ${categoryName} Fetch failed: Path ${path}, Status ${res.status}`);
            return [];
          }
          const text = await res.text();
          if (!text) return [];

          try {
            const json = JSON.parse(text);
            console.log(`✅ [UnifiedTable] ${categoryName} Response Data:`, json);
            // Handle various backend response formats (data, rentPayments, transactions, etc.)
            return json.data || json.rentPayments || json.transactions || (Array.isArray(json) ? json : []);
          } catch (e) {
            console.error(`❌ ${categoryName} JSON Parse error. Response was not valid JSON.`);
            return [];
          }
        } catch (error) {
          console.error(`❌ ${categoryName} Network error:`, error);
          return [];
        }
      };

      // Fetch all three types
      const [rentRaw, elecRaw, maintRaw] = await Promise.all([
        fetchCategory("/api/rent/rentTransactions/site/all", "Rent"),
        fetchCategory("/api/rent/electricityTransactions/site/all", "Electricity"),
        fetchCategory("/api/rent/maintenanceTransactions/site/all", "Maintenance"),
      ]);

      const rentData = rentRaw.map((t: any) => ({
        id: t._id || t.id,
        category: "Rent",
        siteCode: t.siteId?.code || t.siteCode || "-",
        siteName: t.siteId?.siteName || t.siteName || "-",
        monthYear: t.monthYear || "-",
        paymentDate: t.paymentDate || "",
        amount: Number(t.paymentAmount) || 0,
        status: t.paidStatus || "Pending",
        reference: t.utrNumber || t.utr_number || "-",
        description: "Monthly Rent",
      }));

      const elecData = elecRaw.map((t: any) => ({
        id: t._id || t.id,
        category: "Electricity",
        siteCode: t.siteId?.code || "-",
        siteName: t.siteId?.siteName || "-",
        monthYear: t.monthYear || "-",
        paymentDate: t.paymentDate || "",
        amount: Number(t.paymentAmount) || 0,
        status: t.paidStatus || "Pending",
        reference: t.utrNumber || t.utr_number || "-",
        description: `Units: ${t.units || t.Units || 0}`,
      }));

      const maintData = maintRaw.map((t: any) => ({
        id: t._id || t.id,
        category: "Maintenance",
        siteCode: t.siteId?.code || "-",
        siteName: t.siteId?.siteName || "-",
        monthYear: t.monthYear || "-",
        paymentDate: t.paymentDate || "",
        amount: Number(t.paymentAmount) || 0,
        status: t.paidStatus || "Pending",
        reference: t.utrNumber || t.utr_number || "-",
        description: t.maintenanceDescription || "Maintenance Charges",
      }));

      let combined = [...rentData, ...elecData, ...maintData];
      console.log(`📊 [UnifiedTable] Combined Raw Records (${title}):`, combined.length);

      // Apply initial status filter if provided (e.g. from Dashboard click)
      if (filterStatus) {
        console.log(`🔍 [UnifiedTable] Filtering by status: ${filterStatus}`);
        combined = combined.filter(t => t.status.toLowerCase() === filterStatus.toLowerCase());
        console.log(`🔍 [UnifiedTable] Records after filtering:`, combined.length);
      }

      const sorted = combined.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
      console.log(`✨ [UnifiedTable] Final Sorted Data for ${title}:`, sorted);
      setData(sorted);
    } catch (error) {
      console.error("Error fetching unified transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const filteredData = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return data.filter(t =>
      t.siteName.toLowerCase().includes(search) ||
      t.siteCode.toLowerCase().includes(search) ||
      t.category.toLowerCase().includes(search) ||
      t.reference.toLowerCase().includes(search) ||
      t.monthYear.toLowerCase().includes(search)
    );
  }, [data, searchTerm]);

  const handleExport = () => {
    toast.success("Excel generation started...");
    // Since we don't have a global excel API, we guide users to the specific module ledgers 
    // or we could implement a basic CSV export here.
    // For now, I'll implement a basic client-side CSV download to satisfy the "Excel" request.
    const headers = ["Category", "Site Code", "Site Name", "Month/Year", "Date", "Amount", "Status", "Reference", "Description"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(t => [
        t.category,
        t.siteCode,
        `"${t.siteName.replace(/"/g, '""')}"`,
        t.monthYear,
        t.paymentDate ? new Date(t.paymentDate).toLocaleDateString() : "-",
        t.amount,
        t.status,
        t.reference,
        `"${t.description.replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Excel Style Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-white/[0.03] p-4 rounded-xl border border-gray-200 dark:border-white/[0.08]">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{title}</h1>
          <p className="text-xs text-gray-500 font-bold uppercase mt-1">Cross-Category Transaction Ledger</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Filter transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
          >
            <FileSpreadsheet size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Excel Style Table */}
      <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[70vh] scrollbar-thin">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-[#1A1A1A] border-b-2 border-gray-200 dark:border-white/10">
              <TableRow>
                <TableCell className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 px-6">Category</TableCell>
                <TableCell className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 px-6">Site Code</TableCell>
                <TableCell className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 px-6">Site Name</TableCell>
                <TableCell className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 px-6 text-center">Month/Year</TableCell>
                <TableCell className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 px-6 text-center">Date</TableCell>
                <TableCell className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 px-6 text-right">Amount</TableCell>
                <TableCell className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 px-6 text-center">Status</TableCell>
                <TableCell className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 px-6">Reference</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-indigo-500" size={32} />
                      <span className="text-xs font-bold uppercase text-gray-400 tracking-widest">Aggregating Global Records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-20 text-center">
                    <p className="text-xs font-bold uppercase text-gray-400 tracking-widest">No matching transactions found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((t) => (
                  <TableRow key={`${t.category}-${t.id}`} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${t.category === 'Rent' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800' :
                        t.category === 'Electricity' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800' :
                          'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800'
                        }`}>
                        {t.category}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400 font-bold">{t.siteCode}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{t.siteName}</span>
                        <span className="text-[10px] text-gray-400 mt-1 italic leading-none">{t.description}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tighter">{t.monthYear}</TableCell>
                    <TableCell className="px-6 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
                      {t.paymentDate ? new Date(t.paymentDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        ₹{t.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <Badge
                        size="sm"
                        color={t.status.toLowerCase() === 'paid' ? 'success' : t.status.toLowerCase() === 'pending' ? 'warning' : 'error'}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-mono text-[10px] text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
                      {t.reference}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info */}
        {!loading && (
          <div className="bg-gray-50 dark:bg-white/[0.02] px-6 py-3 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Total Records: {filteredData.length}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Total Sum: ₹{filteredData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
