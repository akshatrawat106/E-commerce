import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { VBtn } from "@/components/shared/VBtn";
import { VInput } from "@/components/shared/VInput";
import { Modal } from "@/components/shared/Modal";

const AdminProducts = ({ notify }: { notify: (msg: string, type?: string) => void }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockModal, setStockModal] = useState<any>(null);
  const [newStock, setNewStock] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", sku: "", price: "", comparePrice: "", description: "", categoryId: "", quantity: "", imageUrl: "", isFeatured: false, isActive: true });
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); api.getProducts().then(setProducts).catch(e => notify(e.message, "error")).finally(() => setLoading(false)); };
  useEffect(load, []);
  useEffect(() => { if (addModal) api.getCategories().then(setCategories).catch(() => {}); }, [addModal]);

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));
  const setF = (k: string, v: any) => setAddForm(f => ({ ...f, [k]: v }));

  const submitProduct = async () => {
    if (!addForm.name.trim() || !addForm.sku.trim() || !addForm.price || !addForm.quantity) { notify("Fill required fields", "error"); return; }
    setSaving(true);
    try {
      await api.createProduct({ name: addForm.name.trim(), sku: addForm.sku.trim().toUpperCase(), price: parseFloat(addForm.price), comparePrice: addForm.comparePrice ? parseFloat(addForm.comparePrice) : undefined, description: addForm.description.trim(), categoryId: addForm.categoryId ? parseInt(addForm.categoryId) : undefined, quantity: parseInt(addForm.quantity), imageUrl: addForm.imageUrl || undefined, isFeatured: addForm.isFeatured, isActive: addForm.isActive });
      notify("Product created! 🎉"); setAddModal(false); load();
    } catch (e: any) { notify(e.message, "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-fade-in">
      {stockModal && (
        <Modal title={`Update Stock — ${stockModal.name}`} onClose={() => setStockModal(null)}>
          <div className="mb-3.5 text-[13px] text-text-secondary">Current stock: <strong className="text-foreground">{stockModal.quantity}</strong></div>
          <VInput label="New Quantity" value={newStock} onChange={setNewStock} type="number" placeholder="e.g. 50" />
          <div className="flex gap-2.5 mt-4">
            <VBtn variant="primary" onClick={async () => { try { await api.updateStock(stockModal.id, parseInt(newStock)); notify("Stock updated"); setStockModal(null); load(); } catch (e: any) { notify(e.message, "error"); } }}>Update</VBtn>
            <VBtn variant="ghost" onClick={() => setStockModal(null)}>Cancel</VBtn>
          </div>
        </Modal>
      )}

      {addModal && (
        <Modal title="Add New Product" onClose={() => setAddModal(false)} width={600}>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <VInput label="Name *" value={addForm.name} onChange={v => setF("name", v)} placeholder="USB-C Hub Pro" />
              <VInput label="SKU *" value={addForm.sku} onChange={v => setF("sku", v.toUpperCase())} placeholder="UCH-001" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <VInput label="Price ₹ *" value={addForm.price} onChange={v => setF("price", v)} type="number" placeholder="1999" />
              <VInput label="Compare Price ₹" value={addForm.comparePrice} onChange={v => setF("comparePrice", v)} type="number" placeholder="2499" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-text-dim font-mono tracking-[1.5px] uppercase mb-1.5">Category</label>
                <select value={addForm.categoryId} onChange={e => setF("categoryId", e.target.value)} className="w-full bg-surface border border-border rounded-lg px-3.5 py-[11px] text-foreground text-[13px] outline-none font-body">
                  <option value="">— No category —</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <VInput label="Stock *" value={addForm.quantity} onChange={v => setF("quantity", v)} type="number" placeholder="100" />
            </div>
            <div>
              <label className="block text-[10px] text-text-dim font-mono tracking-[1.5px] uppercase mb-1.5">Description</label>
              <textarea value={addForm.description} onChange={e => setF("description", e.target.value)} placeholder="Product description…" rows={3} className="w-full bg-surface border border-border rounded-lg px-3.5 py-2.5 text-foreground text-[13px] outline-none font-body resize-y focus:border-primary/30" />
            </div>
            <VInput label="Image URL" value={addForm.imageUrl} onChange={v => setF("imageUrl", v)} placeholder="https://…" />
            <div className="flex gap-2.5">
              {[{ k: "isFeatured", l: "Featured ⭐", c: "amber" }, { k: "isActive", l: "Active ✓", c: "emerald" }].map(({ k, l, c }) => (
                <button key={k} onClick={() => setF(k, !(addForm as any)[k])}
                  className={`px-4 py-2 rounded-lg border cursor-pointer font-body font-semibold text-xs transition-all ${(addForm as any)[k] ? `bg-${c}-dim text-${c} border-${c}/25` : "bg-surface text-text-secondary border-border"}`}>{l}</button>
              ))}
            </div>
            <div className="flex gap-2.5 pt-1.5 border-t border-border mt-1">
              <VBtn variant="primary" loading={saving} onClick={submitProduct}>Add Product</VBtn>
              <VBtn variant="ghost" onClick={() => setAddModal(false)}>Cancel</VBtn>
            </div>
          </div>
        </Modal>
      )}

      <div className="flex gap-2.5 mb-4 items-center">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or SKU…"
          className="flex-1 bg-surface border border-border rounded-lg px-3.5 py-[9px] text-foreground text-[13px] font-body outline-none focus:border-primary/30" />
        <VBtn variant="primary" icon="+" onClick={() => setAddModal(true)}>Add Product</VBtn>
      </div>

      <GlassCard className="overflow-hidden">
        {loading ? <div className="flex justify-center p-12"><Spinner size={28} /></div> :
          filtered.length === 0 ? <EmptyState icon="◧" title="No products found" /> : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[680px]">
                <thead>
                  <tr className="bg-deep border-b border-border">
                    {["Product", "SKU", "Price", "Stock", "Status", "Actions"].map(h => (
                      <th key={h} className="px-3.5 py-2.5 text-left text-[9px] text-text-dim font-mono tracking-[1.5px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-border/15 transition-all hover:bg-raised">
                      <td className="px-3.5 py-[11px]">
                        <div className="flex items-center gap-2.5">
                          {p.imageUrl && <img src={p.imageUrl} alt="" className="w-[34px] h-[34px] object-cover rounded-md border border-border shrink-0" onError={(e: any) => e.target.style.display = "none"} />}
                          <div>
                            <div className="font-body font-semibold text-[13px]">{p.name}</div>
                            {p.isFeatured && <span className="text-[9px] text-amber font-mono">FEATURED</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-[11px] font-mono text-[10px] text-text-dim">{p.sku}</td>
                      <td className="px-3.5 py-[11px]">
                        <div className="font-display font-bold text-[15px]">₹{(p.price || 0).toLocaleString()}</div>
                        {p.comparePrice && <div className="text-[10px] text-text-dim line-through">₹{p.comparePrice.toLocaleString()}</div>}
                      </td>
                      <td className="px-3.5 py-[11px]">
                        <span className={`font-mono text-[13px] font-medium ${p.quantity === 0 ? "text-destructive" : p.quantity < 10 ? "text-amber" : "text-emerald"}`}>
                          {p.quantity === 0 ? "OUT" : p.quantity}
                        </span>
                      </td>
                      <td className="px-3.5 py-[11px]"><StatusBadge status={p.isActive ? "active" : "inactive"} /></td>
                      <td className="px-3.5 py-[11px]">
                        <div className="flex gap-1.5">
                          <VBtn size="sm" variant="secondary" onClick={() => { setStockModal(p); setNewStock(String(p.quantity || 0)); }}>Stock</VBtn>
                          <VBtn size="sm" variant={p.isFeatured ? "ghost" : "success"} onClick={async () => { try { await api.toggleFeatured(p.id, !p.isFeatured); load(); } catch (e: any) { notify(e.message, "error"); } }}>{p.isFeatured ? "Unfeature" : "Feature"}</VBtn>
                          <VBtn size="sm" variant={p.isActive ? "danger" : "success"} onClick={async () => { try { await api.toggleProductActive(p.id, !p.isActive); load(); } catch (e: any) { notify(e.message, "error"); } }}>{p.isActive ? "Disable" : "Enable"}</VBtn>
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

export default AdminProducts;
