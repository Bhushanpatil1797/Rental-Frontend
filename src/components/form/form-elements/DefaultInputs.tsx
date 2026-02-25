/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useState } from 'react';
import ComponentCard from '../../common/ComponentCard';
import Label from '../Label';
import Input from '../input/InputField';
import Select from '../Select';
import { ChevronDownIcon } from '../../../icons';
import { toast } from 'react-hot-toast';
import { ChevronDown, ChevronUp, PlusIcon, TrashIcon } from 'lucide-react';
// import Button from '../Button'; // Assuming you have a Button component
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Define property type options
const propertyTypeOptions = [
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
  { value: "industrial", label: "Industrial" },
  { value: "retail", label: "Retail" },
];

// Define status options
const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

// Define paid status options
const paidStatusOptions = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partially Paid" },
];
// Updated Owner form structure to match database column names
interface Owner {
  owner_name: string;
  owner_details: string;
  mobile_no: string;
  email: string;
  owner_account_no: string;
  owner_bank_name: string;
  owner_bank_ifsc: string;
  owner_mobile_no?: string; // This field is optional
  owner_monthly_rent: number;
  siteId?: number; // This will be filled automatically by the backend
}

// Define Electricity Consumer interface
interface ElectricityConsumer {
  consumer_name: string;
  unit: string;
  electricity_charges: string;
  electricity_consumerno: string;
  electricity_provider: string;
  electricity_status: string;
}

// Initial empty owner with updated field names
const emptyOwner: Owner = {
  owner_name: '',
  owner_details: '',
  mobile_no: '',
  email: '',
  owner_account_no: '',
  owner_bank_name: '',
  owner_bank_ifsc: '',
  owner_mobile_no: '',
  owner_monthly_rent: 0
};

// Initial empty electricity consumer
const emptyElectricityConsumer: ElectricityConsumer = {
  consumer_name: '',
  unit: '',
  electricity_charges: '',
  electricity_consumerno: '',
  electricity_provider: '',
  electricity_status: ''
};

