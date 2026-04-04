/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, MapPin, Calendar, Phone, CreditCard } from 'lucide-react'
import RentPaymentForm from '@/components/form/form-elements/RentPayments'
import RentEscalationTable from '@/components/form/form-elements/RentEscalationTable'
import ElectricityPaymentForm from '@/components/form/form-elements/ElectricityPayments'
import { Toaster } from 'react-hot-toast'

type ComponentCardProps = {
  title: React.ReactNode
  children: React.ReactNode
}

const ComponentCard: React.FC<ComponentCardProps> = ({ title, children }) => {
  return (
    <div className="p-4 mb-4 bg-white border rounded-lg shadow-sm dark:bg-white/[0.03] dark:border-gray-700">
      <h2 className="mb-3 font-medium text-gray-900 text-md dark:text-white">{title}</h2>
      {children}
    </div>
  )
}

const Page = () => {
  const [sites, setSites] = useState<any[]>([])

  const [query, setQuery] = useState('')
  const [filteredSites, setFilteredSites] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSite, setSelectedSite] = useState<any>(null)
  const [siteDetails, setSiteDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [expandedOwners, setExpandedOwners] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token not found in localStorage")

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/rent/sites`;
        console.log("Fetching sites from:", url);

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("Electricity Page - Fetch Sites Response Status:", res.status)

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }

        const data = await res.json()
        console.log("Electricity Page - Fetch Sites JSON data:", data)

        // Standard check for data location
        const siteList = data.data || data.sites || (Array.isArray(data) ? data : [])
        console.log("Electricity Page - Extracted siteList:", siteList)

        setSites(siteList)
        setError(null)
      } catch (error: any) {
        console.error("Failed to fetch sites:", error)
        setError(error.message || "Error fetching sites")
        setSites([])
      } finally {
        setLoading(false)
      }
    }

    fetchSites()
  }, [])

  useEffect(() => {
    if (query.trim() === '') {
      setFilteredSites([])
      return
    }

    const filtered = sites.filter(site =>
      (site.siteName || site.site_name)?.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredSites(filtered)
  }, [query, sites])

  const fetchSiteDetails = async (siteId: string) => {
    setLoadingDetails(true)
    setSiteDetails(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Token not found in localStorage")

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/rent/sites/${siteId}`;
      console.log("Fetching site details from:", url);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Electricity Page - Site Details Response Status:", res.status)

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      const data = await res.json()
      console.log("Electricity Page - Site Details JSON data:", data)

      const details = data.data || data
      console.log("Electricity Page - Unwrapped details:", details)
      setSiteDetails(details)

      // Initialize all owners as collapsed using camelCase or fallback
      const owners = details.owners || details.ownerId || []
      if (owners.length > 0) {
        const initialOwnerState: { [key: number]: boolean } = {}
        owners.forEach((_: any, index: number) => {
          initialOwnerState[index] = false
        })
        setExpandedOwners(initialOwnerState)
      }

      setError(null)
    } catch (error: any) {
      console.error("Failed to fetch site details:", error)
      setError(error.message || "Error fetching site details")
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleSiteClick = async (site: any) => {
    setSelectedSite(site)
    await fetchSiteDetails(site._id || site.id)
  }

  const handleBackToSearch = () => {
    setSelectedSite(null)
    setSiteDetails(null)
  }

  const toggleOwner = (index: number) => {
    setExpandedOwners(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (e) {
      return 'Invalid Date'
    }
  }

  return (
    <div className="p-4">
      {/* Add the Toaster component here */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Default options
          className: '',
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Success toast styling
          success: {
            duration: 4000,
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          // Error toast styling
          error: {
            duration: 4000,
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
        }}
      />
      {!selectedSite ? (
        // Search View
        <>
          <h1 className="text-xl font-semibold mb-4 dark:text-white">Search Site's</h1>
          <input
            type="text"
            placeholder="Search site name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className=" p-2 w-full mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white"
          />

          {loading ? (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2">Loading sites...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
              Error: {error}
            </div>
          ) : (
            query.trim() !== '' && (
              <div className="border rounded overflow-hidden">
                {filteredSites.length > 0 ? (
                  filteredSites.map(site => (
                    <div
                      key={site._id || site.id}
                      className="p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                      onClick={() => handleSiteClick(site)}
                    >
                      <div>
                        <div className="text-blue-600 font-medium hover:underline">
                          {site.siteName || site.site_name}
                        </div>
                        {(site.propertyLocation || site.property_location) && (
                          <div className="text-gray-500 text-sm flex items-center mt-1">
                            <MapPin size={14} className="mr-1" />
                            {site.propertyLocation || site.property_location}
                          </div>
                        )}
                      </div>
                      <div className="text-gray-400">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No results found for "{query}"
                  </div>
                )}
              </div>
            )
          )}
        </>
      ) : (
        // Site Details View
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedSite.siteName || selectedSite.site_name}
            </h1>
            <button
              onClick={handleBackToSearch}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Back to Search
            </button>
          </div>
          {loadingDetails ? (
            <div className="py-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4">Loading site details...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
              Error: {error}
            </div>
          ) : siteDetails ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Basic Site Information */}
              <ComponentCard title="Basic Site Information">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 ">Site Name</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.siteName || siteDetails.site_name || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Site Code</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.code || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Property Location</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.propertyLocation || siteDetails.property_location || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Property Type</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.propertyType || siteDetails.property_type || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Pincode</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.pincode || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Managed By</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.managedBy || siteDetails.manage_by || 'N/A'}</div>
                  </div>
                  <div className="mt-4 pb-7">
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Property Address</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.propertyAddress || siteDetails.property_address || 'N/A'}</div>
                  </div>
                  <div className="mt-4 pb-7">
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Added Bank Account</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.addedBankName || siteDetails.added_bank_name || 'N/A'}</div>
                  </div>
                </div>
                {/* Agreement Information */}
                <ComponentCard title="Agreement Information">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Agreement Date</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400 " />
                        {formatDate(siteDetails.agreementDate || siteDetails.agreement_date)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Agreement Expiring</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {formatDate(siteDetails.agreementExpiring || siteDetails.agreement_expiring)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Rent Start Date</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {formatDate(siteDetails.rentStartDate || siteDetails.rent_start_date)}
                      </div>
                    </div>
                    {/* <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Payment Date</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {siteDetails.payment_date
                          ? formatDate(siteDetails.payment_date)
                          : `Day ${siteDetails.payment_day || 'N/A'}`}
                      </div>
                    </div> */}
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Payment Day (1 to 10)</label>
                      <div className="mt-1 font-medium dark:text-white">{siteDetails.paymentDay || siteDetails.payment_day || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Monthly Rent (Base Rent)</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        ₹{(siteDetails.monthlyRent || siteDetails.monthly_rent || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Agreement Years</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {siteDetails.agreementYears || siteDetails.agreement_years || 'N/A'} years
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Escalation %</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {siteDetails.yearlyEscalationPercentage || siteDetails.yearly_escalation_percentage || 0}%
                      </div>
                    </div>
                  </div>
                </ComponentCard>
                <RentEscalationTable site={selectedSite} />

              </ComponentCard>
              {/* Combined Owner and Electricity Information */}
              <ComponentCard title="Owner & Electricity Details">
                <div className="space-y-6">
                  {/* Owner Information Section */}
                  {siteDetails.owners && siteDetails.owners.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                        Owner Information
                      </h4>
                      <div className="space-y-4">
                        {siteDetails.owners.map((owner: any, index: number) => (
                          <div key={owner._id || owner.id || index} className="mb-4 border rounded overflow-hidden bg-gray-50 dark:bg-[#121212]">
                            {/* Collapsible Header */}
                            <div
                              className="flex justify-between items-center p-3 bg-white dark:bg-white/[0.03] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => toggleOwner(index)}
                            >
                              <h5 className="font-semibold text-gray-900 dark:text-white">
                                {owner.ownerName || owner.owner_name ? (owner.ownerName || owner.owner_name) : `Owner ${index + 1}`}
                              </h5>
                              <div className="text-gray-600 dark:text-gray-300">
                                {expandedOwners[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </div>
                            </div>
                            {/* Collapsible Body */}
                            {expandedOwners[index] && (
                              <div className="p-3 bg-white dark:bg-white/[0.03] border-t border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400">Owner Name</label>
                                    <div className="mt-1 font-medium dark:text-white">{owner.ownerName || owner.owner_name || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400">Monthly Rent</label>
                                    <div className="mt-1 font-medium dark:text-white">₹{owner.ownerMonthlyRent || owner.owner_monthly_rent || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400">Mobile No.</label>
                                    <div className="mt-1 font-medium flex items-center dark:text-white">
                                      <Phone size={14} className="mr-1 text-gray-400" />
                                      {owner.mobileNo || owner.mobile_no || 'N/A'}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm text-gray-500 dark:text-gray-400">Email</label>
                                    <div className="mt-1 font-medium dark:text-white">
                                      {owner.email || 'N/A'}
                                    </div>
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-sm text-gray-500 dark:text-gray-400">Bank Details</label>
                                    <div className="mt-1 grid grid-cols-3 gap-2">
                                      <div>
                                        <span className="text-xs text-gray-500">Account No</span>
                                        <div className="font-medium flex items-center dark:text-white">
                                          <CreditCard size={14} className="mr-1 text-gray-400" />
                                          {owner.ownerAccountNo || owner.owner_account_no || 'N/A'}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">Bank Name</span>
                                        <div className="font-medium dark:text-white">{owner.ownerBankName || owner.owner_bank_name || 'N/A'}</div>
                                      </div>
                                      <div>
                                        <span className="text-xs text-gray-500">IFSC</span>
                                        <div className="font-medium dark:text-white">{owner.ownerBankIfsc || owner.owner_bank_ifsc || 'N/A'}</div>
                                      </div>
                                    </div>
                                  </div>
                                  {owner.ownerDetails && (
                                    <div className="col-span-2">
                                      <label className="block text-sm text-gray-500 dark:text-gray-400">Owner Details</label>
                                      <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded dark:text-white">
                                        {owner.ownerDetails}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Electricity Details Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                      Electricity Details
                    </h4>
                    {siteDetails.consumerName || siteDetails.consumer_name ? (
                      <div className="space-y-4">
                        {(siteDetails.consumerName || siteDetails.consumer_name).split(',').map((name: string, index: number) => {
                          const units = (siteDetails.unit || '').split(',') || [];
                          const charges = (siteDetails.electricityCharges || siteDetails.electricity_charges || '').split(',') || [];
                          const consumerNos = (siteDetails.electricityConsumerNo || siteDetails.electricity_consumerno || '').split(',') || [];

                          return (
                            <div key={index} className="p-3 border rounded bg-gray-50 dark:bg-[#121212]">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Consumer Name</p>
                                  <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03]">
                                    {name.trim() || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Electricity Unit</p>
                                  <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03]">
                                    {units[index]?.trim() || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Electricity Charges</p>
                                  <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03]">
                                    ₹{charges[index]?.trim() || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Consumer Number</p>
                                  <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03]">
                                    {consumerNos[index]?.trim() || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Electricity Provider</p>
                                  <p className="font-medium w-full p-2 mt-1 border rounded text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-white/[0.03]">
                                    {siteDetails.electricityProvider || siteDetails.electricity_provider || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Electricity Status</p>
                                  <span className={`px-2 py-1 text-sm rounded-full ${(siteDetails.electricityStatus || siteDetails.electricity_status)?.toLowerCase() === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    }`}>
                                    {siteDetails.electricityStatus || siteDetails.electricity_status || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No electricity information available</p>
                    )}
                  </div>
                </div>
              </ComponentCard>
              <ElectricityPaymentForm
                siteId={selectedSite._id || selectedSite.id}
                owners={(siteDetails.owners || siteDetails.ownerId || []).map((owner: any) => ({
                  id: owner._id || owner.id,
                  owner_name: owner.ownerName || owner.owner_name,
                  owner_monthly_rent: Number(owner.ownerMonthlyRent || owner.owner_monthly_rent) || 0
                }))}
                currentMonthlyRent={Number(siteDetails.monthlyRent || siteDetails.monthly_rent) || 0}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default Page