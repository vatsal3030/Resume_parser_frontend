import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? "div" : "button";
  
  // Base editorial styles
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
  
  // Variants mapping — Claude Editorial Design
  const variants = {
    default: "bg-(--primary) text-white hover:bg-(--primary-active) rounded-xl shadow-sm active:scale-[0.98]",
    primary: "bg-(--primary) text-white hover:bg-(--primary-active) rounded-xl shadow-sm active:scale-[0.98]",
    secondary: "bg-(--surface-soft) text-(--ink) border border-(--hairline) hover:bg-(--surface-card) rounded-xl shadow-sm active:scale-[0.98]",
    ghost: "text-(--body) hover:bg-(--surface-soft) hover:text-(--ink) rounded-xl active:scale-[0.98]",
    outline: "bg-transparent text-(--ink) border border-(--hairline) hover:bg-(--surface-card) rounded-xl active:scale-[0.98]",
    dark: "bg-(--surface-dark-elevated) text-(--on-dark) hover:bg-(--surface-dark-soft) rounded-xl shadow-sm active:scale-[0.98]",
    destructive: "bg-(--error) text-white hover:bg-red-700 rounded-xl shadow-sm active:scale-[0.98]",
    link: "text-(--primary) underline-offset-4 hover:underline bg-transparent",
    // Legacy compatibility
    brutal: "bg-(--primary) text-white hover:bg-(--primary-active) rounded-xl shadow-sm active:scale-[0.98]",
    pink: "bg-(--primary-active) text-white hover:bg-[#8f4a33] rounded-xl shadow-sm active:scale-[0.98]",
    mint: "bg-(--accent-teal) text-white hover:bg-[#4a9e8e] rounded-xl shadow-sm active:scale-[0.98]",
    green: "bg-(--success) text-white hover:bg-[#4a9960] rounded-xl shadow-sm active:scale-[0.98]",
    white: "bg-(--surface-card) text-(--ink) border border-(--hairline) hover:bg-(--surface-soft) rounded-xl shadow-sm active:scale-[0.98]",
  };

  // Sizes mapping
  const sizes = {
    default: "h-10 px-5 py-2",
    sm: "h-8 px-3.5 text-xs rounded-lg",
    lg: "h-12 px-7 text-base rounded-2xl",
    icon: "h-10 w-10 rounded-xl",
  };

  return (
    <Comp
      className={cn(baseStyles, variants[variant] || variants.default, sizes[size], className)}
      ref={ref}
      {...props}
    />
  )
});
Button.displayName = "Button"

export { Button }
