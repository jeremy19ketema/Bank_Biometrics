import React from "react";
import VaultSidebar from "@/components/layout/VaultSidebar";
import VaultTopbar from "@/components/layout/VaultTopbar";
import DemoBanner from "@/components/layout/DemoBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell flex flex-col h-screen">
      <DemoBanner />
      <div className="flex flex-1 overflow-hidden">
        <VaultSidebar />
      <div className="main-wrapper">
        <main className="main">
          <VaultTopbar />
          {children}
        </main>
      </div>
      </div>
    </div>
  );
}