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

import { Pencil, Trash2 } from "lucide-react";
import Button from "../ui/button/Button";

interface MasterData {
  Sr_No: number;
  id?: number; // Adding id field for API operations
  CITY_NAME: string;
  SPA_NAME: string;
  AREA: string;
  SPA_CODE: string;
  OWNER_NAME: string;
  OPENING_DATE: string;
  STATUS: string;
  LINE_TRACK: string;
  LOCATION: string;
  MOBILE_1: string;
  MOBILE_2: string;
  MOBILE_3: string;
  EMAIL: string;
  ADDRESS: string;
  Agreement: string;
  Remark: string;
}

// Modal for editing record
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MasterData | null;
  onSave: (data: MasterData) => void;
  mode?: "edit" | "add"; // Add this line
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, data, onSave, mode = "edit" }) => {
  const [formData, setFormData] = useState<MasterData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    } else if (mode === "add") {
      setFormData({
        Sr_No: 0,
        CITY_NAME: "",
        SPA_NAME: "",
        AREA: "",
        SPA_CODE: "",
        OWNER_NAME: "",
        OPENING_DATE: "",
        STATUS: "Open",
        LINE_TRACK: "",
        LOCATION: "",
        MOBILE_1: "",
        MOBILE_2: "",
        MOBILE_3: "",
        EMAIL: "",
        ADDRESS: "",
        Agreement: "",
        Remark: "",
      });
    }
  }, [data, mode]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 ">
      <div className="bg-white dark:bg-white/[0.03] dark:text-amber-50 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide" style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <h2 className="text-xl font-semibold mb-2">{mode === "add" ? "Add New Record" : "Edit Record"}</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* ...existing form fields... */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SPA Name</label>
              <input
                name="SPA_NAME"
                value={formData.SPA_NAME}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SPA Code</label>
              <input
                name="SPA_CODE"
                value={formData.SPA_CODE}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
              <input
                name="CITY_NAME"
                value={formData.CITY_NAME}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Area</label>
              <input
                name="AREA"
                value={formData.AREA}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Owner Name</label>
              <input
                name="OWNER_NAME"
                value={formData.OWNER_NAME}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opening Date</label>
              <input
                type="date"
                name="OPENING_DATE"
                value={formData.OPENING_DATE ? formData.OPENING_DATE.split('T')[0] : ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                name="STATUS"
                value={formData.STATUS}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Open">Open</option>
                <option value="Process">Process</option>
                <option value="Close">Close</option>
                <option value="T Close">T Close</option>
                <option value="Handover">Handover</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Line Track</label>
              <input
                name="LINE_TRACK"
                value={formData.LINE_TRACK || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <input
                name="LOCATION"
                value={formData.LOCATION || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile 1</label>
              <input
                name="MOBILE_1"
                value={formData.MOBILE_1 || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile 2</label>
              <input
                name="MOBILE_2"
                value={formData.MOBILE_2 || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile 3</label>
              <input
                name="MOBILE_3"
                value={formData.MOBILE_3 || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                name="EMAIL"
                value={formData.EMAIL || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
            <input
              name="ADDRESS"
              value={formData.ADDRESS || ''}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agreement</label>
              <input
                name="Agreement"
                value={formData.Agreement || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remark</label>
              <input
                name="Remark"
                value={formData.Remark || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? (mode === "add" ? "Adding..." : "Saving...") : (mode === "add" ? "Add Record" : "Save Changes")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function MasterTable() {
  const [masterData, setMasterData] = useState<MasterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<MasterData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [updateStatus, setUpdateStatus] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/master`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMasterData(data.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching master data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch master data"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleAddRecord = async (newData: MasterData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/master/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setMasterData((prev) => [...prev, result.data]);
      setUpdateStatus({
        message: "Record added successfully!",
        type: "success",
      });
      setTimeout(() => setUpdateStatus({ message: '', type: null }), 3000);
      setIsAddModalOpen(false);
    } catch (error) {
      setUpdateStatus({
        message: error instanceof Error ? error.message : "Failed to add record",
        type: "error",
      });
    }
  };
  const handleEditClick = (record: MasterData) => {
    setCurrentRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRecord(null);
  };

  const handleSaveChanges = async (updatedData: MasterData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      // Use Sr_No for the API call if id isn't available
      const recordId = updatedData.id || updatedData.Sr_No;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/master/${recordId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update the local data
      setMasterData((prevData) =>
        prevData.map((item) =>
          item.Sr_No === updatedData.Sr_No ? updatedData : item
        )
      );

      setUpdateStatus({
        message: "Record updated successfully!",
        type: "success",
      });

      setTimeout(() => {
        setUpdateStatus({ message: '', type: null });
      }, 3000);

      handleCloseModal();
    } catch (error) {
      console.error("Error updating record:", error);
      setUpdateStatus({
        message: error instanceof Error ? error.message : "Failed to update record",
        type: "error",
      });
    }
  };
  const handleDelete = async (record: MasterData) => {
    if (!window.confirm(`Are you sure you want to delete "${record.SPA_NAME}"?`)) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const recordId = record.id || record.Sr_No;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/master/${recordId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setMasterData((prev) => prev.filter((item) => item.Sr_No !== record.Sr_No));
      setUpdateStatus({
        message: "Record deleted successfully!",
        type: "success",
      });
      setTimeout(() => setUpdateStatus({ message: '', type: null }), 3000);
    } catch (error) {
      setUpdateStatus({
        message: error instanceof Error ? error.message : "Failed to delete record",
        type: "error",
      });
    }
  };
  const filteredData = masterData
    .filter((item) => {
      const searchString = searchTerm.toLowerCase();
      return (
        item.SPA_CODE.toLowerCase().includes(searchString) ||
        item.SPA_NAME.toLowerCase().includes(searchString) ||
        item.CITY_NAME.toLowerCase().includes(searchString) ||
        item.AREA.toLowerCase().includes(searchString) ||
        item.OWNER_NAME.toLowerCase().includes(searchString) ||
        item.STATUS.toLowerCase().includes(searchString)
      );
    })
    .sort((a, b) => a.Sr_No - b.Sr_No);

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-2">
      {/* Status message */}
      {updateStatus.type && (
        <div
          className={`p-4 rounded-md ${updateStatus.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}
        >
          {updateStatus.message}
        </div>
      )}
      {/* Add New Button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white text-sm"
        />
        <Button
          variant="primary"
          onClick={handleAddClick}
          className="flex items-center justify-center gap-1 text-xs py-1 px-2.5 rounded-lg shadow-sm transition-all hover:shadow"
          size="sm"
        >
          <span className="font-medium">+</span>
          <span>Add New</span>
        </Button>
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
                        { width: "w-16", label: "Sr No" },
                        { width: "w-24", label: "SPA Code" },
                        { width: "w-40", label: "SPA Name" },
                        { width: "w-32", label: "City" },
                        { width: "w-32", label: "Area" },
                        { width: "w-40", label: "Owner Name" },
                        { width: "w-32", label: "Opening Date" },
                        { width: "w-24", label: "Status" },
                        { width: "w-48", label: "Address" }, // Reduced from w-96 to w-48
                        { width: "w-24", label: "Actions" },
                      ].map(({ width, label }) => (
                        <TableCell
                          key={label}
                          className={`${width} px-6 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap dark:bg-[#4f46e5] text-center dark:from-gray-800 dark:to-gray-700 border-r border-gray-200 dark:border-gray-600 shadow-sm`}
                        >
                          <div className="flex items-center space-x-1">
                            <span className="text-sm uppercase tracking-wide">{label}</span>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHeader>

                  {/* Scrollable Body */}
                  <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredData.map((item) => (
                      <TableRow
                        key={item.Sr_No}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <TableCell className="w-16 px-6 py-4 text-gray-900 dark:text-gray-100">{item.Sr_No}</TableCell>
                        <TableCell className="w-16 px-6 py-4 text-gray-900 dark:text-gray-100">{item.SPA_CODE}</TableCell>
                        <TableCell className="w-16 px-6 py-4 text-gray-900 dark:text-gray-100">{item.SPA_NAME}</TableCell>
                        <TableCell className="w-16 px-6 py-4 text-gray-900 dark:text-gray-100">{item.CITY_NAME}</TableCell>
                        <TableCell className="w-16 px-6 py-4 text-gray-900 dark:text-gray-100">{item.AREA}</TableCell>
                        <TableCell className="w-16 px-6 py-4 text-gray-900 dark:text-gray-100">{item.OWNER_NAME}</TableCell>
                        <TableCell className="w-16 px-6 py-4 text-gray-900 dark:text-gray-100">
                          {item.OPENING_DATE ? new Date(item.OPENING_DATE).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="w-16 px-6 py-4 text-gray-900 dark:text-gray-100">
                          <Badge
                            size="sm"
                            color={
                              item.STATUS.toLowerCase() === "open"
                                ? "success"
                                : item.STATUS.toLowerCase() === "pending"
                                  ? "warning"
                                  : "error"
                            }
                          >
                            {item.STATUS}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-48 px-6 py-4 text-gray-900 dark:text-gray-100">
                          <div className="truncate max-w-48" title={item.ADDRESS || '-'}>
                            {item.ADDRESS || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="w-24 px-6 py-4 text-gray-900 dark:text-gray-100">
                          <div className="flex flex-row gap-1">
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleEditClick(item)}
                              className="flex items-center p-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md min-w-0"
                            >
                              <Pencil className="h-3 w-3 mr-0.5" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item)}
                              className="flex items-center p-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md min-w-0"
                            >
                              <Trash2 className="h-3 w-3 mr-0.5" />
                              Delete
                            </Button>
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

        {filteredData.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No results found for "{searchTerm}"
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <EditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          data={currentRecord}
          onSave={handleSaveChanges}
        />
      )}
      {/* Add Modal */}
      {isAddModalOpen && (
        <EditModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          data={null}
          onSave={handleAddRecord}
          mode="add"
        />
      )}
    </div>
  );
}