/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  User, Phone, Mail, Shield, Hash, Building2,
  MapPin, Activity, RefreshCw, Calendar, CreditCard,
  CheckCircle2, XCircle
} from 'lucide-react';

// ── JWT decode (no library needed) ────────────────────────────────────────────
function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch { return null; }
}

// ── Info row helper ────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
      <span className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value ?? <span className="text-gray-300 dark:text-gray-600 font-normal">—</span>}</span>
    </div>
  );
}

// ── Centre Card ────────────────────────────────────────────────────────────────
function CentreCard({ centre }: { centre: any }) {
  const isActive = centre.isActiveToday;
  return (
    <div className={`relative rounded-2xl border p-4 transition-shadow hover:shadow-md ${
      isActive
        ? 'border-emerald-100 bg-emerald-50/60 dark:border-emerald-800/30 dark:bg-emerald-900/10'
        : 'border-gray-100 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-white/[0.06]'}`}>
            <Building2 size={15} className={isActive ? 'text-emerald-600' : 'text-gray-500'} />
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">{centre.name}</div>
            {centre.shortCode && <div className="text-xs text-gray-400 mt-0.5">{centre.shortCode}</div>}
          </div>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
          isActive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {centre.city && (
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <MapPin size={10} /> {centre.city}
          </div>
        )}
        {centre.payCriteria && (
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <CreditCard size={10} /> {centre.payCriteria}
          </div>
        )}
        {centre.todaysBalance != null && (
          <div className="col-span-2 mt-1 p-2 rounded-lg bg-white/60 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
            <div className="text-gray-400 text-xs mb-0.5">Today&apos;s Balance</div>
            <div className="font-bold text-gray-900 dark:text-white">
              ₹{centre.todaysBalance.toLocaleString('en-IN')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Profile Page ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const payload = parseJwt(token);
      const userId = payload?._id || payload?.id || localStorage.getItem('userId');

      if (!token || !userId) throw new Error('Not logged in');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load user');
      const data = await res.json();
      setUser(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const assignedCentres: any[] = user?.centreIds ?? [];

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN') : undefined;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">

      {/* ── Hero Card ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-6 shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

        {loading ? (
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-white/20 rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <div className="text-white/80">{error}</div>
        ) : (
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30 flex-shrink-0">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-sm text-white font-medium">
                    <Shield size={13} />{user.role}
                  </span>
                  {user.loginId && (
                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-sm text-white/80">
                      <Hash size={12} />ID: {user.loginId}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'Active'
                      ? 'bg-emerald-400/20 text-emerald-100'
                      : 'bg-red-400/20 text-red-100'
                  }`}>
                    <Activity size={10} />{user.status ?? 'Active'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={fetchProfile}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors self-start sm:self-center"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}
      </div>

      {!loading && !error && user && (
        <>
          {/* ── Quick Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Assigned Centres', value: assignedCentres.length, icon: <Building2 size={18} className="text-indigo-600" />, bg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/30' },
              { label: 'Active Today', value: user.activeCount ?? 0, icon: <CheckCircle2 size={18} className="text-emerald-600" />, bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30' },
              { label: 'Inactive Today', value: user.inactiveCount ?? 0, icon: <XCircle size={18} className="text-red-500" />, bg: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30' },
              { label: 'Branches', value: user.branchIds?.length ?? 0, icon: <MapPin size={18} className="text-amber-600" />, bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30' },
            ].map(s => (
              <div key={s.label} className={`flex items-center gap-3 p-4 rounded-xl border ${s.bg}`}>
                <div className="p-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm">{s.icon}</div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                  <div className="font-bold text-gray-900 dark:text-white text-lg">{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Personal Info ── */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User size={15} className="text-indigo-500" />Personal Information
                </h3>
                <dl>
                  <InfoRow label="Full Name" value={user.name} />
                  <InfoRow label="Role" value={user.role} />
                  <InfoRow label="Login ID" value={user.loginId} />
                  <InfoRow label="Status" value={
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status}
                    </span>
                  } />
                  <InfoRow label="Last Login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-IN') : undefined} />
                  <InfoRow label="Member Since" value={fmt(user.createdAt)} />
                </dl>
              </div>

              <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Phone size={15} className="text-purple-500" />Contact Details
                </h3>
                <dl>
                  <InfoRow label="Mobile Number" value={user.mobileNumber ? String(user.mobileNumber) : undefined} />
                  <InfoRow label="Email" value={user.email} />
                  <InfoRow label="Aadhar / PAN" value={user.aadharOrPanNumber} />
                </dl>
              </div>
            </div>

            {/* ── Assigned Centres ── */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 size={15} className="text-emerald-500" />Assigned Centres
                  </h3>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/[0.05] px-2.5 py-1 rounded-full">
                    {assignedCentres.length} centre{assignedCentres.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {assignedCentres.length === 0 ? (
                  <div className="py-12 text-center">
                    <Building2 size={32} className="mx-auto mb-2 text-gray-200 dark:text-gray-700" />
                    <p className="text-gray-400 text-sm">No centres assigned to this user.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assignedCentres.map((centre: any) => (
                      <CentreCard key={centre._id} centre={centre} />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Branches & Regions ── */}
              {((user.branchIds?.length ?? 0) > 0 || (user.regionIds?.length ?? 0) > 0) && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.branchIds?.length > 0 && (
                    <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                        <MapPin size={14} className="text-amber-500" />Branches
                      </h3>
                      <div className="space-y-2">
                        {user.branchIds.map((b: any) => (
                          <div key={b._id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                            {b.name ?? b}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {user.regionIds?.length > 0 && (
                    <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-5">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                        <MapPin size={14} className="text-violet-500" />Regions
                      </h3>
                      <div className="space-y-2">
                        {user.regionIds.map((r: any) => (
                          <div key={r._id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                            {r.name ?? r}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
