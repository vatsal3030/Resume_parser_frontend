import React from"react";

/**
 * FormField — Consistent form field wrapper with label, error, and help text.
 */
export function FormField({
 label,
 htmlFor,
 error,
 help,
 required = false,
 children,
 className ="",
}) {
 return (
 <div className={`space-y-1.5 ${className}`}>
 {label && (
 <label htmlFor={htmlFor} className="block text-sm font-medium text-(--ink)">
 {label}
 {required && <span className="text-(--error) ml-1">*</span>}
 </label>
 )}
 {children}
 {error && (
 <p className="text-xs text-(--error)" role="alert">
 {error}
 </p>
 )}
 {help && !error && (
 <p className="text-xs text-(--muted)">{help}</p>
 )}
 </div>
 );
}

/**
 * FormSection — Groups related form fields with a heading.
 */
export function FormSection({ title, description, children, className ="" }) {
 return (
 <div className={`space-y-4 ${className}`}>
 {title && (
 <div className="border-b border-(--hairline) pb-3">
 <h3 className="text-base font-medium text-(--ink)">{title}</h3>
 {description && (
 <p className="text-sm text-(--muted) mt-0.5">{description}</p>
 )}
 </div>
 )}
 <div className="space-y-4">{children}</div>
 </div>
 );
}

/**
 * FormInput — Editorial styled text input.
 */
export const FormInput = React.forwardRef(
 ({ className ="", hasError = false, ...props }, ref) => {
 return (
 <input
 ref={ref}
 className={`
 w-full border border-(--hairline) rounded-xl px-3.5 py-2.5 text-sm text-(--ink)
 bg-(--surface-card)
 focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/15
 transition-all duration-200 placeholder:text-(--muted-soft)
 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-(--surface-soft)
 ${hasError ?"border-(--error) bg-red-500/10 focus:ring-red-500/15" :""}
 ${className}
 `}
 {...props}
 />
 );
 }
);
FormInput.displayName ="FormInput";

/**
 * FormTextarea — Editorial styled textarea.
 */
export const FormTextarea = React.forwardRef(
 ({ className ="", hasError = false, rows = 3, ...props }, ref) => {
 return (
 <textarea
 ref={ref}
 rows={rows}
 className={`
 w-full border border-(--hairline) rounded-xl px-3.5 py-2.5 text-sm text-(--ink)
 bg-(--surface-card) resize-y
 focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/15
 transition-all duration-200 placeholder:text-(--muted-soft)
 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-(--surface-soft)
 ${hasError ?"border-(--error) bg-red-500/10 focus:ring-red-500/15" :""}
 ${className}
 `}
 {...props}
 />
 );
 }
);
FormTextarea.displayName ="FormTextarea";

/**
 * FormSelect — Editorial styled select dropdown.
 */
export const FormSelect = React.forwardRef(
 ({ className ="", hasError = false, children, ...props }, ref) => {
 return (
 <select
 ref={ref}
 className={`
 w-full border border-(--hairline) rounded-xl px-3.5 py-2.5 text-sm text-(--ink)
 bg-(--surface-card) appearance-none cursor-pointer
 focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/15
 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
 ${hasError ?"border-(--error) bg-red-500/10" :""}
 ${className}
 `}
 {...props}
 >
 {children}
 </select>
 );
 }
);
FormSelect.displayName ="FormSelect";
