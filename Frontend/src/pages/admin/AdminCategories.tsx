import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/shared/GlassCard";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { VBtn } from "@/components/shared/VBtn";
import { VInput } from "@/components/shared/VInput";
import { Modal } from "@/components/shared/Modal";

const ACCENT_COLORS = ["text-primary", "text-sapphire", "text-emerald", "text-amber", "text-destructive"];

const AdminCategories = ({ notify }: { notify: (msg: string, type?: string) => void }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "" });

  const load = () => { setLoading(true); api.getCategories().then(setCategories).catch(e => notify(e.message, "error")).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setForm({ name: "", description: "", imageUrl: "" }); setEditingId(null); setCreating(true); };
  const openEdit = (cat: any) => { setForm({ name: cat.name || "", description: cat.description || "", imageUrl: cat.imageUrl || "" }); setEditingId(cat.id); setCreating(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { notify("Category name is required", "error"); return; }
    setSaving(true);
    try {
      if (editingId) await api.updateCategory(editingId, form); else await api.createCategory(form);
      notify(editingId ? "Category updated!" : "Category created! 🎉");
      setCreating(false); setEditingId(null); load();
    } catch (e: any) { notify(e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    try { await api.deleteCategory(id); notify("Category deleted"); setDeleteConfirm(null); load(); }
    catch (e: any) { notify(e.message, "error"); }
  };

  return (
    <div className="animate-fade-in">
      {creating && (
        <Modal title={editingId ? "Edit Category" : "New Category"} onClose={() => { setCreating(false); setEditingId(null); }}>
          <div className="flex flex-col gap-3.5">
            <VInput label="Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Smartphones" />
            <div>
              <label className="block text-[10px] text-text-dim font-mono tracking-[1.5px] uppercase mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" rows={3}
                className="w-full bg-surface border border-border rounded-lg px-3.5 py-2.5 text-foreground text-[13px] font-body outline-none resize-y focus:border-primary/30" />
            </div>
            <VInput label="Image URL" value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} placeholder="https://…" />
            {form.imageUrl && <img src={form.imageUrl} alt="" className="w-[60px] h-[60px] rounded-lg object-cover border border-border" onError={(e: any) => e.target.style.display = "none"} />}
            <div className="flex gap-2.5 pt-1.5 border-t border-border mt-1">
              <VBtn variant="primary" loading={saving} onClick={handleSave} icon={editingId ? "✎" : "+"}>{editingId ? "Save Changes" : "Create Category"}</VBtn>
              <VBtn variant="ghost" onClick={() => { setCreating(false); setEditingId(null); }}>Cancel</VBtn>
            </div>
          </div>
        </Modal>
      )}
      {deleteConfirm && (
        <Modal title="Confirm Delete" onClose={() => setDeleteConfirm(null)} width={380}>
          <div className="text-[13px] text-text-secondary mb-4 leading-relaxed">Delete <strong className="text-foreground">"{deleteConfirm.name}"</strong>? This may affect associated products.</div>
          <div className="bg-destructive-dim border border-destructive/15 rounded-lg px-3.5 py-2.5 text-[11px] text-destructive mb-[18px] font-mono">⚠ This cannot be undone</div>
          <div className="flex gap-2.5">
            <VBtn variant="danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</VBtn>
            <VBtn variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</VBtn>
          </div>
        </Modal>
      )}

      <div className="flex justify-between items-center mb-[18px]">
        <div className="text-[10px] text-text-dim font-mono tracking-[1.5px]">{categories.length} CATEGORIES</div>
        <VBtn variant="primary" icon="+" onClick={openCreate}>Add Category</VBtn>
      </div>

      {loading ? <div className="flex justify-center p-[60px]"><Spinner size={28} /></div> :
        categories.length === 0 ? <EmptyState icon="◫" title="No categories" sub="Create your first category" /> : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5">
            {categories.map((cat, i) => (
              <GlassCard key={cat.id} className="overflow-hidden animate-fade-up hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all cursor-default" style={{ animationDelay: `${i * 0.04}s` } as any}>
                <div className={`h-[3px] bg-gradient-to-r ${["from-primary", "from-sapphire", "from-emerald", "from-amber", "from-destructive"][i % 5]} to-transparent`} />
                <div className="p-4">
                  <div className="flex gap-3 mb-3 items-start">
                    <div className={`w-[46px] h-[46px] rounded-[10px] bg-surface border border-border flex items-center justify-center shrink-0 overflow-hidden`}>
                      {cat.imageUrl ? <img src={cat.imageUrl} alt="" className="w-full h-full object-cover" onError={(e: any) => e.target.style.display = "none"} /> : <span className={`text-xl ${ACCENT_COLORS[i % 5]}`}>◫</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-body font-bold text-sm mb-0.5 truncate">{cat.name}</div>
                      <div className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">{cat.description || "No description"}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-border pt-3">
                    <VBtn size="sm" variant="secondary" onClick={() => openEdit(cat)} icon="✎">Edit</VBtn>
                    <VBtn size="sm" variant="danger" onClick={() => setDeleteConfirm(cat)}>Delete</VBtn>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
    </div>
  );
};

export default AdminCategories;
