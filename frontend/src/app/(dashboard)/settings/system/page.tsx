"use client";

import { useState, useEffect } from "react";
import { Plus } from 'lucide-react';
import {
  Settings,
  Shield,
  Users,
  CheckCircle,
  Fingerprint,
  Building2,
  UserCog,
  Bell,
  FileText,
  Database,
  Plug,
  Wrench,
  Table,
  Palette,
  Info,
  Save,
  RefreshCw,
  Lock,
  Key,
  Clock,
  Globe,
  Mail,
  Phone,
  AlertTriangle,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Server,
  HardDrive,
  Cpu,
  Activity,
  Calendar,
  MessageSquare,
  UserCheck,
  UserX,
  ShieldCheck,
  DatabaseZap,
  Cloud,
  Download,
  Upload,
  RotateCw,
  Search,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Section =
  | "general"
  | "security"
  | "roles"
  | "approval-rules"
  | "biometric"
  | "branch-defaults"
  | "user-defaults"
  | "notifications"
  | "audit"
  | "backup"
  | "api"
  | "maintenance"
  | "approval-matrix"
  | "appearance"
  | "about";

interface NavItem {
  id: Section;
  label: string;
  icon: React.ReactNode;
}

// Mock data for approval matrix
const approvalMatrixActions = [
  { id: "create-branch", action: "Create Branch", defaultApprover: "Super Admin" },
  { id: "delete-branch", action: "Delete Branch", defaultApprover: "Super Admin" },
  { id: "create-bank-manager", action: "Create Bank Manager", defaultApprover: "Super Admin" },
  { id: "reset-manager-password", action: "Reset Manager Password", defaultApprover: "Super Admin IT" },
  { id: "create-accountant", action: "Create Accountant", defaultApprover: "Bank Manager" },
  { id: "reset-accountant-password", action: "Reset Accountant Password", defaultApprover: "Branch IT" },
  { id: "large-withdrawal", action: "Large Withdrawal", defaultApprover: "Bank Manager" },
  { id: "huge-withdrawal", action: "Huge Withdrawal", defaultApprover: "Super Admin Manager" },
  { id: "forex-approval", action: "FOREX Approval", defaultApprover: "FOREX" },
  { id: "branch-shutdown", action: "Branch Shutdown", defaultApprover: "Super Admin" },
];

const approverOptions = [
  "Super Admin",
  "Super Admin Manager",
  "Super Admin IT",
  "Super Admin FOREX",
  "Bank Manager",
  "Branch IT",
  "Accountant",
  "FOREX",
];

export default function SystemSettingsPage() {
  const { toast, toasts, dismissToast } = useToast();
  const [activeSection, setActiveSection] = useState<Section>("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveTarget, setSaveTarget] = useState<Section | "all" | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // ---- General Settings ----
  const [general, setGeneral] = useState({
    bankName: "Aegis Bank",
    systemName: "Aegis Biometric Banking",
    timeZone: "Africa/Addis_Ababa",
    currency: "ETB",
    language: "English",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h",
    branchCodeFormat: "BR-XXX",
    staffIdFormat: "EMP-XXXXX",
  });

  // ---- Security Settings ----
  const [security, setSecurity] = useState({
    // Password policy
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    passwordExpiration: 90,
    passwordHistory: 5,
    preventReuse: true,
    maxLoginAttempts: 5,
    accountLockDuration: 30,
    forcePasswordChangeOnFirstLogin: true,
    enable2FA: false,
    sessionTimeout: 30,
    maxConcurrentSessions: 3,
    rememberDevice: true,
    // Login policies
    officeHoursOnly: false,
    countryRestrictions: false,
    vpnDetection: false,
    unknownDeviceApproval: true,
    loginNotifications: true,
  });

  // ---- Role Management ----
  const roles = [
    { id: "super-admin", name: "Super Admin", permissions: 24 },
    { id: "super-admin-manager", name: "Super Admin Manager", permissions: 18 },
    { id: "super-admin-it", name: "Super Admin IT", permissions: 16 },
    { id: "super-admin-forex", name: "Super Admin FOREX", permissions: 14 },
    { id: "bank-manager", name: "Bank Manager", permissions: 12 },
    { id: "branch-it", name: "Branch IT", permissions: 8 },
    { id: "accountant", name: "Accountant", permissions: 6 },
  ];

  const [rolePermissions, setRolePermissions] = useState<
    Record<
      string,
      {
        canCreate: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canView: boolean;
      }
    >
  >({});

  // ---- Approval Rules ----
  const [approvalRules, setApprovalRules] = useState([
    { id: "small-transaction", label: "Small Transaction", threshold: "Below 50,000 ETB", approver: "Bank Manager" },
    { id: "medium-transaction", label: "Medium Transaction", threshold: "50,000–250,000 ETB", approver: "Branch Manager + Biometric" },
    { id: "large-transaction", label: "Large Transaction", threshold: "Above 250,000 ETB", approver: "Super Admin Manager" },
    { id: "critical-operations", label: "Critical Operations", threshold: "Always require Super Admin", approver: "Super Admin" },
  ]);

  // ---- Biometric Settings ----
  const [biometric, setBiometric] = useState({
    fingerprintThreshold: 850,
    faceThreshold: 820,
    irisThreshold: 800,
    maxRetryAttempts: 3,
    sensorTimeout: 30,
    biometricQualityScore: 75,
    enableFingerprint: true,
    enableFace: true,
    enableIris: false,
    livenessDetection: true,
    fakeFingerprintDetection: true,
    cameraQuality: "1080p",
  });

  // ---- Branch Defaults ----
  const [branchDefaults, setBranchDefaults] = useState({
    regionCodes: "AF, EU, NA, SA, AS, OC",
    defaultWorkingHours: "09:00-17:00",
    defaultManagerRole: "BANK_MANAGER",
    defaultITRole: "BRANCH_IT",
    branchActivation: "Manual",
    branchDeactivation: "Manual",
  });

  // ---- User Defaults ----
  const [userDefaults, setUserDefaults] = useState({
    tempPasswordLength: 12,
    defaultExpiration: 90,
    staffIdFormat: "EMP-XXXXX",
    autoEmail: true,
    autoSMS: false,
    forcePasswordChange: true,
    defaultPermissions: "View Only",
    accountExpiration: 365,
  });

  // ---- Notification Settings ----
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    smsEnabled: false,
    inAppEnabled: true,
    events: {
      failedLogin: true,
      passwordReset: true,
      newBranch: true,
      approvalRequest: true,
      systemFailure: true,
      serverOffline: true,
      biometricFailure: true,
      backupCompleted: true,
      criticalSecurityAlert: true,
    },
  });

  // ---- Audit & Logging ----
  const [audit, setAudit] = useState({
    retentionDays: 180,
    logLogin: true,
    logLogout: true,
    logPasswordChanges: true,
    logUserCreation: true,
    logUserDeletion: true,
    logApprovalActions: true,
    logBiometricVerification: true,
    logFailedVerification: true,
    logPermissionChanges: true,
    logBranchChanges: true,
    logSystemConfigChanges: true,
  });

  // ---- Backup & Recovery ----
  const [backup, setBackup] = useState({
    frequency: "daily" as "daily" | "weekly" | "monthly",
    location: "cloud" as "cloud" | "local",
    encryption: true,
    autoBackup: true,
    recoveryTesting: true,
  });

  // ---- API & Integration ----
  const [api, setApi] = useState({
    coreBankingAPI: "",
    biometricAPI: "",
    smsGateway: "",
    emailServer: "",
    otpProvider: "",
    forexAPI: "",
    governmentIDAPI: "",
    healthChecks: true,
    apiKeys: [] as { name: string; key: string; created: string }[],
  });

  // ---- System Maintenance ----
  const [maintenance, setMaintenance] = useState({
    maintenanceMode: false,
    clearCache: false,
    optimizeDatabase: false,
  });

  // ---- Approval Matrix ----
  const [approvalMatrix, setApprovalMatrix] = useState(approvalMatrixActions);

  // ---- Appearance ----
  const [appearance, setAppearance] = useState({
    darkMode: true,
    accentColor: "#C69A4C",
    compactMode: false,
    tableDensity: "normal" as "compact" | "normal" | "spacious",
  });

  // ---- About System ----
  const [about] = useState({
    applicationVersion: "v3.2.1",
    buildNumber: "2024.07.15.001",
    releaseDate: "2024-07-15",
    databaseVersion: "PostgreSQL 16.3",
    serverVersion: "Node.js 20.11.0",
    apiVersion: "v1",
    lastBackup: "2024-07-15 03:00:00 UTC",
    lastRestart: "2024-07-15 00:15:00 UTC",
    license: "Enterprise License",
    uptime: "14d 6h 32m",
  });

  // ---- Navigation items ----
  const navItems: NavItem[] = [
    { id: "general", label: "General Settings", icon: <Settings className="w-4 h-4" /> },
    { id: "security", label: "Security Settings", icon: <Shield className="w-4 h-4" /> },
    { id: "roles", label: "Role Management", icon: <Users className="w-4 h-4" /> },
    { id: "approval-rules", label: "Approval Rules", icon: <CheckCircle className="w-4 h-4" /> },
    { id: "biometric", label: "Biometric Settings", icon: <Fingerprint className="w-4 h-4" /> },
    { id: "branch-defaults", label: "Branch Defaults", icon: <Building2 className="w-4 h-4" /> },
    { id: "user-defaults", label: "User Defaults", icon: <UserCog className="w-4 h-4" /> },
    { id: "notifications", label: "Notification Settings", icon: <Bell className="w-4 h-4" /> },
    { id: "audit", label: "Audit & Logging", icon: <FileText className="w-4 h-4" /> },
    { id: "backup", label: "Backup & Recovery", icon: <Database className="w-4 h-4" /> },
    { id: "api", label: "API & Integration", icon: <Plug className="w-4 h-4" /> },
    { id: "maintenance", label: "System Maintenance", icon: <Wrench className="w-4 h-4" /> },
    { id: "approval-matrix", label: "Approval Matrix", icon: <Table className="w-4 h-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
    { id: "about", label: "About System", icon: <Info className="w-4 h-4" /> },
  ];

  // ---- Save functions ----
  const handleSaveSection = (section: Section) => {
    setIsSaving(true);
    setSaveTarget(section);
    setTimeout(() => {
      setIsSaving(false);
      setSaveTarget(null);
      toast.success("Settings Saved", `${navItems.find((i) => i.id === section)?.label} updated successfully.`);
    }, 600);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setSaveTarget("all");
    setTimeout(() => {
      setIsSaving(false);
      setSaveTarget(null);
      toast.success("All Settings Saved", "All configurations have been updated successfully.");
    }, 1000);
  };

  const handleExportLogs = async () => {
    setIsExporting(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("aegis_auth_token="))
        ?.split("=")[1];

      const res = await fetch("http://localhost:5000/api/audit/logs", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        const logs = data.data;
        if (logs.length === 0) {
          toast.success("No Logs", "There are currently no logs to export.");
          setIsExporting(false);
          return;
        }
        
        const headers = Object.keys(logs[0]).join(",");
        const csvRows = logs.map((log: any) => 
          Object.values(log).map(val => {
            if (val === null || val === undefined) return '""';
            const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
            return `"${strVal.replace(/"/g, '""')}"`;
          }).join(",")
        );
        
        const csvContent = [headers, ...csvRows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `system_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Export Successful", "Audit logs have been exported successfully.");
      } else {
        toast.error("Export Failed", "Failed to export logs from the server.");
      }
    } catch (error) {
      toast.error("Export Error", "An error occurred while exporting logs.");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  // ---- Render section content ----
  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return renderGeneral();
      case "security":
        return renderSecurity();
      case "roles":
        return renderRoles();
      case "approval-rules":
        return renderApprovalRules();
      case "biometric":
        return renderBiometric();
      case "branch-defaults":
        return renderBranchDefaults();
      case "user-defaults":
        return renderUserDefaults();
      case "notifications":
        return renderNotifications();
      case "audit":
        return renderAudit();
      case "backup":
        return renderBackup();
      case "api":
        return renderAPI();
      case "maintenance":
        return renderMaintenance();
      case "approval-matrix":
        return renderApprovalMatrix();
      case "appearance":
        return renderAppearance();
      case "about":
        return renderAbout();
      default:
        return null;
    }
  };

  // ---- Section renderers ----

  const renderGeneral = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[color:var(--brass)]" />
          General Settings
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Configure core application preferences and global formatting options.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Bank Name</label>
          <input
            type="text"
            value={general.bankName}
            onChange={(e) => setGeneral({ ...general, bankName: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">System Name</label>
          <input
            type="text"
            value={general.systemName}
            onChange={(e) => setGeneral({ ...general, systemName: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Time Zone</label>
          <select
            value={general.timeZone}
            onChange={(e) => setGeneral({ ...general, timeZone: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
          >
            <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Dubai">Asia/Dubai</option>
            <option value="Asia/Singapore">Asia/Singapore</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Currency</label>
          <select
            value={general.currency}
            onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
          >
            <option value="ETB">ETB (Ethiopian Birr)</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Language</label>
          <select
            value={general.language}
            onChange={(e) => setGeneral({ ...general, language: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Amharic">Amharic</option>
            <option value="French">French</option>
            <option value="Arabic">Arabic</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Date Format</label>
          <select
            value={general.dateFormat}
            onChange={(e) => setGeneral({ ...general, dateFormat: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Time Format</label>
          <select
            value={general.timeFormat}
            onChange={(e) => setGeneral({ ...general, timeFormat: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
          >
            <option value="24h">24-hour</option>
            <option value="12h">12-hour (AM/PM)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Branch Code Format</label>
          <input
            type="text"
            value={general.branchCodeFormat}
            onChange={(e) => setGeneral({ ...general, branchCodeFormat: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Staff ID Format</label>
          <input
            type="text"
            value={general.staffIdFormat}
            onChange={(e) => setGeneral({ ...general, staffIdFormat: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
      </div>
      
      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("general")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "general" ? "Saving Preferences..." : "Save General Settings"}
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Shield className="w-6 h-6 text-[color:var(--brass)]" />
          Security Settings
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Configure password policies, authentication, and login restrictions.
        </p>
      </div>

      {/* Password Policy */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-[color:var(--ledger-paper)] flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-[color:var(--brass)]" />
          Password Policy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Minimum Password Length</label>
            <input
              type="number"
              value={security.minLength}
              onChange={(e) => setSecurity({ ...security, minLength: parseInt(e.target.value) || 8 })}
              className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password Expiration (Days)</label>
            <select
              value={security.passwordExpiration}
              onChange={(e) => setSecurity({ ...security, passwordExpiration: parseInt(e.target.value) })}
              className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={0}>Never expire</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { key: "requireUppercase", label: "Require Uppercase" },
            { key: "requireLowercase", label: "Require Lowercase" },
            { key: "requireNumbers", label: "Require Numbers" },
            { key: "requireSymbols", label: "Require Symbols" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#0B192C]/50 border border-white/5 hover:bg-[#0B192C] transition-colors">
              <input
                type="checkbox"
                checked={security[item.key as keyof typeof security] as boolean}
                onChange={() => setSecurity({ ...security, [item.key]: !security[item.key as keyof typeof security] })}
                className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C]"
              />
              <span className="text-xs font-medium text-[color:var(--ledger-paper)]">{item.label}</span>
            </label>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password History</label>
            <input
              type="number"
              value={security.passwordHistory}
              onChange={(e) => setSecurity({ ...security, passwordHistory: parseInt(e.target.value) || 5 })}
              className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Max Failed Login Attempts</label>
            <input
              type="number"
              value={security.maxLoginAttempts}
              onChange={(e) => setSecurity({ ...security, maxLoginAttempts: parseInt(e.target.value) || 5 })}
              className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Account Lock Duration (Minutes)</label>
            <input
              type="number"
              value={security.accountLockDuration}
              onChange={(e) => setSecurity({ ...security, accountLockDuration: parseInt(e.target.value) || 30 })}
              className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Max Concurrent Sessions</label>
            <input
              type="number"
              value={security.maxConcurrentSessions}
              onChange={(e) => setSecurity({ ...security, maxConcurrentSessions: parseInt(e.target.value) || 3 })}
              className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {[
            { key: "forcePasswordChangeOnFirstLogin", label: "Force password change on first login" },
            { key: "enable2FA", label: "Enable Two-Factor Authentication (2FA)" },
            { key: "rememberDevice", label: "Remember trusted devices" },
            { key: "preventReuse", label: "Prevent reuse of previous passwords" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#0B192C]/50 border border-white/5 hover:bg-[#0B192C] transition-colors">
              <input
                type="checkbox"
                checked={security[item.key as keyof typeof security] as boolean}
                onChange={() => setSecurity({ ...security, [item.key]: !security[item.key as keyof typeof security] })}
                className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C]"
              />
              <span className="text-sm font-medium text-[color:var(--ledger-paper)]">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Login Policies */}
      <div className="mt-10 pt-6 border-t border-white/5">
        <h3 className="text-sm font-semibold text-[color:var(--ledger-paper)] flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[color:var(--brass)]" />
          Login Policies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Session Timeout (Minutes)</label>
            <input
              type="number"
              value={security.sessionTimeout}
              onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) || 30 })}
              className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {[
            { key: "officeHoursOnly", label: "Restrict to office hours" },
            { key: "countryRestrictions", label: "Country restrictions" },
            { key: "vpnDetection", label: "Block VPN connections" },
            { key: "unknownDeviceApproval", label: "Require approval for unknown devices" },
            { key: "loginNotifications", label: "Login notifications" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#0B192C]/50 border border-white/5 hover:bg-[#0B192C] transition-colors">
              <input
                type="checkbox"
                checked={security[item.key as keyof typeof security] as boolean}
                onChange={() => setSecurity({ ...security, [item.key]: !security[item.key as keyof typeof security] })}
                className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C]"
              />
              <span className="text-sm font-medium text-[color:var(--ledger-paper)]">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("security")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "security" ? "Saving Preferences..." : "Save Security Settings"}
        </button>
      </div>
    </div>
  );

  const renderRoles = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Users className="w-6 h-6 text-[color:var(--brass)]" />
          Role Management
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Configure role permissions and access levels.
        </p>
      </div>
      
      <div className="mt-4 overflow-hidden rounded-xl bg-[#0B192C]/30 border border-white/5 shadow-inner backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0B192C]/80 border-b border-white/10">
              <tr>
                <th className="py-4 px-6 font-semibold text-slate-300 uppercase tracking-wider text-xs">Role</th>
                <th className="py-4 px-4 font-semibold text-slate-300 uppercase tracking-wider text-xs text-center">Create</th>
                <th className="py-4 px-4 font-semibold text-slate-300 uppercase tracking-wider text-xs text-center">Edit</th>
                <th className="py-4 px-4 font-semibold text-slate-300 uppercase tracking-wider text-xs text-center">Delete</th>
                <th className="py-4 px-4 font-semibold text-slate-300 uppercase tracking-wider text-xs text-center">View</th>
                <th className="py-4 px-6 font-semibold text-slate-300 uppercase tracking-wider text-xs text-right">Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-[#0B192C]/60 transition-colors">
                  <td className="py-4 px-6 font-medium text-[color:var(--ledger-paper)]">{role.name}</td>
                  <td className="py-4 px-4 text-center">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C] cursor-pointer" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C] cursor-pointer" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C] cursor-pointer" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C] cursor-pointer" />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-mono font-medium rounded-full bg-[#0B192C] border border-[color:var(--brass)]/20 text-[color:var(--brass)]">{role.permissions}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("roles")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "roles" ? "Saving Preferences..." : "Save Role Settings"}
        </button>
      </div>
    </div>
  );

  const renderApprovalRules = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-[color:var(--brass)]" />
          Approval Rules
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Configure transaction thresholds and approval requirements.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        {approvalRules.map((rule) => (
          <div key={rule.id} className="p-5 rounded-xl bg-[#0B192C]/50 border border-white/5 hover:bg-[#0B192C]/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-[color:var(--ledger-paper)]">{rule.label}</h4>
              <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1 font-mono">{rule.threshold}</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={rule.approver}
                onChange={(e) =>
                  setApprovalRules(
                    approvalRules.map((r) =>
                      r.id === rule.id ? { ...r, approver: e.target.value } : r
                    )
                  )
                }
                className="w-full sm:w-auto bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer shadow-inner"
              >
                <option value="Bank Manager">Bank Manager</option>
                <option value="Branch Manager + Biometric">Branch Manager + Biometric</option>
                <option value="Super Admin Manager">Super Admin Manager</option>
                <option value="Super Admin">Super Admin</option>
                <option value="FOREX">FOREX</option>
              </select>
              <button className="p-2 rounded-lg text-[color:var(--brass)] bg-[#0B192C] border border-[color:var(--brass)]/20 hover:bg-[color:var(--brass)] hover:text-[#0B192C] transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("approval-rules")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "approval-rules" ? "Saving Preferences..." : "Save Approval Rules"}
        </button>
      </div>
    </div>
  );

  const renderBiometric = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Fingerprint className="w-6 h-6 text-[color:var(--brass)]" />
          Biometric Settings
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Configure biometric thresholds and verification parameters.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Fingerprint Threshold (0-1000)</label>
          <input
            type="number"
            value={biometric.fingerprintThreshold}
            onChange={(e) => setBiometric({ ...biometric, fingerprintThreshold: parseInt(e.target.value) || 850 })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Face Threshold (0-1000)</label>
          <input
            type="number"
            value={biometric.faceThreshold}
            onChange={(e) => setBiometric({ ...biometric, faceThreshold: parseInt(e.target.value) || 820 })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Iris Threshold (0-1000)</label>
          <input
            type="number"
            value={biometric.irisThreshold}
            onChange={(e) => setBiometric({ ...biometric, irisThreshold: parseInt(e.target.value) || 800 })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Max Retry Attempts</label>
          <input
            type="number"
            value={biometric.maxRetryAttempts}
            onChange={(e) => setBiometric({ ...biometric, maxRetryAttempts: parseInt(e.target.value) || 3 })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Sensor Timeout (Seconds)</label>
          <input
            type="number"
            value={biometric.sensorTimeout}
            onChange={(e) => setBiometric({ ...biometric, sensorTimeout: parseInt(e.target.value) || 30 })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Camera Quality</label>
          <select
            value={biometric.cameraQuality}
            onChange={(e) => setBiometric({ ...biometric, cameraQuality: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
            <option value="4K">4K</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/5">
        {[
          { key: "enableFingerprint", label: "Enable Fingerprint" },
          { key: "enableFace", label: "Enable Face Recognition" },
          { key: "enableIris", label: "Enable Iris Scan" },
          { key: "livenessDetection", label: "Liveness Detection" },
          { key: "fakeFingerprintDetection", label: "Fake Fingerprint Detection" },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#0B192C]/50 border border-white/5 hover:bg-[#0B192C] transition-colors">
            <input
              type="checkbox"
              checked={biometric[item.key as keyof typeof biometric] as boolean}
              onChange={() => setBiometric({ ...biometric, [item.key]: !biometric[item.key as keyof typeof biometric] })}
              className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C]"
            />
            <span className="text-sm font-medium text-[color:var(--ledger-paper)]">{item.label}</span>
          </label>
        ))}
      </div>
      
      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("biometric")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "biometric" ? "Saving Preferences..." : "Save Biometric Settings"}
        </button>
      </div>
    </div>
  );

  const renderBranchDefaults = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[color:var(--brass)]" />
          Branch Defaults
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Configure default settings for new branches.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Region Codes</label>
          <input
            type="text"
            value={branchDefaults.regionCodes}
            onChange={(e) => setBranchDefaults({ ...branchDefaults, regionCodes: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Default Working Hours</label>
          <input
            type="text"
            value={branchDefaults.defaultWorkingHours}
            onChange={(e) => setBranchDefaults({ ...branchDefaults, defaultWorkingHours: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Default Manager Role</label>
          <select
            value={branchDefaults.defaultManagerRole}
            onChange={(e) => setBranchDefaults({ ...branchDefaults, defaultManagerRole: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
          >
            <option value="BANK_MANAGER">BANK_MANAGER</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Default IT Role</label>
          <select
            value={branchDefaults.defaultITRole}
            onChange={(e) => setBranchDefaults({ ...branchDefaults, defaultITRole: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
          >
            <option value="BRANCH_IT">BRANCH_IT</option>
            <option value="SUPER_ADMIN_IT">SUPER_ADMIN_IT</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Branch Activation</label>
          <select
            value={branchDefaults.branchActivation}
            onChange={(e) => setBranchDefaults({ ...branchDefaults, branchActivation: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
          >
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Branch Deactivation</label>
          <select
            value={branchDefaults.branchDeactivation}
            onChange={(e) => setBranchDefaults({ ...branchDefaults, branchDeactivation: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
          >
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("branch-defaults")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "branch-defaults" ? "Saving Preferences..." : "Save Branch Defaults"}
        </button>
      </div>
    </div>
  );

  const renderUserDefaults = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <UserCog className="w-6 h-6 text-[color:var(--brass)]" />
          User Defaults
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Configure default settings for new users.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Temporary Password Length</label>
          <input
            type="number"
            value={userDefaults.tempPasswordLength}
            onChange={(e) => setUserDefaults({ ...userDefaults, tempPasswordLength: parseInt(e.target.value) || 12 })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Default Expiration (Days)</label>
          <input
            type="number"
            value={userDefaults.defaultExpiration}
            onChange={(e) => setUserDefaults({ ...userDefaults, defaultExpiration: parseInt(e.target.value) || 90 })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Staff ID Format</label>
          <input
            type="text"
            value={userDefaults.staffIdFormat}
            onChange={(e) => setUserDefaults({ ...userDefaults, staffIdFormat: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Default Permissions</label>
          <select
            value={userDefaults.defaultPermissions}
            onChange={(e) => setUserDefaults({ ...userDefaults, defaultPermissions: e.target.value })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
          >
            <option value="View Only">View Only</option>
            <option value="Standard">Standard</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Account Expiration (Days)</label>
          <input
            type="number"
            value={userDefaults.accountExpiration}
            onChange={(e) => setUserDefaults({ ...userDefaults, accountExpiration: parseInt(e.target.value) || 365 })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/5">
        {[
          { key: "autoEmail", label: "Automatic Email on User Creation" },
          { key: "autoSMS", label: "Automatic SMS on User Creation" },
          { key: "forcePasswordChange", label: "Force Password Change on First Login" },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#0B192C]/50 border border-white/5 hover:bg-[#0B192C] transition-colors">
            <input
              type="checkbox"
              checked={userDefaults[item.key as keyof typeof userDefaults] as boolean}
              onChange={() => setUserDefaults({ ...userDefaults, [item.key]: !userDefaults[item.key as keyof typeof userDefaults] })}
              className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C]"
            />
            <span className="text-sm font-medium text-[color:var(--ledger-paper)]">{item.label}</span>
          </label>
        ))}
      </div>
      
      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("user-defaults")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "user-defaults" ? "Saving Preferences..." : "Save User Defaults"}
        </button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Bell className="w-6 h-6 text-[color:var(--brass)]" />
          Notification Settings
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Configure notification channels and event alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
        {[
          { key: "emailEnabled", label: "Email Notifications" },
          { key: "smsEnabled", label: "SMS Notifications" },
          { key: "inAppEnabled", label: "In-App Notifications" },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#0B192C]/50 border border-white/5 hover:bg-[#0B192C] transition-colors">
            <input
              type="checkbox"
              checked={notifications[item.key as keyof typeof notifications] as boolean}
              onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
              className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C]"
            />
            <span className="text-sm font-medium text-[color:var(--ledger-paper)]">{item.label}</span>
          </label>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-[color:var(--ledger-paper)] mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[color:var(--brass)]" />
          Events to Notify
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(notifications.events).map(([key, value]) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#0B192C]/30 border border-white/5 hover:bg-[#0B192C]/80 transition-colors">
              <input
                type="checkbox"
                checked={value}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    events: { ...notifications.events, [key]: !value },
                  })
                }
                className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C]"
              />
              <span className="text-xs font-medium text-[color:var(--ledger-paper)]">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("notifications")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "notifications" ? "Saving Preferences..." : "Save Notification Settings"}
        </button>
      </div>
    </div>
  );

  const renderAudit = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <FileText className="w-6 h-6 text-[color:var(--brass)]" />
          Audit & Logging
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Configure audit log retention and what to log.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Log Retention</label>
          <select
            value={audit.retentionDays}
            onChange={(e) => setAudit({ ...audit, retentionDays: parseInt(e.target.value) })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer shadow-inner"
          >
            <option value={90}>90 days</option>
            <option value={180}>180 days</option>
            <option value={365}>365 days</option>
            <option value={0}>Forever</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-[color:var(--ledger-paper)] mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-[color:var(--brass)]" />
          Events to Log
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(audit)
            .filter(([key]) => key !== "retentionDays")
            .map(([key, value]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#0B192C]/30 border border-white/5 hover:bg-[#0B192C]/80 transition-colors">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={() => setAudit({ ...audit, [key]: !value })}
                  className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C]"
                />
                <span className="text-xs font-medium text-[color:var(--ledger-paper)]">
                  {key
                    .replace(/^log/, "")
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
              </label>
            ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-white/5">
        <button 
          onClick={handleExportLogs}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[color:var(--brass)]/10 text-[color:var(--brass)] text-sm font-semibold transition-colors border border-[color:var(--brass)]/30 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? "Exporting..." : "Export Logs"}
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-white/5 text-slate-300 text-sm font-semibold transition-colors border border-white/10 shadow-sm">
          <Database className="w-4 h-4" />
          Archive Logs
        </button>
      </div>

      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("audit")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "audit" ? "Saving Preferences..." : "Save Audit Settings"}
        </button>
      </div>
    </div>
  );

  const renderBackup = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Database className="w-6 h-6 text-[color:var(--brass)]" />
          Backup & Recovery
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Configure backup frequency, location, and recovery options.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Backup Frequency</label>
          <select
            value={backup.frequency}
            onChange={(e) => setBackup({ ...backup, frequency: e.target.value as "daily" | "weekly" | "monthly" })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer shadow-inner"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Backup Location</label>
          <select
            value={backup.location}
            onChange={(e) => setBackup({ ...backup, location: e.target.value as "cloud" | "local" })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer shadow-inner"
          >
            <option value="cloud">Cloud</option>
            <option value="local">Local</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/5">
        {[
          { key: "autoBackup", label: "Enable Automatic Backup" },
          { key: "encryption", label: "Encrypt Backups" },
          { key: "recoveryTesting", label: "Automated Recovery Testing" },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#0B192C]/50 border border-white/5 hover:bg-[#0B192C] transition-colors">
            <input
              type="checkbox"
              checked={backup[item.key as keyof typeof backup] as boolean}
              onChange={() => setBackup({ ...backup, [item.key]: !backup[item.key as keyof typeof backup] })}
              className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C]"
            />
            <span className="text-sm font-medium text-[color:var(--ledger-paper)]">{item.label}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-white/5">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[color:var(--brass)]/10 text-[color:var(--brass)] text-sm font-semibold transition-colors border border-[color:var(--brass)]/30 shadow-sm">
          <RefreshCw className="w-4 h-4" />
          Backup Now
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-amber-500/10 text-amber-400 text-sm font-semibold transition-colors border border-amber-500/30 shadow-sm">
          <RotateCw className="w-4 h-4" />
          Restore System
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-white/5 text-slate-300 text-sm font-semibold transition-colors border border-white/10 shadow-sm">
          <Download className="w-4 h-4" />
          Download Backup
        </button>
      </div>

      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("backup")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "backup" ? "Saving Preferences..." : "Save Backup Settings"}
        </button>
      </div>
    </div>
  );

  const renderAPI = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Plug className="w-6 h-6 text-[color:var(--brass)]" />
          API & Integration
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Configure API endpoints and integration settings.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Core Banking API</label>
          <input
            type="text"
            value={api.coreBankingAPI}
            onChange={(e) => setApi({ ...api, coreBankingAPI: e.target.value })}
            placeholder="https://api.corebanking.example.com/v1"
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Biometric API</label>
          <input
            type="text"
            value={api.biometricAPI}
            onChange={(e) => setApi({ ...api, biometricAPI: e.target.value })}
            placeholder="https://api.biometric.example.com/v1"
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">SMS Gateway</label>
          <input
            type="text"
            value={api.smsGateway}
            onChange={(e) => setApi({ ...api, smsGateway: e.target.value })}
            placeholder="https://api.sms.example.com/v1"
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Server</label>
          <input
            type="text"
            value={api.emailServer}
            onChange={(e) => setApi({ ...api, emailServer: e.target.value })}
            placeholder="smtp.example.com"
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">OTP Provider</label>
          <input
            type="text"
            value={api.otpProvider}
            onChange={(e) => setApi({ ...api, otpProvider: e.target.value })}
            placeholder="https://api.otp.example.com/v1"
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">FOREX API</label>
          <input
            type="text"
            value={api.forexAPI}
            onChange={(e) => setApi({ ...api, forexAPI: e.target.value })}
            placeholder="https://api.forex.example.com/v1"
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2 col-span-1 md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Government ID Verification API</label>
          <input
            type="text"
            value={api.governmentIDAPI}
            onChange={(e) => setApi({ ...api, governmentIDAPI: e.target.value })}
            placeholder="https://api.gov-id.example.com/v1"
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-[color:var(--brass)] focus:outline-none focus:border-[color:var(--brass)] focus:ring-1 focus:ring-[color:var(--brass)] transition-all shadow-inner"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-white/5">
        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#0B192C]/50 border border-white/5 hover:bg-[#0B192C] transition-colors flex-1">
          <input
            type="checkbox"
            checked={api.healthChecks}
            onChange={() => setApi({ ...api, healthChecks: !api.healthChecks })}
            className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C]"
          />
          <span className="text-sm font-medium text-[color:var(--ledger-paper)]">Enable Automated Health Checks</span>
        </label>
        
        <button className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#0B192C] hover:bg-emerald-500/10 text-emerald-400 text-sm font-semibold transition-colors border border-emerald-500/30 shadow-sm">
          <Activity className="w-4 h-4" />
          Run Health Checks Now
        </button>
      </div>
      
      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("api")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "api" ? "Saving Preferences..." : "Save API Settings"}
        </button>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Wrench className="w-6 h-6 text-[color:var(--brass)]" />
          System Maintenance
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Manage system maintenance and performance tools.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {/* Maintenance Mode */}
        <div className="p-5 rounded-xl bg-[#0B192C]/50 border border-amber-500/30 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Maintenance Mode
              </h3>
              <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-1">Temporarily restrict access for system maintenance.</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={maintenance.maintenanceMode}
                onChange={() => setMaintenance({ ...maintenance, maintenanceMode: !maintenance.maintenanceMode })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-[#1E293B] border border-white/10 rounded-full peer peer-checked:bg-amber-500/20 peer-checked:border-amber-500/50 transition-all">
                <div className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-slate-400 transition-all ${
                  maintenance.maintenanceMode ? "translate-x-7 bg-amber-400" : ""
                }`} />
              </div>
            </label>
          </div>
        </div>

        {/* System Status */}
        <div className="p-6 rounded-xl bg-[#0B192C]/30 border border-white/5">
          <h3 className="text-sm font-semibold text-[color:var(--ledger-paper)] mb-5 flex items-center gap-2">
            <Server className="w-4 h-4 text-[color:var(--brass)]" />
            System Status Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-[#0B192C] border border-[#1E293B] shadow-inner">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Disk Usage</p>
              <p className="text-2xl font-bold text-[color:var(--ledger-paper)] mt-1">68%</p>
              <div className="w-full h-2 bg-[#1E293B] rounded-full mt-3 overflow-hidden shadow-inner">
                <div className="h-full w-[68%] bg-[color:var(--brass)] rounded-full"></div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#0B192C] border border-[#1E293B] shadow-inner">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Memory Usage</p>
              <p className="text-2xl font-bold text-[color:var(--ledger-paper)] mt-1">42%</p>
              <div className="w-full h-2 bg-[#1E293B] rounded-full mt-3 overflow-hidden shadow-inner">
                <div className="h-full w-[42%] bg-[color:var(--brass)] rounded-full"></div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#0B192C] border border-[#1E293B] shadow-inner">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">CPU Usage</p>
              <p className="text-2xl font-bold text-[color:var(--ledger-paper)] mt-1">23%</p>
              <div className="w-full h-2 bg-[#1E293B] rounded-full mt-3 overflow-hidden shadow-inner">
                <div className="h-full w-[23%] bg-emerald-400 rounded-full"></div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#0B192C] border border-[#1E293B] shadow-inner flex flex-col justify-center">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Server Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                <p className="text-2xl font-bold text-emerald-400">Online</p>
              </div>
              <p className="text-xs font-mono text-emerald-400/70 mt-2">Uptime: 14d 6h</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-white/5">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-sky-500/10 text-sky-400 text-sm font-semibold transition-colors border border-sky-500/30 shadow-sm">
            <RefreshCw className="w-4 h-4" />
            Clear Cache
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[color:var(--brass)]/10 text-[color:var(--brass)] text-sm font-semibold transition-colors border border-[color:var(--brass)]/30 shadow-sm">
            <DatabaseZap className="w-4 h-4" />
            Optimize Database
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-rose-500/10 text-rose-400 text-sm font-semibold transition-colors border border-rose-500/30 shadow-sm">
            <RotateCw className="w-4 h-4" />
            Restart System
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("maintenance")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "maintenance" ? "Saving Preferences..." : "Save Maintenance Settings"}
        </button>
      </div>
    </div>
  );

  const renderApprovalMatrix = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Table className="w-6 h-6 text-[color:var(--brass)]" />
          Approval Matrix
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Configure which actions require which approver.
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-[#0B192C]/30 border border-white/5 shadow-inner backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0B192C]/80 border-b border-white/10">
              <tr>
                <th className="py-4 px-6 font-semibold text-slate-300 uppercase tracking-wider text-xs">Action</th>
                <th className="py-4 px-4 font-semibold text-slate-300 uppercase tracking-wider text-xs">Approver</th>
                <th className="py-4 px-6 font-semibold text-slate-300 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {approvalMatrix.map((item) => (
                <tr key={item.id} className="hover:bg-[#0B192C]/60 transition-colors group">
                  <td className="py-4 px-6 font-medium text-[color:var(--ledger-paper)]">{item.action}</td>
                  <td className="py-4 px-4">
                    <select
                      value={item.defaultApprover}
                      onChange={(e) =>
                        setApprovalMatrix(
                          approvalMatrix.map((a) =>
                            a.id === item.id ? { ...a, defaultApprover: e.target.value } : a
                          )
                        )
                      }
                      className="w-full bg-[#0B192C] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer"
                    >
                      {approverOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg text-[color:var(--brass)] bg-[#0B192C] border border-[color:var(--brass)]/20 hover:bg-[color:var(--brass)] hover:text-[#0B192C] transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg text-rose-400 bg-[#0B192C] border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[color:var(--brass)]/10 text-[color:var(--brass)] text-sm font-semibold transition-colors border border-[color:var(--brass)]/30 shadow-sm">
          <Plus className="w-4 h-4" />
          Add New Rule
        </button>
      </div>

      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("approval-matrix")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "approval-matrix" ? "Saving Preferences..." : "Save Approval Matrix"}
        </button>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Palette className="w-6 h-6 text-[color:var(--brass)]" />
          Appearance
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          Customize the look and feel of the application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Theme</label>
          <select
            value={appearance.darkMode ? "dark" : "light"}
            onChange={(e) => setAppearance({ ...appearance, darkMode: e.target.value === "dark" })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer shadow-inner"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={appearance.accentColor}
              onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
              className="w-12 h-12 rounded-xl border border-white/10 cursor-pointer bg-[#0B192C] overflow-hidden"
            />
            <input
              type="text"
              value={appearance.accentColor}
              onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
              className="flex-1 bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-mono text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all shadow-inner uppercase"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Table Density</label>
          <select
            value={appearance.tableDensity}
            onChange={(e) => setAppearance({ ...appearance, tableDensity: e.target.value as "compact" | "normal" | "spacious" })}
            className="w-full bg-[#0B192C] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[color:var(--brass)] transition-all cursor-pointer shadow-inner"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="spacious">Spacious</option>
          </select>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#0B192C]/50 border border-white/5 hover:bg-[#0B192C] transition-colors max-w-md">
          <input
            type="checkbox"
            checked={appearance.compactMode}
            onChange={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
            className="w-4 h-4 rounded border-gray-600 text-[color:var(--brass)] focus:ring-[color:var(--brass)] bg-[#0B192C]"
          />
          <span className="text-sm font-medium text-[color:var(--ledger-paper)]">Enable Compact Mode (reduces spacing)</span>
        </label>
      </div>

      <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
        <button
          onClick={() => handleSaveSection("appearance")}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "appearance" ? "Saving Preferences..." : "Save Appearance Settings"}
        </button>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Info className="w-6 h-6 text-[color:var(--brass)]" />
          About System
        </h2>
        <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-2">
          System information and version details.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Application Version", value: about.applicationVersion },
          { label: "Build Number", value: about.buildNumber },
          { label: "Release Date", value: about.releaseDate },
          { label: "Database Version", value: about.databaseVersion },
          { label: "Server Version", value: about.serverVersion },
          { label: "API Version", value: about.apiVersion },
          { label: "Last Backup", value: about.lastBackup },
          { label: "Last Restart", value: about.lastRestart },
          { label: "License", value: about.license },
          { label: "System Uptime", value: about.uptime, highlight: true },
        ].map((item, index) => (
          <div key={index} className="flex justify-between items-center p-4 rounded-xl bg-[#0B192C]/30 border border-white/5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
            <span className={`font-mono text-sm ${item.highlight ? "text-emerald-400 font-bold" : "text-slate-200"}`}>{item.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm font-medium text-amber-200/80 flex items-center gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0" />
        System information is read-only. Contact support for updates.
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Navigation */}
      <nav className="lg:w-56 flex-shrink-0">
        <div className="glass-panel rounded-2xl border border-slate-800 p-2 sticky top-4 max-h-[calc(100vh-100px)] overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                activeSection === item.id
                  ? "bg-[rgba(198,154,76,0.15)] text-[color:var(--brass)] font-semibold"
                  : "text-[color:var(--ledger-paper-dim)] hover:bg-[rgba(244,239,223,0.06)] hover:text-[color:var(--ledger-paper)]"
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="flex-1">
        <div className="bg-[#0B192C]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8">
          {renderSection()}
          {activeSection !== "about" && activeSection !== "maintenance" && (
            <div className="flex justify-end mt-8 pt-6 border-t border-white/10 hidden">
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:brightness-110 text-[#0B192C] font-bold text-sm transition-all shadow-[0_0_20px_rgba(198,154,76,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving && saveTarget === "all" ? "Saving All Settings..." : "Save All Settings"}
              </button>
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}