export default function AddSiteForm() {
  // State for form data
  const [formData, setFormData] = useState({
    code: '', site_name: '', property_type: '', property_location: '', property_address: '', pincode: '', tenant_name: '',
    address: '', mobile_no: '', email: '', monthly_rent: '', deposit: '', maintenance_charges: '', online_paid: '', cash_paid: '', muncipal_tax: '',
    cma_charges: '', electricity_charges: '', electricity_provider: '', water_charges: '', bank_no: '', bank_name: '', bank_ifsc: '',
    bank_details: '', agreement_date: '', agreement_expiring: '', fitout_time: '', rent_start_date: '',
    agreement_years: '', yearly_escalation_percentage: '', modified: '', total_amount: '', paid_status: '',
    status: 'active', payment_date: '', agent_details: '', agent_cost: '', authorised_by: '', payment_day: '', gst_charges: '', area_size: '',
    electricity_consumerno: '', escalation_percentage: '', added_account_no: '', added_bank_name: '', added_ifsc: '',
    mseb_deposit: '', manage_by: '', rent_type: '', authorised_person_commissio: '', unit: '', consumer_name: '', glocation_link: '',
    site_mobileno: '', website_link: '', gdrive_link: '', rent_status: '', electricity_status: '', owner_renttotal: '',
    // Add this field for electricity consumers
    electricityConsumers: [] as ElectricityConsumer[]
  });

  // State for owners array
  const [owners, setOwners] = useState<Owner[]>([{ ...emptyOwner }]);

  // State for tracking expanded electricity consumer details
  const [expandedElectricityDetails, setExpandedElectricityDetails] = useState<boolean[]>([]);

  // State for loading status
  const [isLoading, setIsLoading] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle date changes
  const handleDateChange = (name: string, dateObj: Date | null, dateStr: string) => {
    setFormData({
      ...formData,
      [name]: dateStr
    });
  };

  // Handle owner input changes with updated field names
  const handleOwnerChange = (index: number, field: keyof Owner, value: string | number) => {
    const updatedOwners = [...owners];
    updatedOwners[index] = {
      ...updatedOwners[index],
      [field]: value
    };
    setOwners(updatedOwners);
  };

  // Add a new owner
  const addOwner = () => {
    setOwners([...owners, { ...emptyOwner }]);
  };

  // Remove an owner
  const removeOwner = (index: number) => {
    if (owners.length > 1) {
      const updatedOwners = [...owners];
      updatedOwners.splice(index, 1);
      setOwners(updatedOwners);
    }
  };
  // ===== Electricity Consumer Management Functions =====
  // Add a new electricity consumer
  const addElectricityConsumer = () => {
    const newConsumer = { ...emptyElectricityConsumer };

    setFormData(prev => ({
      ...prev,
      electricityConsumers: [...prev.electricityConsumers, newConsumer]
    }));

    // Expand the newly added consumer
    setExpandedElectricityDetails(prev => [...prev, true]);
  };

  // Remove an electricity consumer
  const removeElectricityConsumer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      electricityConsumers: prev.electricityConsumers.filter((_, i) => i !== index)
    }));

    // Update expanded state
    setExpandedElectricityDetails(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle expansion of electricity consumer details
  const toggleElectricityDetail = (index: number) => {
    setExpandedElectricityDetails(prev => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  // Handle changes to electricity consumer fields
  const handleElectricityChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedConsumers = [...prev.electricityConsumers];
      updatedConsumers[index] = {
        ...updatedConsumers[index],
        [name]: value
      };
      return {
        ...prev,
        electricityConsumers: updatedConsumers
      };
    });
  };
  // Handle changes for select inputs in electricity consumers
  const handleElectricitySelectChange = (index: number, fieldName: string, selectedValue: string) => {
    setFormData(prev => {
      const updatedConsumers = [...prev.electricityConsumers];
      updatedConsumers[index] = {
        ...updatedConsumers[index],
        [fieldName]: selectedValue
      };
      return {
        ...prev,
        electricityConsumers: updatedConsumers
      };
    });
  };
  // Format electricity data for API submission
  const formatElectricityDataForSubmission = () => {
    const { electricityConsumers } = formData;
    if (electricityConsumers && electricityConsumers.length > 0) {
      return {
        consumer_name: electricityConsumers.map(c => c.consumer_name).join(','),
        unit: electricityConsumers.map(c => c.unit).join(','),
        electricity_charges: electricityConsumers.map(c => c.electricity_charges).join(','),
        electricity_consumerno: electricityConsumers.map(c => c.electricity_consumerno).join(','),
        electricity_provider: electricityConsumers.map(c => c.electricity_provider).join(','),
        electricity_status: electricityConsumers.map(c => c.electricity_status).join(',')
      };
    }
    return {};
  };
  // Submit form data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Format electricity data for API
      const electricityData = formatElectricityDataForSubmission();
      // Format the data with correct field mappings
      const formattedData: any = {
        ...formData,
        ...electricityData, // Merge the formatted electricity data
        monthly_rent: formData.monthly_rent ? parseFloat(formData.monthly_rent.toString()) : null,
        deposit: formData.deposit ? parseFloat(formData.deposit.toString()) : null,
        // Include owners data with proper field names matching database columns
        owners: owners.map(owner => ({
          owner_name: owner.owner_name,
          owner_details: owner.owner_details,
          mobile_no: owner.mobile_no,
          email: owner.email,
          owner_account_no: owner.owner_account_no,
          owner_bank_name: owner.owner_bank_name,
          owner_bank_ifsc: owner.owner_bank_ifsc,
          owner_mobile_no: owner.owner_mobile_no || '', // Optional field
          owner_monthly_rent: parseFloat(owner.owner_monthly_rent.toString()) || 0
        }))
      };
      if ('electricityConsumers' in formattedData) {
        delete formattedData.electricityConsumers;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sites/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formattedData)
      });

      console.log("API Response:",response);
      console.log("API Status:",response.status);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      toast.success('Successfully Site Record Added', {
        duration: 4000,
        position: 'top-center',
      });

      // Reset form
      setFormData({
        code: '', site_name: '', property_type: '', property_location: '', property_address: '', pincode: '', tenant_name: '',
        address: '', mobile_no: '', email: '', monthly_rent: '', deposit: '', maintenance_charges: '', online_paid: '', cash_paid: '', muncipal_tax: '',
        cma_charges: '', electricity_charges: '', electricity_provider: '', water_charges: '', bank_no: '', bank_name: '', bank_ifsc: '',
        bank_details: '', agreement_date: '', agreement_expiring: '', fitout_time: '', rent_start_date: '',
        agreement_years: '', yearly_escalation_percentage: '', modified: '', total_amount: '', paid_status: '',
        status: 'active', payment_date: '', agent_details: '', agent_cost: '', authorised_by: '', payment_day: '', gst_charges: '', area_size: '',
        electricity_consumerno: '', escalation_percentage: '', added_account_no: '', added_bank_name: '', added_ifsc: '',
        mseb_deposit: '', manage_by: '', rent_type: '', authorised_person_commissio: '', unit: '', consumer_name: '', glocation_link: '',
        site_mobileno: '', website_link: '', gdrive_link: '', rent_status: '', electricity_status: '', owner_renttotal: '',
        electricityConsumers: []
      });
      setOwners([{ ...emptyOwner }]);
      setExpandedElectricityDetails([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add site');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* <h1 className="mb-6 text-2xl font-bold">Add New Site</h1> */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 md:grid-cols-2">
          {/* Basic Site Information */}
          <ComponentCard title="Basic Site Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Site Code*</Label>
                <Input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="site_name">Site Name*</Label>
                <Input
                  type="text"
                  id="site_name"
                  name="site_name"
                  value={formData.site_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="property_location">Property Location</Label>
                <Input
                  type="text"
                  id="property_location"
                  name="property_location"
                  value={formData.property_location}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="property_address">Property Address</Label>
                <Input
                  type="text"
                  id="property_address"
                  name="property_address"
                  value={formData.property_address}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="manage_by">Manage By</Label>
                <Input
                  type="text"
                  id="manage_by"
                  name="manage_by"
                  value={formData.manage_by}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="payment_day">Payment Day</Label>
                <Input
                  type="text"
                  id="payment_day"
                  name="payment_day"
                  value={formData.payment_day}
                  onChange={handleInputChange}

                />
              </div>
              <div>
                <Label htmlFor="property_type">Property Type</Label>
                <div className="relative">
                  <Select
                    options={propertyTypeOptions}
                    placeholder="Select property type"
                    onChange={(value) => handleSelectChange('property_type', value)}
                    value={formData.property_type}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <div className="relative">
                  <Select
                    options={statusOptions}
                    value={formData.status}
                    onChange={(value) => handleSelectChange('status', value)}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            </div>
          </ComponentCard>
          {/* Owners Section - Updated field names */}
          <ComponentCard title="Owners">
            <div className="space-y-4">
              {owners.map((owner, index) => (
                <div key={index} className="p-4 mb-4 border border-gray-200 rounded-lg dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-amber-50">Owner {index + 1}</h3>
                    {owners.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOwner(index)}
                        className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`owner-name-${index}`}>Name</Label>
                      <Input
                        type="text"
                        id={`owner-name-${index}`}
                        value={owner.owner_name}
                        onChange={(e) => handleOwnerChange(index, 'owner_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`owner-details-${index}`}>Remarks</Label>
                      <Input
                        type="text"
                        id={`owner-details-${index}`}
                        value={owner.owner_details}
                        onChange={(e) => handleOwnerChange(index, 'owner_details', e.target.value)}
                      />
                    </div>
                    {/* <div>
                      <Label htmlFor={`owner-mobile-${index}`}>Mobile Number</Label>
                      <Input
                        type="text"
                        id={`owner-mobile-${index}`}
                        value={owner.mobile_no}
                        onChange={(e) => handleOwnerChange(index, 'mobile_no', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`owner-email-${index}`}>Email</Label>
                      <Input
                        type="email"
                        id={`owner-email-${index}`}
                        value={owner.email}
                        onChange={(e) => handleOwnerChange(index, 'email', e.target.value)}
                      />
                    </div> */}
                    <div>
                      <Label htmlFor={`owner-account-${index}`}>Bank Account</Label>
                      <Input
                        type="text"
                        id={`owner-account-${index}`}
                        value={owner.owner_account_no}
                        onChange={(e) => handleOwnerChange(index, 'owner_account_no', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`owner-bank-name-${index}`}>Bank Name</Label>
                      <Input
                        type="text"
                        id={`owner-bank-name-${index}`}
                        value={owner.owner_bank_name}
                        onChange={(e) => handleOwnerChange(index, 'owner_bank_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`owner-ifsc-${index}`}>IFSC Code</Label>
                      <Input
                        type="text"
                        id={`owner-ifsc-${index}`}
                        value={owner.owner_bank_ifsc}
                        onChange={(e) => handleOwnerChange(index, 'owner_bank_ifsc', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`owner-mobile-no-${index}`}>Mobile Number (Optional)</Label>
                      <Input
                        type="text"
                        id={`owner-mobile-no-${index}`}
                        value={owner.owner_mobile_no || ''}
                        onChange={(e) => handleOwnerChange(index, 'owner_mobile_no', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`owner-rent-${index}`}>Monthly Rent</Label>
                      <Input
                        type="number"
                        id={`owner-rent-${index}`}
                        value={owner.owner_monthly_rent}
                        onChange={(e) => handleOwnerChange(index, 'owner_monthly_rent', parseFloat(e.target.value))}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addOwner}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Add Owner
              </button>
            </div>
          </ComponentCard>
          {/* Financial Information */}
          <ComponentCard title="Rent Details">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="added_bank_name">Added Bank Name </Label>
                <Input
                  type="text"
                  id="added_bank_name"
                  name="added_bank_name"
                  value={formData.added_bank_name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="added_account_no">Added Bank Acc. No. </Label>
                <Input
                  type="text"
                  id="added_account_no"
                  name="added_account_no"
                  value={formData.added_account_no}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="area_size">Area Sq.Foot</Label>
                <Input
                  type="number"
                  id="area_size"
                  name="area_size"
                  value={formData.area_size}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="monthly_rent">Monthly Rent</Label>
                <Input
                  type="number"
                  id="monthly_rent"
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="online_paid">Online Paid</Label>
                <Input
                  type="number"
                  id="online_paid"
                  name="online_paid"
                  value={formData.online_paid}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="cash_paid">Cash Paid</Label>
                <Input
                  type="number"
                  id="cash_paid"
                  name="cash_paid"
                  value={formData.cash_paid}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="deposit">Deposit</Label>
                <Input
                  type="number"
                  id="deposit"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="maintenance_charges">Maintenance</Label>
                <Input
                  type="number"
                  id="maintenance_charges"
                  name="maintenance_charges"
                  value={formData.maintenance_charges}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="gst_charges">GST (₹)</Label>
                <Input
                  type="number"
                  id="gst_charges"
                  name="gst_charges"
                  value={formData.gst_charges}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="muncipal_tax">Muncipal Tax* (₹)</Label>
                <Input
                  type="number"
                  id="muncipal_tax"
                  name="muncipal_tax"
                  value={formData.muncipal_tax}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="cma_charges">CAM Charges* (₹)</Label>
                <Input
                  type="number"
                  id="cma_charges"
                  name="cma_charges"
                  value={formData.cma_charges}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="water_charges">Water Charges* (₹)</Label>
                <Input
                  type="number"
                  id="water_charges"
                  name="water_charges"
                  value={formData.water_charges}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="owner_renttotal">Owner Rent Total (₹)</Label>
                <Input
                  type="number"
                  id="owner_renttotal"
                  name="owner_renttotal"
                  value={formData.owner_renttotal}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="rent_status">Rent Status</Label>
                <div className="relative">
                  <Select
                    options={paidStatusOptions}
                    value={formData.rent_status}
                    onChange={(value) => handleSelectChange('rent_status', value)}
                    className="dark:bg-dark-900"
                  />
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            </div>
          </ComponentCard>
          {/* Agreement Information */}
          <ComponentCard title="Agreement Information">
            <div className="grid grid-cols-2 gap-4">
              {/* Existing Fields */}
              <div>
                <Label htmlFor="rent_start_date">Rent Date (Start)</Label>
                <Input
                  type="date"
                  id="rent_start_date"
                  name="rent_start_date"
                  value={formData.rent_start_date}
                  onChange={handleInputChange}
                />
              </div>
              {/* <div>
                <Label htmlFor="monthly_rent">Monthly Rent</Label>
                <Input
                  type="number"
                  id="monthly_rent"
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleInputChange}
                />
              </div> */}
              {/* <div>
                <Label htmlFor="deposit">Deposit</Label>
                <Input
                  type="number"
                  id="deposit"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleInputChange}
                />
              </div> */}
              {/* New Fields from Update Form */}
              <div>
                <Label htmlFor="fitout_time">Fitout Date</Label>
                <Input
                  type="date"
                  id="fitout_time"
                  name="fitout_time"
                  value={formData.fitout_time}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="agreement_date">Agreement Date (Start)</Label>
                <Input
                  type="date"
                  id="agreement_date"
                  name="agreement_date"
                  value={formData.agreement_date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="agreement_expiring">Agreement Date (Expiring)</Label>
                <Input
                  type="date"
                  id="agreement_expiring"
                  name="agreement_expiring"
                  value={formData.agreement_expiring}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="agreement_years">Year's of Agreement</Label>
                <Input
                  type="number"
                  id="agreement_years"
                  name="agreement_years"
                  value={formData.agreement_years}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="yearly_escalation_percentage">Yearly Escalation (%)</Label>
                <Input
                  type="number"
                  id="yearly_escalation_percentage"
                  name="yearly_escalation_percentage"
                  value={formData.yearly_escalation_percentage}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="payment_date">Rent Pay Date (Last Pay Date)</Label>
                <Input
                  type="date"
                  id="payment_date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </ComponentCard>
          {/* Electricity Details Section */}
          <ComponentCard title="Electricity Details">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">Electricity Consumers</h3>
              <button
                onClick={addElectricityConsumer}
                type="button"
                className="flex items-center border px-2 py-1 rounded text-sm"
              >
                <PlusIcon className="mr-1" size={16} />
                Add Consumer
              </button>
            </div>
            {formData.electricityConsumers && formData.electricityConsumers.length > 0 ? (
              formData.electricityConsumers.map((consumer, index) => (
                <div key={index} className="mb-4 border rounded overflow-hidden">
                  {/* Collapsible Header */}
                  <div
                    className="flex justify-between items-center p-3 bg-white dark:bg-white/[0.03] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => toggleElectricityDetail(index)}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {consumer.consumer_name || `Consumer ${index + 1}`}
                    </h3>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElectricityConsumer(index);
                        }}
                        className="text-red-500 hover:text-red-700 mr-3"
                      >
                        <TrashIcon size={18} />
                      </button>
                      <div className="text-gray-600 dark:text-gray-300">
                        {expandedElectricityDetails[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>
                  {/* Collapsible Body */}
                  {expandedElectricityDetails[index] && (
                    <div className="p-3 bg-white dark:bg-white/[0.03] border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`consumer_name_${index}`}>Consumer Name</Label>
                          <Input
                            type="text"
                            id={`consumer_name_${index}`}
                            name="consumer_name"
                            value={consumer.consumer_name || ''}
                            onChange={(e) => handleElectricityChange(index, e)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`unit_${index}`}>Electricity Unit</Label>
                          <Input
                            type="text"
                            id={`unit_${index}`}
                            name="unit"
                            value={consumer.unit || ''}
                            onChange={(e) => handleElectricityChange(index, e)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`electricity_charges_${index}`}>Electricity Charges (₹)</Label>
                          <Input
                            type="number"
                            id={`electricity_charges_${index}`}
                            name="electricity_charges"
                            value={consumer.electricity_charges || ''}
                            onChange={(e) => handleElectricityChange(index, e)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`electricity_consumerno_${index}`}>Consumer Number</Label>
                          <Input
                            type="text"
                            id={`electricity_consumerno_${index}`}
                            name="electricity_consumerno"
                            value={consumer.electricity_consumerno || ''}
                            onChange={(e) => handleElectricityChange(index, e)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`electricity_provider_${index}`}>Electricity Provider</Label>
                          <Input
                            type="text"
                            id={`electricity_provider_${index}`}
                            name="electricity_provider"
                            value={consumer.electricity_provider || ''}
                            onChange={(e) => handleElectricityChange(index, e)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`electricity_status_${index}`}>Electricity Status</Label>
                          <div className="relative">
                            <Select
                              options={[
                                { label: 'Pending', value: 'Pending' },
                                { label: 'Paid', value: 'Paid' }
                              ]}
                              value={consumer.electricity_status || ''}
                              onChange={(value) => handleElectricitySelectChange(index, 'electricity_status', value)}
                              className="dark:bg-dark-900"
                            />
                            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                              <ChevronDownIcon />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center p-4 border rounded border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-400">No electricity consumers added yet</p>
                <button
                  onClick={addElectricityConsumer}
                  type="button"
                  className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-[#121212] dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Consumer
                </button>
              </div>
            )}
          </ComponentCard>
          {/* Tenant Information */}
          <ComponentCard title="Tenant Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tenant_name">Tenant Name</Label>
                <Input
                  type="text"
                  id="tenant_name"
                  name="tenant_name"
                  value={formData.tenant_name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="address">Tenant Address</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="mobile_no">Mobile Number</Label>
                <Input
                  type="text"
                  id="mobile_no"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="tenant_name">Agent Details</Label>
                <Input
                  type="text"
                  id="agent_details"
                  name="agent_details"
                  value={formData.agent_details}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="agent_cost">Agent Cost</Label>
                <Input
                  type="text"
                  id="agent_cost"
                  name="agent_cost"
                  value={formData.agent_cost}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="authorised_by">Authorised By</Label>
                <Input
                  type="text"
                  id="authorised_by"
                  name="authorised_by"
                  value={formData.authorised_by}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="payment_day">Authorize Person Commission</Label>
                <Input
                  type="text"
                  id="authorised_person_commissio"
                  name="authorised_person_commissio"
                  value={formData.authorised_person_commissio}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </ComponentCard>
          {/* Important Links */}
          <ComponentCard title="Important Links">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="gdrive_link">Google Drive Link</Label>
                <Input
                  type="url"
                  id="gdrive_link"
                  name="gdrive_link"
                  value={formData.gdrive_link}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="glocation_link">Google Location Link</Label>
                <Input
                  type="url"
                  id="glocation_link"
                  name="glocation_link"
                  value={formData.glocation_link}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="website_link">Website Link</Label>
                <Input
                  type="url"
                  id="website_link"
                  name="website_link"
                  value={formData.website_link}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </ComponentCard>
        </div>
        {/* Form Actions */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="button"
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Site'}
          </button>
        </div>
      </form>
    </div>
  );
}