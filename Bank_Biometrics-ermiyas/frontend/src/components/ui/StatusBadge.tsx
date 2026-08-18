interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  ACTIVE: {
    bg: "bg-[color:var(--moss)]/15",
    text: "text-[color:var(--moss)]",
    border: "border-[color:var(--moss)]/30",
    label: "ACTIVE",
  },
  INACTIVE: {
    bg: "bg-slate-700/40",
    text: "text-slate-400",
    border: "border-slate-600/30",
    label: "INACTIVE",
  },
  SUSPENDED: {
    bg: "bg-[color:var(--clay)]/15",
    text: "text-[color:var(--clay)]",
    border: "border-[color:var(--clay)]/30",
    label: "SUSPENDED",
  },
  ON_LEAVE: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    label: "ON LEAVE",
  },
  MAINTENANCE: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    label: "MAINTENANCE",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    bg: "bg-slate-700/40",
    text: "text-slate-400",
    border: "border-slate-600/30",
    label: status,
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}