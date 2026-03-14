import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { AmbientOrbs, GridPattern, GoldDivider } from "@/components/shared/Decorative";
import { GlassCard } from "@/components/shared/GlassCard";
import { VInput } from "@/components/shared/VInput";
import { Spinner } from "@/components/shared/Spinner";

const AuthPage = () => {
  const { handleAuth } = useAuth();
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    setErr(""); setLoading(true);
    try {
      let data: any;
      if (tab === "login") data = await api.login(email, password);
      else data = await api.register({ email, password, firstName, lastName });
      const returnedRole = (data.role || "").toUpperCase();
      const isAdmin = returnedRole.includes("ADMIN");
      if (role === "admin" && !isAdmin) { setErr("These credentials belong to a customer account."); return; }
      if (role === "user" && isAdmin) { setErr("These credentials belong to an admin account."); return; }
      api.setToken(data.token);
      handleAuth({ token: data.token, role: data.role, userId: data.userId, name: `${data.firstName} ${data.lastName}`, email: data.email });
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  // Portal Selection
  if (!role) return (
    <div className="min-h-screen bg-void flex relative overflow-hidden">
      <AmbientOrbs intensity={0.05} />
      <GridPattern opacity={0.025} />

      {/* Left - Branding */}
      <div className="flex-1 flex flex-col justify-center px-[6vw] py-20 relative z-[1] animate-fade-in">
        <div className="mb-12">
          <div className="font-display text-[13px] text-primary tracking-[4px] mb-4 uppercase">Est. 2024</div>
          <h1 className="font-display font-bold text-[clamp(72px,8vw,110px)] leading-[0.88] tracking-tight text-foreground">
            VOR<span className="gold-shimmer">TEX</span>
          </h1>
          <div className="font-mono text-[11px] text-text-dim tracking-[4px] mt-3 uppercase">Next-Gen Tech Marketplace</div>
        </div>
        <div className="flex flex-col gap-4 max-w-[360px]">
          <p className="text-[13px] text-text-secondary leading-[1.8] font-light">
            Curated technology accessories for the discerning professional. Where precision meets elegance.
          </p>
          <GoldDivider />
          <div className="flex gap-6 mt-2">
            {[["2K+", "Products"], ["98%", "Satisfaction"], ["1-Day", "Delivery"]].map(([val, lbl]) => (
              <div key={lbl as string}>
                <div className="font-display text-[28px] font-bold text-primary leading-none">{val}</div>
                <div className="text-[10px] text-text-dim font-mono tracking-wider mt-1">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Portal Selector */}
      <div className="w-[460px] bg-gradient-to-b from-abyss to-deep border-l border-border flex flex-col justify-center px-[6vw] py-[60px] relative z-[1] animate-fade-up" style={{ animationDelay: "0.06s" }}>
        <div className="mb-10">
          <div className="font-mono text-[10px] text-primary tracking-[3px] uppercase mb-3">Select Portal</div>
          <div className="font-body text-2xl font-bold text-foreground">How will you enter?</div>
        </div>

        <div className="flex flex-col gap-3.5">
          {[
            { key: "user" as const, label: "Customer Portal", sub: "Shop, track orders, manage wishlist", icon: "◇", colorClass: "text-sapphire border-sapphire/20 bg-sapphire-dim hover:border-sapphire/40 hover:bg-sapphire/15", iconBg: "bg-sapphire/10 border-sapphire/20" },
            { key: "admin" as const, label: "Admin Console", sub: "Manage products, orders & analytics", icon: "◆", colorClass: "text-primary border-primary/20 bg-primary-glow hover:border-primary/40 hover:bg-primary/15", iconBg: "bg-primary/10 border-primary/20", prefill: true },
          ].map(r => (
            <button
              key={r.key}
              onClick={() => { setRole(r.key); if (r.prefill) { setEmail("admin@store.com"); setPassword("admin123"); } }}
              className={`rounded-xl p-5 cursor-pointer text-left flex items-center gap-4 transition-all duration-300 border hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] ${r.colorClass}`}
            >
              <div className={`w-12 h-12 rounded-[10px] border flex items-center justify-center text-xl shrink-0 ${r.iconBg}`}>{r.icon}</div>
              <div className="flex-1">
                <div className="font-body font-bold text-sm text-foreground">{r.label}</div>
                <div className="text-xs text-text-secondary mt-0.5 font-light">{r.sub}</div>
              </div>
              <div className="text-base">→</div>
            </button>
          ))}
        </div>

        <div className="mt-10 p-4 bg-surface/50 rounded-lg border border-border">
          <div className="text-[10px] text-text-dim font-mono tracking-wider mb-1">DEMO CREDENTIALS</div>
          <div className="text-[11px] text-text-secondary font-mono">Admin: admin@store.com / admin123</div>
        </div>
      </div>
    </div>
  );

  // Login/Register Form
  return (
    <div className="min-h-screen bg-void flex items-center justify-center relative overflow-hidden">
      <AmbientOrbs intensity={0.05} />
      <GridPattern opacity={0.02} />
      <div className="relative z-[1] w-full max-w-[460px] px-[5vw] animate-scale-in">
        <button onClick={() => { setRole(null); setErr(""); }} className="bg-surface border border-border rounded-lg px-3.5 py-[7px] cursor-pointer text-text-secondary font-mono text-[11px] tracking-wider mb-6 flex items-center gap-1.5 transition-all hover:border-border-bright hover:text-foreground">
          ← BACK
        </button>

        <div className="mb-8">
          <div className="font-display font-bold text-[40px] tracking-tight">VOR<span className="gold-shimmer">TEX</span></div>
          <div className="text-xs text-text-secondary mt-1 font-light">
            {role === "admin" ? "Administrator Access" : tab === "login" ? "Welcome back" : "Create your account"}
          </div>
        </div>

        <GlassCard className="p-7">
          {role === "user" && (
            <div className="flex bg-deep rounded-lg p-[3px] mb-6 border border-border">
              {(["login", "register"] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setErr(""); }}
                  className={`flex-1 py-2 rounded-md border-none cursor-pointer font-body font-semibold text-xs tracking-wide transition-all ${tab === t ? "bg-gradient-to-br from-primary to-primary-dim text-primary-foreground" : "bg-transparent text-text-secondary"}`}>
                  {t === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3.5">
            {tab === "register" && role === "user" && (
              <div className="grid grid-cols-2 gap-3">
                <VInput label="First Name" value={firstName} onChange={setFirstName} placeholder="Rahul" />
                <VInput label="Last Name" value={lastName} onChange={setLastName} placeholder="Sharma" />
              </div>
            )}
            <VInput label="Email Address" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
            <VInput label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
          </div>

          {err && (
            <div className="mt-3.5 text-xs text-destructive bg-destructive-dim border border-destructive/20 rounded-lg px-3.5 py-2.5 font-mono flex gap-2 items-center">
              <span>⚠</span><span>{err}</span>
            </div>
          )}

          <button
            onClick={handleSubmit} disabled={loading}
            className="w-full mt-5 bg-gradient-to-br from-primary to-primary-dim text-primary-foreground border-none rounded-lg py-3 font-body font-bold text-sm cursor-pointer flex items-center justify-center gap-2 tracking-wide shadow-[0_8px_30px_hsl(var(--primary-glow-strong))] transition-all hover:from-primary-bright hover:to-primary active:scale-[0.97] disabled:opacity-50 disabled:cursor-wait"
          >
            {loading ? <Spinner size={16} /> : null}
            {loading ? "Authenticating..." : tab === "login" ? "Enter Portal →" : "Create Account →"}
          </button>
        </GlassCard>
      </div>
    </div>
  );
};

export default AuthPage;
