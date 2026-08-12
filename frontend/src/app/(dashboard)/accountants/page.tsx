"use client";

import Link from "next/link";

export default function AccountantListPage() {
  const accountants = [
    { empId: "ACT-401", name: "Bethlehem Haile", till: "Till #01", branch: "Main HQ Branch", volume: "$420,000", successRate: "99.9%", status: "ACTIVE" },
    { empId: "ACT-402", name: "Kassahun Fikre", till: "Till #02", branch: "Main HQ Branch", volume: "$380,000", successRate: "99.8%", status: "ACTIVE" },
    { empId: "ACT-403", name: "Hiwot Gebre", till: "Till #03", branch: "Bole Diplomatic Branch", volume: "$510,000", successRate: "100%", status: "ACTIVE" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Accountant & Teller Roster</h1>
          <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Operational directory of cashiers and biometric verification operators.</p>
        </div>
        <Link href="/accountants/create" className="btn-primary flex items-center gap-2">
          + Add Accountant / Teller
        </Link>
      </div>

      <div className="ledger-panel">
        <div className="ledger-head">
          <h3 className="display">Active Tellers</h3>
          <span className="mono text-xs text-ledger-paper-dim">{accountants.length} entries</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Teller ID</th>
              <th>Full Name</th>
              <th>Assigned Till</th>
              <th>Branch</th>
              <th style={{ textAlign: "right" }}>Today Volume</th>
              <th style={{ textAlign: "right" }}>Match Accuracy</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accountants.map((a) => (
              <tr key={a.empId}>
                <td className="mono-cell font-semibold text-[color:var(--brass)]">{a.empId}</td>
                <td className="font-semibold">{a.name}</td>
                <td>{a.till}</td>
                <td className="text-ledger-paper-dim">{a.branch}</td>
                <td style={{ textAlign: "right" }} className="mono-cell text-[color:var(--moss)]">{a.volume}</td>
                <td style={{ textAlign: "right" }} className="mono-cell text-[color:var(--brass)]">{a.successRate}</td>
                <td style={{ textAlign: "right" }}>
                  <div className="flex justify-end gap-2">
                    <Link href={`/accountants/details?id=${a.empId}`} className="btn-mini">Inspect</Link>
                    <Link href={`/accountants/performance?id=${a.empId}`} className="btn-mini">Performance</Link>
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