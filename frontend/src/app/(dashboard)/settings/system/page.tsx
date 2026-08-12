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
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">General Settings</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Configure core application settings.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Bank Name</label>
          <input
            type="text"
            value={general.bankName}
            onChange={(e) => setGeneral({ ...general, bankName: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">System Name</label>
          <input
            type="text"
            value={general.systemName}
            onChange={(e) => setGeneral({ ...general, systemName: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Time Zone</label>
          <select
            value={general.timeZone}
            onChange={(e) => setGeneral({ ...general, timeZone: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Dubai">Asia/Dubai</option>
            <option value="Asia/Singapore">Asia/Singapore</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Currency</label>
          <select
            value={general.currency}
            onChange={(e) => setGeneral({ ...general, currency: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="ETB">ETB (Ethiopian Birr)</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Language</label>
          <select
            value={general.language}
            onChange={(e) => setGeneral({ ...general, language: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Amharic">Amharic</option>
            <option value="French">French</option>
            <option value="Arabic">Arabic</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Date Format</label>
          <select
            value={general.dateFormat}
            onChange={(e) => setGeneral({ ...general, dateFormat: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Time Format</label>
          <select
            value={general.timeFormat}
            onChange={(e) => setGeneral({ ...general, timeFormat: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="24h">24-hour</option>
            <option value="12h">12-hour (AM/PM)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Branch Code Format</label>
          <input
            type="text"
            value={general.branchCodeFormat}
            onChange={(e) => setGeneral({ ...general, branchCodeFormat: e.target.value })}
            className="input-field font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Staff ID Format</label>
          <input
            type="text"
            value={general.staffIdFormat}
            onChange={(e) => setGeneral({ ...general, staffIdFormat: e.target.value })}
            className="input-field font-mono"
          />
        </div>
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("general")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "general" ? "Saving..." : "Save General Settings"}
        </button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">Security Settings</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Configure password policies, authentication, and login restrictions.</p>

      {/* Password Policy */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[color:var(--brass)]" />
          Password Policy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Minimum Password Length</label>
            <input
              type="number"
              value={security.minLength}
              onChange={(e) => setSecurity({ ...security, minLength: parseInt(e.target.value) || 8 })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password Expiration (Days)</label>
            <select
              value={security.passwordExpiration}
              onChange={(e) => setSecurity({ ...security, passwordExpiration: parseInt(e.target.value) })}
              className="input-field cursor-pointer"
            >
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={0}>Never expire</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {[
            { key: "requireUppercase", label: "Require Uppercase" },
            { key: "requireLowercase", label: "Require Lowercase" },
            { key: "requireNumbers", label: "Require Numbers" },
            { key: "requireSymbols", label: "Require Symbols" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={security[item.key as keyof typeof security] as boolean}
                onChange={() => setSecurity({ ...security, [item.key]: !security[item.key as keyof typeof security] })}
                className="accent-[color:var(--brass)]"
              />
              <span className="text-xs text-[color:var(--ledger-paper)]">{item.label}</span>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password History (Number to remember)</label>
            <input
              type="number"
              value={security.passwordHistory}
              onChange={(e) => setSecurity({ ...security, passwordHistory: parseInt(e.target.value) || 5 })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Max Failed Login Attempts</label>
            <input
              type="number"
              value={security.maxLoginAttempts}
              onChange={(e) => setSecurity({ ...security, maxLoginAttempts: parseInt(e.target.value) || 5 })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Account Lock Duration (Minutes)</label>
            <input
              type="number"
              value={security.accountLockDuration}
              onChange={(e) => setSecurity({ ...security, accountLockDuration: parseInt(e.target.value) || 30 })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Max Concurrent Sessions</label>
            <input
              type="number"
              value={security.maxConcurrentSessions}
              onChange={(e) => setSecurity({ ...security, maxConcurrentSessions: parseInt(e.target.value) || 3 })}
              className="input-field"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {[
            { key: "forcePasswordChangeOnFirstLogin", label: "Force password change on first login" },
            { key: "enable2FA", label: "Enable Two-Factor Authentication (2FA)" },
            { key: "rememberDevice", label: "Remember trusted devices" },
            { key: "preventReuse", label: "Prevent reuse of previous passwords" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={security[item.key as keyof typeof security] as boolean}
                onChange={() => setSecurity({ ...security, [item.key]: !security[item.key as keyof typeof security] })}
                className="accent-[color:var(--brass)]"
              />
              <span className="text-xs text-[color:var(--ledger-paper)]">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Login Policies */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-[color:var(--ledger-paper)] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[color:var(--brass)]" />
          Login Policies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Session Timeout (Minutes)</label>
            <input
              type="number"
              value={security.sessionTimeout}
              onChange={(e) => setSecurity({ ...security, sessionTimeout: parseInt(e.target.value) || 30 })}
              className="input-field"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {[
            { key: "officeHoursOnly", label: "Restrict login to office hours only" },
            { key: "countryRestrictions", label: "Enable country-based login restrictions" },
            { key: "vpnDetection", label: "Detect and block VPN connections" },
            { key: "unknownDeviceApproval", label: "Require approval for unknown devices" },
            { key: "loginNotifications", label: "Send notifications for new logins" },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={security[item.key as keyof typeof security] as boolean}
                onChange={() => setSecurity({ ...security, [item.key]: !security[item.key as keyof typeof security] })}
                className="accent-[color:var(--brass)]"
              />
              <span className="text-xs text-[color:var(--ledger-paper)]">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("security")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "security" ? "Saving..." : "Save Security Settings"}
        </button>
      </div>
    </div>
  );

  const renderRoles = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">Role Management</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Configure role permissions and access levels.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[color:var(--line)]">
            <tr>
              <th className="py-3 px-4 font-semibold text-[color:var(--ledger-paper-dim)] uppercase tracking-wider">Role</th>
              <th className="py-3 px-4 font-semibold text-[color:var(--ledger-paper-dim)] uppercase tracking-wider text-center">Create</th>
              <th className="py-3 px-4 font-semibold text-[color:var(--ledger-paper-dim)] uppercase tracking-wider text-center">Edit</th>
              <th className="py-3 px-4 font-semibold text-[color:var(--ledger-paper-dim)] uppercase tracking-wider text-center">Delete</th>
              <th className="py-3 px-4 font-semibold text-[color:var(--ledger-paper-dim)] uppercase tracking-wider text-center">View</th>
              <th className="py-3 px-4 font-semibold text-[color:var(--ledger-paper-dim)] uppercase tracking-wider text-right">Permissions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-[color:var(--line)] hover:bg-[rgba(198,154,76,0.04)]">
                <td className="py-3 px-4 font-medium text-[color:var(--ledger-paper)]">{role.name}</td>
                <td className="py-3 px-4 text-center">
                  <input type="checkbox" defaultChecked className="accent-[color:var(--brass)]" />
                </td>
                <td className="py-3 px-4 text-center">
                  <input type="checkbox" defaultChecked className="accent-[color:var(--brass)]" />
                </td>
                <td className="py-3 px-4 text-center">
                  <input type="checkbox" className="accent-[color:var(--brass)]" />
                </td>
                <td className="py-3 px-4 text-center">
                  <input type="checkbox" defaultChecked className="accent-[color:var(--brass)]" />
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="text-[color:var(--brass)] font-mono">{role.permissions}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("roles")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "roles" ? "Saving..." : "Save Role Settings"}
        </button>
      </div>
    </div>
  );

  const renderApprovalRules = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">Approval Rules</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Configure transaction thresholds and approval requirements.</p>
      <div className="mt-6 space-y-4">
        {approvalRules.map((rule) => (
          <div key={rule.id} className="p-4 rounded-xl bg-[#0B192C] border border-[color:var(--line)]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[color:var(--ledger-paper)]">{rule.label}</h4>
                <p className="text-xs text-[color:var(--ledger-paper-dim)]">{rule.threshold}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={rule.approver}
                  onChange={(e) =>
                    setApprovalRules(
                      approvalRules.map((r) =>
                        r.id === rule.id ? { ...r, approver: e.target.value } : r
                      )
                    )
                  }
                  className="bg-[#0B192C] border border-[color:var(--line-strong)] rounded-lg px-3 py-1.5 text-xs text-[color:var(--ledger-paper)] focus:outline-none focus:border-[color:var(--brass)]"
                >
                  <option value="Bank Manager">Bank Manager</option>
                  <option value="Branch Manager + Biometric">Branch Manager + Biometric</option>
                  <option value="Super Admin Manager">Super Admin Manager</option>
                  <option value="Super Admin">Super Admin</option>
                  <option value="FOREX">FOREX</option>
                </select>
                <button className="text-[color:var(--brass)] hover:text-[color:var(--ledger-paper)]">
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("approval-rules")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "approval-rules" ? "Saving..." : "Save Approval Rules"}
        </button>
      </div>
    </div>
  );

  const renderBiometric = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">Biometric Settings</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Configure biometric thresholds and verification parameters.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Fingerprint Threshold (0-1000)</label>
          <input
            type="number"
            value={biometric.fingerprintThreshold}
            onChange={(e) => setBiometric({ ...biometric, fingerprintThreshold: parseInt(e.target.value) || 850 })}
            className="input-field font-mono text-[color:var(--brass)]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Face Threshold (0-1000)</label>
          <input
            type="number"
            value={biometric.faceThreshold}
            onChange={(e) => setBiometric({ ...biometric, faceThreshold: parseInt(e.target.value) || 820 })}
            className="input-field font-mono text-[color:var(--brass)]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Iris Threshold (0-1000)</label>
          <input
            type="number"
            value={biometric.irisThreshold}
            onChange={(e) => setBiometric({ ...biometric, irisThreshold: parseInt(e.target.value) || 800 })}
            className="input-field font-mono text-[color:var(--brass)]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Max Retry Attempts</label>
          <input
            type="number"
            value={biometric.maxRetryAttempts}
            onChange={(e) => setBiometric({ ...biometric, maxRetryAttempts: parseInt(e.target.value) || 3 })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Sensor Timeout (Seconds)</label>
          <input
            type="number"
            value={biometric.sensorTimeout}
            onChange={(e) => setBiometric({ ...biometric, sensorTimeout: parseInt(e.target.value) || 30 })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Camera Quality</label>
          <select
            value={biometric.cameraQuality}
            onChange={(e) => setBiometric({ ...biometric, cameraQuality: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
            <option value="4K">4K</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[
          { key: "enableFingerprint", label: "Enable Fingerprint" },
          { key: "enableFace", label: "Enable Face Recognition" },
          { key: "enableIris", label: "Enable Iris Scan" },
          { key: "livenessDetection", label: "Liveness Detection" },
          { key: "fakeFingerprintDetection", label: "Fake Fingerprint Detection" },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={biometric[item.key as keyof typeof biometric] as boolean}
              onChange={() => setBiometric({ ...biometric, [item.key]: !biometric[item.key as keyof typeof biometric] })}
              className="accent-[color:var(--brass)]"
            />
            <span className="text-xs text-[color:var(--ledger-paper)]">{item.label}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("biometric")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "biometric" ? "Saving..." : "Save Biometric Settings"}
        </button>
      </div>
    </div>
  );

  const renderBranchDefaults = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">Branch Defaults</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Configure default settings for new branches.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Region Codes</label>
          <input
            type="text"
            value={branchDefaults.regionCodes}
            onChange={(e) => setBranchDefaults({ ...branchDefaults, regionCodes: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Default Working Hours</label>
          <input
            type="text"
            value={branchDefaults.defaultWorkingHours}
            onChange={(e) => setBranchDefaults({ ...branchDefaults, defaultWorkingHours: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Default Manager Role</label>
          <select
            value={branchDefaults.defaultManagerRole}
            onChange={(e) => setBranchDefaults({ ...branchDefaults, defaultManagerRole: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="BANK_MANAGER">BANK_MANAGER</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Default IT Role</label>
          <select
            value={branchDefaults.defaultITRole}
            onChange={(e) => setBranchDefaults({ ...branchDefaults, defaultITRole: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="BRANCH_IT">BRANCH_IT</option>
            <option value="SUPER_ADMIN_IT">SUPER_ADMIN_IT</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Branch Activation</label>
          <select
            value={branchDefaults.branchActivation}
            onChange={(e) => setBranchDefaults({ ...branchDefaults, branchActivation: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Branch Deactivation</label>
          <select
            value={branchDefaults.branchDeactivation}
            onChange={(e) => setBranchDefaults({ ...branchDefaults, branchDeactivation: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("branch-defaults")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "branch-defaults" ? "Saving..." : "Save Branch Defaults"}
        </button>
      </div>
    </div>
  );

  const renderUserDefaults = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">User Defaults</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Configure default settings for new users.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Temporary Password Length</label>
          <input
            type="number"
            value={userDefaults.tempPasswordLength}
            onChange={(e) => setUserDefaults({ ...userDefaults, tempPasswordLength: parseInt(e.target.value) || 12 })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Default Expiration (Days)</label>
          <input
            type="number"
            value={userDefaults.defaultExpiration}
            onChange={(e) => setUserDefaults({ ...userDefaults, defaultExpiration: parseInt(e.target.value) || 90 })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Staff ID Format</label>
          <input
            type="text"
            value={userDefaults.staffIdFormat}
            onChange={(e) => setUserDefaults({ ...userDefaults, staffIdFormat: e.target.value })}
            className="input-field font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Default Permissions</label>
          <select
            value={userDefaults.defaultPermissions}
            onChange={(e) => setUserDefaults({ ...userDefaults, defaultPermissions: e.target.value })}
            className="input-field cursor-pointer"
          >
            <option value="View Only">View Only</option>
            <option value="Standard">Standard</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Account Expiration (Days)</label>
          <input
            type="number"
            value={userDefaults.accountExpiration}
            onChange={(e) => setUserDefaults({ ...userDefaults, accountExpiration: parseInt(e.target.value) || 365 })}
            className="input-field"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mt-4">
        {[
          { key: "autoEmail", label: "Automatic Email on User Creation" },
          { key: "autoSMS", label: "Automatic SMS on User Creation" },
          { key: "forcePasswordChange", label: "Force Password Change on First Login" },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={userDefaults[item.key as keyof typeof userDefaults] as boolean}
              onChange={() => setUserDefaults({ ...userDefaults, [item.key]: !userDefaults[item.key as keyof typeof userDefaults] })}
              className="accent-[color:var(--brass)]"
            />
            <span className="text-xs text-[color:var(--ledger-paper)]">{item.label}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("user-defaults")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "user-defaults" ? "Saving..." : "Save User Defaults"}
        </button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">Notification Settings</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Configure notification channels and event alerts.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        {[
          { key: "emailEnabled", label: "Email Notifications" },
          { key: "smsEnabled", label: "SMS Notifications" },
          { key: "inAppEnabled", label: "In-App Notifications" },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={notifications[item.key as keyof typeof notifications] as boolean}
              onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
              className="accent-[color:var(--brass)]"
            />
            <span className="text-xs text-[color:var(--ledger-paper)]">{item.label}</span>
          </label>
        ))}
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-[color:var(--ledger-paper)] mb-3">Events to Notify</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(notifications.events).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    events: { ...notifications.events, [key]: !value },
                  })
                }
                className="accent-[color:var(--brass)]"
              />
              <span className="text-xs text-[color:var(--ledger-paper)]">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("notifications")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "notifications" ? "Saving..." : "Save Notification Settings"}
        </button>
      </div>
    </div>
  );

  const renderAudit = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">Audit & Logging</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Configure audit log retention and what to log.</p>
      <div className="mt-6">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Log Retention</label>
        <select
          value={audit.retentionDays}
          onChange={(e) => setAudit({ ...audit, retentionDays: parseInt(e.target.value) })}
          className="input-field cursor-pointer max-w-xs"
        >
          <option value={90}>90 days</option>
          <option value={180}>180 days</option>
          <option value={365}>365 days</option>
          <option value={0}>Forever</option>
        </select>
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-[color:var(--ledger-paper)] mb-3">Events to Log</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(audit)
            .filter(([key]) => key !== "retentionDays")
            .map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={() => setAudit({ ...audit, [key]: !value })}
                  className="accent-[color:var(--brass)]"
                />
                <span className="text-xs text-[color:var(--ledger-paper)]">
                  {key
                    .replace(/^log/, "")
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </span>
              </label>
            ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-6">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] text-xs font-semibold transition-colors border border-[color:var(--brass)]/30">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700">
          <Database className="w-4 h-4" />
          Archive Logs
        </button>
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("audit")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "audit" ? "Saving..." : "Save Audit Settings"}
        </button>
      </div>
    </div>
  );

  const renderBackup = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">Backup & Recovery</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Configure backup frequency, location, and recovery options.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Backup Frequency</label>
          <select
            value={backup.frequency}
            onChange={(e) => setBackup({ ...backup, frequency: e.target.value as "daily" | "weekly" | "monthly" })}
            className="input-field cursor-pointer"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Backup Location</label>
          <select
            value={backup.location}
            onChange={(e) => setBackup({ ...backup, location: e.target.value as "cloud" | "local" })}
            className="input-field cursor-pointer"
          >
            <option value="cloud">Cloud</option>
            <option value="local">Local</option>
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mt-4">
        {[
          { key: "autoBackup", label: "Enable Automatic Backup" },
          { key: "encryption", label: "Encrypt Backups" },
          { key: "recoveryTesting", label: "Automated Recovery Testing" },
        ].map((item) => (
          <label key={item.key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={backup[item.key as keyof typeof backup] as boolean}
              onChange={() => setBackup({ ...backup, [item.key]: !backup[item.key as keyof typeof backup] })}
              className="accent-[color:var(--brass)]"
            />
            <span className="text-xs text-[color:var(--ledger-paper)]">{item.label}</span>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-6">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] text-xs font-semibold transition-colors border border-[color:var(--brass)]/30">
          <RefreshCw className="w-4 h-4" />
          Backup Now
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-colors border border-amber-500/30">
          <RotateCw className="w-4 h-4" />
          Restore System
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700">
          <Download className="w-4 h-4" />
          Download Backup
        </button>
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("backup")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "backup" ? "Saving..." : "Save Backup Settings"}
        </button>
      </div>
    </div>
  );

  const renderAPI = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">API & Integration</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Configure API endpoints and integration settings.</p>
      <div className="mt-6 grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Core Banking API</label>
          <input
            type="text"
            value={api.coreBankingAPI}
            onChange={(e) => setApi({ ...api, coreBankingAPI: e.target.value })}
            placeholder="https://api.corebanking.example.com/v1"
            className="input-field font-mono text-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Biometric API</label>
          <input
            type="text"
            value={api.biometricAPI}
            onChange={(e) => setApi({ ...api, biometricAPI: e.target.value })}
            placeholder="https://api.biometric.example.com/v1"
            className="input-field font-mono text-xs"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">SMS Gateway</label>
            <input
              type="text"
              value={api.smsGateway}
              onChange={(e) => setApi({ ...api, smsGateway: e.target.value })}
              placeholder="https://api.sms.example.com/v1"
              className="input-field font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Server</label>
            <input
              type="text"
              value={api.emailServer}
              onChange={(e) => setApi({ ...api, emailServer: e.target.value })}
              placeholder="smtp.example.com"
              className="input-field font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">OTP Provider</label>
            <input
              type="text"
              value={api.otpProvider}
              onChange={(e) => setApi({ ...api, otpProvider: e.target.value })}
              placeholder="https://api.otp.example.com/v1"
              className="input-field font-mono text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">FOREX API</label>
            <input
              type="text"
              value={api.forexAPI}
              onChange={(e) => setApi({ ...api, forexAPI: e.target.value })}
              placeholder="https://api.forex.example.com/v1"
              className="input-field font-mono text-xs"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Government ID Verification API</label>
          <input
            type="text"
            value={api.governmentIDAPI}
            onChange={(e) => setApi({ ...api, governmentIDAPI: e.target.value })}
            placeholder="https://api.gov-id.example.com/v1"
            className="input-field font-mono text-xs"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={api.healthChecks}
            onChange={() => setApi({ ...api, healthChecks: !api.healthChecks })}
            className="accent-[color:var(--brass)]"
          />
          <span className="text-xs text-[color:var(--ledger-paper)]">Enable Health Checks</span>
        </label>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] text-xs font-semibold transition-colors border border-[color:var(--brass)]/30">
          <Activity className="w-4 h-4" />
          Run Health Checks
        </button>
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("api")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "api" ? "Saving..." : "Save API Settings"}
        </button>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">System Maintenance</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Manage system maintenance and performance tools.</p>

      <div className="mt-6 space-y-6">
        {/* Maintenance Mode */}
        <div className="p-4 rounded-xl bg-[#0B192C] border border-[color:var(--line)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[color:var(--ledger-paper)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Maintenance Mode
              </h3>
              <p className="text-xs text-[color:var(--ledger-paper-dim)]">Temporarily restrict access for system maintenance.</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input
                type="checkbox"
                checked={maintenance.maintenanceMode}
                onChange={() => setMaintenance({ ...maintenance, maintenanceMode: !maintenance.maintenanceMode })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[color:var(--vault-charcoal-2)] border border-[color:var(--line-strong)] rounded-full peer peer-checked:bg-[rgba(198,154,76,0.25)] peer-checked:border-[color:var(--brass)] transition-all">
                <div className={`w-4 h-4 rounded-full bg-[color:var(--ledger-paper-dim)] transition-all ${
                  maintenance.maintenanceMode ? "translate-x-6 bg-[color:var(--brass)]" : "translate-x-1"
                }`} />
              </div>
            </label>
          </div>
        </div>

        {/* System Status */}
        <div>
          <h3 className="text-sm font-semibold text-[color:var(--ledger-paper)] mb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-[color:var(--brass)]" />
            System Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-[#0B192C] border border-[color:var(--line)]">
              <p className="text-[10px] text-[color:var(--ledger-paper-dim)] uppercase tracking-wider">Disk Usage</p>
              <p className="text-lg font-bold text-[color:var(--ledger-paper)]">68%</p>
              <div className="w-full h-1.5 bg-[color:var(--line-strong)] rounded-full mt-1 overflow-hidden">
                <div className="h-full w-[68%] bg-[color:var(--brass)] rounded-full"></div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#0B192C] border border-[color:var(--line)]">
              <p className="text-[10px] text-[color:var(--ledger-paper-dim)] uppercase tracking-wider">Memory Usage</p>
              <p className="text-lg font-bold text-[color:var(--ledger-paper)]">42%</p>
              <div className="w-full h-1.5 bg-[color:var(--line-strong)] rounded-full mt-1 overflow-hidden">
                <div className="h-full w-[42%] bg-[color:var(--brass)] rounded-full"></div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#0B192C] border border-[color:var(--line)]">
              <p className="text-[10px] text-[color:var(--ledger-paper-dim)] uppercase tracking-wider">CPU Usage</p>
              <p className="text-lg font-bold text-[color:var(--ledger-paper)]">23%</p>
              <div className="w-full h-1.5 bg-[color:var(--line-strong)] rounded-full mt-1 overflow-hidden">
                <div className="h-full w-[23%] bg-[color:var(--moss)] rounded-full"></div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#0B192C] border border-[color:var(--line)]">
              <p className="text-[10px] text-[color:var(--ledger-paper-dim)] uppercase tracking-wider">Server Status</p>
              <p className="text-lg font-bold text-[color:var(--moss)]">Online</p>
              <p className="text-[10px] text-[color:var(--ledger-paper-dim)]">Uptime: 14d 6h</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-colors border border-amber-500/30">
            <RefreshCw className="w-4 h-4" />
            Clear Cache
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] text-xs font-semibold transition-colors border border-[color:var(--brass)]/30">
            <DatabaseZap className="w-4 h-4" />
            Optimize Database
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors border border-rose-500/30">
            <RotateCw className="w-4 h-4" />
            Restart System
          </button>
        </div>
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("maintenance")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "maintenance" ? "Saving..." : "Save Maintenance Settings"}
        </button>
      </div>
    </div>
  );

  const renderApprovalMatrix = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">Approval Matrix</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Configure which actions require which approver.</p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[color:var(--line)]">
            <tr>
              <th className="py-3 px-4 font-semibold text-[color:var(--ledger-paper-dim)] uppercase tracking-wider">Action</th>
              <th className="py-3 px-4 font-semibold text-[color:var(--ledger-paper-dim)] uppercase tracking-wider">Approver</th>
              <th className="py-3 px-4 font-semibold text-[color:var(--ledger-paper-dim)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {approvalMatrix.map((item) => (
              <tr key={item.id} className="border-b border-[color:var(--line)] hover:bg-[rgba(198,154,76,0.04)]">
                <td className="py-3 px-4 font-medium text-[color:var(--ledger-paper)]">{item.action}</td>
                <td className="py-3 px-4">
                  <select
                    value={item.defaultApprover}
                    onChange={(e) =>
                      setApprovalMatrix(
                        approvalMatrix.map((a) =>
                          a.id === item.id ? { ...a, defaultApprover: e.target.value } : a
                        )
                      )
                    }
                    className="bg-[#0B192C] border border-[color:var(--line-strong)] rounded-lg px-3 py-1.5 text-xs text-[color:var(--ledger-paper)] focus:outline-none focus:border-[color:var(--brass)]"
                  >
                    {approverOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-[color:var(--brass)] hover:text-[color:var(--ledger-paper)] mr-2">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[color:var(--brass)]/10 hover:bg-[color:var(--brass)]/20 text-[color:var(--brass)] text-xs font-semibold transition-colors border border-[color:var(--brass)]/30">
        <Plus className="w-4 h-4" />
        Add New Rule
      </button>
      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("approval-matrix")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "approval-matrix" ? "Saving..." : "Save Approval Matrix"}
        </button>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">Appearance</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">Customize the look and feel of the application.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Theme</label>
          <select
            value={appearance.darkMode ? "dark" : "light"}
            onChange={(e) => setAppearance({ ...appearance, darkMode: e.target.value === "dark" })}
            className="input-field cursor-pointer"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={appearance.accentColor}
              onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
              className="w-10 h-10 rounded border border-[color:var(--line-strong)] cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={appearance.accentColor}
              onChange={(e) => setAppearance({ ...appearance, accentColor: e.target.value })}
              className="input-field flex-1 font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Table Density</label>
          <select
            value={appearance.tableDensity}
            onChange={(e) => setAppearance({ ...appearance, tableDensity: e.target.value as "compact" | "normal" | "spacious" })}
            className="input-field cursor-pointer"
          >
            <option value="compact">Compact</option>
            <option value="normal">Normal</option>
            <option value="spacious">Spacious</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Compact Mode</label>
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={appearance.compactMode}
              onChange={() => setAppearance({ ...appearance, compactMode: !appearance.compactMode })}
              className="accent-[color:var(--brass)]"
            />
            <span className="text-xs text-[color:var(--ledger-paper)]">Enable compact mode (reduces spacing)</span>
          </label>
        </div>
      </div>
      <div className="flex justify-end mt-6 pt-4 border-t border-[color:var(--line)]">
        <button
          onClick={() => handleSaveSection("appearance")}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isSaving && saveTarget === "appearance" ? "Saving..." : "Save Appearance Settings"}
        </button>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div>
      <h2 className="text-lg font-display font-medium text-[color:var(--ledger-paper)]">About System</h2>
      <p className="text-xs text-[color:var(--ledger-paper-dim)] mt-1">System information and version details.</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-xl bg-[#0B192C] border border-[color:var(--line)]">
        <div className="flex justify-between py-2 border-b border-[color:var(--line)]">
          <span className="text-[color:var(--ledger-paper-dim)]">Application Version</span>
          <span className="font-mono text-[color:var(--ledger-paper)]">{about.applicationVersion}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-[color:var(--line)]">
          <span className="text-[color:var(--ledger-paper-dim)]">Build Number</span>
          <span className="font-mono text-[color:var(--ledger-paper)]">{about.buildNumber}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-[color:var(--line)]">
          <span className="text-[color:var(--ledger-paper-dim)]">Release Date</span>
          <span className="font-mono text-[color:var(--ledger-paper)]">{about.releaseDate}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-[color:var(--line)]">
          <span className="text-[color:var(--ledger-paper-dim)]">Database Version</span>
          <span className="font-mono text-[color:var(--ledger-paper)]">{about.databaseVersion}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-[color:var(--line)]">
          <span className="text-[color:var(--ledger-paper-dim)]">Server Version</span>
          <span className="font-mono text-[color:var(--ledger-paper)]">{about.serverVersion}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-[color:var(--line)]">
          <span className="text-[color:var(--ledger-paper-dim)]">API Version</span>
          <span className="font-mono text-[color:var(--ledger-paper)]">{about.apiVersion}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-[color:var(--line)]">
          <span className="text-[color:var(--ledger-paper-dim)]">Last Backup</span>
          <span className="font-mono text-[color:var(--ledger-paper)]">{about.lastBackup}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-[color:var(--line)]">
          <span className="text-[color:var(--ledger-paper-dim)]">Last Restart</span>
          <span className="font-mono text-[color:var(--ledger-paper)]">{about.lastRestart}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-[color:var(--line)]">
          <span className="text-[color:var(--ledger-paper-dim)]">License</span>
          <span className="font-mono text-[color:var(--ledger-paper)]">{about.license}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-[color:var(--ledger-paper-dim)]">System Uptime</span>
          <span className="font-mono text-[color:var(--moss)]">{about.uptime}</span>
        </div>
      </div>
      <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-[color:var(--ledger-paper-dim)] flex items-center gap-2">
        <Info className="w-4 h-4 text-amber-400" />
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

      {/* Content */}
      <div className="flex-1">
        <div className="glass-panel rounded-2xl border border-slate-800 p-6 md:p-8">
          {renderSection()}

          {/* Global Save Button (only for sections with save) */}
          {activeSection !== "about" && activeSection !== "maintenance" && (
            <div className="flex justify-end mt-8 pt-4 border-t border-[color:var(--line)]">
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[color:var(--brass)] hover:bg-[#d7ab5c] text-[color:var(--ink-navy)] font-bold text-sm transition-all shadow-lg shadow-[color:var(--brass)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isSaving && saveTarget === "all" ? "Saving All..." : "Save All Settings"}
              </button>
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}