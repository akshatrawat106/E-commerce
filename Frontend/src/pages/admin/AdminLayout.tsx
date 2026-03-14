import { useState, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/shared/UserAvatar";
import AdminDashboard from "./AdminDashboard";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";
import AdminUsers from "./AdminUsers";
import AdminCoupons from "./AdminCoupons";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "orders", label: "Orders", icon: "◎" },
  { id: "products", label: "Products", icon: "◧" },
  { id: "categories", label: "Categories", icon: "◫" },
  { id: "users", label: "Users", icon: "◑" },
  { id: "coupons", label: "Coupons", icon: "◇" },
];

const AdminLayout = () => {
  const { auth, handleLogout } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const notify = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex h-screen w-screen max-w-[100vw] bg-void overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] bg-gradient-to-br from-raised to-surface border-l-[3px] rounded-[10px] px-5 py-3.5 text-[13px] text-foreground flex items-center gap-3 shadow-2xl backdrop-blur-xl max-w-[360px] animate-fade-up ${
          toast.type === "error" ? "border-destructive" : toast.type === "warn" ? "border-amber" : "border-emerald"
        }`}>
          <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
            toast.type === "error" ? "bg-destructive/15 text-destructive" : toast.type === "warn" ? "bg-amber/15 text-amber" : "bg-emerald/15 text-emerald"
          }`}>
            {toast.type === "error" ? "✕" : toast.type === "warn" ? "⚠" : "✦"}
          </div>
          <span className="leading-relaxed">{toast.msg}</span>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${collapsed ? "w-16 min-w-[64px]" : "w-[220px] min-w-[220px]"} bg-gradient-to-b from-abyss to-deep border-r border-border flex flex-col transition-all duration-300 shrink-0 relative z-20`}>
        <div className="px-4 pt-5 pb-4 border-b border-border overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg shrink-0 bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center text-sm text-primary-foreground font-black font-display">V</div>
            {!collapsed && (
              <div>
                <div className="font-display font-bold text-lg tracking-tight text-foreground">VORTEX</div>
                <div className="text-[8px] text-text-dim font-mono tracking-[2px]">ADMIN</div>
              </div>
            )}
          </div>
        </div>

        <nav className="p-2 flex-1 overflow-hidden">
          {TABS.map(t => (
            <button
              key={t.id} onClick={() => setTab(t.id)} title={collapsed ? t.label : ""}
              className={`w-full flex items-center gap-2.5 rounded-lg cursor-pointer mb-0.5 font-body font-semibold text-xs tracking-wide transition-all whitespace-nowrap overflow-hidden ${
                collapsed ? "py-2.5 justify-center" : "py-2.5 px-3"
              } ${tab === t.id ? "bg-primary-glow border border-primary-dim/25 text-primary" : "bg-transparent border border-transparent text-text-secondary hover:bg-surface hover:text-foreground"}`}
            >
              <span className="text-sm shrink-0">{t.icon}</span>
              {!collapsed && <span>{t.label}</span>}
              {!collapsed && tab === t.id && <div className="ml-auto w-1 h-1 rounded-full bg-primary" />}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-border">
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2.5 px-2.5 py-2">
              <UserAvatar initials={auth?.name?.slice(0, 2)} size={28} />
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="text-[11px] font-semibold text-foreground font-body truncate">{auth?.name?.split(" ")[0]}</div>
                <div className="text-[9px] text-text-dim font-mono">ADMIN</div>
              </div>
            </div>
          )}
          <div className="flex gap-1.5">
            <button onClick={() => setCollapsed(!collapsed)} className="flex-[0] px-2.5 py-[7px] rounded-[7px] border border-border bg-surface text-text-secondary cursor-pointer text-xs flex items-center justify-center">
              {collapsed ? "→" : "←"}
            </button>
            {!collapsed && (
              <button onClick={handleLogout} className="flex-1 py-[7px] rounded-[7px] bg-destructive-dim text-destructive border border-destructive/15 cursor-pointer font-body font-semibold text-[11px]">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col min-w-0">
        <div className="px-7 py-3.5 bg-gradient-to-r from-abyss/95 to-deep/95 border-b border-border flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="text-lg text-primary">{TABS.find(t => t.id === tab)?.icon}</span>
            <div className="font-body font-bold text-base">{TABS.find(t => t.id === tab)?.label}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald shadow-[0_0_10px_hsl(var(--emerald))]" />
            <span className="text-[10px] text-emerald font-mono tracking-wider">LIVE</span>
          </div>
        </div>

        <div className="p-8 flex-1 relative min-w-0">
          {tab === "dashboard" && <AdminDashboard notify={notify} />}
          {tab === "orders" && <AdminOrders notify={notify} />}
          {tab === "products" && <AdminProducts notify={notify} />}
          {tab === "categories" && <AdminCategories notify={notify} />}
          {tab === "users" && <AdminUsers notify={notify} />}
          {tab === "coupons" && <AdminCoupons notify={notify} />}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
