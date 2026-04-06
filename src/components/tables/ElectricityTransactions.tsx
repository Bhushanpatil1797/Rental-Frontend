/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */

"use client";

import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const SiteOwnerCell = ({ siteId }: { siteId?: string }) => {
    const [ownerName, setOwnerName] = React.useState<string>("...");

    React.useEffect(() => {
        if (!siteId) { setOwnerName("-"); return; }
        const fetchOwner = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rent/sites/${siteId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error();
                const json = await res.json();
                console.log(`Fetched site ${siteId} for owner name (Elec):`, json);
                const siteData = json.data || json;
                if (siteData.owners && siteData.owners.length > 0) {
                    const names = siteData.owners.map((o: any) => o.ownerId?.ownerName || "Unknown").join(", ");
                    setOwnerName(names);
                } else {
                    setOwnerName("-");
                }
            } catch (err) {
                console.error(`Error fetching owner for site ${siteId} (Elec):`, err);
                setOwnerName("-");
            }
        };
        fetchOwner();
    }, [siteId]);

    return <span>{ownerName}</span>;
};

interface ElectricityTransaction {
    image: any;
    transactionId: string;
    id: string;
    _id: string;
    siteId: any | null;
    ownerId?: any | null;
    monthYear: string;
    paymentDate: string;
    paymentAmount: string;
    paidStatus: string;
    paymentType: string;
    utrNumber: string;
    units: string;
    electricityCharges: string;
    electricityConsumerNo: string;
    monthly_amount?: number;
    ownerName?: string;
}


interface FilterParams {
    site_id?: string;
    owner_name?: string;
    paid_status?: string;
    start_date?: string;
    end_date?: string;
    payment_type?: string;
    payment_amount?: string;
    utr_number?: string;
}

