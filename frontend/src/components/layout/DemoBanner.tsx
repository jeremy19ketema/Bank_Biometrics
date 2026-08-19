"use client";
import React, { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { AlertTriangle } from "lucide-react";

export default function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function checkProviderStatus() {
      try {
        const response = await apiClient.get<{ providerType?: string; data?: { providerType?: string } }>("/api/biometrics/status");
        if (response.data?.providerType === "MOCK" || response.data?.data?.providerType === "MOCK") {
          setIsDemo(true);
        }
      } catch (err) {
        console.error("Failed to fetch biometric status", err);
      }
    }
    
    // Quick check on load
    checkProviderStatus();
  }, []);

  if (!isDemo) return null;

  return (
    <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-center space-x-2 text-sm font-semibold shadow-md z-50">
      <AlertTriangle className="w-5 h-5" />
      <span>Demo biometric mode — not for real banking authorization.</span>
    </div>
  );
}
