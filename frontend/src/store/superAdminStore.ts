import { create } from "zustand";
import { Branch, BankManager } from "@/types";

// Extended types for IT and FOREX users
export interface ITUser {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  lastLogin?: string;
  createdAt: string;
}

export interface FOREXUser {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  certificationLevel: string;
  createdAt: string;
}

export interface HRUser {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}

interface SuperAdminState {
  // Branches
  branches: Branch[];
  addBranch: (branch: Omit<Branch, "id" | "createdAt">) => void;
  updateBranch: (id: string, branch: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  getBranchById: (id: string) => Branch | undefined;

  // IT Users
  itUsers: ITUser[];
  addITUser: (user: Omit<ITUser, "id" | "createdAt">) => void;
  updateITUser: (id: string, user: Partial<ITUser>) => void;
  deleteITUser: (id: string) => void;
  getITUserById: (id: string) => ITUser | undefined;
  resetITUserPassword: (id: string) => void;

  // Managers
  managers: BankManager[];
  addManager: (manager: Omit<BankManager, "id">) => void;
  updateManager: (id: string, manager: Partial<BankManager>) => void;
  deleteManager: (id: string) => void;
  getManagerById: (id: string) => BankManager | undefined;

  // FOREX Users
  forexUsers: FOREXUser[];
  addFOREXUser: (user: Omit<FOREXUser, "id" | "createdAt">) => void;
  updateFOREXUser: (id: string, user: Partial<FOREXUser>) => void;
  deleteFOREXUser: (id: string) => void;
  getFOREXUserById: (id: string) => FOREXUser | undefined;

  // HR Users
  hrUsers: HRUser[];
  addHRUser: (user: Omit<HRUser, "id" | "createdAt">) => void;
  updateHRUser: (id: string, user: Partial<HRUser>) => void;
  deleteHRUser: (id: string) => void;
  getHRUserById: (id: string) => HRUser | undefined;

  // Generic User Creation
  createUser: (data: {
    username: string;
    fullName: string;
    email: string;
    role: string;
    branchId?: string;
    passcode: string;
    department?: string;
  }) => Promise<{success: boolean, message?: string}>;

  // Real backend integration
  createBranch: (data: any) => Promise<{success: boolean, message?: string}>;
}

// Mock data
const initialBranches: Branch[] = [
  {
    id: "br-1",
    code: "BR-001",
    name: "Main HQ Branch",
    city: "Addis Ababa",
    address: "Churchill Avenue, HQ Building",
    phone: "+251-11-123-4567",
    email: "mainhq@aegisbank.eth",
    status: "ACTIVE",
    managerName: "Dawit Wolde",
    tellerCount: 14,
    dailyTransactionLimit: 5000000,
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "br-2",
    code: "BR-002",
    name: "Bole Diplomatic Branch",
    city: "Addis Ababa",
    address: "Bole Road, Medhanialem",
    phone: "+251-11-234-5678",
    email: "bole@aegisbank.eth",
    status: "ACTIVE",
    managerName: "Frehiwot Tadesse",
    tellerCount: 8,
    dailyTransactionLimit: 3500000,
    createdAt: "2024-02-20T08:00:00Z",
  },
  {
    id: "br-3",
    code: "BR-003",
    name: "Kazanchis Financial Hub",
    city: "Addis Ababa",
    address: "UN Avenue",
    phone: "+251-11-345-6789",
    email: "kazanchis@aegisbank.eth",
    status: "ACTIVE",
    managerName: "Yonas Alemu",
    tellerCount: 12,
    dailyTransactionLimit: 4000000,
    createdAt: "2024-03-10T08:00:00Z",
  },
  {
    id: "br-4",
    code: "BR-004",
    name: "Hawassa Regional Office",
    city: "Hawassa",
    address: "Lakefront Boulevard",
    phone: "+251-46-220-1234",
    email: "hawassa@aegisbank.eth",
    status: "ACTIVE",
    managerName: "Meron Bekele",
    tellerCount: 6,
    dailyTransactionLimit: 2000000,
    createdAt: "2024-04-05T08:00:00Z",
  },
];

const initialITUsers: ITUser[] = [
  {
    id: "it-1",
    employeeId: "IT-001",
    fullName: "Solomon Tesfaye",
    email: "s.tesfaye@aegisbank.eth",
    phone: "+251-911-123-456",
    department: "Infrastructure & Security",
    status: "ACTIVE",
    lastLogin: "2024-07-22T09:15:00Z",
    createdAt: "2024-01-10T08:00:00Z",
  },
  {
    id: "it-2",
    employeeId: "IT-002",
    fullName: "Bethlehem Amare",
    email: "b.amare@aegisbank.eth",
    phone: "+251-911-234-567",
    department: "Database Administration",
    status: "ACTIVE",
    lastLogin: "2024-07-21T16:30:00Z",
    createdAt: "2024-02-15T08:00:00Z",
  },
  {
    id: "it-3",
    employeeId: "IT-003",
    fullName: "Mulugeta Haile",
    email: "m.haile@aegisbank.eth",
    phone: "+251-911-345-678",
    department: "Biometric Systems",
    status: "ACTIVE",
    lastLogin: "2024-07-22T08:45:00Z",
    createdAt: "2024-03-20T08:00:00Z",
  },
];

const initialManagers: BankManager[] = [
  {
    id: "mgr-1",
    employeeId: "MGR-101",
    fullName: "Dawit Wolde",
    email: "d.wolde@aegisbank.eth",
    phone: "+251-911-456-789",
    branchId: "br-1",
    branchName: "Main HQ Branch",
    status: "ACTIVE",
    assignedDate: "2024-01-15",
  },
  {
    id: "mgr-2",
    employeeId: "MGR-102",
    fullName: "Frehiwot Tadesse",
    email: "f.tadesse@aegisbank.eth",
    phone: "+251-911-567-890",
    branchId: "br-2",
    branchName: "Bole Diplomatic Branch",
    status: "ACTIVE",
    assignedDate: "2024-03-10",
  },
  {
    id: "mgr-3",
    employeeId: "MGR-103",
    fullName: "Yonas Alemu",
    email: "y.alemu@aegisbank.eth",
    phone: "+251-911-678-901",
    branchId: "br-3",
    branchName: "Kazanchis Financial Hub",
    status: "ACTIVE",
    assignedDate: "2024-05-22",
  },
];

const initialFOREXUsers: FOREXUser[] = [
  {
    id: "fx-1",
    employeeId: "FX-001",
    fullName: "Tigist Kebede",
    email: "t.kebede@aegisbank.eth",
    phone: "+251-911-789-012",
    specialization: "Currency Exchange",
    status: "ACTIVE",
    certificationLevel: "Senior Dealer",
    createdAt: "2024-01-20T08:00:00Z",
  },
  {
    id: "fx-2",
    employeeId: "FX-002",
    fullName: "Meseret Yilma",
    email: "m.yilma@aegisbank.eth",
    phone: "+251-911-890-123",
    specialization: "Treasury Operations",
    status: "ACTIVE",
    certificationLevel: "Certified Dealer",
    createdAt: "2024-02-25T08:00:00Z",
  },
  {
    id: "fx-3",
    employeeId: "FX-003",
    fullName: "Abebe Girma",
    email: "a.girma@aegisbank.eth",
    phone: "+251-911-901-234",
    specialization: "International Settlements",
    status: "ACTIVE",
    certificationLevel: "Principal Dealer",
    createdAt: "2024-03-15T08:00:00Z",
  },
];

const initialHRUsers: HRUser[] = [
  {
    id: "hr-1",
    employeeId: "HR-001",
    fullName: "Abeba Tafesse",
    email: "a.tafesse@aegisbank.eth",
    phone: "+251-911-111-222",
    department: "Talent Acquisition",
    status: "ACTIVE",
    createdAt: "2023-11-05T08:00:00Z",
  },
  {
    id: "hr-2",
    employeeId: "HR-002",
    fullName: "Solomon Getachew",
    email: "s.getachew@aegisbank.eth",
    phone: "+251-911-333-444",
    department: "Employee Relations",
    status: "ACTIVE",
    createdAt: "2024-01-12T08:00:00Z",
  }
];

export const useSuperAdminStore = create<SuperAdminState>((set, get) => ({
  // Branches State
  branches: initialBranches,

  addBranch: (branch) => {
    const newBranch: Branch = {
      ...branch,
      id: `br-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ branches: [...state.branches, newBranch] }));
  },

  updateBranch: (id, updatedFields) => {
    set((state) => ({
      branches: state.branches.map((branch) =>
        branch.id === id ? { ...branch, ...updatedFields } : branch
      ),
    }));
  },

  deleteBranch: (id) => {
    set((state) => ({
      branches: state.branches.filter((branch) => branch.id !== id),
    }));
  },

  getBranchById: (id) => {
    return get().branches.find((branch) => branch.id === id);
  },

  // IT Users State
  itUsers: initialITUsers,

  addITUser: (user) => {
    const newUser: ITUser = {
      ...user,
      id: `it-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ itUsers: [...state.itUsers, newUser] }));
  },

  updateITUser: (id, updatedFields) => {
    set((state) => ({
      itUsers: state.itUsers.map((user) =>
        user.id === id ? { ...user, ...updatedFields } : user
      ),
    }));
  },

  deleteITUser: (id) => {
    set((state) => ({
      itUsers: state.itUsers.filter((user) => user.id !== id),
    }));
  },

  getITUserById: (id) => {
    return get().itUsers.find((user) => user.id === id);
  },

  resetITUserPassword: (id) => {
    // In production, this would call an API
    console.log(`Password reset initiated for IT user: ${id}`);
    // Update last login or add a flag
    set((state) => ({
      itUsers: state.itUsers.map((user) =>
        user.id === id ? { ...user, lastLogin: new Date().toISOString() } : user
      ),
    }));
  },

  // Managers State
  managers: initialManagers,

  addManager: (manager) => {
    const newManager: BankManager = {
      ...manager,
      id: `mgr-${Date.now()}`,
    };
    set((state) => ({ managers: [...state.managers, newManager] }));
  },

  updateManager: (id, updatedFields) => {
    set((state) => ({
      managers: state.managers.map((manager) =>
        manager.id === id ? { ...manager, ...updatedFields } : manager
      ),
    }));
  },

  deleteManager: (id) => {
    set((state) => ({
      managers: state.managers.filter((manager) => manager.id !== id),
    }));
  },

  getManagerById: (id) => {
    return get().managers.find((manager) => manager.id === id);
  },

  // FOREX Users State
  forexUsers: initialFOREXUsers,

  addFOREXUser: (user) => {
    const newUser: FOREXUser = {
      ...user,
      id: `fx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ forexUsers: [...state.forexUsers, newUser] }));
  },

  updateFOREXUser: (id, updatedFields) => {
    set((state) => ({
      forexUsers: state.forexUsers.map((user) =>
        user.id === id ? { ...user, ...updatedFields } : user
      ),
    }));
  },

  deleteFOREXUser: (id) => {
    set((state) => ({
      forexUsers: state.forexUsers.filter((user) => user.id !== id),
    }));
  },

  getFOREXUserById: (id) => get().forexUsers.find((user) => user.id === id),

  // HR Users State
  hrUsers: initialHRUsers,

  addHRUser: (user) => {
    const newUser: HRUser = {
      ...user,
      id: `hr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ hrUsers: [...state.hrUsers, newUser] }));
  },

  updateHRUser: (id, updatedFields) => {
    set((state) => ({
      hrUsers: state.hrUsers.map((user) =>
        user.id === id ? { ...user, ...updatedFields } : user
      ),
    }));
  },

  deleteHRUser: (id) => {
    set((state) => ({
      hrUsers: state.hrUsers.filter((user) => user.id !== id),
    }));
  },

  getHRUserById: (id) => get().hrUsers.find((user) => user.id === id),

  createUser: async (data) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("aegis_auth_token="))
        ?.split("=")[1];

      const res = await fetch("http://localhost:5000/api/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || "Failed to create user" };
    }
  },

  createBranch: async (data) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("aegis_auth_token="))
        ?.split("=")[1];

      const res = await fetch("http://localhost:5000/api/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      
      // Update local state so it appears immediately if we use it
      set((state) => ({ branches: [...state.branches, result.data] }));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || "Failed to create branch" };
    }
  },
}));
