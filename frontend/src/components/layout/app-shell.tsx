"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  Receipt,
  Printer,
  BarChart3,
  Users,
  Search,
  Bell,
  LogOut,
  CreditCard,
  Menu,
  X,
  UserCheck,
  CheckCheck,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  href: string;
  label: string;
  labelLao: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", labelLao: "ໜ້າຫຼັກ (Dashboard)", icon: LayoutDashboard },
  { href: "/thesis", label: "Thesis Management", labelLao: "ຄຸ້ມຄອງບົດໂຄງການ", icon: BookOpen },
  { href: "/examination", label: "Examination Hub", labelLao: "ສູນການສອບເສັງ", icon: CalendarCheck },
  { href: "/progress", label: "Progress Tracking", labelLao: "ຕິດຕາມຄວາມຄືບໜ້າ", icon: TrendingUp },
  { href: "/finance", label: "Financial Records", labelLao: "ບັນທຶກການເງິນ", icon: Receipt },
  { href: "/disbursement", label: "Disbursement", labelLao: "ເບີກຈ່າຍຄ່າຕອບແທນ", icon: CreditCard },
  { href: "/printing", label: "Printing Orders", labelLao: "ຄຳສັ່ງພິມບົດ", icon: Printer },
  { href: "/reports", label: "Reports & Analytics", labelLao: "ລາຍງານ ແລະ ສະຖິຕິ", icon: BarChart3 },
  { href: "/users", label: "User Administration", labelLao: "ຄຸ້ມຄອງຜູ້ໃຊ້ງານ", icon: Users },
];

