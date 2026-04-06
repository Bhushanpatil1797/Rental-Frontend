"use client";

import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { useSidebar } from "@/context/SidebarContext";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const sidebarWidth = isExpanded || isHovered ? "lg:pl-[240px]" : "lg:pl-[90px]";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0f0f0f]">
      {/* Full-width sticky header */}
      <AppHeader />

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && <Backdrop />}

      {/* Persistent Sidebar */}
      <AppSidebar />

      {/* Page content — with dynamic offset for the sidebar on desktop */}
      <main className={`flex-1 w-full transition-all duration-300 ${sidebarWidth}`}>
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}