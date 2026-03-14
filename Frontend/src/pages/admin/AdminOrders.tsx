import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { VBtn } from "@/components/shared/VBtn";
import { Modal } from "@/components/shared/Modal";

const AdminOrders = ({ notify }: { notify: (msg: string, type?: string) => void }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAllOrders(page, 15, statusFilter);
      setOrders(res.content || res);
      setTotalPages(res.totalPages || 0);
    } catch (e: any) { notify(e.message, "error"); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o =>
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const STATUSES = ["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

  if (selected) return <OrderDetail order={selected} onBack={() => { setSelected(null); load(); }} notify={notify} />;

  return (
    <div className="animate-fade-in">
      <div className="flex gap-2.5 mb-4 flex-wrap items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…"
          className="flex-1 bg-surface border border-border rounded-lg px-3.5 py-[9px] text-foreground text-[13px] font-body outline-none focus:border-primary/30 transition-colors" />
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`px-3.5 py-[9px] rounded-lg text-xs font-body font-semibold cursor-pointer transition-all ${statusFilter === s ? "bg-primary-glow text-primary border border-primary/25" : "bg-surface text-text-secondary border border-border hover:text-foreground"}`}>
            {s}
          </button>
        ))}
      </div>

      <GlassCard className="overflow-hidden">
        {loading ? <div className="flex justify-center p-12"><Spinner size={28} /></div> :
          filtered.length === 0 ? <EmptyState icon="◎" title="No orders found" /> : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-deep border-b border-border">
                    {["Order", "Customer", "Date", "Items", "Total", "Status", "Payment", ""].map(h => (
                      <th key={h} className="px-3.5 py-2.5 text-left text-[9px] text-text-dim font-mono tracking-[1.5px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => {
                    const fullName = `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim() || o.user?.email;
                    return (
                      <tr key={o.id} onClick={() => setSelected(o)} className="border-b border-border/15 cursor-pointer transition-all hover:bg-raised">
                        <td className="px-3.5 py-3"><span className="font-mono text-[11px] text-primary">{o.orderNumber}</span></td>
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-2">
                            <UserAvatar initials={(o.user?.firstName?.[0] || "") + (o.user?.lastName?.[0] || "")} size={26} variant="sapphire" />
                            <div>
                              <div className="text-xs font-semibold">{fullName}</div>
                              <div className="text-[10px] text-text-dim">{o.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 text-[10px] text-text-dim font-mono">{o.createdAt?.slice(0, 10)}</td>
                        <td className="px-3.5 py-3 text-xs text-text-secondary">{o.orderItems?.length || 0}</td>
                        <td className="px-3.5 py-3 font-display font-bold text-base text-foreground">₹{(o.totalAmount || 0).toLocaleString()}</td>
                        <td className="px-3.5 py-3"><StatusBadge status={o.status} /></td>
                        <td className="px-3.5 py-3"><StatusBadge status={o.paymentStatus} /></td>
                        <td className="px-3.5 py-3 text-text-dim text-sm">→</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </GlassCard>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-4">
          <VBtn size="sm" variant="secondary" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>← Prev</VBtn>
          <span className="px-3.5 py-1.5 font-mono text-[11px] text-text-secondary">Page {page + 1} / {totalPages}</span>
          <VBtn size="sm" variant="secondary" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next →</VBtn>
        </div>
      )}
    </div>
  );
};

const OrderDetail = ({ order: init, onBack, notify }: { order: any; onBack: () => void; notify: (msg: string, type?: string) => void }) => {
  const [order, setOrder] = useState(init);
  const [os, setOs] = useState(init.status);
  const [ps, setPs] = useState(init.paymentStatus);
  const [ss, setSs] = useState(init.shippingStatus);
  const [saving, setSaving] = useState(false);

  const apply = async () => {
    setSaving(true);
    try {
      let u = order;
      if (os !== order.status) u = await api.updateOrderStatus(order.id, os);
      if (ps !== order.paymentStatus) u = await api.updatePaymentStatus(order.id, ps);
      if (ss !== order.shippingStatus) u = await api.updateShippingStatus(order.id, ss);
      setOrder(u); notify("Order updated");
    } catch (e: any) { notify(e.message, "error"); }
    finally { setSaving(false); }
  };

  const dirty = os !== order.status || ps !== order.paymentStatus || ss !== order.shippingStatus;
  const fullName = `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3.5 mb-5">
        <VBtn size="sm" variant="secondary" onClick={onBack}>← Back</VBtn>
        <div>
          <div className="font-mono text-xs text-primary">{order.orderNumber}</div>
          <div className="text-[11px] text-text-dim mt-0.5">{order.createdAt?.slice(0, 16)}</div>
        </div>
        <StatusBadge status={order.status} size="md" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-[18px]">
          <div className="text-[9px] text-text-dim font-mono tracking-[2px] mb-3.5">CUSTOMER</div>
          <div className="flex gap-3 items-center mb-3">
            <UserAvatar initials={(order.user?.firstName?.[0] || "") + (order.user?.lastName?.[0] || "")} size={42} variant="sapphire" />
            <div>
              <div className="font-body font-bold text-[15px]">{fullName || "Unknown"}</div>
              <div className="text-xs text-text-secondary">{order.user?.email}</div>
            </div>
          </div>
          {order.notes && <div className="bg-deep rounded-lg px-3 py-2.5 text-xs text-text-secondary border-l-2 border-primary/25">{order.notes}</div>}
        </GlassCard>

        <GlassCard className="p-[18px]">
          <div className="text-[9px] text-text-dim font-mono tracking-[2px] mb-3.5">UPDATE STATUS</div>
          {[
            { label: "Order", val: os, set: setOs, opts: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] },
            { label: "Payment", val: ps, set: setPs, opts: ["PENDING", "PAID", "FAILED", "REFUNDED"] },
            { label: "Shipping", val: ss, set: setSs, opts: ["PENDING", "SHIPPED", "DELIVERED"] },
          ].map(({ label, val, set, opts }) => (
            <div key={label} className="mb-3">
              <div className="text-[9px] text-text-dim font-mono tracking-wider mb-1.5">{label}</div>
              <div className="flex gap-1 flex-wrap">
                {opts.map(o => (
                  <button key={o} onClick={() => set(o)}
                    className={`px-2.5 py-1 rounded-[5px] cursor-pointer text-[9px] font-mono tracking-wide transition-all ${val === o ? "bg-primary-glow text-primary border border-primary/25" : "bg-surface text-text-secondary border border-border"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <VBtn variant="primary" size="sm" loading={saving} disabled={!dirty} onClick={apply} className="mt-2">Apply Changes</VBtn>
        </GlassCard>

        <GlassCard className="col-span-2 overflow-hidden">
          <div className="px-4 py-3 border-b border-border font-body font-bold text-[13px]">Order Items</div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-deep">
                {["Product", "SKU", "Qty", "Unit Price", "Total"].map(h => (
                  <th key={h} className="px-3.5 py-2 text-left text-[9px] text-text-dim font-mono tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(order.orderItems || []).map((item: any, i: number) => (
                <tr key={i} className="border-t border-border/15">
                  <td className="px-3.5 py-2.5 text-[13px]">{item.productName}</td>
                  <td className="px-3.5 py-2.5 font-mono text-[10px] text-text-dim">{item.productSku}</td>
                  <td className="px-3.5 py-2.5 font-mono text-text-secondary">×{item.quantity}</td>
                  <td className="px-3.5 py-2.5 font-mono text-xs">₹{(item.unitPrice || 0).toLocaleString()}</td>
                  <td className="px-3.5 py-2.5 font-display font-bold text-base">₹{(item.totalPrice || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end gap-5 px-4 py-3.5 border-t border-border items-center">
            {[{ l: "Subtotal", v: order.subtotal }, { l: "Tax", v: order.taxAmount }, { l: "Shipping", v: order.shippingCost }].map(({ l, v }) => (
              <div key={l} className="text-right">
                <div className="text-[9px] text-text-dim font-mono tracking-wider">{l}</div>
                <div className="font-mono text-xs text-text-secondary">₹{(v || 0).toLocaleString()}</div>
              </div>
            ))}
            <div className="bg-primary-glow border border-primary/20 rounded-lg px-[18px] py-2.5 text-right">
              <div className="text-[9px] text-primary font-mono tracking-wider">TOTAL</div>
              <div className="font-display font-bold text-2xl text-primary">₹{(order.totalAmount || 0).toLocaleString()}</div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminOrders;
