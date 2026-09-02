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
  actionOnClick
}) {
  return (
    <Card className="max-w-xl mx-auto text-center py-12 px-6 rounded-2xl bg-(--surface-card) border border-(--hairline) shadow-sm">
      <CardContent className="flex flex-col items-center p-0">
        <div className="w-14 h-14 rounded-2xl bg-(--surface-soft) border border-(--hairline-soft) flex items-center justify-center text-(--primary) mb-4">
          <Icon className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-serif font-medium text-(--ink) mb-1.5">{title}</h2>
        <p className="text-xs text-(--muted) max-w-sm leading-relaxed mb-6">
          {description}
        </p>
        
        {actionHref && actionLabel && (
          <Link href={actionHref}>
            <Button variant="default" className="text-xs py-2 px-5">
              {actionLabel}
            </Button>
          </Link>
        )}

        {actionOnClick && actionLabel && !actionHref && (
          <Button variant="default" className="text-xs py-2 px-5" onClick={actionOnClick}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
