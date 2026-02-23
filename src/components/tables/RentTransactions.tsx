/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

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
interface RentTransaction {
  month_year: unknown;
  monthly_rent: number;
  id: number;
  tenant_id: string;
  owner_name: string;
  payment_amount: string;
  payment_date: string;
  payment_type: string;
  paid_status: string;
  utr_number: string;
  rent_month: string;
  rent_year: string;
  remarks: string;
  image?: string;
  site: {
    property_location: string;
    property_address: string;
    location: any;
    id: string;
    site_name: string;
    code: string;
    tenant_name: string;
  };
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

export default function RentTransactionsTable() {
  const [transactions, setTransactions] = useState<RentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});
  const [totalCount, setTotalCount] = useState(0);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<RentTransaction | null>(null);
  const [updateFormData, setUpdateFormData] = useState({
    monthly_rent: "",
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
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'pdf'>('excel');
  const [viewProofTransaction, setViewProofTransaction] = useState<RentTransaction | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [removeImageFlag, setRemoveImageFlag] = useState(false);

  useEffect(() => {
    fetchRentTransactions();
  }, [filters]);

  const fetchRentTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      // Build query params
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rent-payments?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data.rentPayments);
      setTotalCount(data.count);
      setError(null);
    } catch (error) {
      console.error("Error fetching rent transactions:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch rent transactions"
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

  const getTransactionMonthYear = (item: RentTransaction) => {
    // Try to use month_year if it's a string like "2024-06-01"
    if (typeof item.month_year === "string" && item.month_year.length >= 7) {
      return item.month_year.slice(0, 7); // "YYYY-MM"
    }
    // Fallback to rent_year and rent_month
    if (item.rent_year && item.rent_month) {
      const months = {
        "January": "01", "February": "02", "March": "03", "April": "04",
        "May": "05", "June": "06", "July": "07", "August": "08",
        "September": "09", "October": "10", "November": "11", "December": "12"
      };
      const monthNum = months[item.rent_month as keyof typeof months] || "01";
      return `${item.rent_year}-${monthNum}`;
    }
    return "";
  };

  // Get current month in "YYYY-MM" format
  const currentMonthYear = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  })();

  const filteredTransactions = transactions
    .filter((item) => {
      const searchString = searchTerm.toLowerCase();
      return (
        (item.site?.site_name?.toLowerCase() || "").includes(searchString) ||
        (item.site?.property_location?.toLowerCase() || "").includes(searchString) ||
        (item.site?.code?.toLowerCase() || "").includes(searchString) ||
        (item.owner_name?.toLowerCase() || "").includes(searchString) ||
        (item.payment_type?.toLowerCase() || "").includes(searchString) ||
        (item.paid_status?.toLowerCase() || "").includes(searchString) ||
        (item.utr_number?.toLowerCase() || "").includes(searchString)
      );
    })
    .sort((a, b) => {
      // Sort: current month records first, then by payment_date descending
      const aMonth = getTransactionMonthYear(a);
      const bMonth = getTransactionMonthYear(b);

      if (aMonth === currentMonthYear && bMonth !== currentMonthYear) return -1;
      if (bMonth === currentMonthYear && aMonth !== currentMonthYear) return 1;

      // If both are current month or both are not, sort by payment_date descending
      const dateA = a.payment_date ? new Date(a.payment_date).getTime() : 0;
      const dateB = b.payment_date ? new Date(b.payment_date).getTime() : 0;
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

  const handleUpdateClick = (transaction: RentTransaction) => {
    setSelectedTransaction(transaction);
    // Format date to YYYY-MM-DD for input type="date"
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    // Set month_year based on rent_month and rent_year
    const monthYear = transaction.rent_month && transaction.rent_year
      ? `${transaction.rent_year}-${getMonthNumber(transaction.rent_month)}-01`
      : '';

    setUpdateFormData({
      monthly_rent: transaction.monthly_rent.toString(),
      payment_type: transaction.payment_type || "",
      paid_status: transaction.paid_status || "",
      payment_date: formatDateForInput(transaction.payment_date),
      payment_amount: transaction.payment_amount || "",
      utr_number: transaction.utr_number || "",
      month_year: monthYear
    });
    setIsUpdateModalOpen(true);
  };

  const getMonthNumber = (monthName: string) => {
    const months = {
      "January": "01", "February": "02", "March": "03", "April": "04",
      "May": "05", "June": "06", "July": "07", "August": "08",
      "September": "09", "October": "10", "November": "11", "December": "12"
    };
    return months[monthName as keyof typeof months] || "01";
  };

  const handleDeleteClick = (transaction: RentTransaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear the error for this field
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
    if (!updateFormData.monthly_rent) {
      errors.monthly_rent = "Monthly rent is required";
    } else if (isNaN(Number(updateFormData.monthly_rent))) {
      errors.monthly_rent = "Monthly rent must be a number";
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

      const formData = new FormData();
      formData.append('monthly_rent', updateFormData.monthly_rent);
      formData.append('payment_type', updateFormData.payment_type);
      formData.append('paid_status', updateFormData.paid_status);
      formData.append('payment_date', updateFormData.payment_date);
      formData.append('payment_amount', updateFormData.payment_amount);
      formData.append('utr_number', updateFormData.utr_number);
      formData.append('month_year', updateFormData.month_year);
      // Append removeImage flag as string 'true' or 'false'
      formData.append('removeImage', removeImageFlag ? 'true' : 'false');
      // Append new image file if selected
      if (newImageFile) {
        formData.append('image', newImageFile);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rent-payments/${selectedTransaction.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // IMPORTANT: Do NOT set Content-Type header for multipart/form-data.
          // Let the browser set it automatically with proper boundary.
        },
        body: formData,
      }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Refresh the data
      await fetchRentTransactions();

      // Reset image states
      setNewImageFile(null);
      setRemoveImageFlag(false);
      setSelectedTransaction(null);
      setIsUpdateModalOpen(false);

      alert("Rent payment updated successfully");
    } catch (error) {
      console.error("Error updating rent payment:", error);
      alert(error instanceof Error ? error.message : "Failed to update rent payment");
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rent-payments/${selectedTransaction.id}`,
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
      // Refresh the data
      await fetchRentTransactions();
      // Close the modal
      setIsDeleteModalOpen(false);
      setSelectedTransaction(null);
      // Show success toast or notification here (if you have a toast system)
      alert("Rent payment deleted successfully");
    } catch (error) {
      console.error("Error deleting rent payment:", error);
      alert(error instanceof Error ? error.message : "Failed to delete rent payment");
    } finally {
      setDeleteLoading(false);
    }
  };
  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }
  // Function to handle Excel download
  const handleDownloadExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rent-payments/download-ledger?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to download Excel file: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RentLedger_${new Date().toISOString().split("T")[0]}.xlsx`;
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
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(filters as any).toString();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rent-payments/download-ledger-pdf?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to download PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RentPayments_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('PDF download failed');
    }
  };

  const handleDownload = () => {
    if (selectedFormat === 'excel') {
      handleDownloadExcel();
    } else {
      handleDownloadPDF();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 px-3 sticky top-0 z-20 py-2 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredTransactions.length} of {totalCount} transactions
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-40 px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white"
          />
          <select
            value={filters.paid_status || ""}
            onChange={(e) => handleFilterChange("paid_status", e.target.value)}
            className="w-32 px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white [&>option]:dark:text-black">
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Partial</option>
          </select>
          <select
            value={filters.payment_type || ""}
            onChange={(e) => handleFilterChange("payment_type", e.target.value)}
            className="w-32 px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white [&>option]:dark:text-black">
            <option value="">All Types</option>
            <option value="Rent">Rent</option>
            <option value="Electricity">Electricity</option>
          </select>
          <DatePicker
            selected={filters.start_date ? new Date(filters.start_date) : null}
            onChange={(date: Date | null) =>
              handleFilterChange(
                "start_date",
                date ? date.toLocaleDateString("en-CA") : ""
              )
            }
            dateFormat="yyyy-MM-dd"
            placeholderText="Start Date"
            className="w-32 px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white"
          />
          <DatePicker
            selected={filters.end_date ? new Date(filters.end_date) : null}
            onChange={(date: Date | null) =>
              handleFilterChange(
                "end_date",
                date ? date.toLocaleDateString("en-CA") : ""
              )
            }
            dateFormat="yyyy-MM-dd"
            placeholderText="End Date"
            className="w-32 px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white"
          />
          <button
            onClick={() => setFilters({})}
            className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
          <div className="relative inline-block text-left">
            <button
              onClick={handleDownload}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              📥 Ledger ({selectedFormat.toUpperCase()})
            </button>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as 'excel' | 'pdf')}
              className="absolute top-0 right-0 h-full opacity-0 cursor-pointer"
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
                        { width: "w-10", label: "ID" },
                        { width: "w-16", label: "Site Code" },
                        { width: "w-24", label: "Site Name" },
                        { width: "w-20", label: "Owner Name" },
                        { width: "w-32", label: "Rent Amount" },
                        { width: "w-32", label: "Payment Date" },
                        { width: "w-32", label: "Rent Period" },
                        { width: "w-12", label: "Payment Type" },
                        { width: "w-10", label: "Status" },
                        { width: "w-24", label: "UTR Number" },
                        { width: "w-24", label: "Image" },
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
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <TableCell className="w-16 px-6 py-4 text-gray-900  dark:text-gray-100">{item.id}</TableCell>
                        <TableCell className="w-16 px-6 py-4 text-gray-900 dark:text-gray-100">{item.site?.code || '-'}</TableCell>
                        <TableCell className="w-24 px-6 py-4 text-gray-900 dark:text-gray-100">
                          {item.site
                            ? `${item.site.site_name} (${item.site.property_location || 'No location'})`
                            : '-'}
                        </TableCell>
                        <TableCell className="w-20 px-6 py-4 text-gray-900 truncate max-w-48 dark:text-gray-100">{item.owner_name || '-'}</TableCell>
                        <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                          {formatCurrency(Number(item.payment_amount))}
                        </TableCell>
                        <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100">
                          {formatDate(item.payment_date)}
                        </TableCell>
                        <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100">
                          {`${item.month_year || '-'}`}
                        </TableCell>
                        <TableCell className="w-12 px-6 py-4 text-center text-gray-900 dark:text-gray-100">
                          {item.payment_type || '-'}
                        </TableCell>
                        <TableCell className="w-10 px-6 py-4 text-gray-900 dark:text-gray-100">
                          <Badge
                            size="sm"
                            color={
                              item.paid_status?.toLowerCase() === "paid"
                                ? "success"
                                : item.paid_status?.toLowerCase() === "pending"
                                  ? "warning"
                                  : "error"
                            }
                          >
                            {item.paid_status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-32 px-6 py-4 text-gray-900 dark:text-gray-100">{item.utr_number || '-'}</TableCell>
                        <TableCell className="w-24 px-6 py-4 text-gray-900 dark:text-gray-100">
                          {item.image ? (
                            <>
                              <button
                                type="button"
                                className="underline text-blue-600 hover:text-blue-800 text-xs"
                                onClick={() => setViewProofTransaction(item)}
                                title="View File"
                              >
                                View Proof
                              </button>
                              {/* Popup: Shows Image OR PDF File */}
                              {viewProofTransaction?.id === item.id && viewProofTransaction.image && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                                  <div className="bg-white dark:bg-[#121212] rounded-lg p-4 shadow-lg relative max-w-xs w-full">
                                    <button
                                      className="absolute top-4 right-4 text-3xl text-gray-500 hover:text-gray-800 dark:hover:text-red-500"
                                      onClick={() => setViewProofTransaction(null)}
                                      aria-label="Close"
                                    >
                                      &times;
                                    </button>
                                    {viewProofTransaction.image.endsWith('.pdf') ? (
                                      <iframe
                                        src={viewProofTransaction.image}
                                        title="PDF Proof"
                                        width="300"
                                        height="400"
                                        className="mx-auto border rounded"
                                      >
                                        <a href={viewProofTransaction.image} target="_blank" rel="noopener noreferrer">
                                          View PDF
                                        </a>
                                      </iframe>
                                    ) : (
                                      <img
                                        src={viewProofTransaction.image}
                                        alt="Rent Proof"
                                        className="max-h-80 w-auto mx-auto rounded"
                                        onError={e => (e.currentTarget.style.display = 'none')}
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="w-28 px-6 py-4 text-gray-900  dark:text-gray-100">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdateClick(item)}
                              className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="px-2 py-1 text-xs font-medium text-white  bg-red-600 rounded-md hover:bg-red-700"
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
              : "No rent transactions found"
            }
          </div>
        )}
      </div>
      {isUpdateModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1f1f1f] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Update Rent Payment
            </h2>
            <form onSubmit={handleUpdateSubmit}>
              <div className="space-y-4">
                {/* Row 1: Monthly Rent & Payment Type */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Monthly Rent
                    </label>
                    <input
                      type="text"
                      name="monthly_rent"
                      value={updateFormData.monthly_rent}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formErrors.monthly_rent ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                    />
                    {formErrors.monthly_rent && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.monthly_rent}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Type
                    </label>
                    <select
                      name="payment_type"
                      value={updateFormData.payment_type}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formErrors.payment_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Select Payment Type</option>
                      <option value="Rent">Rent</option>
                      <option value="Electricity">Electricity</option>
                    </select>
                    {formErrors.payment_type && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.payment_type}</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Payment Status & Payment Date */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Status
                    </label>
                    <select
                      name="paid_status"
                      value={updateFormData.paid_status}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formErrors.paid_status ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Select Status</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Partial</option>
                    </select>
                    {formErrors.paid_status && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.paid_status}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Date
                    </label>
                    <DatePicker
                      selected={
                        updateFormData.payment_date
                          ? new Date(updateFormData.payment_date)
                          : null
                      }
                      onChange={(date: Date | null) => {
                        setUpdateFormData(prev => ({
                          ...prev,
                          payment_date: date
                            ? [
                              date.getFullYear(),
                              String(date.getMonth() + 1).padStart(2, '0'),
                              String(date.getDate()).padStart(2, '0')
                            ].join('-')
                            : ""
                        }));
                      }}
                      dateFormat="yyyy-MM-dd"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholderText="Select date"
                      isClearable
                    />
                  </div>
                </div>

                {/* Row 3: Payment Amount & UTR Number */}
                <div className="flex space-x-4">
                  <div className="flex-1">
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
                  <div className="flex-1">
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
                </div>

                {/* Row 4: Rent Period & Proof File */}
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rent Period (Month/Year)
                    </label>
                    <input
                      type="text"
                      name="month_year"
                      value={updateFormData.month_year}
                      onChange={handleInputChange}
                      placeholder="e.g. January 2024"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Proof File
                    </label>

                    {/* Show existing file preview or filename if available and not marked for removal */}
                    {!removeImageFlag && selectedTransaction?.image ? (
                      <div className="mb-2">
                        {selectedTransaction.image.match(/\.(jpeg|jpg|gif|png|svg|webp|bmp)$/i) ? (
                          <img
                            src={selectedTransaction.image}
                            alt="Existing proof"
                            className="max-w-xs max-h-48 object-contain rounded-md border border-gray-300"
                          />
                        ) : (
                          <a
                            href={selectedTransaction.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline break-all"
                          >
                            View existing file
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No file available</p>
                    )}

                    {/* Checkbox to remove existing file */}
                    {selectedTransaction?.image && (
                      <label className="inline-flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={removeImageFlag}
                          onChange={(e) => {
                            setRemoveImageFlag(e.target.checked);
                            if (e.target.checked) setNewImageFile(null); // clear new file if removing existing
                          }}
                          className="form-checkbox"
                        />
                        <span>Remove existing file</span>
                      </label>
                    )}

                    {/* Upload new file input accepting any file type */}
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="*/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setNewImageFile(e.target.files[0]);
                            setRemoveImageFlag(false);
                          }
                        }}
                        disabled={removeImageFlag}
                        className="block w-full text-sm text-gray-500 dark:text-gray-300 file:border file:border-gray-300 file:rounded-md file:bg-gray-50 dark:file:bg-gray-800 file:p-2 file:cursor-pointer"
                      />
                      {newImageFile && (
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-400">Selected file: {newImageFile.name}</p>
                      )}
                    </div>
                  </div>
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

      {isDeleteModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50  flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-[#1f1f1f] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6 ">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Confirm Delete
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this rent payment? This action cannot be undone.
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