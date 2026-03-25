import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-hint focus:outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 text-text-primary",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
