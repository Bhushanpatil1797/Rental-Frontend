/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */

'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, MapPin, Calendar, Phone, CreditCard, Building2, Users, Landmark, FileText, Globe, ArrowLeft, MoreVertical, CheckCircle2, ExternalLink, ShieldCheck, Banknote, HelpCircle, UserCheck } from 'lucide-react'
import RentPaymentForm from '@/components/form/form-elements/RentPayments'
import RentEscalationTable from '@/components/form/form-elements/RentEscalationTable'
import { Toaster } from 'react-hot-toast'
import Badge from '@/components/ui/badge/Badge'

// ─── UI Helpers ───────────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
    <div className="flex items-center gap-3 mb-5 group">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider leading-none">{title}</h3>
            {subtitle && <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-1">{subtitle}</p>}
        </div>
    </div>
);

const ViewField = ({ label, value, span2, icon: Icon }: { label: string, value: any, span2?: boolean, icon?: any }) => (
    <div className={`${span2 ? 'col-span-2' : ''} p-3 rounded-xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100/50 dark:border-white/[0.03] hover:shadow-sm transition-all duration-200 group`}>
        <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon size={12} className="text-indigo-500/70" />}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</span>
        </div>
        <div className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {value || 'Not Specified'}
        </div>
    </div>
);

type ComponentCardProps = {
  title: React.ReactNode
  children: React.ReactNode
}

