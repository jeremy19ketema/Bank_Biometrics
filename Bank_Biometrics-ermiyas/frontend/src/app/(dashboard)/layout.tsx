"use client";

import React from "react";
import { usePathname } from "next/navigation";
import VaultSidebar from "@/components/layout/VaultSidebar";
import VaultTopbar from "@/components/layout/VaultTopbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // HR dashboard has its own custom layout, so skip VaultSidebar and VaultTopbar
  const isHRPage = pathname?.includes("/hr") || pathname?.includes("/hr");
  
  if (isHRPage) {
    return children;
  }

  return (
    <div className="app-shell">
      <VaultSidebar />
      <div className="main-wrapper">
        <main className="main">
          <VaultTopbar />
          {children}
        </main>
      </div>
    </div>
  );
}