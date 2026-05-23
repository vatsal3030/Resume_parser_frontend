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
  <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden">
    <div className={`p-4 border-b-4 border-brutal-black sticky top-0 bg-brutal-bg z-10 flex items-center ${isDesktopCollapsed ? 'justify-center' : 'justify-between'}`}>
        <Link 
          href="/" 
          className="flex items-center" 
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          title="Elevara"
        >
          <span className={`font-black uppercase tracking-tighter bg-brutal-mint px-2 py-1 border-2 border-brutal-black text-black shadow-[2px_2px_0_#000] hover:shadow-none transition-all ${isDesktopCollapsed ? 'text-xs' : 'text-xl lg:text-2xl'}`}>
            {isDesktopCollapsed ? 'EL' : 'Elevara'}
          </span>
        </Link>
        {isMobileOpen && setIsMobileOpen && (
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-1 border-2 border-brutal-black bg-brutal-yellow shadow-[2px_2px_0_#000]">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              title={item.name}
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className={`group flex items-center gap-3 px-3 py-3 font-bold text-sm uppercase tracking-widest border-2 transition-colors ${
                isActive 
                  ? "bg-brutal-yellow border-brutal-black text-black shadow-[2px_2px_0_#000]" 
                  : "border-transparent text-foreground hover:bg-gray-100 hover:border-brutal-black hover:shadow-[2px_2px_0_#000]"
              } ${isDesktopCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:-translate-y-1 group-hover:scale-110'}`} />
              {!isDesktopCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}

        {/* Utility Section Divider */}
        <div className={`border-t-2 border-dashed border-gray-300 my-3 ${isDesktopCollapsed ? 'mx-2' : 'mx-1'}`} />

        {UTILITY_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              title={item.name}
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className={`group flex items-center gap-3 px-3 py-2.5 font-bold text-xs uppercase tracking-widest border-2 transition-colors ${
                isActive 
                  ? "bg-brutal-pink border-brutal-black text-black shadow-[2px_2px_0_#000]" 
                  : "border-transparent text-gray-500 hover:bg-gray-100 hover:border-brutal-black hover:text-foreground"
              } ${isDesktopCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:-translate-y-0.5 group-hover:scale-110'}`} />
              {!isDesktopCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 border-t-4 border-brutal-black text-xs font-bold uppercase tracking-widest text-gray-500 ${isDesktopCollapsed ? 'text-center' : 'text-center'}`}>
        {isDesktopCollapsed ? 'v1' : 'v1.0.0'}
      </div>
    </div>
  );

export function Sidebar({ isMobileOpen, setIsMobileOpen, isDesktopCollapsed }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block h-screen fixed left-0 top-0 bg-white border-r-4 border-brutal-black z-40 transition-all duration-300 ${
          isDesktopCollapsed ? 'w-[80px]' : 'w-[280px]'
        }`}
      >
        <SidebarContent pathname={pathname} isDesktopCollapsed={isDesktopCollapsed} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      </aside>

      {/* Mobile Slide-over Drawer overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r-4 border-brutal-black transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent pathname={pathname} isDesktopCollapsed={isDesktopCollapsed} isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      </aside>
    </>
  );
}
