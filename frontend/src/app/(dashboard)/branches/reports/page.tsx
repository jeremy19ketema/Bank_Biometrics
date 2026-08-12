import Link from "next/link";
import { FileText, Download, ArrowLeft, Calendar, HardDrive } from "lucide-react";

export default function BranchReportsPage() {
  const reports = [
    {
      title: "Monthly Branch Operational Clearance Summary",
      date: "2026-07-01",
      type: "PDF / Audit",
      size: "2.4 MB",
    },
    {
      title: "Biometric Hardware Latency & FRR Audit",
      date: "2026-06-30",
      type: "CSV Export",
      size: "840 KB",
    },
    {
      title: "High-Value Teller Override Log",
      date: "2026-06-28",
      type: "Encrypted Log",
      size: "1.8 MB",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/branches"
            className="p-2 rounded-lg bg-[#111C2E] border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Branch Reports</h1>
            <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
              Download consolidated institution reports and audit exports.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[#0F1B2B] font-bold text-xs transition-all shadow-lg shadow-[color:var(--brass)]/20">
          <Download className="w-4 h-4" />
          <span>Generate Custom Export</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-800">
          {reports.map((report, index) => (
            <div
              key={index}
              className="p-5 flex items-center justify-between hover:bg-[#111C2E]/60 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{report.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {report.date}
                    </span>
                    <span>{report.type}</span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {report.size}
                    </span>
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700">
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}