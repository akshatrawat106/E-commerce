import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const GlassCard = ({ children, className, onClick, glow, style, onMouseEnter, onMouseLeave }: GlassCardProps) => (
  <div
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={style}
    className={cn(
      "relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-raised/60 to-surface/80 backdrop-blur-[10px]",
      glow && "animate-glow-pulse",
      onClick && "cursor-pointer",
      className
    )}
  >
    {children}
  </div>
);
