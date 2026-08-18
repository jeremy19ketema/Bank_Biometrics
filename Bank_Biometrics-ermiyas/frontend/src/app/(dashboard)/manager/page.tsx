"use client";

import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  FileCheck2,
  Landmark,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function ManagerDashboardPage() {
  const metrics = [
    {
      label: "Active branches",
      value: "14",
      delta: "+2 this week",
      icon: Building2,
    },
    {
      label: "Pending approvals",
      value: "09",
      delta: "3 urgent",
      icon: FileCheck2,
    },
    {
      label: "Customer coverage",
      value: "92%",
      delta: "+4.2%",
      icon: Users,
    },
    {
      label: "Compliance score",
      value: "99.1%",
      delta: "Stable",
      icon: ShieldCheck,
    },
  ];

  const queue = [
    {
      id: "APR-204",
      request: "High-value withdrawal authorization",
      branch: "Bole Branch",
      time: "09:42",
      status: "Priority",
    },
    {
      id: "APR-205",
      request: "Temporary access for branch IT",
      branch: "Arada Branch",
      time: "11:10",
      status: "Review",
    },
    {
      id: "APR-206",
      request: "Account verification review",
      branch: "Piassa Branch",
      time: "13:35",
      status: "Pending",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="section-title mb-2">Operations overview</div>
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
              Branch leadership control center
            </h1>
            <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">
              Monitor branch readiness, approval queues, and compliance signals from a single secure workspace.
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--brass)]/30 bg-[rgba(198,154,76,0.14)] px-4 py-2.5 text-sm font-semibold text-[color:var(--ledger-paper)] transition hover:bg-[rgba(198,154,76,0.22)]">
            <BadgeCheck className="h-4 w-4" />
            Review queue
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-5 shadow-[0_16px_40px_rgba(2,8,23,0.28)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--ledger-paper-dim)]">{metric.label}</span>
                <div className="rounded-2xl border border-[color:var(--brass)]/20 bg-[rgba(198,154,76,0.12)] p-2 text-[color:var(--brass)]">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-5 text-3xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
                {metric.value}
              </div>
              <div className="mt-2 text-sm text-[color:var(--moss)]">{metric.delta}</div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-5 shadow-[0_20px_60px_rgba(2,8,23,0.36)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="section-title">Approval queue</div>
              <h2 className="mt-1 text-lg font-semibold text-[color:var(--ledger-paper)]">
                Pending actions
              </h2>
            </div>
            <button className="text-sm font-semibold text-[color:var(--brass)]">Open full list</button>
          </div>

          <div className="mt-5 space-y-3">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-semibold text-[color:var(--ledger-paper)]">{item.request}</div>
                  <div className="mt-1 text-sm text-[color:var(--ledger-paper-dim)]">
                    {item.id} · {item.branch} · {item.time}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="status-pill bg-[rgba(198,154,76,0.16)] text-[color:var(--brass)]">
                    {item.status}
                  </span>
                  <button className="rounded-full border border-white/10 p-2 text-[color:var(--ledger-paper-dim)] transition hover:text-[color:var(--ledger-paper)]">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-5 shadow-[0_20px_60px_rgba(2,8,23,0.36)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="section-title">Branch intelligence</div>
              <h2 className="mt-1 text-lg font-semibold text-[color:var(--ledger-paper)]">
                Network health
              </h2>
            </div>
            <div className="status-pill bg-[rgba(76,122,94,0.16)] text-[color:var(--moss)]">Healthy</div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[color:var(--brass)]/20 bg-[rgba(198,154,76,0.12)] p-2 text-[color:var(--brass)]">
                  <Landmark className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[color:var(--ledger-paper)]">Regional branches</div>
                  <div className="text-sm text-[color:var(--ledger-paper-dim)]">14 live sites · 2 under review</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[rgba(244,239,223,0.04)] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[color:var(--brass)]/20 bg-[rgba(198,154,76,0.12)] p-2 text-[color:var(--brass)]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[color:var(--ledger-paper)]">Security posture</div>
                  <div className="text-sm text-[color:var(--ledger-paper-dim)]">No critical incidents in the last 24 hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}