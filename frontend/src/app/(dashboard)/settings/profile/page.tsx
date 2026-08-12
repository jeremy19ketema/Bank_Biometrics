"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Fingerprint,
  Camera,
  Edit,
  Save,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  branchName?: string;
  branchCode?: string;
  enrolledSince?: string;
  tenure?: string;
  approvals?: number;
  accuracy?: string;
}

export default function ProfilePage() {
  const { toast, toasts, dismissToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const userData = sessionStorage.getItem("aegis_user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setProfile({
          ...user,
          phone: user.phone || "+1 (212) 555-0182",
          enrolledSince: "Mar 2022",
          tenure: "4.2y",
          approvals: 1204,
          accuracy: "99.6%",
        });
        setFormData({
          fullName: user.fullName || "",
          email: user.email || "",
          phone: user.phone || "+1 (212) 555-0182",
          bio: "Overseeing daily operations and approvals since 2022.",
        });
      } catch {}
    }
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      toast.success("Profile Updated", "Your profile has been saved successfully.");
    }, 800);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "+1 (212) 555-0182",
        bio: "Overseeing daily operations and approvals since 2022.",
      });
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[color:var(--ledger-paper-dim)]">Loading profile...</p>
      </div>
    );
  }

  const activityLog = [
    { event: "Approved wire transfer #TX-88221", time: "Today, 09:42 UTC", type: "success" },
    { event: "Signed in via fingerprint scan", time: "Today, 08:03 UTC", type: "success" },
    { event: "Declined cash withdrawal #TX-88240", time: "Yesterday, 16:11 UTC", type: "warning" },
    { event: "Updated contact phone number", time: "Jul 24, 11:20 UTC", type: "success" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[color:var(--ledger-paper)]">Profile</h1>
        <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">
          {profile.branchCode || profile.branchName || "Staff"} · Manage your personal information and biometrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6 text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full border-2 border-[color:var(--brass)] bg-[color:var(--vault-charcoal-2)] flex items-center justify-center text-3xl font-display text-[color:var(--brass)]">
                {getInitials(profile.fullName)}
              </div>
              <button
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[color:var(--brass)] border-2 border-[color:var(--vault-charcoal)] flex items-center justify-center hover:opacity-80 transition-opacity"
                onClick={() => toast.info("Coming Soon", "Avatar upload will be available soon.")}
              >
                <Edit className="w-3.5 h-3.5 text-[color:var(--ink-navy)]" />
              </button>
            </div>

            <h2 className="text-xl font-display font-medium text-[color:var(--ledger-paper)] mt-4">
              {profile.fullName}
            </h2>
            <p className="text-xs font-mono text-[color:var(--brass)] uppercase tracking-[0.08em]">
              {profile.role?.replace(/_/g, " ") || "User"}
            </p>
            <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">{profile.branchName || "No branch assigned"}</p>

            <div className="flex justify-around mt-6 pt-4 border-t border-[color:var(--line)]">
              <div>
                <p className="text-lg font-mono text-[color:var(--ledger-paper)]">{profile.tenure || "—"}</p>
                <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Tenure</p>
              </div>
              <div>
                <p className="text-lg font-mono text-[color:var(--ledger-paper)]">{profile.approvals || 0}</p>
                <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Approvals</p>
              </div>
              <div>
                <p className="text-lg font-mono text-[color:var(--ledger-paper)]">{profile.accuracy || "—"}</p>
                <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Accuracy</p>
              </div>
            </div>

            <div className="mt-4 text-left border-t border-[color:var(--line)] pt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[color:var(--ledger-paper-dim)]">Staff ID</span>
                <span className="font-mono text-[color:var(--ledger-paper)]">{profile.id?.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[color:var(--ledger-paper-dim)]">Access level</span>
                <span className="font-mono text-[color:var(--brass)]">{profile.role?.replace(/_/g, " ") || "User"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[color:var(--ledger-paper-dim)]">Enrolled since</span>
                <span className="font-mono text-[color:var(--ledger-paper)]">{profile.enrolledSince || "—"}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6">
            <h3 className="text-base font-display font-medium text-[color:var(--ledger-paper)]">Recent activity</h3>
            <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Last 4 logged actions</p>
            <div className="mt-4 space-y-3">
              {activityLog.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    item.type === "success" ? "bg-[color:var(--moss)]" : "bg-[color:var(--clay)]"
                  }`} />
                  <div>
                    <p className="text-sm text-[color:var(--ledger-paper)]">{item.event}</p>
                    <p className="text-xs font-mono text-[color:var(--ledger-paper-dim)]">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Personal Details */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-display font-medium text-[color:var(--ledger-paper)]">Personal details</h3>
                <p className="text-xs text-[color:var(--ledger-paper-dim)]">Visible to compliance and branch administrators</p>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] text-xs font-semibold transition-colors border border-[color:var(--brass)]/30"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
              ) : null}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={profile.branchName || "Not assigned"}
                      disabled
                      className="input-field cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Bio / Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="input-field resize-none"
                    placeholder="Optional – visible on your internal staff card"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-xs transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Full Legal Name</p>
                  <p className="text-[color:var(--ledger-paper)] font-medium">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Email</p>
                  <p className="text-[color:var(--ledger-paper)] font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Phone</p>
                  <p className="text-[color:var(--ledger-paper)] font-medium">{profile.phone || "Not set"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--ledger-paper-dim)]">Branch</p>
                  <p className="text-[color:var(--ledger-paper)] font-medium">{profile.branchName || "Not assigned"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Biometric Reference */}
          <div className="glass-panel rounded-2xl border border-slate-800 p-6">
            <h3 className="text-base font-display font-medium text-[color:var(--ledger-paper)]">Biometric reference</h3>
            <p className="text-xs text-[color:var(--ledger-paper-dim)]">Used for sign-in and transaction verification</p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-[color:var(--line)]">
                <div>
                  <p className="text-sm text-[color:var(--ledger-paper)]">Fingerprint enrollment</p>
                  <p className="text-xs font-mono text-[color:var(--ledger-paper-dim)]">Last updated Mar 14, 2022</p>
                </div>
                <span className="status-chip pass">Active</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-[color:var(--ledger-paper)]">Facial recognition</p>
                  <p className="text-xs font-mono text-[color:var(--ledger-paper-dim)]">Not yet enrolled</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700">
                  <Camera className="w-3.5 h-3.5" />
                  Enroll now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}