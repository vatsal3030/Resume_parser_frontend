import React from 'react';
import { motion } from 'framer-motion';

export function SkeletonLoader({ className = "", type = "text", rows = 1 }) {
  const baseClasses = "bg-gray-200 animate-pulse border-2 border-brutal-black/10";
  
  if (type === "card") {
    return (
      <div className={`p-6 border-4 border-brutal-black bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] flex flex-col gap-4 ${className}`}>
        <div className={`h-8 w-1/3 rounded-sm ${baseClasses}`}></div>
        <div className={`h-4 w-full rounded-sm ${baseClasses}`}></div>
        <div className={`h-4 w-5/6 rounded-sm ${baseClasses}`}></div>
        <div className={`h-4 w-4/6 rounded-sm ${baseClasses}`}></div>
      </div>
    );
  }

  if (type === "profile") {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className={`w-16 h-16 rounded-full ${baseClasses}`}></div>
        <div className="flex flex-col gap-2 w-full">
          <div className={`h-6 w-1/3 rounded-sm ${baseClasses}`}></div>
          <div className={`h-4 w-1/4 rounded-sm ${baseClasses}`}></div>
        </div>
      </div>
    );
  }

  if (type === "heatmap") {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <div className={`h-6 w-1/4 rounded-sm mb-4 ${baseClasses}`}></div>
        <div className="flex gap-1 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={`${i}-${j}`} className={`w-3 h-3 rounded-sm ${baseClasses}`} style={{ opacity: Math.random() * 0.5 + 0.2 }}></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default text rows
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className={`h-4 rounded-sm ${baseClasses}`}
          style={{ width: i === rows - 1 ? '70%' : '100%' }}
        ></div>
      ))}
    </div>
  );
}

export function SkeletonPage({ type = "github" }) {
  if (type === "github") {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 opacity-70"
      >
        <SkeletonLoader type="card" className="md:col-span-2 h-40" />
        <SkeletonLoader type="heatmap" className="md:col-span-2 p-8 border-4 border-brutal-black bg-white shadow-[4px_4px_0_rgba(0,0,0,1)]" />
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
      </motion.div>
    );
  }

  if (type === "portfolio") {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-8 opacity-70"
      >
        <div className="h-64 border-4 border-brutal-black bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center p-8">
           <SkeletonLoader type="text" rows={3} className="w-1/2" />
        </div>
        <div className="h-96 border-4 border-brutal-black bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] p-8">
           <SkeletonLoader type="text" rows={8} />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 opacity-70">
      <SkeletonLoader type="profile" />
      <SkeletonLoader type="card" />
      <SkeletonLoader type="text" rows={4} />
    </div>
  );
}
