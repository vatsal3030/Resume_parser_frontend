"use client";
import React from "react";

/**
 * BrutalTabs — Brutalist styled tab navigation with keyboard support.
 *
 * @param {Array} tabs - Array of { id, label, icon?: LucideIcon }
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
    // Focus the new tab button
    const tabList = e.currentTarget.parentElement;
    tabList?.children[nextIndex]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Tabs"
      className={`flex border-b-4 border-brutal-black overflow-x-auto ${className}`}
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
              flex items-center gap-2 px-5 py-3 font-bold text-sm uppercase tracking-tight
              border-b-4 -mb-[4px] whitespace-nowrap transition-all
              ${
                isActive
                  ? "border-brutal-yellow bg-brutal-yellow text-brutal-black"
                  : "border-transparent hover:bg-gray-100 text-gray-600 hover:text-brutal-black"
              }
            `}
          >
            {Icon && <Icon className="w-4 h-4" />}
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
