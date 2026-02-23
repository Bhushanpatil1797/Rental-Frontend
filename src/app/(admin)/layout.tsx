"use client";

import AppHeader from "@/layout/AppHeader";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <AppHeader />
      {/* Page Content */}
      <div className="flex-1 p-3">{children}</div>
    </div>
  );
}