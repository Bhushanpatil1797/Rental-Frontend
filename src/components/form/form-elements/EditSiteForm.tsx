
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ComponentCard from '@/components/common/ComponentCard';
import Badge from '@/components/ui/badge/Badge';
import RentEscalationTable from './RentEscalationTable';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SiteRentTransactionsTable from '../../tables/SiteRenttransaction';
interface Owner {
  owner_mobile_no: string;
  id: number;
  owner_name: string;
  owner_details: string;
  mobile_no?: string;
  email?: string;
  owner_account_no: string;
  owner_bank_name: string;
  owner_bank_ifsc: string;
  owner_monthly_rent: string;
  siteId?: number;
  createdAt?: string;
  updatedAt?: string;
}

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
  // Add other fields as needed
}
interface SiteRentTransactionsTableProps {
  siteId: number | string;
  site: Site;
}

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

        // The API returns site data directly, not nested under a 'site' property
        setSite(data);
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

  const handleDelete = async () => {
    if (!site || !params.id) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sites/${params.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Successfully deleted, navigate back to sites list
      router.push('/basic-tables');
    } catch (error) {
      console.error("Error deleting site:", error);
      setError(error instanceof Error ? error.message : "Failed to delete site");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-xl">Loading site details...</div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-xl text-red-500">
          {error || "Site not found"}
        </div>
      </div>
    );
  }

  const OwnerInfoSection = ({ owners }: { owners: Owner[] }) => {
    const [expandedOwners, setExpandedOwners] = useState(
      owners?.map(() => false) || []
    );

    const toggleOwner = (index: number) => {
      setExpandedOwners((prev) =>
        prev.map((expanded, i) => (i === index ? !expanded : expanded))
      );
    };

    if (!owners || owners.length === 0) {
      return <p className="text-gray-500 dark:text-gray-400">No owner information available</p>;
    }

    return (
      <div>
        {owners.map((owner, index) => (
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
                  {expandedOwners[index] ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Body */}
            {expandedOwners[index] && (
              <div className="p-3 bg-white dark:bg-white/[0.03] border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <DisplayField label="Owner Name" value={owner.owner_name} />
                  <DisplayField label="Monthly Rent" value={`₹${owner.owner_monthly_rent || 'N/A'}`} />
                  <DisplayField label="Bank" value={owner.owner_bank_name} />
                  <DisplayField label="Account No." value={owner.owner_account_no} />
                  <DisplayField label="IFSC No." value={owner.owner_bank_ifsc} />
                  <DisplayField label="Mobile No." value={owner.owner_mobile_no} />
                  <div className="col-span-2">
                    <DisplayField label="Remarks" value={owner.owner_details} multiline />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  interface DisplayFieldProps {
    label: string;
    value: string | number | undefined | null;
    multiline?: boolean;
  }

  const DisplayField: React.FC<DisplayFieldProps> = ({ label, value, multiline = false }) => (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white bg-white dark:bg-white/[0.03] border-gray-300 dark:border-gray-600 ${multiline ? 'whitespace-pre-wrap' : ''
          }`}
      >
        {value || 'N/A'}
      </p>
    </div>
  );


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">{site.site_name}</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Back
          </button>
          <button
            onClick={() => router.push(`/site/edit/${site.id}`)}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Edit Site
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
          >
            Delete Site
          </button>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-lg dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete "{site.site_name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Basic Site Information */}
        <ComponentCard title="Site Information">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Site Code</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.code || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Site Name (SPA)</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.site_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Property Location (Region)</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.property_location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Property Address (Area)</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.property_address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pincode</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.pincode || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Managed By</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.manage_by || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Day (1 to 10)</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.payment_day || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Property Type</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.property_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Bank Name</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.added_bank_name || 'N/A'}</p>
            </div>
          </div>
        </ComponentCard>

        {/* Owner Information */}
        {/* <ComponentCard title="Owner's Information">
          {site.owners && site.owners.length > 0 ? (
            site.owners.map((owner, index) => (
              <div key={owner.id || index} className="mb-4 p-3 border rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Owner Name</p>
                    <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{owner.owner_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Rent</p>
                    <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">₹{owner.owner_monthly_rent || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bank</p>
                    <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{owner.owner_bank_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account No.</p>
                    <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{owner.owner_account_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">IFSC No.</p>
                    <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{owner.owner_bank_ifsc || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mobile No.</p>
                    <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{owner.owner_mobile_no || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remarks</p>
                    <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{owner.owner_details || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No owner information available</p>
          )}
        </ComponentCard> */}
        <ComponentCard title="Owner's Information">
          <OwnerInfoSection owners={site.owners} />
        </ComponentCard>

        {/* Financial Details */}
        <ComponentCard title="Rent Details">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Area Sq.Foot</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">₹{site.area_size || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Rent (Base Rent)</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">₹{site.monthly_rent || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deposit</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">₹{site.deposit || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Maintenance</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">₹{site.maintenance_charges || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">GST*</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">₹{site.gst_charges || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Muncipal Tax*</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">₹{site.muncipal_tax || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">CAM Charges*</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">₹{site.cma_charges || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Water Charges*</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">₹{site.water_charges || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Owner Rent Total</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">₹{site.owner_renttotal || 'N/A'}</p>
            </div>
            {/* <div>
              <p className="text-sm text-gray-500">Municipal Tax</p>
              <p className="font-medium w-50 p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">₹{site.muncipal_tax || 'N/A'}</p>
            </div> */}
            <div>
              <p className="text-sm text-gray-500">Rent Pay Status (Current Status)</p>
              <Badge
                size="sm"
                color={site.rent_status?.toLowerCase() === "pending" ? "warning" : "success"}
              >
                {site.rent_status || 'N/A'}
              </Badge>
            </div>
          </div>
        </ComponentCard>

        {/* Agreement Information */}
        <ComponentCard title="Agreement Information">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Rent Date (Start)</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.rent_start_date || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fitout Date</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.fitout_time || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Agreement Date (Start)</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.agreement_date || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Agreement Date (Expiring)</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.agreement_expiring || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Year's of Agreement</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.agreement_years || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Yearly Escalation (%)</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.yearly_escalation_percentage || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rent Pay Date (Last Pay Date)</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.payment_date || 'N/A'}</p>
            </div>
          </div>
          {/* Rent Escalation Schedule */}
          <ComponentCard title="Rent Escalation Schedule">
            <RentEscalationTable site={{ ...site, monthly_rent: (site.monthly_rent ?? 0).toString() }} />
          </ComponentCard>
        </ComponentCard>

        {/* Electricity Details */}
        <ComponentCard title="Electricity Details">
          {site.consumer_name ? (
            site.consumer_name.split(',').map((name, index) => {
              const units = site.unit?.split(',') || [];
              const charges = site.electricity_charges?.split(',') || [];
              const consumerNos = site.electricity_consumerno?.split(',') || [];

              return (
                <div key={index} className="mb-4 p-3 border rounded">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Consumer Name</p>
                      <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        {name.trim() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Electricity Unit</p>
                      <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        {units[index]?.trim() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Electricity Charges</p>
                      <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        ₹{charges[index]?.trim() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Consumer Number</p>
                      <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        {consumerNos[index]?.trim() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Electricity Provider</p>
                      <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        {site.electricity_provider || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 ">Electricity Status</p>
                      <Badge
                        size="sm"
                        color={site.electricity_status?.toLowerCase() === "pending" ? "warning" : "success"}
                      >
                        {site.electricity_status || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No electricity information available</p>
          )}
        </ComponentCard>

        {/* Tenant Information */}
        <ComponentCard title="Tenant Information">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tenant Name</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.tenant_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mobile No.</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.mobile_no || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 overflow-x-auto">{site.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Agent Details</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.agent_details || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Agent Cost</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.agent_cost || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Authorised By</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.authorised_by || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Authorised Person Commission</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.authorised_person_commissio || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Manage By</p>
              <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03] focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{site.manage_by || 'N/A'}</p>
            </div>
          </div>
        </ComponentCard>

        {/* Links */}
        {/* <ComponentCard title="Important Links">
          <div className="grid grid-cols-1 gap-4">
            {site.gdrive_link && (
              <a href={site.gdrive_link} target="_blank" rel="noopener noreferrer"
                className="text-blue-500 hover:underline">
                Google Drive Link
              </a>
            )}
            {site.glocation_link && (
              <a href={site.glocation_link} target="_blank" rel="noopener noreferrer"
                className="text-blue-500 hover:underline ">
                Google Location Link
              </a>
            )}
            {site.website_link && (
              <a href={site.website_link} target="_blank" rel="noopener noreferrer"
                className="text-blue-500 hover:underline">
                Website Link
              </a>
            )}
            {!site.gdrive_link && !site.glocation_link && !site.website_link && (
              <p className="text-gray-500">No links available</p>
            )}
          </div>
        </ComponentCard> */}
        {/* <ComponentCard title="Rent Transactions">
         <SiteRentTransactionsTable siteId={site.id} site={site} />
        </ComponentCard> */}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-1">
        <ComponentCard title="Rent Transactions">
          <SiteRentTransactionsTable siteId={site.id.toString()} site={site} />
        </ComponentCard>
      </div>
    </div>
  );
}