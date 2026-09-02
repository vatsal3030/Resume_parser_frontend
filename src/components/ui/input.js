"use client";
import * as React from"react"
import { cn } from"@/lib/utils"
import { Eye, EyeOff } from"lucide-react"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
 return (
 <input
 type={type}
 className={cn(
"flex h-10 w-full rounded-xl border border-(--hairline) bg-(--surface-soft) px-3.5 py-2 text-sm text-(--ink) ring-offset-background transition-all duration-200",
"file:border-0 file:bg-transparent file:text-sm file:font-medium",
"placeholder:text-(--muted-soft)",
"focus-visible:outline-none focus-visible:border-(--primary) focus-visible:ring-2 focus-visible:ring-(--primary)/15",
"disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-(--surface-soft)",
 className
 )}
 ref={ref}
 {...props}
 />
 )
})
Input.displayName ="Input"

const PasswordInput = React.forwardRef(({ className, ...props }, ref) => {
 const [showPassword, setShowPassword] = React.useState(false);

 return (
 <div className="relative">
 <Input
 type={showPassword ?"text" :"password"}
 className={cn("pr-11", className)}
 ref={ref}
 {...props}
 />
 <button
 type="button"
 tabIndex={-1}
 onClick={() => setShowPassword(prev => !prev)}
 className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-(--muted) hover:text-(--ink) transition-colors duration-200 rounded-r-lg"
 aria-label={showPassword ?"Hide password" :"Show password"}
 >
 {showPassword ? (
 <EyeOff className="w-4 h-4" />
 ) : (
 <Eye className="w-4 h-4" />
 )}
 </button>
 </div>
 );
})
PasswordInput.displayName ="PasswordInput"

export { Input, PasswordInput }
