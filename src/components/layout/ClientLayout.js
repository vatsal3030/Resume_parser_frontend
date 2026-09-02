"use client";

import { useState, useEffect } from"react";
import { Sidebar } from"./Sidebar";
import { TopHeader } from"./TopHeader";
import { useRouter } from"next/navigation";
import { supabase } from"@/lib/supabase";
import { Loader2 } from"lucide-react";

export function ClientLayout({ children }) {
 const [isMobileOpen, setIsMobileOpen] = useState(false);
 const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
 const [isLoading, setIsLoading] = useState(true);
 const router = useRouter();

 useEffect(() => {
 const checkAuth = async () => {
 const { data: { session } } = await supabase.auth.getSession();
 if (!session) {
 router.push("/login");
 } else {
 setIsLoading(false);
 }
 };
 checkAuth();
 
 const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
 if (!session) {
 router.push("/login");
 }
 });

 return () => subscription.unsubscribe();
 }, [router]);

 useEffect(() => {
 const handleKeyDown = (e) => {
 // Toggle on Ctrl+B or Cmd+B
 if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
 e.preventDefault(); // Prevent default browser bookmarks shortcut
 setIsDesktopCollapsed((prev) => !prev);
 }
 };
 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, []);

 if (isLoading) {
 return (
 <div className="flex h-screen w-full items-center justify-center bg-(--canvas)">
 <Loader2 className="w-8 h-8 animate-spin text-(--primary)" />
 </div>
 );
 }

 return (
 <div className="flex h-screen overflow-hidden bg-(--canvas) text-(--ink)">
 {/* Sidebar (Desktop fixed, Mobile drawer) */}
 <Sidebar 
 isMobileOpen={isMobileOpen} 
 setIsMobileOpen={setIsMobileOpen} 
 isDesktopCollapsed={isDesktopCollapsed} 
 />

 {/* Main Content Area */}
 <div 
 className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${
 isDesktopCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
 }`}
 >
 <TopHeader 
 setIsMobileOpen={setIsMobileOpen} 
 isDesktopCollapsed={isDesktopCollapsed}
 setIsDesktopCollapsed={setIsDesktopCollapsed}
 />
 
 {/* Scrollable Content */}
 <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-gutter-stable">
 {children}
 </main>
 </div>
 </div>
 );
}