export default function ElectricityTransactionsTable() {
    const [transactions, setTransactions] = useState<ElectricityTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<FilterParams>({});
    const [totalCount, setTotalCount] = useState(0);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<ElectricityTransaction | null>(null);
    const [updateFormData, setUpdateFormData] = useState({
        monthly_amount: "",
        payment_type: "",
        paid_status: "",
        payment_date: "",
        payment_amount: "",
        utr_number: "",
        month_year: ""
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<"excel" | "pdf">("excel");

    useEffect(() => {
        fetchElectricityTransactions();
    }, [filters]);

    // Effect to resolve owner names batch-wise for searchability
    useEffect(() => {
        const resolveOwners = async () => {
            // Find transactions needing owner resolution
            const needingResolution = transactions.filter(t => 
                t.siteId?._id && (!t.ownerName || t.ownerName === "-" || t.ownerName === "...")
            );
            
            if (needingResolution.length === 0) return;
            
            const uniqueSiteIds = Array.from(new Set(needingResolution.map(t => {
                // siteId can be object or string
                return typeof t.siteId === 'object' ? t.siteId?._id : t.siteId;
            }).filter(Boolean)));
            
            const token = localStorage.getItem("token");
            const ownerMap: Record<string, string> = {};
            
            await Promise.all(uniqueSiteIds.map(async (sid) => {
                if (!sid) return;
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rent/sites/${sid}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const json = await res.json();
                        const siteData = json.data || json;
                        if (siteData.owners && siteData.owners.length > 0) {
                            const names = siteData.owners.map((o: any) => 
                                o.ownerId?.ownerName || o.ownerName || (typeof o.ownerId === 'string' ? o.ownerId : "Unknown")
                            ).join(", ");
                            ownerMap[sid] = names;
                        } else {
                            ownerMap[sid] = "-";
                        }
                    }
                } catch (e) {
                    console.error(`Error resolving owners for site ${sid}:`, e);
                }
            }));
            
            if (Object.keys(ownerMap).length > 0) {
                setTransactions(prev => prev.map(t => {
                    const sid = typeof t.siteId === 'object' ? t.siteId?._id : t.siteId;
                    if (sid && ownerMap[sid]) {
                        return { ...t, ownerName: ownerMap[sid] };
                    }
                    return t;
                }));
            }
        };

        if (!loading && transactions.length > 0) {
            resolveOwners();
        }
    }, [transactions.length, loading]);

    const fetchElectricityTransactions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found");

            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const url = `${process.env.NEXT_PUBLIC_API_URL}/api/rent/electricityTransactions/site/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            console.log("Fetching electricity transactions from:", url);

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Electricity Transactions API Response Status:", response.status);

            if (!response.ok) {
                console.error("Electricity Transactions Error Response:", response);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();
            console.log("Electricity Transactions Data:", json);

            // Support both { data: [...] } and plain array responses
            const dataArray = json.data || (Array.isArray(json) ? json : (json?.data || []));
            const normalizedTransactions = dataArray.map((t: any) => ({
                ...t,
                id: t._id || t.id,
                ownerName: t.siteId?.ownerName || t.ownerName || "-",
                electricityConsumerNo: t.electricityConsumerId?.consumerNo || t.electricityConsumerNo || '-',
            }));

            setTransactions(normalizedTransactions);
            setTotalCount(json.total || normalizedTransactions.length);
            setError(null);
        } catch (error) {
            console.error("Error fetching electricity transactions:", error);
            setError(
                error instanceof Error ? error.message : "Failed to fetch electricity transactions"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterKey: keyof FilterParams, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
    };

    const filteredTransactions = transactions
        .filter((item) => {
            const searchString = searchTerm.toLowerCase();
            return (
                (item.siteId?.siteName?.toLowerCase() || "").includes(searchString) ||
                (item.siteId?.code?.toLowerCase() || "").includes(searchString) ||
                (item.ownerName?.toLowerCase() || "").includes(searchString) ||
                (item.paymentType?.toLowerCase() || "").includes(searchString) ||
                (item.paidStatus?.toLowerCase() || "").includes(searchString) ||
                (item.utrNumber?.toLowerCase() || "").includes(searchString) ||
                (item.electricityConsumerNo?.toLowerCase() || "").includes(searchString)
            );
        })
        .filter((item) => {
            if (filters.paid_status && item.paidStatus?.toLowerCase() !== filters.paid_status.toLowerCase()) return false;
            
            // Client-side date range filter (robust)
            if (filters.start_date) {
                const start = new Date(filters.start_date);
                start.setHours(0, 0, 0, 0);
                const current = new Date(item.paymentDate);
                if (current < start) return false;
            }
            if (filters.end_date) {
                const end = new Date(filters.end_date);
                end.setHours(23, 59, 59, 999);
                const current = new Date(item.paymentDate);
                if (current > end) return false;
            }
            
            return true;
        })
        .sort((a, b) => {
            const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
            const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
            return dateB - dateA;
        });

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const handleUpdateClick = (transaction: ElectricityTransaction) => {
        setSelectedTransaction(transaction);
        const formatDateForInput = (dateString: string) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        setUpdateFormData({
            monthly_amount: transaction.monthly_amount?.toString() || "",
            payment_type: transaction.paymentType || "",
            paid_status: transaction.paidStatus || "",
            payment_date: formatDateForInput(transaction.paymentDate),
            payment_amount: transaction.paymentAmount || "",
            utr_number: transaction.utrNumber || "",
            month_year: transaction.monthYear || ""
        });
        setIsUpdateModalOpen(true);
    };

    const handleDeleteClick = (transaction: ElectricityTransaction) => {
        setSelectedTransaction(transaction);
        setIsDeleteModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUpdateFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!updateFormData.monthly_amount) {
            errors.monthly_amount = "Monthly amount is required";
        } else if (isNaN(Number(updateFormData.monthly_amount))) {
            errors.monthly_amount = "Monthly amount must be a number";
        }

        if (!updateFormData.paid_status) {
            errors.paid_status = "Payment status is required";
        }

        if (!updateFormData.payment_type) {
            errors.payment_type = "Payment type is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;
        if (!selectedTransaction) return;

        try {
            setUpdateLoading(true);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found");

            const id = selectedTransaction._id || selectedTransaction.id;
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/rent/electricity/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        monthly_amount: Number(updateFormData.monthly_amount),
                        payment_type: updateFormData.payment_type,
                        paid_status: updateFormData.paid_status,
                        payment_date: updateFormData.payment_date,
                        payment_amount: updateFormData.payment_amount,
                        utr_number: updateFormData.utr_number,
                        month_year: updateFormData.month_year
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            await fetchElectricityTransactions();
            setIsUpdateModalOpen(false);
            setSelectedTransaction(null);
            alert("Electricity payment updated successfully");

        } catch (error) {
            console.error("Error updating electricity payment:", error);
            alert(error instanceof Error ? error.message : "Failed to update electricity payment");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDeleteSubmit = async () => {
        if (!selectedTransaction) return;

        try {
            setDeleteLoading(true);
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found");

            const id = selectedTransaction._id || selectedTransaction.id;
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/rent/electricity/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            await fetchElectricityTransactions();
            setIsDeleteModalOpen(false);
            setSelectedTransaction(null);
            alert("Electricity payment deleted successfully");

        } catch (error) {
            console.error("Error deleting electricity payment:", error);
            alert(error instanceof Error ? error.message : "Failed to delete electricity payment");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDownloadExcel = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication token not found");

            const queryParams = new URLSearchParams();
            queryParams.append("model", "rent/electricityTransaction");

            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/rent/export/ledger?${queryParams.toString()}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) throw new Error(`Failed to download Excel file: ${response.status}`);

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ElectricityLedger_${new Date().toISOString().split("T")[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Error downloading Excel:", error);
            alert(error instanceof Error ? error.message : "Failed to download Excel");
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const token = localStorage.getItem("token");
            const queryParams = new URLSearchParams(filters as any).toString();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/rent/ledger.pdf?category=electricity&${queryParams}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) throw new Error("Failed to download PDF");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `ElectricityLedger_${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("PDF download failed:", error);
            alert("PDF download failed");
        }
    };

    const handleDownload = async () => {
        if (selectedFormat === "excel") {
            await handleDownloadExcel();
        } else {
            await handleDownloadPDF();
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 px-4 sticky top-0 z-20 py-4 bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                    Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredTransactions.length}</span> of <span className="font-semibold text-gray-900 dark:text-gray-100">{totalCount}</span> transactions
                </p>

                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-48 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-shadow shadow-sm"
                    />

                    <select
                        value={filters.paid_status || ""}
                        onChange={(e) => handleFilterChange("paid_status", e.target.value)}
                        className="w-full sm:w-auto min-w-[120px] px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white [&>option]:dark:text-black transition-shadow shadow-sm"
                    >
                        <option value="">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="partial">Partial</option>
                    </select>



                    <DatePicker
                        selected={filters.start_date ? new Date(filters.start_date) : null}
                        onChange={(date: Date | null) =>
                            handleFilterChange("start_date", date ? date.toLocaleDateString("en-CA") : "")
                        }
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Start Date"
                        className="w-full sm:w-32 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-shadow shadow-sm font-medium"
                    />

                    <DatePicker
                        selected={filters.end_date ? new Date(filters.end_date) : null}
                        onChange={(date: Date | null) =>
                            handleFilterChange("end_date", date ? date.toLocaleDateString("en-CA") : "")
                        }
                        dateFormat="yyyy-MM-dd"
                        placeholderText="End Date"
                        className="w-full sm:w-32 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-shadow shadow-sm font-medium"
                    />

                    {(searchTerm !== "" || Object.values(filters).some(v => !!v)) && (
                        <button
                            onClick={() => { setFilters({}); setSearchTerm(""); }}
                            className="w-full sm:w-auto flex justify-center px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors shadow-sm"
                        >
                            Clear
                        </button>
                    )}

                    <div className="relative inline-block text-left w-full sm:w-auto">
                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-shadow shadow-sm"
                        >
                            📥 Ledger ({selectedFormat.toUpperCase()})
                        </button>
                        <select
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value as "excel" | "pdf")}
                            className="absolute top-0 right-0 h-full w-full opacity-0 cursor-pointer"
                        >
                            <option value="excel">excel</option>
                            <option value="pdf">pdf</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="relative rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden">
                            <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                                <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <TableHeader className="sticky top-0 z-10 bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-700">
                                        <TableRow>
                                            {[
                                                { width: "w-32", label: "Site Code" },
                                                { width: "w-40", label: "Site Name" },
                                                { width: "w-32", label: "Owner Name" },
                                                { width: "w-40", label: "Unit" },
                                                { width: "w-32", label: "Bill Amount" },
                                                { width: "w-32", label: "Payment Date" },
                                                { width: "w-32", label: "Bill Period" },
                                                { width: "w-32", label: "Electricity Charges" },
                                                { width: "w-24", label: "Status" },
                                                { width: "w-32", label: "Consumer Number" },
                                                { width: "w-32", label: "UTR Number" },
                                                { width: "w-34", label: "Image" },
                                                { width: "w-28", label: "Actions" }
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

                                    <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredTransactions.map((item) => (
                                            <TableRow
                                                key={item.transactionId || item.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            >
                                                <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100">{item.siteId?.code || '-'}</TableCell>
                                                <TableCell className="w-40 px-6 py-4 text-gray-900 dark:text-gray-100">{item.siteId?.siteName || '-'}</TableCell>
                                                <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                                                    {item.ownerName || "..."}
                                                </TableCell>
                                                <TableCell className="w-40 px-6 py-4 text-gray-900 dark:text-gray-100">{item.units || '-'}</TableCell>
                                                <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                                                    {formatCurrency(Number(item.paymentAmount) || 0)}
                                                </TableCell>
                                                <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100">
                                                    {formatDate(item.paymentDate)}
                                                </TableCell>
                                                <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100">
                                                    {item.monthYear || '-'}
                                                </TableCell>
                                                <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100">
                                                    {item.electricityCharges || '-'}
                                                </TableCell>
                                                <TableCell className="w-24 px-6 py-4 text-gray-900 dark:text-gray-100">
                                                    <Badge
                                                        size="sm"
                                                        color={
                                                            item.paidStatus?.toLowerCase() === "paid"
                                                                ? "success"
                                                                : item.paidStatus?.toLowerCase() === "pending"
                                                                    ? "warning"
                                                                    : "error"
                                                        }
                                                    >
                                                        {item.paidStatus || 'Unknown'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100">{item.electricityConsumerNo || '-'}</TableCell>
                                                <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100 font-mono text-xs">
                                                    {item.utrNumber || (item as any).utr_number || '-'}
                                                </TableCell>
                                                <TableCell className="w-24 px-6 py-4 text-gray-900 dark:text-gray-100">
                                                    {item.image ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="underline text-blue-600 hover:text-blue-800 text-xs"
                                                                onClick={() => setSelectedTransaction(item)}
                                                                title="View Image"
                                                            >
                                                                View Image
                                                            </button>
                                                            {selectedTransaction?._id === item._id && selectedTransaction.image && !isUpdateModalOpen && !isDeleteModalOpen && (
                                                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                                                                    <div className="bg-white dark:bg-[#121212] rounded-lg p-4 shadow-lg relative max-w-xs w-full">
                                                                        <button
                                                                            className="absolute top-4 right-4 text-3xl text-gray-500 hover:text-gray-800 dark:hover:text-red-500"
                                                                            onClick={() => setSelectedTransaction(null)}
                                                                            aria-label="Close"
                                                                        >
                                                                            &times;
                                                                        </button>
                                                                        <img
                                                                            src={selectedTransaction.image}
                                                                            alt="Bill"
                                                                            className="max-h-80 w-auto mx-auto rounded"
                                                                            onError={e => (e.currentTarget.style.display = 'none')}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                                <TableCell className="w-28 px-6 py-4 text-gray-900 dark:text-gray-100">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleUpdateClick(item)}
                                                            className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(item)}
                                                            className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>

                {filteredTransactions.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        {searchTerm
                            ? `No results found for "${searchTerm}"`
                            : "No electricity transactions found"
                        }
                    </div>
                )}
            </div>

            {/* Update Modal */}
            {isUpdateModalOpen && selectedTransaction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-white/[0.03] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            Update Electricity Payment
                        </h2>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Monthly Amount
                                    </label>
                                    <input
                                        type="text"
                                        name="monthly_amount"
                                        value={updateFormData.monthly_amount}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${formErrors.monthly_amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                                    />
                                    {formErrors.monthly_amount && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.monthly_amount}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Payment Type
                                    </label>
                                    <select
                                        name="payment_type"
                                        value={updateFormData.payment_type}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${formErrors.payment_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                                    >
                                        <option value="">Select Payment Type</option>
                                        <option value="electricity">Electricity</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {formErrors.payment_type && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.payment_type}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Payment Status
                                    </label>
                                    <select
                                        name="paid_status"
                                        value={updateFormData.paid_status}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${formErrors.paid_status ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                    </select>
                                    {formErrors.paid_status && (
                                        <p className="mt-1 text-sm text-red-500">{formErrors.paid_status}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Payment Date
                                    </label>
                                    <input
                                        type="date"
                                        name="payment_date"
                                        value={updateFormData.payment_date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Payment Amount
                                    </label>
                                    <input
                                        type="text"
                                        name="payment_amount"
                                        value={updateFormData.payment_amount}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        UTR Number
                                    </label>
                                    <input
                                        type="text"
                                        name="utr_number"
                                        value={updateFormData.utr_number}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Bill Period (Month/Year)
                                    </label>
                                    <input
                                        type="text"
                                        name="month_year"
                                        value={updateFormData.month_year}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Mar-2026"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsUpdateModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updateLoading ? "Updating..." : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedTransaction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-white/[0.03] rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            Confirm Delete
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete this electricity payment? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteSubmit}
                                disabled={deleteLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteLoading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}