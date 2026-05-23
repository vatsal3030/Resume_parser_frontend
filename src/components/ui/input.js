"use client";
import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-none border-3 border-brutal-black bg-white px-4 py-2 text-sm font-medium ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        "focus:shadow-brutal focus:-translate-y-1 focus:-translate-x-1",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

const PasswordInput = React.forwardRef(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-12", className)}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword(prev => !prev)}
        className="absolute right-0 top-0 h-full px-3 flex items-center justify-center border-l-3 border-brutal-black bg-brutal-bg hover:bg-brutal-yellow transition-colors"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="w-5 h-5 text-brutal-black" />
        ) : (
          <Eye className="w-5 h-5 text-brutal-black" />
        )}
      </button>
    </div>
  );
})
PasswordInput.displayName = "PasswordInput"

export { Input, PasswordInput }
