const STATUS_MAP: Record<string, { bg: string; fg: string; icon: string }> = {
  DELIVERED: { bg: "bg-emerald-dim", fg: "text-emerald", icon: "✦" },
  SHIPPED: { bg: "bg-sapphire-dim", fg: "text-sapphire", icon: "◈" },
  PROCESSING: { bg: "bg-amber-dim", fg: "text-amber", icon: "◎" },
  PENDING: { bg: "bg-muted", fg: "text-muted-foreground", icon: "○" },
  CANCELLED: { bg: "bg-destructive-dim", fg: "text-destructive", icon: "✕" },
  PAID: { bg: "bg-emerald-dim", fg: "text-emerald", icon: "✦" },
  REFUNDED: { bg: "bg-sapphire-dim", fg: "text-sapphire", icon: "↩" },
  FAILED: { bg: "bg-destructive-dim", fg: "text-destructive", icon: "✕" },
  active: { bg: "bg-emerald-dim", fg: "text-emerald", icon: "●" },
  inactive: { bg: "bg-destructive-dim", fg: "text-destructive", icon: "●" },
  ADMIN: { bg: "bg-primary-glow", fg: "text-primary", icon: "◆" },
  CUSTOMER: { bg: "bg-muted", fg: "text-muted-foreground", icon: "◇" },
  ACTIVE: { bg: "bg-emerald-dim", fg: "text-emerald", icon: "●" },
  INACTIVE: { bg: "bg-destructive-dim", fg: "text-destructive", icon: "●" },
};

export const StatusBadge = ({ status, size = "sm" }: { status: string; size?: "sm" | "md" }) => {
  const s = STATUS_MAP[status] || { bg: "bg-muted", fg: "text-muted-foreground", icon: "○" };
  return (
    <span className={`${s.bg} ${s.fg} inline-flex items-center gap-1 rounded-sm border border-current/10 font-mono font-normal tracking-wider whitespace-nowrap ${size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3.5 py-1 text-[11px]"}`}>
      <span className={size === "sm" ? "text-[8px]" : "text-[9px]"}>{s.icon}</span>
      {status}
    </span>
  );
};
