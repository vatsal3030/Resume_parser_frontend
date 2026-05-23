import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText } from "lucide-react";

export function EmptyState({ 
  icon: Icon = FileText, 
  title, 
  description, 
  actionLabel, 
  actionHref,
  actionOnClick,
  highlightColor = "bg-brutal-pink"
}) {
  return (
    <Card className="max-w-2xl mx-auto text-center py-20 bg-brutal-white border-4 border-brutal-black shadow-[8px_8px_0_#000]">
      <CardContent>
        <Icon className="w-24 h-24 text-brutal-black mx-auto mb-6 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]" />
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">{title}</h2>
        <p className={`text-lg font-bold max-w-md mx-auto ${highlightColor} px-3 py-1 border-2 border-brutal-black shadow-[2px_2px_0_#000]`}>
          {description}
        </p>
        
        {actionHref && actionLabel && (
          <Link href={actionHref} className="mt-8 inline-block">
            <Button variant="default" className="text-xl px-10 py-6 hover:-translate-y-1 transition-transform">
              {actionLabel}
            </Button>
          </Link>
        )}

        {actionOnClick && actionLabel && !actionHref && (
          <div className="mt-8 inline-block">
            <Button variant="default" className="text-xl px-10 py-6 hover:-translate-y-1 transition-transform" onClick={actionOnClick}>
              {actionLabel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
