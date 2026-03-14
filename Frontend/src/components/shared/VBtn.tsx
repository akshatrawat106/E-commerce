import { useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type BtnSize = "sm" | "md" | "lg";

interface VBtnProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const variantClasses: Record<BtnVariant, string> = {
  primary: "bg-gradient-to-br from-primary to-primary-dim text-primary-foreground border-none shadow-[0_4px_15px_hsl(var(--primary-glow))] hover:from-primary-bright hover:to-primary hover:shadow-[0_8px_30px_hsl(var(--primary-glow-strong)),0_0_0_1px_hsl(var(--primary)/0.25)]",
  secondary: "bg-surface text-foreground border border-border hover:bg-raised hover:border-border-bright",
  ghost: "bg-transparent text-text-secondary border border-transparent hover:bg-raised/50 hover:text-foreground hover:border-border",
  danger: "bg-destructive-dim text-destructive border border-destructive/20 hover:bg-destructive/15",
  success: "bg-emerald-dim text-emerald border border-emerald/20 hover:bg-emerald/15",
};

const sizeClasses: Record<BtnSize, string> = {
  sm: "px-3.5 py-1.5 text-[11px]",
  md: "px-5 py-2.5 text-[13px]",
  lg: "px-8 py-3.5 text-sm",
};

export const VBtn = ({ children, onClick, variant = "primary", size = "md", icon, loading, disabled, className, fullWidth }: VBtnProps) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={cn(
      "inline-flex items-center justify-center gap-[7px] rounded-lg font-body font-semibold tracking-wide whitespace-nowrap transition-all duration-200 active:scale-[0.97] hover:scale-[1.02]",
      variantClasses[variant],
      sizeClasses[size],
      (disabled || loading) && "opacity-45 cursor-not-allowed hover:scale-100",
      fullWidth && "w-full",
      className
    )}
  >
    {loading ? <Spinner size={13} /> : icon && <span className="text-[calc(1em+1px)]">{icon}</span>}
    {children}
  </button>
);
