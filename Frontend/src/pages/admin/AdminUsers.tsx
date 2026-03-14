import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { VBtn } from "@/components/shared/VBtn";
import { Modal } from "@/components/shared/Modal";

const AdminUsers = ({ notify }: { notify: (msg: string, type?: string) => void }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewOrders, setViewOrders] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const load = async (q?: string) => {
    setLoading(true);
    try { const res = q ? await api.searchUsers(q) : await api.getAllUsers(); setUsers(res.content || res); }
    catch (e: any) { notify(e.message, "error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSearch = (q: string) => { setSearch(q); if (q.length > 1 || q === "") load(q.length > 1 ? q : undefined); };

  const openOrders = async (u: any) => {
    setViewOrders(u); setOrdersLoading(true);
    try { setUserOrders(await api.getOrdersByUser(u.id)); }
    catch (e: any) { notify(e.message, "error"); }
    finally { setOrdersLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      {viewOrders && (
        <Modal title={`Orders — ${viewOrders.firstName} ${viewOrders.lastName}`} onClose={() => setViewOrders(null)} width={600}>
          {ordersLoading ? <div className="flex justify-center p-8"><Spinner /></div> :
            userOrders.length === 0 ? <EmptyState icon="◎" title="No orders yet" /> :
              userOrders.map(o => (
                <div key={o.id} className="bg-surface rounded-[10px] px-3.5 py-3 mb-2 border border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-mono text-[11px] text-primary mb-0.5">{o.orderNumber}</div>
                      <div className="text-[11px] text-text-dim">{o.createdAt?.slice(0, 10)} · {o.orderItems?.length || 0} items</div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <StatusBadge status={o.status} />
                      <div className="font-display font-bold text-base">₹{(o.totalAmount || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
        </Modal>
      )}

      <div className="mb-4">
        <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search by name or email…"
          className="bg-surface border border-border rounded-lg px-3.5 py-[9px] text-foreground text-[13px] font-body outline-none w-[340px] focus:border-primary/30" />
      </div>

      <GlassCard className="overflow-hidden">
        {loading ? <div className="flex justify-center p-12"><Spinner size={28} /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[560px]">
              <thead>
                <tr className="bg-deep border-b border-border">
                  {["User", "Role", "Status", "Joined", "Actions"].map(h => (
                    <th key={h} className="px-3.5 py-2.5 text-left text-[9px] text-text-dim font-mono tracking-[1.5px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-border/15 transition-all hover:bg-raised">
                    <td className="px-3.5 py-[11px]">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar initials={(u.firstName?.[0] || "") + (u.lastName?.[0] || "")} size={30} variant={u.role === "ADMIN" ? "primary" : "sapphire"} />
                        <div>
                          <div className="font-body font-semibold text-[13px]">{u.firstName} {u.lastName}</div>
                          <div className="text-[10px] text-text-dim">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-[11px]"><StatusBadge status={u.role} /></td>
                    <td className="px-3.5 py-[11px]"><StatusBadge status={u.isActive ? "active" : "inactive"} /></td>
                    <td className="px-3.5 py-[11px] font-mono text-[10px] text-text-dim">{u.createdAt?.slice(0, 10)}</td>
                    <td className="px-3.5 py-[11px]">
                      <div className="flex gap-1.5">
                        <VBtn size="sm" variant="secondary" onClick={() => openOrders(u)}>Orders</VBtn>
                        {u.role !== "ADMIN" && <VBtn size="sm" variant={u.isActive ? "danger" : "success"} onClick={async () => { try { await api.toggleUserStatus(u.id, !u.isActive); notify(`User ${!u.isActive ? "activated" : "deactivated"}`); load(search.length > 1 ? search : undefined); } catch (e: any) { notify(e.message, "error"); } }}>{u.isActive ? "Ban" : "Unban"}</VBtn>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default AdminUsers;
