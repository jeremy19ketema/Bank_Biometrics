import React from "react";
import VaultSidebar from "@/components/layout/VaultSidebar";
import VaultTopbar from "@/components/layout/VaultTopbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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