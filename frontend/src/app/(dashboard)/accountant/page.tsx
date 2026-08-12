"use client";

import Link from "next/link";
import {
  Fingerprint,
  Banknote,
  Receipt,
  ArrowRight,
  Wallet,
  Users,
  UserRoundPlus,
  CheckCircle,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AccountantDashboard() {
  // Mock KPI data
  const stats = {
    todayTransactions: 48,
    totalVolume: "$42,580.00",
    customersServed: 32,
    pendingOverrides: 2,
  };

  // Mock Recent Activity
  const recentActivities = [
    {
      id: 1,
      customer: "Abebe Bikila",
      type: "Cash Withdrawal",
      amount: "$8,500.00",
      status: "Pending Approval",
      time: "2 mins ago",
      requiresManager: true,
    },
    {
      id: 2,
      customer: "Tigist Assefa",
      type: "Cheque Clearance",
      amount: "$12,000.00",
      status: "Completed",
      time: "12 mins ago",
      requiresManager: false,
    },
    {
      id: 3,
      customer: "Haile Gebrselassie",
      type: "Biometric Enrollment",
      amount: "—",
      status: "Completed",
      time: "25 mins ago",
      requiresManager: false,
    },
    {
      id: 4,
      customer: "Bethelhem Haile",
      type: "Cash Deposit",
      amount: "$5,000.00",
      status: "Pending Approval",
      time: "42 mins ago",
      requiresManager: true,
    },
  ];

  // Mock chart data – Daily transaction volume (Mon-Sun)
  const chartData = [
    { day: "Mon", volume: 42000 },
    { day: "Tue", volume: 38000 },
    { day: "Wed", volume: 55000 },
    { day: "Thu", volume: 48000 },
    { day: "Fri", volume: 62000 },
    { day: "Sat", volume: 28000 },
    { day: "Sun", volume: 15000 },
  ];

  // Find max volume for percentage calculation
  const maxVolume = Math.max(...chartData.map((d) => d.volume));
  // Chart height in pixels
  const chartHeight = 140;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Today's Transactions
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
              {stats.todayTransactions}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Total Volume Processed
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
              {stats.totalVolume}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--brass-dim)]/10 text-[color:var(--brass-dim)] border border-[color:var(--brass-dim)]/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Customers Served
            </p>
            <p className="text-xl font-bold text-[color:var(--ledger-paper)]">
              {stats.customersServed}
            </p>
          </div>
        </div>

        <div className="bg-[color:var(--vault-charcoal)] border border-[color:var(--line)] rounded-lg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">
              Pending Overrides
            </p>
            <p className="text-xl font-bold text-[color:var(--clay)]">
              {stats.pendingOverrides}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles – 3×2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Biometric Verification */}
        <Link
          href="/biometrics/scan"
          className="panel hover:border-[color:var(--brass)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center group-hover:bg-[color:var(--brass)] group-hover:text-[#0F1B2B] transition-colors">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="20" />
                </svg>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--brass)] group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--brass)] transition-colors">
              Biometric Verification
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              Capture optical fingerprint or face scan for customer identification.
            </p>
          </div>
        </Link>

        {/* 2. Cash Withdrawal */}
        <Link
          href="/transactions/withdrawal"
          className="panel hover:border-[color:var(--moss)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center group-hover:bg-[color:var(--moss)] group-hover:text-[#0F1B2B] transition-colors">
                <Banknote className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc moss" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="40" />
                </svg>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--moss)] group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--moss)] transition-colors">
              Cash Withdrawal
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              Process over‑the‑counter cash payout backed by biometric authentication.
            </p>
          </div>
        </Link>

        {/* 3. Cheque Processing */}
        <Link
          href="/transactions/cheque"
          className="panel hover:border-[color:var(--brass-dim)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--brass-dim)]/10 text-[color:var(--brass-dim)] border border-[color:var(--brass-dim)]/30 flex items-center justify-center group-hover:bg-[color:var(--brass-dim)] group-hover:text-[#0F1B2B] transition-colors">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="60" />
                </svg>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--brass-dim)] group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--brass-dim)] transition-colors">
              Cheque Processing
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              Clear MICR cheques and verify authorization against customer biometric template.
            </p>
          </div>
        </Link>

        {/* 4. Cash Deposit */}
        <Link
          href="/transactions/deposit"
          className="panel hover:border-[color:var(--brass)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] border border-[color:var(--brass)]/30 flex items-center justify-center group-hover:bg-[color:var(--brass)] group-hover:text-[#0F1B2B] transition-colors">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="30" />
                </svg>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--brass)] group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--brass)] transition-colors">
              Cash Deposit
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              Accept and process customer cash or cheque deposits into their accounts.
            </p>
          </div>
        </Link>

        {/* 5. Customer Search */}
        <Link
          href="/customers/search"
          className="panel hover:border-[color:var(--moss)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center group-hover:bg-[color:var(--moss)] group-hover:text-[#0F1B2B] transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc moss" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="35" />
                </svg>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--moss)] group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--moss)] transition-colors">
              Customer Search
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              Quickly find customer profiles, account details, and transaction history.
            </p>
          </div>
        </Link>

        {/* 6. Biometric Enrollment */}
        <Link
          href="/biometrics/enroll"
          className="panel hover:border-[color:var(--brass-dim)] transition-all group"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[color:var(--brass-dim)]/10 text-[color:var(--brass-dim)] border border-[color:var(--brass-dim)]/30 flex items-center justify-center group-hover:bg-[color:var(--brass-dim)] group-hover:text-[#0F1B2B] transition-colors">
                <UserRoundPlus className="w-6 h-6" />
              </div>
              <div className="vault-dial" style={{ width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle className="track" cx="20" cy="20" r="16" strokeWidth="3" />
                  <circle className="arc" cx="20" cy="20" r="16" strokeWidth="3" strokeDasharray="100.5" strokeDashoffset="50" />
                </svg>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[color:var(--ledger-paper-dim)] group-hover:text-[color:var(--brass-dim)] group-hover:translate-x-1 transition-all" />
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-lg text-[color:var(--ledger-paper)] group-hover:text-[color:var(--brass-dim)] transition-colors">
              Biometric Enrollment
            </h3>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">
              Register new customer fingerprints and facial templates into the system.
            </p>
          </div>
        </Link>
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Volume Chart – Fixed with visible bars */}
        <div className="panel">
          <h3 className="display">Daily Transaction Volume</h3>
          <div className="panel-sub">This week – total value processed per day</div>

          {/* Chart container with explicit height and flex */}
          <div
            className="flex items-end gap-3"
            style={{ height: `${chartHeight + 30}px`, paddingTop: "10px" }}
          >
            {chartData.map((item) => {
              const barHeight = Math.max((item.volume / maxVolume) * chartHeight, 8);
              return (
                <div
                  key={item.day}
                  className="flex flex-col items-center gap-1 flex-1 h-full justify-end"
                >
                  <div
                    className="w-full rounded-sm transition-all duration-300 hover:brightness-125"
                    style={{
                      height: `${barHeight}px`,
                      background: `linear-gradient(180deg, var(--brass), var(--brass-dim))`,
                      minHeight: "6px",
                      borderRadius: "3px 3px 0 0",
                    }}
                  />
                  <span className="font-mono text-[10px] text-[color:var(--ledger-paper-dim)]">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Value labels */}
          <div className="flex justify-between text-[10px] text-[color:var(--ledger-paper-dim)] font-mono mt-2">
            <span>${chartData[0].volume.toLocaleString()}</span>
            <span>${chartData[3].volume.toLocaleString()}</span>
            <span>${chartData[6].volume.toLocaleString()}</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="panel">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="display">Recent Activity</h3>
              <div className="panel-sub">Live feed of teller operations</div>
            </div>
            <Clock className="w-4 h-4 text-[color:var(--ledger-paper-dim)]" />
          </div>
          <div className="space-y-3 mt-2">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[rgba(15,23,40,0.4)] border border-[color:var(--line)] hover:border-[color:var(--line-strong)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {activity.requiresManager ? (
                    <div className="w-8 h-8 rounded-full bg-[color:var(--clay)]/10 text-[color:var(--clay)] border border-[color:var(--clay)]/30 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[color:var(--moss)]/10 text-[color:var(--moss)] border border-[color:var(--moss)]/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[color:var(--ledger-paper)] truncate">
                      {activity.customer}
                    </p>
                    <p className="text-xs text-[color:var(--ledger-paper-dim)] truncate">
                      {activity.type} · {activity.time}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 ml-2">
                  {activity.amount !== "—" && (
                    <span className="text-sm font-mono text-[color:var(--brass)]">
                      {activity.amount}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono uppercase tracking-[0.06em] ${
                      activity.requiresManager
                        ? "text-[color:var(--clay)]"
                        : "text-[color:var(--moss)]"
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[color:var(--line)]">
            <Link
              href="/transactions/history"
              className="text-xs font-mono text-[color:var(--brass)] hover:underline flex items-center gap-1"
            >
              View full transaction history →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}