const roleLabelsLao: Record<string, string> = {
  STAFF: "ພະນັກງານວິຊາການ (Staff)",
  HEAD: "ຫົວໜ້າພາກວິຊາ (Head of Dept)",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "NOTIF-001",
      title: "ປະກາດຕາຕະລາງສອບປ້ອງກັນຫົວບົດ ຊຸດທີ 1",
      message: "ຕາຕະລາງສອບປ້ອງກັນຫົວບົດວິທະຍານິພົນ ຊຸດທີ 1 (Proposal Defense Round 1) ໄດ້ຖືກອະນຸມັດ ແລະ ປະກາດແລ້ວ.",
      type: "EXAM",
      link: "/examination",
      is_read: false,
      created_at: "2026-10-02 09:30",
    },
    {
      id: "NOTIF-002",
      title: "ກວດສອບສະລິບໂອນເງິນສຳເລັດ",
      message: "ສະລິບໂອນເງິນຄ່າທຳນຽມສອບປ້ອງກັນກຸ່ມ CS-2026-001 ໄດ້ຮັບການຢືນຢັນ ແລະ ອອກໃບຮັບເງິນແລ້ວ.",
      type: "FINANCE",
      link: "/finance",
      is_read: false,
      created_at: "2026-10-02 10:15",
    },
    {
      id: "NOTIF-003",
      title: "ບັນທຶກຄະແນນສອບປ້ອງກັນບົດຈົບຊັ້ນ",
      message: "ຄະນະກຳມະການໄດ້ບັນທຶກຄະແນນສອບເສັງຮອບທີ 1 ຂອງ 12 ກຸ່ມສຳເລັດແລ້ວ ພ້ອມອອກໃບຄະແນນທາງການ.",
      type: "SCORE",
      link: "/examination",
      is_read: false,
      created_at: "2026-10-05 14:00",
    },
    {
      id: "NOTIF-004",
      title: "ຄຳສັ່ງພິມບົດໂຄງການສຳເລັດແລ້ວ",
      message: "ງານພິມບົດໂຄງການເລກທີ #PRT-2026-003 ເຂົ້າເຫຼັ້ມປົກແຂງສີແດງຄຳ ພິມສຳເລັດແລ້ວ ພ້ອມສົ່ງມອບ.",
      type: "PRINT",
      link: "/printing",
      is_read: true,
      created_at: "2026-10-08 11:45",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  // Available roles: 2 roles with equal capabilities
  const availableRoles = ["STAFF", "HEAD"];
  
  const currentRole = availableRoles[activeRoleIndex % availableRoles.length];

  const cycleRole = () => {
    setActiveRoleIndex(prev => prev + 1);
  };

  return (
    <div className="h-screen flex bg-slate-50 font-sans overflow-hidden">
      {/* Desktop Sidebar (Independent scrolling container) */}
      <aside className="hidden lg:flex lg:flex-col w-64 h-full border-r border-slate-200/90 bg-slate-900 text-slate-300 shrink-0 select-none">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-white shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              BTMS
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">v1.0</span>
            </span>
            <p className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
              ລະບົບບົດໂຄງການ &amp; ການເງິນ
            </p>
          </div>
        </div>

        {/* Role Switcher Pill */}
        <div className="px-4 pt-4 pb-2 shrink-0">
          <div className="rounded-lg bg-slate-800/80 p-2.5 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-sky-400" /> ບົດບາດປັດຈຸບັນ
              </span>
              <button 
                onClick={cycleRole}
                title="ຄລິກເພື່ອປ່ຽນມຸມມອງບົດບາດອື່ນ"
                className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2"
              >
                ປ່ຽນບົດບາດ
              </button>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="sky" className="bg-sky-900/50 text-sky-300 border-sky-700/50 text-[11px]">
                {roleLabelsLao[currentRole] || currentRole}
              </Badge>
              <span className="text-[10px] text-slate-400 font-mono">Role</span>
            </div>
          </div>
        </div>

        {/* Navigation Items (Separate scroll area) */}
        <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto dark-scroll">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            ເມນູຫຼັກ (Modules)
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-sky-600 text-white font-semibold shadow-xs"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
                <span>{item.labelLao}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Sign Out (Pinned at bottom of sidebar) */}
        <div className="p-3 border-t border-slate-800 shrink-0 mt-auto">
          <div className="flex items-center justify-between rounded-lg bg-slate-800/60 p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-xs font-bold text-sky-300 shrink-0">
                {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {profile?.display_name || user?.email?.split("@")[0] || "ອາຈານ ສົມຊາຍ ປະເສີດ"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {profile?.email || "somchai.p@nuol.edu.la"}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              title="ອອກຈາກລະບົບ"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Navbar (Fixed header) */}
        <header className="h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur-md shrink-0 z-30 flex items-center justify-between px-6">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                B
              </div>
              <span className="font-bold text-sm text-slate-900">BTMS</span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden sm:flex items-center gap-2.5 w-72 md:w-96 rounded-lg bg-slate-100/80 px-3 py-1.5 border border-slate-200 text-slate-500 text-xs">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາບົດໂຄງການ, ນັກສຶກສາ, ຫ້ອງສອບເສັງ, ໃບຮັບເງິນ... (⌘K)"
              className="bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none w-full text-xs"
            />
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            {/* Live Exam Indicator */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>ສົກຮຽນ 2026 / ພາກຮຽນ 1</span>
            </div>

            {/* Notification Bell & Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="ແຈ້ງເຕືອນ"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-sky-400" />
                        <span className="text-xs font-bold">ການແຈ້ງເຕືອນລະບົບ</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white">
                            {unreadCount} ໃໝ່
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-sky-300 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <CheckCheck className="h-3 w-3" />
                          <span>ອ່ານທັງໝົດ</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          ບໍ່ມີການແຈ້ງເຕືອນໃໝ່
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 transition-colors hover:bg-slate-50 cursor-pointer ${
                              !item.is_read ? "bg-sky-50/40" : ""
                            }`}
                            onClick={() => markAsRead(item.id)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                                {item.title}
                              </span>
                              {!item.is_read && (
                                <span className="h-2 w-2 rounded-full bg-sky-500 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                              {item.message}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.created_at}
                              </span>
                              <Link
                                href={item.link}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(item.id);
                                  setNotificationOpen(false);
                                }}
                                className="text-sky-600 hover:text-sky-700 font-medium flex items-center gap-0.5"
                              >
                                ເປີດເບິ່ງ <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Header User Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {profile?.display_name || "ອາຈານ ສົມຊາຍ ປະເສີດ"}
                </p>
                <p className="text-[10px] text-slate-500 uppercase font-mono">
                  {currentRole}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Slide-over Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex flex-col w-72 h-full bg-slate-900 text-slate-200 p-4 z-10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-sky-500 flex items-center justify-center text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-white">BTMS</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 min-h-0 py-4 space-y-1 overflow-y-auto dark-scroll">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                        isActive ? "bg-sky-600 text-white" : "text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.labelLao}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-800 shrink-0 mt-auto">
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-rose-400 text-sm font-medium w-full px-3 py-2"
                >
                  <LogOut className="h-4 w-4" /> ອອກຈາກລະບົບ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Viewport (Independent scroll container) */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
