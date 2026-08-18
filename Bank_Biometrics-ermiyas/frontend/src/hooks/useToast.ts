import { useState, useCallback } from "react";
import { ToastMessage, ToastType } from "@/components/ui/Toast";

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title: string, message?: string) => addToast("success", title, message),
    error: (title: string, message?: string) => addToast("error", title, message),
    warning: (title: string, message?: string) => addToast("warning", title, message),
    info: (title: string, message?: string) => addToast("info", title, message),
  };

  return { toasts, toast, dismissToast };
}
