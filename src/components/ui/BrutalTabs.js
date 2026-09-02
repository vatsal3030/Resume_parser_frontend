"use client";
import React from"react";

/**
 * BrutalTabs — Clean editorial tab navigation with subtle active states.
 *
 * @param {Array} tabs - Array of { id, label, icon?: LucideIcon, color?: string }
 * @param {string} activeTab - Currently active tab id
 * @param {function} onTabChange - Tab change handler
 * @param {string} className - Additional classes
 */
export function BrutalTabs({ tabs, activeTab, onTabChange, className ="" }) {
 const handleKeyDown = (e, tabId, index) => {
 let nextIndex;
 if (e.key ==="ArrowRight") {
 nextIndex = (index + 1) % tabs.length;
 } else if (e.key ==="ArrowLeft") {
 nextIndex = (index - 1 + tabs.length) % tabs.length;
 } else if (e.key ==="Home") {
 nextIndex = 0;
 } else if (e.key ==="End") {
 nextIndex = tabs.length - 1;
 } else {
 return;
 }
 e.preventDefault();
 onTabChange(tabs[nextIndex].id);
 const tabList = e.currentTarget.parentElement;
 tabList?.children[nextIndex]?.focus();
 };

 return (
 <div
 role="tablist"
 aria-label="Tabs"
 className={`flex flex-wrap gap-1 p-1 bg-(--surface-soft) rounded-xl ${className}`}
 >
 {tabs.map((tab, index) => {
 const isActive = activeTab === tab.id;
 const Icon = tab.icon;
 return (
 <button
 key={tab.id}
 role="tab"
 aria-selected={isActive}
 aria-controls={`tabpanel-${tab.id}`}
 id={`tab-${tab.id}`}
 tabIndex={isActive ? 0 : -1}
 onClick={() => onTabChange(tab.id)}
 onKeyDown={(e) => handleKeyDown(e, tab.id, index)}
 className={`
 flex items-center gap-2 px-4 py-2 text-sm font-medium
 rounded-lg transition-all duration-200 whitespace-nowrap
 ${
 isActive
 ?"bg-(--surface-card) text-(--ink) shadow-xs border border-(--hairline)"
 :"text-(--muted) hover:text-(--ink) hover:bg-(--surface-card)/60"
 }
 `}
 >
 {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-(--primary)' : 'opacity-60'}`} />}
 {tab.label}
 </button>
 );
 })}
 </div>
 );
}

/**
 * BrutalTabPanel — Content wrapper for a tab panel.
 */
export function BrutalTabPanel({ id, activeTab, children, className ="" }) {
 if (id !== activeTab) return null;

 return (
 <div
 role="tabpanel"
 id={`tabpanel-${id}`}
 aria-labelledby={`tab-${id}`}
 tabIndex={0}
 className={`animate-fade-in pt-5 ${className}`}
 >
 {children}
 </div>
 );
}
