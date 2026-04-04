/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp } from 'lucide-react';
import OwnerSelect from '@/components/owners/OwnerSelect';

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
  const [selectedOwnerIds, setSelectedOwnerIds] = useState<(string | number)[]>([]);
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
        
        // Prevent API calls with invalid IDs
        if (!siteId || siteId === "undefined" || siteId === "[id]") {
          console.error("Invalid siteId in URL parameters:", params);
          setLoading(false);
          setError("Invalid Site ID: The URL is missing a valid identifier. Please navigate back to the Sites list and try again.");
          return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/rent/sites/${siteId}`;
        console.log("Fetching site details from:", url);

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Site Details API Response Status:", response.status);

        if (!response.ok) {
          console.error("API Response Error:", response);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Site Details Fetched Data:", data);

        // Handle nested response if exists
        const siteData = data?.site ?? data?.data ?? data;

        // Normalize siteData by supporting both snake_case and camelCase
        const normalized = { ...siteData };
        const mapping: Record<string, string> = {
          siteName: 'site_name',
          propertyType: 'property_type',
          propertyLocation: 'property_location',
          propertyAddress: 'property_address',
          tenantName: 'tenant_name',
          monthlyRent: 'monthly_rent',
          paidStatus: 'paid_status',
          rentStatus: 'rent_status',
          electricityStatus: 'electricity_status',
          gstCharges: 'gst_charges',
          maintenanceCharges: 'maintenance_charges',
          municipalTax: 'muncipal_tax', // Fixed: backend uses municipalTax
          muncipalTax: 'muncipal_tax', // Keep for safety
          cmaCharges: 'cma_charges',
          electricityCharges: 'electricity_charges',
          electricityProvider: 'electricity_provider',
          waterCharges: 'water_charges',
          bankName: 'added_bank_name',
          addedBankName: 'added_bank_name', // camelCase version
          accountNo: 'added_account_no',
          addedAccountNo: 'added_account_no', // camelCase version
          ifscCode: 'added_ifsc',
          addedIfsc: 'added_ifsc', // camelCase version
          agreementDate: 'agreement_date',
          agreementExpiring: 'agreement_expiring',
          fitoutTime: 'fitout_time',
          rentStartDate: 'rent_start_date',
          agreementYears: 'agreement_years',
          yearlyEscalationPercentage: 'yearly_escalation_percentage',
          authorisedBy: 'authorised_by',
          managedBy: 'manage_by', // Fixed: backend uses managedBy
          manageBy: 'manage_by', // Keep for safety
          paymentDate: 'payment_date',
          paymentDay: 'payment_day',
          ownerRenttotal: 'owner_renttotal',
          electricityConsumerNo: 'electricity_consumerno', // Fixed case
          electricityConsumerno: 'electricity_consumerno', // Keep for safety
          areaSize: 'area_size',
          rentType: 'rent_type',
          consumerName: 'consumer_name',
          siteMobileNo: 'site_mobileno', // Fixed case
          siteMobileno: 'site_mobileno', // Keep for safety
          agentCost: 'agent_cost',
          agentDetails: 'agent_details',
          authorisedPersonCommission: 'authorised_person_commissio',
          increasedRent: 'increased_rent',
          escalationPercentage: 'escalation_percentage',
          msebDeposit: 'mseb_deposit',
          gdriveLink: 'gdrive_link',
          glocationLink: 'glocation_link',
          websiteLink: 'website_link',
          tenantAddress: 'address',
          tenantEmail: 'email',
          tenantMobileNo: 'mobile_no',
          city: 'city',
          pincode: 'pincode'
        };

        Object.entries(mapping).forEach(([camel, snake]) => {
          if (normalized[camel] !== undefined && normalized[camel] !== null) {
            normalized[snake] = normalized[camel];
          }
        });

        // Extract owner IDs for selection
        if (normalized.owners) {
          setSelectedOwnerIds(normalized.owners.map((o: any) => o._id || o.id));
        }

        // Also normalize owners
        if (normalized.owners && Array.isArray(normalized.owners)) {
          normalized.owners = normalized.owners.map((owner: any) => {
            const normalizedOwner = { ...owner };

            // Extract from nested ownerId object if it exists
            if (owner.ownerId && typeof owner.ownerId === 'object') {
              normalizedOwner.ownerName = owner.ownerId.ownerName || normalizedOwner.ownerName;
              normalizedOwner.ownerDetails = owner.ownerId.ownerDetails || normalizedOwner.ownerDetails;
              normalizedOwner.ownerMobileNo = owner.ownerId.mobileNo || normalizedOwner.ownerMobileNo;
            }

            // Extract from nested bankAccount object if it exists
            if (owner.bankAccount && typeof owner.bankAccount === 'object') {
              normalizedOwner.ownerBankName = owner.bankAccount.bankName || normalizedOwner.ownerBankName;
              normalizedOwner.ownerAccountNo = owner.bankAccount.accountNo || normalizedOwner.ownerAccountNo;
              normalizedOwner.ownerBankIfsc = owner.bankAccount.ifsc || normalizedOwner.ownerBankIfsc;
            }

            const ownerMapping: Record<string, string> = {
              ownerName: 'owner_name',
              ownerDetails: 'owner_details',
              ownerMobileNo: 'owner_mobile_no',
              ownerAccountNo: 'owner_account_no',
              ownerBankName: 'owner_bank_name',
              ownerBankIfsc: 'owner_bank_ifsc',
              ownerMonthlyRent: 'owner_monthly_rent',
              ownerId: 'id'
            };
            Object.entries(ownerMapping).forEach(([camel, snake]) => {
              if (normalizedOwner[camel] !== undefined && normalizedOwner[camel] !== null) {
                normalizedOwner[snake] = normalizedOwner[camel];
              }
            });
            return normalizedOwner;
          });
        }

        setFormData(normalized);
      } catch (error) {
        console.error("Error fetching site details:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch site details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id && params.id !== "undefined") {
      fetchSiteDetails();
    } else if (params.id === "undefined") {
      setLoading(false);
      setError("Invalid Site ID");
    }
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  // Handle owners selection change
  const handleOwnersChange = (ids: (string | number)[]) => {
    setSelectedOwnerIds(ids);
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
      const consumerNames = String(formData.consumer_name || '').split(',').map(name => name.trim());
      const units = String(formData.unit || '').split(',').map(unit => unit.trim());
      const charges = String(formData.electricity_charges || '').split(',').map(charge => charge.trim());
      const consumerNos = String(formData.electricity_consumerno || '').split(',').map(no => no.trim());
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

      // Map snake_case values back to camelCase for the API
      const denormalized = { ...formData };
      const mapping: Record<string, string> = {
        site_name: 'siteName',
        property_type: 'propertyType',
        property_location: 'propertyLocation',
        property_address: 'propertyAddress',
        tenant_name: 'tenantName',
        monthly_rent: 'monthlyRent',
        paid_status: 'paidStatus',
        rent_status: 'rentStatus',
        electricity_status: 'electricityStatus',
        gst_charges: 'gstCharges',
        maintenance_charges: 'maintenanceCharges',
        muncipal_tax: 'muncipalTax',
        cma_charges: 'cmaCharges',
        electricity_charges: 'electricityCharges',
        electricity_provider: 'electricityProvider',
        water_charges: 'waterCharges',
        added_bank_name: 'bankName',
        added_account_no: 'accountNo',
        added_ifsc: 'ifscCode',
        agreement_date: 'agreementDate',
        agreement_expiring: 'agreementExpiring',
        fitout_time: 'fitoutTime',
        rent_start_date: 'rentStartDate',
        agreement_years: 'agreementYears',
        yearly_escalation_percentage: 'yearlyEscalationPercentage',
        authorised_by: 'authorisedBy',
        manage_by: 'manageBy',
        payment_date: 'paymentDate',
        payment_day: 'paymentDay',
        owner_renttotal: 'ownerRenttotal',
        electricity_consumerno: 'electricityConsumerno',
        area_size: 'areaSize',
        rent_type: 'rentType',
        consumer_name: 'consumerName',
        site_mobileno: 'siteMobileno',
        agent_cost: 'agentCost',
        agent_details: 'agentDetails',
        authorised_person_commissio: 'authorisedPersonCommission',
        increased_rent: 'increasedRent',
        escalation_percentage: 'escalationPercentage',
        city: 'city',
        pincode: 'pincode'
      };

      Object.entries(mapping).forEach(([snake, camel]) => {
        if ((denormalized as any)[snake] !== undefined) {
          (denormalized as any)[camel] = (denormalized as any)[snake];
          // Optionally remove snake_case keys to send a cleaner payload
          // delete (denormalized as any)[snake]; 
        }
      });

      // Format nested objects properly
      const submissionData = {
        ...denormalized,
        owners: selectedOwnerIds.map(id => ({ id })), // Backend might need full objects or just IDs
        consumers: (denormalized as any).electricityConsumers || []
      };

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/rent/sites/${params.id}`;
      console.log("Updating site at:", url);
      console.log("Update Payload:", submissionData);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
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
    <div className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Basic Site Information */}
          <ComponentCard title="Basic Site Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <ComponentCard title="Assign Owners">
            <OwnerSelect 
              selectedOwnerIds={selectedOwnerIds} 
              onChange={handleOwnersChange} 
            />
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
                  type="text"
                  name="fitout_time"
                  value={formData.fitout_time || ''}
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