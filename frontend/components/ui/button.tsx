import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "destructive" | "ghost";
  loading?: boolean;
};

export function Button({ 
  className, 
  variant = "default", 
  loading = false, 
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 hover:cursor-pointer",
        variant === "default" && "bg-blue-600 text-white hover:bg-blue-500",
        variant === "secondary" && "bg-slate-800 text-white hover:bg-slate-700",
        variant === "destructive" && "bg-red-600 text-white hover:bg-red-500",
        variant === "ghost" && "bg-transparent text-slate-200 hover:bg-slate-800",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}

