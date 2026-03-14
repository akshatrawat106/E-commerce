import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { VBtn } from "@/components/shared/VBtn";
import { VInput } from "@/components/shared/VInput";
import { Modal } from "@/components/shared/Modal";

const AdminCoupons = ({ notify }: { notify: (msg: string, type?: string) => void }) => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: "", discountType: "PERCENTAGE", discountValue: "", minimumOrderAmount: "" });

  const load = () => { setLoading(true); api.getAllCoupons().then(setCoupons).catch(e => notify(e.message, "error")).finally(() => setLoading(false)); };
  useEffect(load, []);

  const create = async () => {
    try { await api.createCoupon({ ...form, discountValue: parseFloat(form.discountValue), minimumOrderAmount: parseFloat(form.minimumOrderAmount || "0") }); notify("Coupon created!"); setCreating(false); setForm({ code: "", discountType: "PERCENTAGE", discountValue: "", minimumOrderAmount: "" }); load(); }
    catch (e: any) { notify(e.message, "error"); }
  };

  return (
    <div className="animate-fade-in">
      {creating && (
        <Modal title="Create Coupon" onClose={() => setCreating(false)}>
          <div className="flex flex-col gap-3.5">
            <VInput label="Code" value={form.code} onChange={v => setForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="SAVE20" />
            <div>
              <label className="block text-[10px] text-text-dim font-mono tracking-[1.5px] mb-1.5">TYPE</label>
              <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} className="w-full bg-surface border border-border rounded-lg px-3.5 py-[11px] text-foreground text-[13px] outline-none">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
              </select>
            </div>
            <VInput label={form.discountType === "PERCENTAGE" ? "Discount %" : "Discount ₹"} value={form.discountValue} onChange={v => setForm(f => ({ ...f, discountValue: v }))} type="number" placeholder="20" />
            <VInput label="Min Order ₹" value={form.minimumOrderAmount} onChange={v => setForm(f => ({ ...f, minimumOrderAmount: v }))} type="number" placeholder="0" />
          </div>
          <div className="flex gap-2.5 mt-5">
            <VBtn variant="primary" onClick={create}>Create Coupon</VBtn>
            <VBtn variant="ghost" onClick={() => setCreating(false)}>Cancel</VBtn>
          </div>
        </Modal>
      )}

      <div className="flex justify-end mb-4">
        <VBtn variant="primary" icon="+" onClick={() => setCreating(true)}>New Coupon</VBtn>
      </div>

      {loading ? <div className="flex justify-center p-12"><Spinner size={28} /></div> :
        coupons.length === 0 ? <EmptyState icon="◇" title="No coupons" sub="Create your first discount coupon" /> : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
            {coupons.map((c, i) => (
              <GlassCard key={c.id} className={`p-[18px] animate-fade-up hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all cursor-default ${!c.isActive ? "opacity-55" : ""}`} style={{ animationDelay: `${i * 0.04}s` } as any}>
                <div className="flex justify-between items-start mb-3">
                  <div className="font-mono font-medium text-[15px] text-primary tracking-[2px]">{c.code}</div>
                  <StatusBadge status={c.isActive ? "active" : "inactive"} />
                </div>
                <div className="font-display font-bold text-[26px] text-foreground mb-1">
                  {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                </div>
                <div className="text-[11px] text-text-secondary mb-3.5">Min ₹{c.minimumOrderAmount || 0} · Used {c.usedCount || 0}× times</div>
                <VBtn size="sm" variant={c.isActive ? "danger" : "success"} onClick={async () => { try { await api.toggleCoupon(c.id, !c.isActive); load(); } catch (e: any) { notify(e.message, "error"); } }}>
                  {c.isActive ? "Deactivate" : "Activate"}
                </VBtn>
              </GlassCard>
            ))}
          </div>
        )}
    </div>
  );
};

export default AdminCoupons;
