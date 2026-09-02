"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FilePlus,
  FileEdit, 
  ClipboardCheck,
  Briefcase, 
  MessageSquare, 
  Map,
  Code, 
  Users,
  LayoutTemplate,
  CreditCard,
  User,
  HelpCircle,
  Trash2,
  Trophy,
  X
} from "lucide-react";
import { CreditBalance } from "@/components/ui/CreditBalance";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "New Analysis", path: "/dashboard/analyze", icon: FilePlus },
  { name: "Resume Studio", path: "/dashboard/studio", icon: FileEdit },
  { name: "DSA Tracker", path: "/dashboard/tools/dsa-tracker", icon: Trophy },
  { name: "GitHub", path: "/dashboard/tools/github", icon: Code },
  { name: "Portfolio", path: "/dashboard/tools/portfolio", icon: LayoutTemplate },
  { name: "AI Tailor", path: "/dashboard/tools/tailor", icon: ClipboardCheck },
  { name: "Job Tracker", path: "/dashboard/tracker", icon: Briefcase },
  { name: "Cover Letter", path: "/dashboard/tools/cover-letter", icon: FileEdit },
  { name: "Interviews", path: "/dashboard/tools/mock-interview", icon: MessageSquare },
  { name: "Roadmap", path: "/dashboard/tools/roadmap", icon: Map },
  { name: "Community", path: "/dashboard/community", icon: Users },
];

const UTILITY_ITEMS = [
  { name: "Credits", path: "/dashboard/credits", icon: CreditCard },
  { name: "Profile", path: "/dashboard/profile", icon: User },
  { name: "Trash", path: "/dashboard/trash", icon: Trash2 },
  { name: "Help", path: "/dashboard/help", icon: HelpCircle },
];

const SidebarContent = ({ pathname, isDesktopCollapsed, isMobileOpen, setIsMobileOpen }) => (
  <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden bg-(--canvas) border-r border-(--hairline) transition-colors">
    {/* Logo Header */}
    <div className={`p-4 border-b border-(--hairline) sticky top-0 bg-(--canvas)/90 backdrop-blur-md z-10 flex items-center ${isDesktopCollapsed ? 'justify-center' : 'justify-between'}`}>
      <Link 
        href="/" 
        className="flex items-center gap-2.5 group" 
        onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        title="Elevara"
      >
        <div className="w-8 h-8 rounded-xl bg-(--primary) text-white flex items-center justify-center font-serif text-base font-medium shadow-xs group-hover:scale-108 group-hover:rotate-[-4deg] transition-all duration-300">
          E
        </div>
        {!isDesktopCollapsed && (
          <span className="font-serif text-(--ink) text-2xl tracking-tight">
            Elevara
          </span>
        )}
      </Link>
      {isMobileOpen && setIsMobileOpen && (
        <button 
          onClick={() => setIsMobileOpen(false)} 
          className="lg:hidden p-1.5 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft) transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-3 py-3 space-y-0.5">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            title={item.name}
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
            className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
              isActive 
                ? "bg-(--surface-card) text-(--ink) shadow-xs border border-(--hairline) font-medium" 
                : "text-(--muted) hover:bg-(--surface-soft) hover:text-(--ink) hover:translate-x-0.5"
            } ${isDesktopCollapsed ? 'justify-center px-0' : ''}`}
          >
            <div className="relative flex items-center justify-center shrink-0 w-5 h-5">
              <item.icon className={`w-[18px] h-[18px] transition-all duration-300 ease-out group-hover:scale-118 group-hover:rotate-[-6deg] ${
                isActive 
                  ? 'text-(--primary) scale-105' 
                  : 'text-(--muted-soft) group-hover:text-(--primary)'
              }`} />
            </div>
            {!isDesktopCollapsed && <span className="truncate transition-colors duration-200">{item.name}</span>}
          </Link>
        );
      })}

      {/* Utility Section Divider */}
      <div className={`border-t border-(--hairline-soft) my-3 ${isDesktopCollapsed ? 'mx-2' : 'mx-1'}`} />

      {/* Utility Nav */}
      <div className="space-y-0.5">
        {UTILITY_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              title={item.name}
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-(--surface-card) text-(--ink) shadow-xs border border-(--hairline) font-medium" 
                  : "text-(--muted) hover:bg-(--surface-soft) hover:text-(--ink) hover:translate-x-0.5"
              } ${isDesktopCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className="relative flex items-center justify-center shrink-0 w-5 h-5">
                <item.icon className={`w-4 h-4 transition-all duration-300 ease-out group-hover:scale-118 group-hover:rotate-[-6deg] ${
                  isActive 
                    ? 'text-(--primary) scale-105' 
                    : 'text-(--muted-soft) group-hover:text-(--primary)'
                }`} />
              </div>
              {!isDesktopCollapsed && <span className="truncate transition-colors duration-200">{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </nav>

    {/* Live Credit Widget */}
    {!isDesktopCollapsed && (
      <div className="px-3 py-3 border-t border-(--hairline-soft) bg-(--surface-soft)/50">
        <p className="text-[10px] uppercase font-medium tracking-wider text-(--muted-soft) mb-1.5 px-1">Credits</p>
        <CreditBalance className="w-full justify-between" />
      </div>
    )}

    {/* Version */}
    <div className={`px-4 py-2.5 border-t border-(--hairline-soft) text-[10px] font-medium text-(--muted-soft) ${isDesktopCollapsed ? 'text-center' : ''}`}>
      {isDesktopCollapsed ? 'v1' : 'Elevara v1.0'}
    </div>
  </div>
);

export function Sidebar({ isMobileOpen, setIsMobileOpen, isDesktopCollapsed }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block h-screen fixed left-0 top-0 bg-(--canvas) z-40 transition-all duration-300 ${
          isDesktopCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        <SidebarContent pathname={pathname} isDesktopCollapsed={isDesktopCollapsed} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-(--canvas) shadow-2xl transform transition-transform duration-300 ease-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent pathname={pathname} isDesktopCollapsed={isDesktopCollapsed} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      </aside>
    </>
  );
}
