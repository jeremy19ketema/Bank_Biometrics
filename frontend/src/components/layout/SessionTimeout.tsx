"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearAuthSession } from "@/lib/auth";

export default function SessionTimeout() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // We only want this to run on authenticated routes
    if (pathname.startsWith("/login") || pathname.startsWith("/change-credentials") || pathname.startsWith("/forgot-password")) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const logout = async () => {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        clearAuthSession();
        // Redirect to login with a timeout reason
        router.push("/login?reason=timeout");
      } catch (error) {
        console.error("Timeout logout failed:", error);
      }
    };

    const resetTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // 1 hour inactivity timeout = 3600000 milliseconds
      timeoutId = setTimeout(logout, 3600000);
    };

    // Events that signify user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "wheel"
    ];

    // Initialize the timer
    resetTimer();

    // Attach event listeners to document
    activityEvents.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      activityEvents.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [pathname, router]);

  return null; // This component doesn't render anything
}
