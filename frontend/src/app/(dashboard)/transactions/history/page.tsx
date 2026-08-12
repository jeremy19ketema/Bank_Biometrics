export default function TransactionHistoryPage() {
  const history = [
    { ref: "TX-9038", customer: "Abebe Bikila", type: "Cash Withdrawal", amount: "$5,000.00", status: "COMPLETED", bio: "MATCH 99.9%", time: "10 mins ago" },
    { ref: "TX-9037", customer: "Tigist Assefa", type: "Cheque Clearance", amount: "$45,000.00", status: "COMPLETED", bio: "MATCH 99.8%", time: "35 mins ago" },
    { ref: "TX-9036", customer: "Haile Gebrselassie", type: "Account Clearance", amount: "$150,000.00", status: "COMPLETED", bio: "MATCH 100%", time: "1 hour ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Transaction Audit Trail</h1>
        <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Immutable ledger history of all completed financial operations and biometric validations.</p>
      </div>

      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">History</h3>
          <span className="mono text-xs text-ledger-paper-dim">{history.length} entries</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Tx Reference</th>
              <th>Customer</th>
              <th>Type</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th>Biometric Match</th>
              <th style={{ textAlign: "right" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((tx) => (
              <tr key={tx.ref}>
                <td className="mono-cell font-semibold text-[color:var(--brass)]">{tx.ref}</td>
                <td className="font-semibold">{tx.customer}</td>
                <td className="text-ledger-paper-dim">{tx.type}</td>
                <td style={{ textAlign: "right" }} className="mono-cell text-[color:var(--moss)] font-bold">{tx.amount}</td>
                <td className="mono-cell text-[color:var(--brass)] font-bold">{tx.bio}</td>
                <td style={{ textAlign: "right" }}>
                  <span className="status-chip pass">{tx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}