const ComponentCard: React.FC<ComponentCardProps> = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm mb-6 transition-all duration-300 hover:shadow-md">
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
  const matchesQuery = query.trim() === '' || site.siteName?.toLowerCase().includes(query.toLowerCase())
  const matchesBank = selectedBank === '' || site.addedBankName === selectedBank
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

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/rent/sites`;
        console.log("Fetching all sites from:", url);
        
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("API Response Status:", res.status)

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`)
        }

        const data = await res.json()
        console.log("Fetched sites JSON data:", data)
        
        // Standard check for data location (some APIs return data.data, some data.sites)
        const siteList = data.data || data.sites || (Array.isArray(data) ? data : [])
        console.log("Extracted siteList:", siteList)

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
      site.siteName?.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredSites(filtered)
  }, [query, sites])

  const fetchSiteDetails = async (siteId: string) => {
    setLoadingDetails(true)
    setSiteDetails(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Token not found in localStorage")

      console.log("Fetching site details for ID:", siteId, "from:", `${process.env.NEXT_PUBLIC_API_URL}/api/rent/sites/${siteId}`);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rent/sites/${siteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Site Details API Response Status:", res.status)

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      const data = await res.json()
      console.log("Fetched site details JSON data:", data)

      // Unwrap data from data.data or data.data (depends on backend structure)
      const details = data.data || data
      console.log("Unwrapped site details:", details)

      setSiteDetails(details)

      // Initialize all owners as collapsed using the new camelCase property or fallback
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
    console.log("Rent Site Clicked:", site);
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
                    key={site._id || site.id}
                    className="p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                    onClick={() => handleSiteClick(site)}
                  >
                    <div>
                      <div className="text-blue-600 font-medium hover:underline">
                        {site.siteName || site.site_name}
                      </div>
                      {site.propertyLocation && (
                        <div className="text-gray-500 text-sm flex items-center mt-1">
                          <MapPin size={14} className="mr-1" />
                          {site.propertyLocation}
                        </div>
                      )}
                      <div className="text-gray-500 text-sm flex items-center mt-1">
                        <CreditCard size={14} className="mr-1" />
                        Added In Bank: {site.addedBankName || site.added_bank_name || 'N/A'}
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Header Area */}
           <div className="relative overflow-hidden mb-8 p-8 rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20">
              <div className="absolute top-0 right-0 p-8 transform translate-x-1/4 -translate-y-1/4">
                <Building2 size={240} className="text-white/10" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Badge size="sm" color="info" variant="light">
                    {siteDetails?.code || "SITE-NO-CODE"}
                  </Badge>
                  <Badge size="sm" color="success" variant="light">
                    Active Site
                  </Badge>
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">
                      {siteDetails?.siteName || siteDetails?.site_name || "New Site Entry"}
                    </h1>
                    <div className="flex items-center gap-4 text-indigo-100/80 text-sm font-medium">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full">
                        <MapPin size={14} />
                        {siteDetails?.propertyLocation || siteDetails?.property_location || "Location N/A"}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full lowercase">
                        <Building2 size={14} />
                        {siteDetails?.propertyType || "Commercial Space"}
                      </div>
                    </div>
                  </div>
                  <button onClick={handleBackToSearch} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 transition-all rounded-2xl text-sm font-bold backdrop-blur-md border border-white/10">
                    <ArrowLeft size={16} /> Back to sites
                  </button>
                </div>
              </div>
            </div>

          {loadingDetails ? (
            <div className="py-20 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-500 font-medium">Synchronizing site data...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 flex items-center gap-3">
              <MoreVertical size={20} />
              <span className="font-bold">Error: {error}</span>
            </div>
          ) : siteDetails ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-8">
                {/* Record Payment Section - NOW AT TOP */}
                <RentPaymentForm
                  siteId={String(selectedSite._id || selectedSite.id)}
                  owners={(siteDetails.owners || siteDetails.ownerId || []).map((owner: any) => ({
                    id: owner.ownerId?._id || owner._id || owner.id,
                    owner_name: owner.ownerId?.ownerName || owner.ownerName || owner.owner_name,
                    owner_monthly_rent: Number(owner.ownerMonthlyRent || owner.owner_monthly_rent) || 0
                  }))}
                  currentMonthlyRent={Number(siteDetails.monthlyRent || siteDetails.monthly_rent) || 0}
                  centreId={siteDetails.centreId?._id || siteDetails.centreId}
                />

                {/* Simplified Site Metadata */}
                <ComponentCard title="">
                  <SectionHeader icon={Building2} title="Site Essential Info" />
                  <div className="grid grid-cols-2 gap-3">
                    <ViewField label="Site Name" value={siteDetails.siteName || siteDetails.site_name} />
                    <ViewField label="Site Code" value={siteDetails.code} />
                    <ViewField label="Property Location" value={siteDetails.propertyLocation || siteDetails.property_location} />
                    <ViewField label="Managed By" value={siteDetails.managedBy || siteDetails.manage_by} />
                    <ViewField label="Monthly Rent (₹)" value={`₹${(siteDetails.monthlyRent || siteDetails.monthly_rent || 0).toLocaleString()}`} icon={Landmark} />
                    <ViewField label="Pincode" value={siteDetails.pincode} />
                    <ViewField label="Property Address" value={siteDetails.propertyAddress || siteDetails.property_address} span2 />
                  </div>
                </ComponentCard>
              </div>

              <div className="space-y-8">
                {/* Owners Container */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between px-2 mb-2">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-6 bg-indigo-600 rounded-full" />
                         <h2 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Active Partcipants</h2>
                      </div>
                         <Badge color="primary" variant="light">
                         {(siteDetails.owners || siteDetails.ownerId || []).length} Owners
                      </Badge>
                   </div>
                   
                   {(siteDetails.owners || siteDetails.ownerId || []).map((owner: any, index: number) => (
                      <div key={owner._id || index} className="group relative overflow-hidden bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] rounded-2xl transition-all duration-300 hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-900/30">
                        <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleOwner(index)}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:rotate-6 transition-transform">
                              { (owner.ownerId?.ownerName || owner.ownerName || owner.owner_name)?.charAt(0) || "O" }
                            </div>
                            <div>
                               <p className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                                 {owner.ownerId?.ownerName || owner.ownerName || owner.owner_name || 'N/A'}
                               </p>
                               <div className="flex items-center gap-2 mt-0.5">
                                 <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded leading-none">
                                    ₹{(owner.ownerMonthlyRent || owner.owner_monthly_rent || 0).toLocaleString()} /mo
                                 </span>
                               </div>
                            </div>
                          </div>
                          <div className={`p-2 rounded-lg transition-colors ${expandedOwners[index] ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 group-hover:bg-gray-50'}`}>
                            {expandedOwners[index] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>

                        {expandedOwners[index] && (
                          <div className="px-5 pb-5 pt-2 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                             <ViewField label="Contact" value={owner.ownerId?.mobileNo || owner.ownerMobileNo || owner.owner_mobile_no} icon={Phone} />
                             <ViewField label="Email Address" value={owner.ownerId?.email || owner.email || owner.ownerEmail} icon={Globe} />
                             <ViewField label="Bank Name" value={owner.bankAccount?.bankName || owner.ownerBankName || owner.owner_bank_name} icon={Landmark} />
                             <ViewField label="Account No" value={owner.bankAccount?.accountNo || owner.ownerAccountNo || owner.owner_account_no} icon={CreditCard} />
                             <ViewField label="IFSC Code" value={owner.bankAccount?.ifsc || owner.ownerBankIfsc || owner.owner_bank_ifsc} />
                             <ViewField label="Details" value={owner.ownerId?.ownerDetails || owner.owner_details || siteDetails.siteName} span2 />
                          </div>
                        )}
                      </div>
                   ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default Page