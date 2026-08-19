"use client";

import React, { useEffect, useState } from "react";
import { reportApi, DashboardMetrics, ReportExportJob } from "@/services/reportApi";
import { ShieldAlert, Download, FileText, CheckCircle, RefreshCcw } from "lucide-react";

export default function AuditorDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({});
  const [jobs, setJobs] = useState<ReportExportJob[]>([]);
  const [exportingType, setExportingType] = useState<string | null>(null);

  useEffect(() => {
    reportApi.getDashboardMetrics().then(res => {
      if (res.success && res.data) setMetrics(res.data);
    });
    fetchJobs();
  }, []);

  const fetchJobs = () => {
    reportApi.getExportJobs().then(res => {
      if (res.success && res.data) setJobs(res.data);
    });
  };

  const handleExport = async (type: string) => {
    setExportingType(type);
    try {
      const res = await reportApi.requestExport(type);
      if (res.success) {
        fetchJobs();
      } else {
        alert(res.message);
      }
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl">
        <div className="section-title mb-2 text-xs uppercase tracking-wider text-[color:var(--brass)]">Compliance & Audit</div>
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">
          Global Audit Dashboard
        </h1>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="panel flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[color:var(--clay)]/10 text-[color:var(--clay)] flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">Security Alerts (Recent)</p>
            <p className="text-2xl font-bold text-[color:var(--ledger-paper)]">{metrics.securityAlerts || 0}</p>
          </div>
        </div>
        <div className="panel flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[color:var(--brass)]/10 text-[color:var(--brass)] flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">Total Scoped Staff</p>
            <p className="text-2xl font-bold text-[color:var(--ledger-paper)]">{metrics.totalStaff || 0}</p>
          </div>
        </div>
        <div className="panel flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[color:var(--moss)]/10 text-[color:var(--moss)] flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-[color:var(--ledger-paper-dim)]">Monitored Devices</p>
            <p className="text-2xl font-bold text-[color:var(--ledger-paper)]">{metrics.totalDevices || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel">
          <h2 className="display mb-4">Request Compliance Exports</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <h3 className="font-semibold text-[color:var(--ledger-paper)]">Transaction Audit Log</h3>
                <p className="text-xs text-[color:var(--ledger-paper-dim)]">Export all transactions within your assigned scope.</p>
              </div>
              <button
                disabled={exportingType === "TRANSACTIONS"}
                onClick={() => handleExport("TRANSACTIONS")}
                className="flex items-center gap-2 bg-[color:var(--brass)]/10 text-[color:var(--brass)] px-4 py-2 rounded-lg hover:bg-[color:var(--brass)] hover:text-[#0F1B2B] transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> {exportingType === "TRANSACTIONS" ? "Requesting..." : "Export"}
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <h3 className="font-semibold text-[color:var(--ledger-paper)]">Attendance & Exceptions</h3>
                <p className="text-xs text-[color:var(--ledger-paper-dim)]">Export all attendance exceptions within your assigned scope.</p>
              </div>
              <button
                disabled={exportingType === "ATTENDANCE"}
                onClick={() => handleExport("ATTENDANCE")}
                className="flex items-center gap-2 bg-[color:var(--moss)]/10 text-[color:var(--moss)] px-4 py-2 rounded-lg hover:bg-[color:var(--moss)] hover:text-[#0F1B2B] transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> {exportingType === "ATTENDANCE" ? "Requesting..." : "Export"}
              </button>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="flex items-center justify-between mb-4">
            <h2 className="display">Recent Export Jobs</h2>
            <button onClick={fetchJobs} className="text-[color:var(--ledger-paper-dim)] hover:text-white transition-colors">
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
          {jobs.length === 0 ? (
            <div className="text-sm text-[color:var(--ledger-paper-dim)]">No recent export jobs.</div>
          ) : (
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--ledger-paper)]">{job.type}</p>
                    <p className="text-xs text-[color:var(--ledger-paper-dim)]">{new Date(job.requestedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    {job.status === "COMPLETED" ? (
                      <a href={job.downloadUrl} className="text-xs bg-[color:var(--moss)]/10 text-[color:var(--moss)] px-2 py-1 rounded border border-[color:var(--moss)]/30 hover:bg-[color:var(--moss)] hover:text-[#0F1B2B] transition-colors">
                        Download ({job.rowCount} rows)
                      </a>
                    ) : (
                      <span className="text-xs text-[color:var(--brass)] bg-[color:var(--brass)]/10 px-2 py-1 rounded">
                        {job.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
