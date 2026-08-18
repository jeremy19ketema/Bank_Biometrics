import Link from "next/link";

export default function BiometricHistoryPage() {
  const scans = [
    { id: "BIO-801", customer: "Abebe Bikila", score: "99.8%", status: "MATCHED", device: "Optical-HQ-01", time: "5 mins ago" },
    { id: "BIO-802", customer: "Tigist Assefa", score: "99.9%", status: "MATCHED", device: "Optical-HQ-02", time: "18 mins ago" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Biometric Verification Log History</h1>
        <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Audit log of optical fingerprint capture and template match events.</p>
      </div>

      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Recent Scans</h3>
          <span className="mono text-xs text-ledger-paper-dim">{scans.length} entries</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Scan Event ID</th>
              <th>Customer Name</th>
              <th style={{ textAlign: "right" }}>Match Precision</th>
              <th>Capture Terminal</th>
              <th style={{ textAlign: "right" }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((s) => (
              <tr key={s.id}>
                <td className="mono-cell font-semibold text-[color:var(--brass)]">{s.id}</td>
                <td>{s.customer}</td>
                <td style={{ textAlign: "right" }} className="mono-cell text-[color:var(--brass)]">{s.score}</td>
                <td className="text-ledger-paper-dim">{s.device}</td>
                <td style={{ textAlign: "right" }}>
                  <span className="status-chip pass">{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}