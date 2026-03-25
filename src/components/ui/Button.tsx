import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "text" | "icon";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white active:bg-primary-dark hover:shadow-md",
      secondary: "bg-transparent border border-border text-primary active:bg-primary/10 hover:border-primary/50",
      text: "bg-transparent text-primary hover:underline",
      icon: "w-12 h-12 rounded-full flex items-center justify-center active:bg-primary/10 text-text-primary",
    };

    const sizes = {
      default: "px-6 py-3 rounded-[24px] text-sm font-medium",
      sm: "px-4 py-2 rounded-[16px] text-xs font-medium",
      lg: "px-8 py-4 rounded-[24px] text-base font-medium",
      icon: "p-3",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          variant !== "icon" && sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
