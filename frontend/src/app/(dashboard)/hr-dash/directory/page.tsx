"use client";

import React, { useState } from "react";
import { Search, Filter, MoreVertical, Mail, Phone, MapPin, Building2, Calendar, Users } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  status: "Active" | "On Leave" | "Offboarding";
  avatar: string;
}

const mockEmployees: Employee[] = [
  {
    id: "EMP-001",
    name: "Sarah Jenkins",
    role: "System Super Admin",
    department: "Executive",
    email: "s.jenkins@aegisbank.eth",
    phone: "+251 91 123 4567",
    location: "HQ - Addis Ababa",
    joinDate: "Jan 12, 2023",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?u=s.jenkins",
  },
  {
    id: "EMP-042",
    name: "Elena Rostova",
    role: "Super Admin Manager",
    department: "Operations",
    email: "e.rostova@aegisbank.eth",
    phone: "+251 92 345 6789",
    location: "HQ - Addis Ababa",
    joinDate: "Mar 05, 2023",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?u=e.rostova",
  },
  {
    id: "EMP-087",
    name: "Solomon Tesfaye",
    role: "Senior IT Administrator",
    department: "Infrastructure",
    email: "s.tesfaye@aegisbank.eth",
    phone: "+251 93 456 7890",
    location: "Bole Branch",
    joinDate: "Jun 18, 2024",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?u=s.tesfaye",
  },
  {
    id: "EMP-112",
    name: "Tigist Kebede",
    role: "Forex Specialist",
    department: "Currency Exchange",
    email: "t.kebede@aegisbank.eth",
    phone: "+251 94 567 8901",
    location: "Canary Wharf Branch",
    joinDate: "Nov 22, 2024",
    status: "On Leave",
    avatar: "https://i.pravatar.cc/150?u=t.kebede",
  },
  {
    id: "EMP-156",
    name: "David Chen",
    role: "Branch Manager",
    department: "Retail Banking",
    email: "d.chen@aegisbank.eth",
    phone: "+251 95 678 9012",
    location: "Canary Wharf Branch",
    joinDate: "Feb 10, 2025",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?u=d.chen",
  },
  {
    id: "EMP-204",
    name: "Mulugeta Haile",
    role: "Branch IT Support",
    department: "IT Services",
    email: "m.haile@aegisbank.eth",
    phone: "+251 96 789 0123",
    location: "Bole Branch",
    joinDate: "Jul 14, 2025",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?u=m.haile",
  },
  {
    id: "EMP-215",
    name: "Jane Doe",
    role: "Senior Accountant",
    department: "Finance",
    email: "j.doe@aegisbank.eth",
    phone: "+251 97 890 1234",
    location: "Bole Diplomatic Branch",
    joinDate: "Aug 01, 2025",
    status: "Offboarding",
    avatar: "https://i.pravatar.cc/150?u=j.doe",
  }
];

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const filteredEmployees = mockEmployees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === "All" || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "On Leave": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Offboarding": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="rounded-[28px] border border-white/10 bg-[rgba(15,23,40,0.82)] p-6 shadow-[0_20px_60px_rgba(2,8,23,0.36)] backdrop-blur-xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--ledger-paper)]">Employee Directory</h1>
          <p className="mt-2 text-sm text-[color:var(--ledger-paper-dim)]">Manage and view all registered personnel in the organization.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl border border-white/10 bg-white/5 text-sm text-[color:var(--ledger-paper)] placeholder-gray-500 focus:outline-none focus:border-[color:var(--brass)]/50 focus:ring-1 focus:ring-[color:var(--brass)]/50 transition-all"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="pl-9 pr-8 py-2 w-full sm:w-48 appearance-none rounded-xl border border-white/10 bg-white/5 text-sm text-[color:var(--ledger-paper)] focus:outline-none focus:border-[color:var(--brass)]/50 focus:ring-1 focus:ring-[color:var(--brass)]/50 transition-all"
            >
              <option value="All" className="bg-[#0f1728]">All Departments</option>
              <option value="Executive" className="bg-[#0f1728]">Executive</option>
              <option value="Operations" className="bg-[#0f1728]">Operations</option>
              <option value="Infrastructure" className="bg-[#0f1728]">Infrastructure</option>
              <option value="Finance" className="bg-[#0f1728]">Finance</option>
              <option value="Currency Exchange" className="bg-[#0f1728]">Currency Exchange</option>
              <option value="Retail Banking" className="bg-[#0f1728]">Retail Banking</option>
              <option value="IT Services" className="bg-[#0f1728]">IT Services</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => (
          <div key={emp.id} className="group relative rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] p-6 transition-all hover:bg-[rgba(20,28,48,0.8)] hover:border-white/10 hover:shadow-lg">
            <button className="absolute right-4 top-4 p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all">
              <MoreVertical className="h-4 w-4 text-[color:var(--ledger-paper-dim)]" />
            </button>
            
            <div className="flex items-start gap-4 mb-5">
              <div className="relative">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[rgba(244,239,223,0.05)] font-display text-xl font-semibold text-[color:var(--brass)] shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]">
                  {emp.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#0f1728] ${emp.status === 'Active' ? 'bg-green-500' : emp.status === 'On Leave' ? 'bg-amber-500' : 'bg-red-500'}`}></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--ledger-paper)] leading-tight">{emp.name}</h3>
                <p className="text-sm text-[color:var(--brass)] mt-1">{emp.role}</p>
                <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-white/5 border-white/10 text-[color:var(--ledger-paper-dim)]">
                  {emp.department}
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 text-sm text-[color:var(--ledger-paper-dim)]">
                <Mail className="h-4 w-4 text-[color:var(--brass)]/70" />
                <span className="truncate">{emp.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[color:var(--ledger-paper-dim)]">
                <Phone className="h-4 w-4 text-[color:var(--brass)]/70" />
                <span>{emp.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[color:var(--ledger-paper-dim)]">
                <Building2 className="h-4 w-4 text-[color:var(--brass)]/70" />
                <span>{emp.location}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusColor(emp.status)}`}>
                  {emp.status}
                </span>
                <span className="text-xs text-[color:var(--ledger-paper-dim)] flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {emp.joinDate}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredEmployees.length === 0 && (
        <div className="rounded-[24px] border border-white/5 bg-[rgba(15,23,40,0.6)] py-20 text-center">
          <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[color:var(--ledger-paper)]">No employees found</h3>
          <p className="text-sm text-[color:var(--ledger-paper-dim)] mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
