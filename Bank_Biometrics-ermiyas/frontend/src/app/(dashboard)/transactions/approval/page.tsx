import { CheckCircle2, XCircle } from "lucide-react";

export default function TransactionApprovalPage() {
  const pendingQueue = [
    { ref: "TX-9041", customer: "Abebe Bikila", type: "High-Value Cash Withdrawal", amount: "$85,000.00", branch: "Main HQ", time: "3 mins ago" },
    { ref: "TX-9042", customer: "Tigist Assefa", type: "Corporate Cheque Clearance", amount: "$120,000.00", branch: "Bole Branch", time: "12 mins ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Manager Override Approval Queue</h1>
        <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Review pending high-value transactions awaiting branch manager passkey authorization.</p>
      </div>

      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Pending Approvals</h3>
          <span className="mono text-xs text-ledger-paper-dim">{pendingQueue.length} items</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Tx Reference</th>
              <th>Customer Name</th>
              <th>Operation</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th>Branch</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingQueue.map((tx) => (
              <tr key={tx.ref}>
                <td className="mono-cell font-semibold text-[color:var(--brass)]">{tx.ref}</td>
                <td className="font-semibold">{tx.customer}</td>
                <td className="text-ledger-paper-dim">{tx.type}</td>
                <td style={{ textAlign: "right" }} className="mono-cell text-amber-400 font-bold">{tx.amount}</td>
                <td className="text-ledger-paper-dim">{tx.branch}</td>
                <td style={{ textAlign: "right" }}>
                  <div className="flex justify-end gap-2">
                    <button className="btn-mini approve flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Authorize</button>
                    <button className="btn-mini decline flex items-center gap-1"><XCircle className="w-3 h-3" /> Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}