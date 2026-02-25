/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, MapPin, Calendar, Phone, CreditCard } from 'lucide-react'
import RentPaymentForm from '@/components/form/form-elements/RentPayments'
import RentEscalationTable from '@/components/form/form-elements/RentEscalationTable'
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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [selectedBank, setSelectedBank] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

// Get unique bank names for dropdown
const bankNames = Array.from(new Set(sites.map(site => site.added_bank_name).filter(Boolean)))

// Update filtered logic to include bank filter
const filtered = sites.filter(site => {
  const matchesQuery = query.trim() === '' || site.site_name?.toLowerCase().includes(query.toLowerCase())
  const matchesBank = selectedBank === '' || site.added_bank_name === selectedBank
  return matchesQuery && matchesBank
})

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedSites = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token not found in localStorage")

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sites/all-sites`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("API Response:", res)
        console.log("API Response Status:", res.status);

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }

        const data = await res.json()
        console.log("Fetched sites data:", data)
        const siteList = Array.isArray(data.sites) ? data.sites : []

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
      site.site_name?.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredSites(filtered)
  }, [query, sites])

  const fetchSiteDetails = async (siteId: number) => {
    setLoadingDetails(true)
    setSiteDetails(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Token not found in localStorage")

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sites/${siteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      const data = await res.json()
      setSiteDetails(data)

      // Initialize all owners as collapsed
      if (data.owners && data.owners.length > 0) {
        const initialOwnerState: { [key: number]: boolean } = {}
        data.owners.forEach((_: any, index: number) => {
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
    await fetchSiteDetails(site.id)
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
        <>
          <h1 className="text-xl font-semibold mb-4 dark:text-white">Search Site's</h1>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search site name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="p-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white"
          />

          <div className="relative min-w-[180px]">
            <button
              type="button"
              className="w-full p-2 rounded-lg border border-gray-300 bg-white dark:bg-white/[0.05] dark:border-white/[0.1] dark:text-white text-left flex justify-between items-center"
              onClick={() => setDropdownOpen((open) => !open)}
            >
              {selectedBank ? selectedBank : "All Banks"}
              <ChevronDown size={16} className="ml-2" />
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/[0.1] rounded shadow-lg max-h-60 overflow-auto">
                <div
                  className={`cursor-pointer px-3 py-2 hover:bg-blue-50 dark:hover:bg-zinc-700 ${selectedBank === '' ? 'font-semibold text-blue-600' : ''}`}
                  onClick={() => {
                    setSelectedBank('')
                    setDropdownOpen(false)
                    setCurrentPage(1)
                  }}
                >
                  All Banks
                </div>
                {bankNames.map(bank => (
                  <div
                    key={bank}
                    className={`cursor-pointer text-xs dark:text-white px-3 py-2 hover:bg-blue-50 dark:hover:bg-zinc-700 ${selectedBank === bank ? 'font-semibold text-blue-600' : ''}`}
                    onClick={() => {
                      setSelectedBank(bank)
                      setDropdownOpen(false)
                      setCurrentPage(1)
                    }}
                  >
                    {bank}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

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
            <div className="border rounded overflow-hidden">
              {paginatedSites.length > 0 ? (
                paginatedSites.map(site => (
                  <div
                    key={site.id}
                    className="p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                    onClick={() => handleSiteClick(site)}
                  >
                    <div>
                      <div className="text-blue-600 font-medium hover:underline">
                        {site.site_name}
                      </div>
                      {site.property_location && (
                        <div className="text-gray-500 text-sm flex items-center mt-1">
                          <MapPin size={14} className="mr-1" />
                          {site.property_location}
                        </div>
                      )}
                      <div className="text-gray-500 text-sm flex items-center mt-1">
                        <CreditCard size={14} className="mr-1" />
                        Added In Bank: {site.added_bank_name || 'N/A'}
                      </div>
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
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 p-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-0.5 rounded border bg-gray-100 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(idx + 1)}
                      className={`px-2 py-0.5 rounded border ${currentPage === idx + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-0.5 rounded border bg-gray-100 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // Site Details View
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedSite.site_name}
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
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.site_name || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Site Code</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.code || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Property Location</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.property_location || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Property Type</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.property_type || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Pincode</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.pincode || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Managed By</label>
                    <div className="mt-1 font-medium dark:text-white">{siteDetails.manage_by || 'N/A'}</div>
                  </div>
                  <div className="mt-4 pb-7">
                  <label className="block text-sm text-gray-500 dark:text-gray-400">Property Address</label>
                  <div className="mt-1 font-medium dark:text-white">{siteDetails.property_address || 'N/A'}</div>
                </div>
                <div className="mt-4 pb-7">
                  <label className="block text-sm text-gray-500 dark:text-gray-400">Added Bank Account</label>
                  <div className="mt-1 font-medium dark:text-white">{siteDetails.added_bank_name || 'N/A'}</div>
                </div>
                </div>
                
                {/* Agreement Information */}
                <ComponentCard title="Agreement Information">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Agreement Date</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400 " />
                        {formatDate(siteDetails.agreement_date)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Agreement Expiring</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {formatDate(siteDetails.agreement_expiring)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Rent Start Date</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {formatDate(siteDetails.rent_start_date)}
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
                      <div className="mt-1 font-medium dark:text-white">{siteDetails.payment_day || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Monthly Rent (Base Rent)</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        ₹{siteDetails.monthly_rent?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Agreement Years</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {siteDetails.agreement_years || 'N/A'} years
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 dark:text-gray-400">Escalation %</label>
                      <div className="mt-1 font-medium flex items-center dark:text-white">
                        <Calendar size={14} className="mr-1 text-gray-400" />
                        {siteDetails.yearly_escalation_percentage || 0}%
                      </div>
                    </div>
                  </div>
                </ComponentCard>
                <RentEscalationTable site={selectedSite} />
              </ComponentCard>
              {/* Owner Information */}
              {siteDetails.owners && siteDetails.owners.length > 0 && (
                <ComponentCard title="Owner Information">
                  {siteDetails.owners.map((owner: { id: any; owner_name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; owner_monthly_rent: any; mobile_no: any; email: any; owner_account_no: any; owner_bank_name: any; owner_bank_ifsc: any; owner_mobile_no: any; owner_details: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined }, index: number) => (
                    <div key={owner.id || index} className="mb-4 border rounded overflow-hidden">
                      {/* Collapsible Header */}
                      <div
                        className="flex justify-between items-center p-3 bg-white dark:bg-white/[0.03] cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700"
                        onClick={() => toggleOwner(index)}
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {owner.owner_name ? owner.owner_name : `Owner ${index + 1}`}
                        </h3>
                        <div className="text-gray-600 dark:text-gray-300">
                          {expandedOwners[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                      {/* Collapsible Body */}
                      {expandedOwners[index] && (
                        <div className="p-3 bg-white dark:bg-white/[0.03] border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-2 gap-4 ">
                            <div>
                              <label className="block text-sm text-gray-500 dark:text-gray-400">Owner Name</label>
                              <div className="mt-1 font-medium dark:text-white">{owner.owner_name || 'N/A'}</div>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500 dark:text-gray-400">Monthly Rent</label>
                              <div className="mt-1 font-medium dark:text-white">₹{owner.owner_monthly_rent || 'N/A'}</div>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500 dark:text-gray-400">Mobile No.</label>
                              <div className="mt-1 font-medium flex items-center dark:text-white">
                                <Phone size={14} className="mr-1 text-gray-400" />
                                {owner.owner_mobile_no || 'N/A'}
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
                                  <div className="font-medium flex items-cente dark:text-white">
                                    <CreditCard size={14} className="mr-1 text-gray-400" />
                                    {owner.owner_account_no || 'N/A'}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">Bank Name</span>
                                  <div className="font-medium dark:text-white">{owner.owner_bank_name || 'N/A'}</div>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">IFSC</span>
                                  <div className="font-medium dark:text-white">{owner.owner_bank_ifsc || 'N/A'}</div>
                                </div>
                              </div>
                            </div>
                            {owner.owner_details && (
                              <div className="col-span-2">
                                <label className="block text-sm text-gray-500 dark:text-gray-400">Owner Details</label>
                                <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded dark:text-white">
                                  {owner.owner_details}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </ComponentCard>

              )}
              <RentPaymentForm
                siteId={selectedSite.id}
                owners={siteDetails.owners?.map((owner: { id: any; owner_name: any; owner_monthly_rent: any }) => ({
                  id: owner.id,
                  owner_name: owner.owner_name,
                  owner_monthly_rent: Number(owner.owner_monthly_rent) || 0
                })) || []}
                currentMonthlyRent={Number(siteDetails.monthly_rent) || 0}
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default Page