"use client";
import React from "react";

/**
 * BrutalTabs — Prominent, button-like tab navigation with icons and color accents.
 *
 * @param {Array} tabs - Array of { id, label, icon?: LucideIcon, color?: string }
 * @param {string} activeTab - Currently active tab id
 * @param {function} onTabChange - Tab change handler
 * @param {string} className - Additional classes
 */
export function BrutalTabs({ tabs, activeTab, onTabChange, className = "" }) {
  const handleKeyDown = (e, tabId, index) => {
    let nextIndex;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
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
      className={`flex flex-wrap gap-2 ${className}`}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        const activeColor = tab.color || "bg-brutal-yellow";
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
              flex items-center gap-2 px-4 py-2.5 font-black text-xs uppercase tracking-tight
              border-3 border-brutal-black transition-all whitespace-nowrap
              ${
                isActive
                  ? `${activeColor} text-brutal-black shadow-[3px_3px_0_#000] translate-x-0 translate-y-0`
                  : "bg-white text-gray-500 hover:bg-gray-100 hover:text-brutal-black shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000]"
              }
            `}
          >
            {Icon && <Icon className={`w-4 h-4 ${isActive ? '' : 'opacity-60'}`} />}
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
export function BrutalTabPanel({ id, activeTab, children, className = "" }) {
  if (id !== activeTab) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={`animate-fade-in pt-6 ${className}`}
    >
      {children}
    </div>
  );
}
