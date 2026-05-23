import React from "react";

/**
 * FormField — Consistent form field wrapper with label, error, and help text.
 *
 * @param {string} label - Field label
 * @param {string} htmlFor - ID of the input element
 * @param {string} error - Error message
 * @param {string} help - Help text
 * @param {boolean} required - Show required indicator
 * @param {React.ReactNode} children - The input element
 */
export function FormField({
  label,
  htmlFor,
  error,
  help,
  required = false,
  children,
  className = "",
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-black uppercase tracking-tight">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs font-bold text-red-600" role="alert">
          {error}
        </p>
      )}
      {help && !error && (
        <p className="text-xs font-bold text-gray-500">{help}</p>
      )}
    </div>
  );
}

/**
 * FormSection — Groups related form fields with a heading.
 */
export function FormSection({ title, description, children, className = "" }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="border-b-2 border-brutal-black pb-2">
          <h3 className="text-lg font-black uppercase tracking-tight">{title}</h3>
          {description && (
            <p className="text-sm font-bold text-gray-500 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/**
 * FormInput — Brutalist styled text input.
 * Wraps native input with consistent border/focus styling.
 */
export const FormInput = React.forwardRef(
  ({ className = "", hasError = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full border-3 border-brutal-black p-3 font-bold text-sm
          bg-white shadow-brutal-sm
          focus:outline-none focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px]
          transition-all placeholder:text-gray-400 placeholder:font-normal
          disabled:opacity-50 disabled:cursor-not-allowed
          ${hasError ? "border-red-500 bg-red-50" : ""}
          ${className}
        `}
        {...props}
      />
    );
  }
);
FormInput.displayName = "FormInput";

/**
 * FormTextarea — Brutalist styled textarea.
 */
export const FormTextarea = React.forwardRef(
  ({ className = "", hasError = false, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`
          w-full border-3 border-brutal-black p-3 font-bold text-sm
          bg-white shadow-brutal-sm resize-y
          focus:outline-none focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px]
          transition-all placeholder:text-gray-400 placeholder:font-normal
          disabled:opacity-50 disabled:cursor-not-allowed
          ${hasError ? "border-red-500 bg-red-50" : ""}
          ${className}
        `}
        {...props}
      />
    );
  }
);
FormTextarea.displayName = "FormTextarea";

/**
 * FormSelect — Brutalist styled select dropdown.
 */
export const FormSelect = React.forwardRef(
  ({ className = "", hasError = false, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          w-full border-3 border-brutal-black p-3 font-bold text-sm
          bg-white shadow-brutal-sm appearance-none cursor-pointer
          focus:outline-none focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px]
          transition-all disabled:opacity-50 disabled:cursor-not-allowed
          ${hasError ? "border-red-500 bg-red-50" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
    );
  }
);
FormSelect.displayName = "FormSelect";
