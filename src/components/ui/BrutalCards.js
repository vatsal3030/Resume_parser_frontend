import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

// Used for linking to individual tools on the dashboard
export function ToolCard({ 
  title, 
  description, 
  href, 
  bgColor = "bg-white", 
  textColor = "text-black",
  icon: Icon
}) {
  return (
    <Link href={href} className="block h-full group">
      <Card className={`${bgColor} ${textColor} border-4 border-brutal-black hover:-translate-y-2 hover:shadow-[8px_8px_0_rgba(0,0,0,1)] transition-all cursor-pointer h-full rounded-none`}>
        <CardContent className="p-6 h-full flex flex-col justify-between">
          <div>
             {Icon && <Icon className="w-8 h-8 mb-4 opacity-80 group-hover:scale-110 transition-transform" />}
             <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{title}</h3>
             <p className="font-bold text-sm opacity-90">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Used for static data visualization (metrics, stats, etc)
export function DashboardCard({
  title,
  value,
  subtext,
  bgColor = "bg-white",
  textColor = "text-black",
  icon: Icon
}) {
  return (
    <Card className={`${bgColor} ${textColor} border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] rounded-none h-full`}>
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <p className="font-black text-sm uppercase tracking-widest opacity-80">{title}</p>
          {Icon && <Icon className="w-6 h-6 opacity-80" />}
        </div>
        <div>
          <span className="text-4xl md:text-5xl font-black">{value}</span>
          {subtext && <p className="font-bold text-sm mt-2 opacity-90">{subtext}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
