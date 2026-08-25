import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TransactionApprovalPage() {
  const pendingQueue = [
    { ref: "TX-9041", customer: "Abebe Bikila", type: "High-Value Cash Withdrawal", amount: "$85,000.00", branch: "Main HQ", time: "3 mins ago" },
    { ref: "TX-9042", customer: "Tigist Assefa", type: "Corporate Cheque Clearance", amount: "$120,000.00", branch: "Bole Branch", time: "12 mins ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] p-6 shadow-xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">Manager Override Approval Queue</h1>
          <p className="text-sm text-white/50 mt-1">Review pending high-value transactions awaiting branch manager passkey authorization.</p>
        </div>
        <Link href="/transactions" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-semibold transition-all border border-white/10 shrink-0">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="bg-[rgba(15,23,40,0.82)] border border-white/10 rounded-[28px] shadow-xl backdrop-blur-xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-xl font-semibold text-white">Pending Approvals</h3>
            <p className="text-xs text-[color:var(--brass)] mt-1 font-mono">{pendingQueue.length} items awaiting review</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#0B192C]/50">
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Tx Reference</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Customer Name</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Operation</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Amount</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider">Branch</th>
                <th className="py-4 px-8 text-xs font-semibold text-slate-300 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {pendingQueue.map((tx) => (
                <tr key={tx.ref} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="py-5 px-8 font-mono text-xs font-semibold text-[color:var(--brass)]">{tx.ref}</td>
                  <td className="py-5 px-8 text-sm text-white font-medium">{tx.customer}</td>
                  <td className="py-5 px-8 text-sm text-white/70">{tx.type}</td>
                  <td className="py-5 px-8 text-right font-mono text-sm text-amber-400 font-bold">{tx.amount}</td>
                  <td className="py-5 px-8 text-sm text-white/50">{tx.branch}</td>
                  <td className="py-5 px-8 text-right">
                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[color:var(--moss)]/10 hover:bg-[color:var(--moss)]/20 text-[color:var(--moss)] text-xs font-bold transition-colors border border-[color:var(--moss)]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Authorize
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[color:var(--clay)]/10 hover:bg-[color:var(--clay)]/20 text-[color:var(--clay)] text-xs font-bold transition-colors border border-[color:var(--clay)]/30">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}