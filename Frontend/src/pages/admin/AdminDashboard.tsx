import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/shared/GlassCard";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";

const AdminDashboard = ({ notify }: { notify: (msg: string, type?: string) => void }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(setStats).catch(e => notify(e.message, "error")).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Spinner size={32} /></div>;
  if (!stats) return <EmptyState icon="◈" title="No dashboard data" />;

  const statCards = [
    { label: "Total Revenue", value: `₹${((stats.totalRevenue || 0) / 1000).toFixed(1)}K`, icon: "₹", color: "text-primary", bg: "bg-primary-glow", border: "from-primary" },
    { label: "Orders", value: stats.totalOrders || 0, icon: "◎", color: "text-sapphire", bg: "bg-sapphire-dim", border: "from-sapphire" },
    { label: "Customers", value: stats.totalUsers || 0, icon: "◑", color: "text-emerald", bg: "bg-emerald-dim", border: "from-emerald" },
    { label: "Products", value: stats.totalProducts || 0, icon: "◧", color: "text-amber", bg: "bg-amber-dim", border: "from-amber" },
  ];

  const breakdown = [
    { label: "Delivered", count: stats.deliveredOrders || 0, color: "bg-emerald", text: "text-emerald" },
    { label: "Shipped", count: stats.shippedOrders || 0, color: "bg-sapphire", text: "text-sapphire" },
    { label: "Processing", count: stats.processingOrders || 0, color: "bg-amber", text: "text-amber" },
    { label: "Pending", count: stats.pendingOrders || 0, color: "bg-text-secondary", text: "text-text-secondary" },
    { label: "Cancelled", count: stats.cancelledOrders || 0, color: "bg-destructive", text: "text-destructive" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        {statCards.map((s, i) => (
          <GlassCard key={i} className="p-5 animate-fade-up hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all cursor-default" style={{ animationDelay: `${i * 0.06}s` } as any}>
            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${s.border} to-transparent rounded-t-xl`} />
            <div className="flex justify-between items-start mb-3">
              <div className="text-[10px] text-text-dim font-mono tracking-[1.5px] uppercase">{s.label}</div>
              <div className={`w-[30px] h-[30px] rounded-lg ${s.bg} border border-current/15 flex items-center justify-center text-[13px] ${s.color}`}>{s.icon}</div>
            </div>
            <div className="font-display font-bold text-[32px] text-foreground animate-count-up" style={{ animationDelay: `${i * 0.1 + 0.2}s` } as any}>{s.value}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="overflow-hidden animate-fade-up" style={{ animationDelay: "0.06s" } as any}>
          <div className="px-[18px] py-3.5 border-b border-border flex items-center gap-2">
            <span className="text-primary">◎</span>
            <div className="font-body font-bold text-[13px]">Order Breakdown</div>
          </div>
          <div className="px-[18px] py-4">
            {breakdown.map(({ label, count, color, text }) => {
              const pct = Math.round((count / Math.max(stats.totalOrders || 1, 1)) * 100);
              return (
                <div key={label} className="mb-3.5">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-text-secondary font-body">{label}</span>
                    <span className={`text-[11px] font-mono ${text}`}>{count} · {pct}%</span>
                  </div>
                  <div className="h-[3px] bg-border rounded-full">
                    <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%`, boxShadow: `0 0 8px hsl(var(--${color.replace("bg-", "")}) / 0.3)` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <div className="flex flex-col gap-3">
          {[
            { show: stats.lowStockProducts > 0, colorClass: "border-amber/15", label: "LOW STOCK ALERT", val: stats.lowStockProducts, sub: "products need restocking", icon: "⚠", iconColor: "text-amber bg-amber-dim" },
            { show: stats.outOfStockProducts > 0, colorClass: "border-destructive/15", label: "OUT OF STOCK", val: stats.outOfStockProducts, sub: "products unavailable", icon: "✕", iconColor: "text-destructive bg-destructive-dim" },
            { show: true, colorClass: "border-primary/15", label: "CATEGORIES", val: stats.totalCategories || 0, sub: "active categories", icon: "◫", iconColor: "text-primary bg-primary-glow" },
          ].filter(a => a.show).map((a, i) => (
            <GlassCard key={i} className={`p-4 ${a.colorClass} animate-fade-up`} style={{ animationDelay: `${i * 0.08}s` } as any}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[9px] font-mono tracking-[2px] mb-1 text-text-dim">{a.icon} {a.label}</div>
                  <div className="font-display font-bold text-[28px] text-foreground">{a.val}</div>
                  <div className="text-[11px] text-text-secondary">{a.sub}</div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[22px] ${a.iconColor}`}>{a.icon}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
