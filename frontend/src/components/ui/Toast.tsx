"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    containerClass: "bg-[color:var(--moss)]/10 border-[color:var(--moss)]/40",
    iconClass: "text-[color:var(--moss)]",
    titleClass: "text-[color:var(--moss)]",
    barClass: "bg-[color:var(--moss)]",
  },
  error: {
    icon: XCircle,
    containerClass: "bg-[color:var(--clay)]/10 border-[color:var(--clay)]/40",
    iconClass: "text-[color:var(--clay)]",
    titleClass: "text-[color:var(--clay)]",
    barClass: "bg-[color:var(--clay)]",
  },
  warning: {
    icon: AlertTriangle,
    containerClass: "bg-amber-500/10 border-amber-500/40",
    iconClass: "text-amber-400",
    titleClass: "text-amber-300",
    barClass: "bg-amber-500",
  },
  info: {
    icon: Info,
    containerClass: "bg-[color:var(--brass)]/10 border-[color:var(--brass)]/40",
    iconClass: "text-[color:var(--brass)]",
    titleClass: "text-[color:var(--brass)]",
    barClass: "bg-[color:var(--brass)]",
  },
};

function Toast({ toast, onDismiss }: ToastProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl shadow-black/40 w-80 overflow-hidden ${config.containerClass}`}
      style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", background: "rgba(22,35,58,0.85)" }}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${config.barClass}`} />
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.iconClass}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold leading-tight ${config.titleClass}`}>{toast.title}</p>
        {toast.message && (
          <p className="text-[11px] text-[color:var(--ledger-paper-dim)] mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 items-end">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}