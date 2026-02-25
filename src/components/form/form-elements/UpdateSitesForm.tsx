/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';
interface Owner {
  id: number;
  owner_name: string;
  owner_details: string;
  mobile_no?: string;
  email?: string;
  owner_account_no: string;
  owner_bank_name: string;
  owner_bank_ifsc: string;
  owner_mobile_no?: string;
  owner_monthly_rent: string;
  siteId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Add this interface near your other interfaces
interface ElectricityDetail {
  consumer_name: string;
  unit: string;
  electricity_charges: string;
  electricity_consumerno: string;
  electricity_provider: string;
  electricity_status: string;
}
//
interface Site {
  id: number;
  code: string;
  site_name: string;
  property_type: string;
  property_location: string;
  property_address: string;
  pincode: string;
  property_owners: string;
  owners_details: string;
  tenant_name: string;
  address: string;
  mobile_no: string;
  email: string;
  monthly_rent: number;
  paid_status: string;
  deposit: number;
  gst_charges: number;
  maintenance_charges: number;
  online_paid: number;
  cash_paid: number;
  muncipal_tax: number;
  cma_charges: number;
  electricity_charges: string;
  electricity_provider: string;
  water_charges: number;
  bank_no: string;
  bank_name: string;
  bank_ifsc: string;
  bank_details: string;
  status: string;
  agreement_date: string;
  agreement_expiring: string;
  fitout_time: string;
  rent_start_date: string;
  increased_rent: string;
  agreement_years: string;
  yearly_escalation_percentage: string;
  modified: string;
  addedby: string;
  total_amount: string;
  agent_details: string;
  agent_cost: string;
  authorised_by: string;
  manage_by: string;
  owners: Owner[];
  // Additional fields from API
  electricity_status: string;
  rent_status: string;
  payment_date: string;
  payment_day: string;
  owner_renttotal: string;
  gdrive_link: string;
  glocation_link: string;
  website_link: string;
  pending_amount: string;
  electricity_consumerno: string;
  escalation_percentage: string;
  added_account_no: string;
  added_bank_name: string;
  added_ifsc: string;
  mseb_deposit: number;
  createdAt?: string;
  updatedAt?: string;
  area_size: string;
  rent_type: string;
  authorised_person_commissio: string;
  unit: string;
  consumer_name: string;
  site_mobileno: string;
  duplicated: number;
}

export default function SiteEditPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOwners, setExpandedOwners] = useState<{ [key: number]: boolean }>({}); // Add this line
  const [expandedElectricityDetails, setExpandedElectricityDetails] = useState<{ [key: number]: boolean }>({});
  // const [electricityDetails, setElectricityDetails] = useState<Array<{
  //   consumer_name: string;
  //   unit: string;
  //   electricity_charges: string;
  //   electricity_consumerno: string;
  //   electricity_provider: string;
  //   electricity_status: string;
  // }>>([]);
  const [electricityDetails, setElectricityDetails] = useState<ElectricityDetail[]>([]);
  const toggleOwner = (index: number) => {
    setExpandedOwners(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  useEffect(() => {
    const fetchSiteDetails = async () => {
      try {
        const siteId = params.id;
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sites/${siteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("API Response:", response);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error("Error fetching site details:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch site details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSiteDetails();
    }
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleOwnerChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      if (!prev) return null;

      const updatedOwners = [...prev.owners];
      updatedOwners[index] = {
        ...updatedOwners[index],
        [name]: value
      };

      return { ...prev, owners: updatedOwners };
    });
  };

  // Add this useEffect to initialize electricity details from formData
  useEffect(() => {
    if (formData && formData.consumer_name) {
      const consumerNames = formData.consumer_name.split(',').map(name => name.trim());
      const units = (formData.unit || '').split(',').map(unit => unit.trim());
      const charges = (formData.electricity_charges || '').split(',').map(charge => charge.trim());
      const consumerNos = (formData.electricity_consumerno || '').split(',').map(no => no.trim());
      const providers = Array(consumerNames.length).fill(formData.electricity_provider || '');
      const statuses = Array(consumerNames.length).fill(formData.electricity_status || '');

      const details: ElectricityDetail[] = consumerNames.map((name, index) => ({
        consumer_name: name,
        unit: units[index] || '',
        electricity_charges: charges[index] || '',
        electricity_consumerno: consumerNos[index] || '',
        electricity_provider: providers[index] || '',
        electricity_status: statuses[index] || ''
      }));

      setElectricityDetails(details);
    }
  }, [formData]);

  // Add this function with your other handlers
  const toggleElectricityDetail = (index: number) => {
    setExpandedElectricityDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  // const handleElectricityChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setElectricityDetails(prev => {
  //     const updated = [...prev];
  //     updated[index] = {
  //       ...updated[index],
  //       [name]: value
  //     };
  //     return updated;
  //   });
  // };

  // Update the handleElectricityChange function
  // Update the handleElectricityChange function
  const handleElectricityChange = (index: number, field: keyof ElectricityDetail, value: string) => {
    setElectricityDetails(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });

    // Update formData with the new electricity details
    setFormData(prev => {
      if (!prev) return null;

      const updatedDetails = [...electricityDetails];
      updatedDetails[index] = {
        ...updatedDetails[index],
        [field]: value
      };

      return {
        ...prev,
        consumer_name: updatedDetails.map(detail => detail.consumer_name).join(','),
        unit: updatedDetails.map(detail => detail.unit).join(','),
        electricity_charges: updatedDetails.map(detail => detail.electricity_charges).join(','),
        electricity_consumerno: updatedDetails.map(detail => detail.electricity_consumerno).join(','),
        electricity_provider: updatedDetails.length > 0 ? updatedDetails[0].electricity_provider : '',
        electricity_status: updatedDetails.length > 0 ? updatedDetails[0].electricity_status : ''
      };
    });
  };

  // Add function to add new electricity detail
  const addElectricityDetail = () => {
    const newDetail: ElectricityDetail = {
      consumer_name: '',
      unit: '',
      electricity_charges: '',
      electricity_consumerno: '',
      electricity_provider: '',
      electricity_status: ''
    };

    setElectricityDetails(prev => [...prev, newDetail]);

    // Update formData
    setFormData(prev => {
      if (!prev) return null;
      const updatedDetails = [...electricityDetails, newDetail];
      return {
        ...prev,
        consumer_name: updatedDetails.map(detail => detail.consumer_name).join(','),
        unit: updatedDetails.map(detail => detail.unit).join(','),
        electricity_charges: updatedDetails.map(detail => detail.electricity_charges).join(','),
        electricity_consumerno: updatedDetails.map(detail => detail.electricity_consumerno).join(','),
        electricity_provider: updatedDetails.length > 0 ? updatedDetails[0].electricity_provider : '',
        electricity_status: updatedDetails.length > 0 ? updatedDetails[0].electricity_status : ''
      };
    });
  };

  // Add function to remove electricity detail
  const removeElectricityDetail = (index: number) => {
    setElectricityDetails(prev => {
      const updated = prev.filter((_, i) => i !== index);

      // Update formData
      setFormData(prevForm => {
        if (!prevForm) return null;

        return {
          ...prevForm,
          consumer_name: updated.map(detail => detail.consumer_name).join(','),
          unit: updated.map(detail => detail.unit).join(','),
          electricity_charges: updated.map(detail => detail.electricity_charges).join(','),
          electricity_consumerno: updated.map(detail => detail.electricity_consumerno).join(','),
          electricity_provider: updated.length > 0 ? updated[0].electricity_provider : '',
          electricity_status: updated.length > 0 ? updated[0].electricity_status : ''
        };
      });

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sites/${params.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      toast.success("Site updated successfully!");
      router.replace(`/sites/${params.id}`);
    } catch (error) {
      console.error("Error updating site:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update site");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-xl">Loading site details...</div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-xl text-red-500">
          {error || "Site not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Site: {formData.site_name}
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              if (params.id) {
                router.push(`/sites/${params.id}`);
              } else {
                router.back();
              }
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Basic Site Information */}
          <ComponentCard title="Basic Site Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400"></label>
                <input
                  type="text"
                  name="code"
                  value={formData.code || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Site Name</label>
                <input
                  type="text"
                  name="site_name"
                  value={formData.site_name || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Property Location</label>
                <input
                  type="text"
                  name="property_location"
                  value={formData.property_location || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Property Address</label>
                <input
                  type="text"
                  name="property_address"
                  value={formData.property_address || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Managed By</label>
                <input
                  type="text"
                  name="manage_by"
                  value={formData.manage_by || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Payment Day</label>
                <input
                  type="text"
                  name="payment_day"
                  value={formData.payment_day || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Property Type</label>
                <input
                  type="text"
                  name="property_type"
                  value={formData.property_type || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Payment Bank Name</label>
                <input
                  type="text"
                  name="added_bank_name"
                  value={formData.added_bank_name || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Status</label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-black dark:text-white bg-white dark:bg-[#121212]">Select Status</option>
                  <option value="Active" className="text-black dark:text-white bg-white dark:bg-[#121212]">Active</option>
                  <option value="Inactive" className="text-black dark:text-white bg-white dark:bg-[#121212]">Inactive</option>
                </select>
              </div>

            </div>
          </ComponentCard>

          {/* Owner Information */}
          <ComponentCard title="Owner Information">
            {formData.owners && formData.owners.length > 0 ? (
              formData.owners.map((owner, index) => (
                <div key={owner.id || index} className="mb-4 border rounded overflow-hidden">
                  {/* Collapsible Header */}
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-white/[0.03]">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {owner.owner_name ? owner.owner_name : `Owner ${index + 1}`}
                      </h3>
                      <button
                        type="button"
                        onClick={() => toggleOwner(index)}
                        className="text-gray-600 dark:text-gray-300"
                      >
                        {expandedOwners[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                    {formData.owners.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => {
                            if (!prev) return null;
                            const updatedOwners = prev.owners.filter((_, i) => i !== index);
                            return { ...prev, owners: updatedOwners };
                          });
                        }}
                        className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Collapsible Body */}
                  {expandedOwners[index] && (
                    <div className="p-3 bg-white dark:bg-white/[0.03] border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400">Owner Name</label>
                          <input
                            type="text"
                            name="owner_name"
                            value={owner.owner_name || ''}
                            onChange={(e) => handleOwnerChange(index, e)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400">Monthly Rent (₹)</label>
                          <input
                            type="text"
                            name="owner_monthly_rent"
                            value={owner.owner_monthly_rent || ''}
                            onChange={(e) => handleOwnerChange(index, e)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400">Bank Name</label>
                          <input
                            type="text"
                            name="owner_bank_name"
                            value={owner.owner_bank_name || ''}
                            onChange={(e) => handleOwnerChange(index, e)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400">Account No.</label>
                          <input
                            type="text"
                            name="owner_account_no"
                            value={owner.owner_account_no || ''}
                            onChange={(e) => handleOwnerChange(index, e)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400">IFSC Code</label>
                          <input
                            type="text"
                            name="owner_bank_ifsc"
                            value={owner.owner_bank_ifsc || ''}
                            onChange={(e) => handleOwnerChange(index, e)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400">Mobile No. (Optional)</label>
                          <input
                            type="text"
                            name="owner_mobile_no"
                            value={owner.owner_mobile_no || ''}
                            onChange={(e) => handleOwnerChange(index, e)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm text-gray-500 dark:text-gray-400">Remarks</label>
                          <textarea
                            name="owner_details"
                            value={owner.owner_details || ''}
                            onChange={(e) => handleOwnerChange(index, e as any)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No owner information available</p>
            )}
            <button
              type="button"
              onClick={() => {
                setFormData(prev => {
                  if (!prev) return null;
                  const newOwner: Owner = {
                    id: Math.random(), // Temporary ID for new owner
                    owner_name: '',
                    owner_details: '',
                    owner_account_no: '',
                    owner_bank_name: '',
                    owner_bank_ifsc: '',
                    owner_mobile_no: '',
                    owner_monthly_rent: ''
                  };
                  return {
                    ...prev,
                    owners: [...prev.owners, newOwner]
                  };
                });
              }}
              className="mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Add Owner
            </button>
          </ComponentCard>

          {/* Financial Details */}
          <ComponentCard title="Rent Details">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Area Sq.Foot</label>
                <input
                  type="number"
                  name="area_size"
                  value={formData.area_size || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Monthly Rent (₹)</label>
                <input
                  type="number"
                  name="monthly_rent"
                  value={formData.monthly_rent || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Deposit (₹)</label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Maintenance (₹)</label>
                <input
                  type="number"
                  name="maintenance_charges"
                  value={formData.maintenance_charges || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">GST (₹)</label>
                <input
                  type="number"
                  name="gst_charges"
                  value={formData.gst_charges || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Muncipal Tax* (₹)</label>
                <input
                  type="number"
                  name="muncipal_tax"
                  value={formData.muncipal_tax || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">CAM Charges* (₹)</label>
                <input
                  type="number"
                  name="cma_charges"
                  value={formData.cma_charges || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Water Charges* (₹)</label>
                <input
                  type="number"
                  name="water_charges"
                  value={formData.water_charges || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Owner Rent Total (₹)</label>
                <input
                  type="text"
                  name="owner_renttotal"
                  value={formData.owner_renttotal || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Water Charges (₹)</label>
                <input
                  type="text"
                  name="water_charges"
                  value={formData.water_charges || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Municipal Tax (₹)</label>
                <input
                  type="text"
                  name="muncipal_tax"
                  value={formData.muncipal_tax || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div> */}
              {/* <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Maintenance Charges (₹)</label>
                <input
                  type="number"
                  name="maintenance_charges"
                  value={formData.maintenance_charges || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div> */}
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Rent Status</label>
                <select
                  name="rent_status"
                  value={formData.rent_status || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-black dark:text-white bg-white dark:bg-[#121212]">Select Status</option>
                  <option value="Pending" className="text-black dark:text-white bg-white dark:bg-[#121212]">Pending</option>
                  <option value="Paid" className="text-black dark:text-white bg-white dark:bg-[#121212]">Paid</option>
                </select>
              </div>
            </div>
          </ComponentCard>

          {/* Agreement Information */}
          <ComponentCard title="Agreement Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Rent Date (Start)</label>
                <input
                  type="date"
                  name="rent_start_date"
                  value={formData.rent_start_date ? formData.rent_start_date.substring(0, 10) : ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Fitout Date</label>
                <input
                  type="date"
                  name="fitout_time"
                  value={formData.fitout_time ? formData.fitout_time.substring(0, 10) : ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Agreement Date (Start)</label>
                <input
                  type="date"
                  name="agreement_date"
                  value={formData.agreement_date ? formData.agreement_date.substring(0, 10) : ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Agreement Date (Expiring)</label>
                <input
                  type="date"
                  name="agreement_expiring"
                  value={formData.agreement_expiring ? formData.agreement_expiring.substring(0, 10) : ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Year's of Agreement</label>
                <input
                  type="number"
                  name="agreement_years"
                  value={formData.agreement_years || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Yearly Escalation (%)</label>
                <input
                  type="number"
                  name="yearly_escalation_percentage"
                  value={formData.yearly_escalation_percentage || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Rent Pay Date (Last Pay Date)</label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date ? formData.payment_date.substring(0, 10) : ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </ComponentCard>

          {/* Electricity Details */}
          <ComponentCard title="Electricity Details">
            {electricityDetails.length > 0 ? (
              electricityDetails.map((detail, index) => (
                <div key={index} className="mb-4 border rounded overflow-hidden">
                  {/* Collapsible Header */}
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-white/[0.03]">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {detail.consumer_name || `Consumer ${index + 1}`}
                      </h3>
                      <button
                        type="button"
                        onClick={() => toggleElectricityDetail(index)}
                        className="text-gray-600 dark:text-gray-300"
                      >
                        {expandedElectricityDetails[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                    {electricityDetails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeElectricityDetail(index)}
                        className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Collapsible Body */}
                  {expandedElectricityDetails[index] && (
                    <div className="p-3 bg-white dark:bg-white/[0.03] border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400">Consumer Name</label>
                          <input
                            type="text"
                            value={detail.consumer_name}
                            onChange={(e) => handleElectricityChange(index, 'consumer_name', e.target.value)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400">Electricity Unit</label>
                          <input
                            type="text"
                            value={detail.unit}
                            onChange={(e) => handleElectricityChange(index, 'unit', e.target.value)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400">Electricity Charges (₹)</label>
                          <input
                            type="text"
                            value={detail.electricity_charges}
                            onChange={(e) => handleElectricityChange(index, 'electricity_charges', e.target.value)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400">Consumer Number</label>
                          <input
                            type="text"
                            value={detail.electricity_consumerno}
                            onChange={(e) => handleElectricityChange(index, 'electricity_consumerno', e.target.value)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400">Electricity Provider</label>
                          <input
                            type="text"
                            value={detail.electricity_provider}
                            onChange={(e) => handleElectricityChange(index, 'electricity_provider', e.target.value)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400">Electricity Status</label>
                          <select
                            value={detail.electricity_status}
                            onChange={(e) => handleElectricityChange(index, 'electricity_status', e.target.value)}
                            className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="" className="text-black dark:text-white bg-white dark:bg-[#121212]">Select Status</option>
                            <option value="Pending" className="text-black dark:text-white bg-white dark:bg-[#121212]">Pending</option>
                            <option value="Paid" className="text-black dark:text-white bg-white dark:bg-[#121212]">Paid</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No electricity information available</p>
            )}
            <button
              type="button"
              onClick={addElectricityDetail}
              className="mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Add Electricity Detail
            </button>
          </ComponentCard>

          {/* Status Information */}
          {/* <ComponentCard title="Status Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Electricity Charges (₹)</label>
                <input
                  type="text"
                  name="electricity_charges"
                  value={formData.electricity_charges || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Electricity Status</label>
                <select
                  name="electricity_status"
                  value={formData.electricity_status || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

            </div>
          </ComponentCard> */}

          {/* Tenant Information */}
          <ComponentCard title="Tenant Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Tenant Name</label>
                <input
                  type="text"
                  name="tenant_name"
                  value={formData.tenant_name || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Mobile No</label>
                <input
                  type="text"
                  name="mobile_no"
                  value={formData.mobile_no || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Agent Details</label>
                <input
                  type="text"
                  name="agent_details"
                  value={formData.agent_details || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Agent Cost</label>
                <input
                  type="number"
                  name="agent_cost"
                  value={formData.agent_cost || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Authorised By</label>
                <input
                  type="text"
                  name="authorised_by "
                  value={formData.authorised_by || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Authorised Person Commission</label>
                <input
                  type="text"
                  name="authorised_person_commissio"
                  value={formData.authorised_person_commissio || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Manage By</label>
                <input
                  type="text"
                  name="manage_by"
                  value={formData.manage_by || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </ComponentCard>

          {/* Links */}
          <ComponentCard title="Important Links">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Google Drive Link</label>
                <input
                  type="url"
                  name="gdrive_link"
                  value={formData.gdrive_link || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Google Location Link</label>
                <input
                  type="url"
                  name="glocation_link"
                  value={formData.glocation_link || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Website Link</label>
                <input
                  type="url"
                  name="website_link"
                  value={formData.website_link || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </ComponentCard>

          {/* Additional Information */}
          {/* <ComponentCard title="Additional Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Agent Details</label>
                <input
                  type="text"
                  name="agent_details"
                  value={formData.agent_details || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Agent Cost (₹)</label>
                <input
                  type="text"
                  name="agent_cost"
                  value={formData.agent_cost || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400">Authorized By</label>
                <input
                  type="text"
                  name="authorised_by"
                  value={formData.authorised_by || ''}
                  onChange={handleChange}
                  className="w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </ComponentCard> */}
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-3 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {submitting ? 'Updating...' : 'Update Site'}
          </button>
        </div>
      </form>
    </div>
  );
}