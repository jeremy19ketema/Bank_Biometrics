"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export default function TrainingPage() {
  const { toast, toasts, dismissToast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    targetUserId: "",
    courseId: "",
    dueDate: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [crsRes, recRes, usrRes] = await Promise.all([
        apiClient.get<any>("/api/compliance/courses"),
        apiClient.get<any>("/api/compliance/staff"),
        apiClient.get<any>("/api/users?status=ACTIVE")
      ]);
      if (crsRes.data.success) setCourses(crsRes.data.data);
      if (recRes.data.success) setRecords(recRes.data.data);
      if (usrRes.data.success) setUsers(usrRes.data.data);
    } catch (err) {
      console.error("Failed to fetch training data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post<any>("/api/compliance/assign", formData);
      if (res.data.success) {
        toast.success("Success", "Course assigned successfully.");
        setFormData({ targetUserId: "", courseId: "", dueDate: "" });
        fetchData();
      } else {
        toast.error("Failed", res.data.message);
      }
    } catch (err: any) {
      toast.error("Error", err.response?.data?.message || err.message);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      const res = await apiClient.patch<any>(`/api/compliance/${id}/verify`, { status: "COMPLETED", documentReference: "Verified via HR Dashboard" });
      if (res.data.success) {
        toast.success("Verified", "Compliance record marked as completed.");
        fetchData();
      } else {
        toast.error("Failed", res.data.message);
      }
    } catch (err: any) {
      toast.error("Error", err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-2xl backdrop-blur-xl">
        <div className="section-title mb-2 text-xs uppercase tracking-wider text-[color:var(--brass)]">Human Resources</div>
        <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <GraduationCap className="w-6 h-6" /> Training & Compliance
        </h1>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-6 shadow-xl xl:col-span-1 h-fit">
          <h2 className="text-lg font-semibold text-white mb-4">Assign Training</h2>
          <form onSubmit={handleAssign} className="space-y-4">
            <select required value={formData.targetUserId} onChange={e => setFormData({...formData, targetUserId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none appearance-none">
              <option value="">Select Employee</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
            </select>
            <select required value={formData.courseId} onChange={e => setFormData({...formData, courseId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none appearance-none">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input required type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[color:var(--brass)] focus:outline-none" />
            <button type="submit" className="w-full px-5 py-3 rounded-xl bg-[color:var(--brass)] text-[#16233A] text-sm font-bold hover:bg-[#d7ab5c] transition">
              Assign Course
            </button>
          </form>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-[rgba(15,23,40,0.78)] p-6 shadow-xl xl:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[color:var(--moss)]" /> Staff Compliance Records
          </h2>
          
          <div className="overflow-x-auto">
            {loading ? (
               <div className="text-center py-12 text-slate-400 animate-pulse">Loading records...</div>
            ) : records.length === 0 ? (
               <div className="text-center py-12 text-slate-500 text-sm">No compliance records found.</div>
            ) : (
               <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-[color:var(--ledger-paper-dim)] border-b border-white/10">
                  <tr>
                    <th className="pb-3 font-semibold">Employee</th>
                    <th className="pb-3 font-semibold">Course</th>
                    <th className="pb-3 font-semibold">Due Date</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map(rec => (
                    <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-medium text-white">{rec.user?.fullName}</td>
                      <td className="py-3 text-slate-300">{rec.course?.title}</td>
                      <td className="py-3 text-slate-400">{new Date(rec.dueDate).toLocaleDateString()}</td>
                      <td className="py-3">
                         <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          rec.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                          rec.status === 'EXPIRED' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {(rec.status === "PENDING" || rec.status === "EXPIRED") && (
                           <button onClick={() => handleVerify(rec.id)} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition">
                             Verify
                           </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
