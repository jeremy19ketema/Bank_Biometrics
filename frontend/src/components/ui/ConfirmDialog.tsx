"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "text-rose-400",
      iconBg: "bg-rose-500/10 border-rose-500/30",
      button: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20",
    },
    warning: {
      icon: "text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/30",
      button: "bg-amber-500 hover:bg-amber-600 text-[#16233A] shadow-amber-500/20",
    },
    info: {
      icon: "text-[color:var(--brass)]",
      iconBg: "bg-[color:var(--brass)]/10 border-[color:var(--brass)]/30",
      button: "bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[#16233A] shadow-[color:var(--brass)]/20",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md glass-panel rounded-2xl border border-slate-700 shadow-2xl shadow-black/60 p-6 space-y-5">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
            <AlertTriangle className={`w-5 h-5 ${styles.icon}`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">This action may not be reversible.</p>
          </div>
        </div>

        <div className="text-sm text-slate-300 leading-relaxed pl-1">{message}</div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${styles.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}