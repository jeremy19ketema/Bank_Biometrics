"use client";
import React, { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { AlertTriangle } from "lucide-react";

export default function DemoBanner() {
  return null;
}

  return (
    <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-center space-x-2 text-sm font-semibold shadow-md z-50">
      <AlertTriangle className="w-5 h-5" />
      <span>Demo biometric mode — not for real banking authorization.</span>
    </div>
  );
}
