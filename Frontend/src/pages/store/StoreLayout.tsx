import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Spinner } from "@/components/shared/Spinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { VBtn } from "@/components/shared/VBtn";
import { VInput } from "@/components/shared/VInput";
import { AmbientOrbs, GridPattern, GoldDivider } from "@/components/shared/Decorative";
import { Modal } from "@/components/shared/Modal";

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
const ProductCard = ({ product: p, index, onAdd, inWishlist, onWishlist }: any) => {
  const [hov, setHov] = useState(false);
  const [adding, setAdding] = useState(false);
  const discount = p.comparePrice ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100) : 0;
  const handleAdd = async () => { setAdding(true); try { await onAdd(p); } finally { setAdding(false); } };

  return (
    <div className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 8) * 0.06}s` }}>
      <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        className={`bg-gradient-to-br border rounded-[14px] overflow-hidden transition-all duration-300 ${hov ? "from-raised to-surface border-primary/20 -translate-y-1 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_30px_hsl(var(--primary-glow))]" : "from-surface to-deep border-border shadow-[0_4px_16px_rgba(0,0,0,0.2)]"}`}>
        <div className={`relative px-6 pt-8 pb-6 text-center overflow-hidden ${hov ? "bg-raised" : "bg-surface"}`}>
          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className={`w-[90px] h-[90px] object-contain relative z-[1] transition-transform duration-300 ${hov ? "scale-[1.08]" : ""}`} /> : <div className="text-[64px] leading-none relative z-[1]">🛍️</div>}
          {p.isFeatured && <div className="absolute top-2.5 left-2.5 bg-gradient-to-br from-primary to-primary-dim text-primary-foreground text-[8px] font-mono font-semibold tracking-[1.5px] px-2 py-0.5 rounded">FEATURED</div>}
          {discount > 0 && <div className="absolute bottom-2.5 right-2.5 bg-emerald-dim text-emerald text-[9px] px-2 py-0.5 rounded font-mono border border-emerald/15">-{discount}%</div>}
          {onWishlist && (
            <button onClick={(e) => { e.stopPropagation(); onWishlist(p.id); }} className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-[7px] border flex items-center justify-center text-[13px] cursor-pointer transition-all ${inWishlist ? "bg-destructive-dim border-destructive/25 text-destructive" : "bg-surface border-border text-text-dim"}`}>
              {inWishlist ? "♥" : "♡"}
            </button>
          )}
        </div>
        <div className="px-4 pt-3.5 pb-4">
          <div className="text-[9px] text-text-dim font-mono tracking-[1.5px] mb-1.5 uppercase">{p.category?.name || p.categoryName || "Uncategorized"}</div>
          <div className="font-body font-bold text-sm mb-3 leading-snug min-h-[38px] text-foreground">{p.name}</div>
          <div className="flex items-end justify-between">
            <div>
              <div className="font-display font-bold text-xl text-foreground">₹{(p.price || 0).toLocaleString()}</div>
              {p.comparePrice && <div className="text-[11px] text-text-dim line-through mt-0.5">₹{p.comparePrice.toLocaleString()}</div>}
            </div>
            <button onClick={handleAdd} disabled={adding || p.quantity === 0}
              className={`rounded-[9px] px-3.5 py-2 font-body font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 hover:scale-[1.02] ${p.quantity === 0 ? "bg-surface border border-border text-text-dim opacity-50 cursor-not-allowed" : hov ? "bg-gradient-to-br from-primary to-primary-dim text-primary-foreground border-none shadow-[0_6px_20px_hsl(var(--primary-glow-strong))]" : "bg-raised border border-border-bright text-foreground"}`}>
              {adding ? <Spinner size={12} /> : p.quantity === 0 ? "Out of Stock" : "Add +"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
const CartDrawer = ({ cart, onClose, onCartChange, notify }: any) => {
  const [items, setItems] = useState(cart);
  const [loadingItem, setLoadingItem] = useState<number | null>(null);
  const [step, setStep] = useState("cart");
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<any>(null);
  const [placing, setPlacing] = useState(false);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [errors, setErrors] = useState<any>({});
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addr, setAddr] = useState({ type: "SHIPPING", firstName: "", lastName: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "India", phone: "", isDefault: false });

  useEffect(() => { setItems(cart); }, [cart]);
  useEffect(() => {
    if (step !== "checkout") return;
    setLoadingAddresses(true);
    api.getAddresses().then(res => {
      const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setSavedAddresses(list);
      const def = list.find((a: any) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
      else if (list.length > 0) setSelectedAddressId(list[0].id);
    }).catch(() => setSavedAddresses([])).finally(() => setLoadingAddresses(false));
  }, [step]);

  const subtotal = items.reduce((a: number, b: any) => a + (b.unitPrice || b.price || 0) * (b.quantity || 1), 0);
  const discount = couponResult?.discountAmount || 0;
  const shipping = 10;
  const total = subtotal - discount + shipping;

  const update = async (itemId: number, qty: number) => {
    if (loadingItem === itemId) return;
    setLoadingItem(itemId);
    try {
      if (qty <= 0) { setItems((prev: any[]) => prev.filter(i => i.id !== itemId)); await api.removeFromCart(itemId); }
      else { setItems((prev: any[]) => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i)); await api.updateCartItem(itemId, qty); }
      await onCartChange();
    } catch (e: any) { notify(e.message, "error"); await onCartChange(); }
    finally { setLoadingItem(null); }
  };

  const validateCoupon = async () => {
    try { const r = await api.validateCoupon(couponCode, subtotal); setCouponResult(r); notify(`Coupon applied! Save ₹${r.discountAmount}`); }
    catch (e: any) { setCouponResult(null); notify(e.message, "error"); }
  };

  const placeOrder = async () => {
    const e: any = {};
    if (selectedAddressId === null) {
      if (!addr.addressLine1.trim()) e.addressLine1 = "Required";
      if (!addr.city.trim()) e.city = "Required";
      if (!addr.country.trim()) e.country = "Required";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) { notify("Please provide a shipping address", "error"); return; }
    setPlacing(true);
    try {
      let shippingAddressId = selectedAddressId;
      if (selectedAddressId === null) {
        const saved = await api.addAddress(addr);
        shippingAddressId = (saved as any)?.id || (saved as any)?.data?.id;
      }
      const orderRes = await api.placeOrder({ shippingAddressId, notes: notes || null, paymentMethod }) as any;
      if (paymentMethod === "RAZORPAY" && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay({
          key: orderRes.razorpayKey, amount: orderRes.totalAmount * 100, currency: orderRes.currency || "INR",
          name: "VORTEX ECOMMERCE", description: `Payment for Order #${orderRes.orderNumber}`, order_id: orderRes.razorpayOrderId,
          handler: async (response: any) => {
            try { await api.verifyPayment({ razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature }); notify("Payment successful! 🎉"); await onCartChange(); onClose(); }
            catch (err: any) { notify("Payment verification failed: " + err.message, "error"); }
          },
          theme: { color: "#C9A84C" }
        });
        rzp.open();
      } else { notify("Order placed! 🎉"); await onCartChange(); onClose(); }
    } catch (e: any) { notify(e.message, "error"); }
    finally { setPlacing(false); }
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-void/85 z-[200] backdrop-blur-sm animate-fade-in" />
      <div className="fixed right-0 top-0 bottom-0 w-[min(480px,100vw)] bg-gradient-to-b from-abyss to-deep border-l border-border z-[201] flex flex-col h-screen animate-slide-right">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="px-[22px] py-4 border-b border-border flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {step === "checkout" && <button onClick={() => setStep("cart")} className="bg-surface border border-border text-text-secondary rounded-[7px] w-7 h-7 cursor-pointer text-[13px] flex items-center justify-center">←</button>}
            <div className="font-display font-bold text-xl tracking-tight">{step === "cart" ? "Your Cart" : "Checkout"}</div>
          </div>
          <button onClick={onClose} className="bg-surface border border-border rounded-[7px] w-7 h-7 cursor-pointer text-sm text-text-secondary flex items-center justify-center">✕</button>
        </div>

        {step === "cart" && (
          <>
            <div className="flex-1 overflow-auto px-[22px] py-3.5">
              {items.length === 0 ? <EmptyState icon="◈" title="Your cart is empty" sub="Browse the shop and add some products" /> :
                items.map((item: any) => (
                  <div key={item.id} className={`flex gap-3 mb-2.5 bg-surface border border-border rounded-[10px] px-3.5 py-3 transition-opacity ${loadingItem === item.id ? "opacity-60" : ""}`}>
                    {item.productImage && <img src={item.productImage} alt="" className="w-11 h-11 object-cover rounded-lg border border-border shrink-0" onError={(e: any) => e.target.style.display = "none"} />}
                    <div className="flex-1 min-w-0">
                      <div className="font-body font-semibold text-[13px] mb-0.5 truncate">{item.productName || item.name}</div>
                      <div className="text-[11px] text-text-dim font-mono">₹{(item.unitPrice || item.price || 0).toLocaleString()} × {item.quantity || 1}</div>
                      <div className="font-display font-bold text-base text-primary mt-0.5">₹{((item.unitPrice || item.price || 0) * (item.quantity || 1)).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button onClick={() => update(item.id, (item.quantity || 1) + 1)} className="w-6 h-6 rounded-[5px] bg-raised border border-border text-foreground cursor-pointer text-sm flex items-center justify-center">+</button>
                      <span className="font-mono text-xs min-w-[18px] text-center text-text-secondary">{loadingItem === item.id ? <Spinner size={11} /> : item.quantity || 1}</span>
                      <button onClick={() => update(item.id, (item.quantity || 1) - 1)} className="w-6 h-6 rounded-[5px] bg-raised border border-border text-text-dim cursor-pointer text-sm flex items-center justify-center">−</button>
                    </div>
                  </div>
                ))}
            </div>
            {items.length > 0 && (
              <div className="px-[22px] py-3.5 border-t border-border shrink-0">
                <div className="flex gap-2 mb-3.5">
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="COUPON CODE" className={`flex-1 bg-surface border rounded-lg px-3 py-2 text-foreground text-[11px] font-mono tracking-wider outline-none ${couponResult ? "border-emerald/25" : "border-border"}`} />
                  <VBtn size="sm" variant={couponResult ? "success" : "secondary"} onClick={validateCoupon} disabled={!couponCode}>{couponResult ? "✓ Applied" : "Apply"}</VBtn>
                </div>
                <div className="bg-surface border border-border rounded-[10px] px-3.5 py-3 mb-3.5">
                  {[{ label: "Subtotal", val: `₹${subtotal.toLocaleString()}` }, ...(discount > 0 ? [{ label: "Discount", val: `-₹${discount.toLocaleString()}`, color: "text-emerald" }] : []), { label: "Shipping", val: `₹${shipping}` }].map(({ label, val, color }: any) => (
                    <div key={label} className="flex justify-between mb-2 text-xs">
                      <span className="text-text-dim font-mono tracking-wide text-[10px]">{label}</span>
                      <span className={`font-mono ${color || "text-text-secondary"}`}>{val}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2.5 mt-1 flex justify-between items-center">
                    <span className="font-mono text-[10px] text-text-dim tracking-wider">TOTAL</span>
                    <span className="font-display font-bold text-[22px] text-primary">₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <button onClick={() => setStep("checkout")} className="w-full bg-gradient-to-br from-primary to-primary-dim border-none rounded-[10px] py-3.5 text-primary-foreground font-body font-bold text-sm cursor-pointer tracking-wide shadow-[0_8px_30px_hsl(var(--primary-glow-strong))] active:scale-[0.97] hover:from-primary-bright hover:to-primary transition-all">
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </>
        )}

        {step === "checkout" && (
          <>
            <div className="flex-1 overflow-auto px-[22px] py-4">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3.5">
                  <div className="w-[18px] h-[18px] rounded-[5px] bg-primary-glow border border-primary/25 flex items-center justify-center text-[9px] text-primary font-mono">1</div>
                  <div className="font-body font-bold text-[13px]">Shipping Address</div>
                </div>
                {loadingAddresses ? <div className="flex justify-center p-5"><Spinner size={20} /></div> : (
                  <>
                    {savedAddresses.map((a: any) => (
                      <button key={a.id} onClick={() => setSelectedAddressId(a.id)} className={`w-full flex gap-2.5 px-3.5 py-[11px] rounded-[10px] border cursor-pointer mb-2 text-left transition-all ${selectedAddressId === a.id ? "border-primary/35 bg-primary-glow" : "border-border bg-surface"}`}>
                        <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 mt-0.5 transition-all ${selectedAddressId === a.id ? "border-primary bg-primary" : "border-text-dim bg-transparent"}`} />
                        <div className="flex-1">
                          <div className="font-body font-semibold text-xs text-foreground mb-0.5">{a.firstName} {a.lastName}{a.isDefault && <span className="text-[8px] bg-emerald-dim text-emerald rounded px-1.5 py-0.5 ml-1.5 font-mono">DEFAULT</span>}</div>
                          <div className="text-[11px] text-text-dim leading-relaxed">{a.addressLine1}, {a.city} — {a.postalCode}</div>
                        </div>
                      </button>
                    ))}
                    <button onClick={() => setSelectedAddressId(null)} className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border cursor-pointer mb-2.5 transition-all ${selectedAddressId === null ? "border-primary/35 bg-primary-glow" : "border-border bg-surface"}`}>
                      <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${selectedAddressId === null ? "border-primary bg-primary" : "border-text-dim bg-transparent"}`} />
                      <span className={`font-body font-semibold text-xs ${selectedAddressId === null ? "text-primary" : "text-text-secondary"}`}>+ Use a new address</span>
                    </button>
                    {selectedAddressId === null && (
                      <div className="bg-surface border border-border rounded-[10px] p-3.5 flex flex-col gap-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <VInput label="First Name" value={addr.firstName} onChange={v => setAddr(a => ({ ...a, firstName: v }))} placeholder="Rahul" />
                          <VInput label="Last Name" value={addr.lastName} onChange={v => setAddr(a => ({ ...a, lastName: v }))} placeholder="Sharma" />
                        </div>
                        <VInput label="Address Line 1 *" value={addr.addressLine1} onChange={v => setAddr(a => ({ ...a, addressLine1: v }))} placeholder="123 MG Road" error={errors.addressLine1} />
                        <VInput label="Address Line 2" value={addr.addressLine2} onChange={v => setAddr(a => ({ ...a, addressLine2: v }))} placeholder="Apt 4B" />
                        <div className="grid grid-cols-2 gap-2">
                          <VInput label="City *" value={addr.city} onChange={v => setAddr(a => ({ ...a, city: v }))} placeholder="Mumbai" error={errors.city} />
                          <VInput label="State" value={addr.state} onChange={v => setAddr(a => ({ ...a, state: v }))} placeholder="Maharashtra" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <VInput label="Postal Code" value={addr.postalCode} onChange={v => setAddr(a => ({ ...a, postalCode: v }))} placeholder="400001" />
                          <VInput label="Country *" value={addr.country} onChange={v => setAddr(a => ({ ...a, country: v }))} placeholder="India" error={errors.country} />
                        </div>
                        <VInput label="Phone" value={addr.phone} onChange={v => setAddr(a => ({ ...a, phone: v }))} placeholder="+91 98765 43210" />
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="mb-5">
                <div className="font-mono text-[9px] text-text-dim tracking-[1.5px] mb-2">ORDER NOTES (OPTIONAL)</div>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special delivery instructions…" rows={2} className="w-full bg-surface border border-border rounded-lg px-3 py-[9px] text-foreground text-xs outline-none resize-none font-body focus:border-primary/30" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <div className="w-[18px] h-[18px] rounded-[5px] bg-primary-glow border border-primary/25 flex items-center justify-center text-[9px] text-primary font-mono">2</div>
                  <div className="font-body font-bold text-[13px]">Payment Method</div>
                </div>
                <div className="flex flex-col gap-2">
                  {[{ id: "RAZORPAY", label: "Pay with Razorpay", sub: "Cards, UPI, Net Banking", icon: "💳" }, { id: "COD", label: "Cash on Delivery", sub: "Pay when your order arrives", icon: "💵" }].map(pm => (
                    <button key={pm.id} onClick={() => setPaymentMethod(pm.id)} className={`w-full flex items-center gap-3 px-3.5 py-[11px] rounded-[10px] cursor-pointer text-left transition-all border ${paymentMethod === pm.id ? "bg-primary-glow border-primary/35" : "bg-surface border-border hover:border-border-bright"}`}>
                      <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-all ${paymentMethod === pm.id ? "border-primary bg-primary" : "border-text-dim bg-transparent"}`} />
                      <div className={`w-[34px] h-[34px] rounded-lg border flex items-center justify-center text-base shrink-0 ${paymentMethod === pm.id ? "bg-primary/15 border-primary/20" : "bg-raised border-border"}`}>{pm.icon}</div>
                      <div className="flex-1">
                        <div className={`font-body font-semibold text-xs transition-colors ${paymentMethod === pm.id ? "text-primary" : "text-foreground"}`}>{pm.label}</div>
                        <div className="text-[10px] text-text-dim mt-0.5 font-mono">{pm.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-[22px] py-3.5 border-t border-border shrink-0">
              <div className="bg-surface border border-border rounded-[10px] px-3.5 py-2.5 mb-3">
                <div className="flex justify-between items-center border-t-0">
                  <span className="font-mono text-[9px] text-text-dim tracking-wider">TOTAL</span>
                  <span className="font-display font-bold text-[22px] text-primary">₹{total.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={placeOrder} disabled={placing} className="w-full bg-gradient-to-br from-primary to-primary-dim border-none rounded-[10px] py-3.5 text-primary-foreground font-body font-bold text-sm cursor-pointer flex items-center justify-center gap-2 tracking-wide shadow-[0_8px_30px_hsl(var(--primary-glow-strong))] disabled:opacity-50 disabled:cursor-not-allowed">
                {placing ? <><Spinner size={15} />Processing…</> : `Confirm Order · ₹${total.toLocaleString()}`}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
const HomePage = ({ setPage, notify, onCartChange }: any) => {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getFeatured(), api.getCategories()])
      .then(([f, c]) => { setFeatured(f); setCategories(c); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const addToCart = async (p: any) => {
    try { await api.addToCart(p.id, 1); await onCartChange(); notify(`${p.name} added to cart`); }
    catch (e: any) { notify(e.message, "error"); }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="min-h-[90vh] w-full flex items-center relative overflow-hidden px-[5vw]">
        <AmbientOrbs intensity={0.05} />
        <GridPattern opacity={0.02} />
        <div className="relative z-[1] flex items-center justify-between w-full gap-[60px]">
          <div className="max-w-[620px]">
            <div className="animate-fade-up inline-flex items-center gap-2 bg-primary-glow border border-primary-dim/25 rounded-full px-4 py-1.5 mb-7">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
              <span className="text-[10px] text-primary font-mono tracking-[2px]">PREMIUM TECH ACCESSORIES</span>
            </div>
            <h1 className="animate-fade-up font-display font-bold text-[clamp(52px,7vw,96px)] leading-[0.88] tracking-tight mb-7" style={{ animationDelay: "0.06s" }}>
              The Future<br />Of<br /><span className="gold-shimmer">Technology</span>
            </h1>
            <p className="animate-fade-up text-base text-text-secondary max-w-[440px] leading-[1.75] mb-10 font-light" style={{ animationDelay: "0.12s" }}>
              Curated precision instruments for the modern professional. Every product engineered to perfection.
            </p>
            <div className="animate-fade-up flex gap-3.5" style={{ animationDelay: "0.18s" }}>
              <button onClick={() => setPage("shop")} className="bg-gradient-to-br from-primary to-primary-dim text-primary-foreground border-none rounded-xl px-9 py-[15px] font-body font-bold text-sm cursor-pointer tracking-wide shadow-[0_10px_40px_hsl(var(--primary-glow-strong))] hover:from-primary-bright hover:to-primary active:scale-[0.97] transition-all">Explore Collection →</button>
              <button onClick={() => setPage("orders")} className="bg-transparent text-text-secondary border border-border rounded-xl px-8 py-[15px] font-body font-semibold text-sm cursor-pointer tracking-wide hover:border-border-bright hover:text-foreground transition-all">Track Order</button>
            </div>
          </div>
          <div className="animate-fade-up flex flex-col gap-3.5 shrink-0" style={{ animationDelay: "0.12s" }}>
            {[{ val: "2,400+", label: "Products", icon: "◧", color: "text-primary" }, { val: "98%", label: "Satisfaction", icon: "◎", color: "text-emerald" }, { val: "24h", label: "Delivery", icon: "◈", color: "text-sapphire" }].map((s, i) => (
              <GlassCard key={i} className="px-[22px] py-4 min-w-[160px]" style={{ animation: `floatBob ${4 + i}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}>
                <div className={`text-base mb-2 ${s.color}`}>{s.icon}</div>
                <div className="font-display font-bold text-[28px] text-foreground leading-none">{s.val}</div>
                <div className="text-[10px] text-text-dim font-mono tracking-[1.5px] mt-1">{s.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="px-[5vw] py-[60px]">
          <div className="mb-7">
            <div className="font-mono text-[9px] text-primary tracking-[3px] mb-2">◆ COLLECTIONS</div>
            <h2 className="font-display font-bold text-[40px] tracking-tight">Browse by Category</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.slice(0, 8).map((cat: any, i: number) => (
              <button key={cat.id} onClick={() => setPage("shop")} className="shrink-0 bg-primary-glow/50 border border-primary/20 rounded-[10px] px-[18px] py-2.5 cursor-pointer flex items-center gap-2 transition-all hover:bg-primary/15 hover:border-primary/40">
                {cat.imageUrl && <img src={cat.imageUrl} alt="" className="w-5 h-5 rounded object-cover" onError={(e: any) => e.target.style.display = "none"} />}
                <span className="font-body font-semibold text-[13px] text-foreground whitespace-nowrap">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-[5vw] pt-5 pb-20">
        <div className="flex justify-between items-end mb-7">
          <div>
            <div className="font-mono text-[9px] text-primary tracking-[3px] mb-2">◆ CURATED</div>
            <h2 className="font-display font-bold text-[40px] tracking-tight">Featured Products</h2>
          </div>
          <button onClick={() => setPage("shop")} className="bg-transparent border-none text-primary font-body font-semibold cursor-pointer text-[13px] flex items-center gap-1 tracking-wide">View All →</button>
        </div>
        {loading ? <div className="flex justify-center p-[60px]"><Spinner size={32} /></div> :
          featured.length === 0 ? <EmptyState icon="◧" title="No featured products" /> : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {featured.slice(0, 6).map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} onAdd={addToCart} />)}
            </div>
          )}
      </div>
    </div>
  );
};

// ─── SHOP PAGE ────────────────────────────────────────────────────────────────
const ShopPage = ({ notify, onCartChange }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const searchTimer = useCallback(() => {}, []);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories(), api.getWishlist()])
      .then(([prods, cats, wl]) => { setProducts(prods); setCategories(cats); setWishlistIds((wl || []).map((w: any) => w.id || w.product?.id)); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (v.length > 1) setTimeout(async () => { try { setProducts(await api.searchProducts(v)); } catch {} }, 400);
    else if (v === "") api.getProducts().then(setProducts).catch(() => {});
  };

  const handleCat = async (catId: number | null) => {
    setCatFilter(catId);
    if (!catId) { api.getProducts().then(setProducts).catch(() => {}); return; }
    try { const res = await api.getProductsByCategory(catId); setProducts(res.content || res); } catch {}
  };

  const addToCart = async (p: any) => {
    try { await api.addToCart(p.id, 1); await onCartChange(); notify(`${p.name} added to cart`); }
    catch (e: any) { notify(e.message, "error"); }
  };

  const toggleWishlist = async (productId: number) => {
    try {
      if (wishlistIds.includes(productId)) { await api.removeFromWishlist(productId); setWishlistIds(p => p.filter(x => x !== productId)); notify("Removed from wishlist"); }
      else { await api.addToWishlist(productId); setWishlistIds(p => [...p, productId]); notify("Added to wishlist ♥"); }
    } catch (e: any) { notify(e.message, "error"); }
  };

  return (
    <div className="px-[5vw] pt-10 pb-20 w-full">
      <div className="mb-8">
        <div className="font-mono text-[9px] text-primary tracking-[3px] mb-2">◆ CATALOGUE</div>
        <h1 className="animate-fade-up font-display font-bold text-[56px] tracking-tight leading-none">All Products</h1>
        <div className="animate-fade-up text-[13px] text-text-secondary mt-2" style={{ animationDelay: "0.06s" }}>{products.length} items available</div>
      </div>
      <div className="animate-fade-up flex gap-2.5 mb-7 flex-wrap items-center" style={{ animationDelay: "0.06s" }}>
        <div className="relative flex-[1_1_280px] max-w-[440px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim text-xs">⌕</span>
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search products…" className="w-full bg-surface border border-border rounded-[10px] px-3.5 py-2.5 pl-8 text-foreground text-[13px] font-body outline-none focus:border-primary/30" />
        </div>
        <button onClick={() => handleCat(null)} className={`px-[18px] py-[9px] rounded-lg cursor-pointer text-xs font-body font-semibold transition-all ${!catFilter ? "bg-primary-glow text-primary border border-primary/25" : "bg-surface text-text-secondary border border-border"}`}>All</button>
        {categories.map((c: any) => (
          <button key={c.id} onClick={() => handleCat(c.id)} className={`px-[18px] py-[9px] rounded-lg cursor-pointer text-xs font-body font-semibold transition-all ${catFilter === c.id ? "bg-primary-glow text-primary border border-primary/25" : "bg-surface text-text-secondary border border-border"}`}>{c.name}</button>
        ))}
      </div>
      {loading ? <div className="flex justify-center p-20"><Spinner size={36} /></div> :
        products.length === 0 ? <EmptyState icon="⌕" title="No products found" sub="Try a different search or category" /> : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {products.map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} onAdd={addToCart} inWishlist={wishlistIds.includes(p.id)} onWishlist={toggleWishlist} />)}
          </div>
        )}
    </div>
  );
};

// ─── ORDERS PAGE ──────────────────────────────────────────────────────────────
const OrdersPage = ({ notify }: any) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);
  const [trackNum, setTrackNum] = useState("");
  const [tracked, setTracked] = useState<any>(null);

  useEffect(() => { api.getMyOrders().then(setOrders).catch((e: any) => notify(e.message, "error")).finally(() => setLoading(false)); }, []);

  const cancel = async (id: number) => {
    setCancelling(true);
    try { const u = await api.cancelOrder(id); setOrders(p => p.map(o => o.id === id ? u : o)); setSelected(u); notify("Order cancelled"); }
    catch (e: any) { notify(e.message, "error"); }
    finally { setCancelling(false); }
  };

  const track = async () => { try { setTracked(await api.trackOrder(trackNum)); } catch (e: any) { notify(e.message, "error"); } };

  if (loading) return <div className="flex justify-center p-[100px]"><Spinner size={32} /></div>;

  return (
    <div className="px-[5vw] pt-10 pb-20 w-full">
      <div className="font-mono text-[9px] text-primary tracking-[3px] mb-2">◆ HISTORY</div>
      <h1 className="animate-fade-up font-display font-bold text-[52px] tracking-tight mb-1.5">My Orders</h1>
      <div className="animate-fade-up text-[13px] text-text-secondary mb-7" style={{ animationDelay: "0.06s" }}>{orders.length} orders</div>

      <div className="animate-fade-up flex gap-2.5 mb-7" style={{ animationDelay: "0.06s" }}>
        <input value={trackNum} onChange={e => setTrackNum(e.target.value)} placeholder="Enter order number to track…" className="flex-1 max-w-[400px] bg-surface border border-border rounded-[10px] px-3.5 py-2.5 text-foreground text-[13px] font-mono outline-none focus:border-primary/30" />
        <VBtn variant="secondary" onClick={track}>Track →</VBtn>
      </div>

      {tracked && (
        <GlassCard className="px-[18px] py-3.5 mb-[18px] border-primary/15">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-mono text-[11px] text-primary mb-1">{tracked.orderNumber}</div>
              <div className="text-[11px] text-text-dim">{tracked.createdAt?.slice(0, 10)}</div>
            </div>
            <div className="flex gap-2"><StatusBadge status={tracked.status} /><StatusBadge status={tracked.shippingStatus} /></div>
          </div>
        </GlassCard>
      )}

      {selected ? (
        <div className="animate-fade-in">
          <button onClick={() => setSelected(null)} className="bg-surface border border-border text-text-secondary rounded-lg px-3.5 py-[7px] cursor-pointer font-mono text-[10px] tracking-wider mb-[18px]">← ALL ORDERS</button>
          <GlassCard className="overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-gradient-to-r from-primary-glow to-transparent">
              <div>
                <div className="font-mono text-primary text-xs mb-0.5">{selected.orderNumber}</div>
                <div className="text-[11px] text-text-dim">{selected.createdAt?.slice(0, 10)}</div>
              </div>
              <div className="flex gap-2"><StatusBadge status={selected.status} size="md" /><StatusBadge status={selected.paymentStatus} size="md" /></div>
            </div>
            <div className="px-5 py-4">
              {(selected.orderItems || []).map((item: any, i: number) => (
                <div key={i} className="flex justify-between py-2.5 border-b border-border/15">
                  <span className="text-sm font-body">{item.productName} <span className="text-text-dim">×{item.quantity}</span></span>
                  <span className="font-display font-bold text-base">₹{(item.totalPrice || 0).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <div className="bg-primary-glow border border-primary/20 rounded-lg px-[18px] py-2.5 text-right">
                  <div className="text-[9px] text-primary font-mono tracking-wider">TOTAL</div>
                  <div className="font-display font-bold text-2xl text-primary">₹{(selected.totalAmount || 0).toLocaleString()}</div>
                </div>
              </div>
              {(selected.status === "PENDING" || selected.status === "PROCESSING") && (
                <div className="mt-3.5"><VBtn variant="danger" loading={cancelling} onClick={() => cancel(selected.id)}>Cancel Order</VBtn></div>
              )}
            </div>
          </GlassCard>
        </div>
      ) : orders.length === 0 ? <EmptyState icon="◎" title="No orders yet" sub="Place your first order from the shop" /> : (
        <div className="flex flex-col gap-2.5">
          {orders.map((o, i) => (
            <div key={o.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => setSelected(o)}>
              <GlassCard className="px-[18px] py-3.5 cursor-pointer transition-all hover:border-primary/20 hover:translate-x-1">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-mono text-[11px] text-primary mb-0.5">{o.orderNumber}</div>
                    <div className="text-[11px] text-text-dim mb-1">{o.createdAt?.slice(0, 10)} · {o.orderItems?.length || 0} items</div>
                    {o.orderItems?.length > 0 && <div className="text-xs text-text-secondary">{o.orderItems.map((i: any) => i.productName).join(", ")}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-xl mb-1.5">₹{(o.totalAmount || 0).toLocaleString()}</div>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── WISHLIST PAGE ────────────────────────────────────────────────────────────
const WishlistPage = ({ notify, onCartChange }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => { api.getWishlist().then((wl: any) => setItems(wl || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const remove = async (productId: number) => { try { await api.removeFromWishlist(productId); load(); notify("Removed from wishlist"); } catch (e: any) { notify(e.message, "error"); } };
  const addToCart = async (p: any) => { try { await api.addToCart(p.id, 1); await onCartChange(); notify(`${p.name} added to cart`); } catch (e: any) { notify(e.message, "error"); } };

  if (loading) return <div className="flex justify-center p-[100px]"><Spinner size={32} /></div>;

  return (
    <div className="px-[5vw] pt-10 pb-20 w-full">
      <div className="font-mono text-[9px] text-primary tracking-[3px] mb-2">◆ SAVED</div>
      <h1 className="animate-fade-up font-display font-bold text-[52px] tracking-tight mb-1.5">Wishlist</h1>
      <div className="animate-fade-up text-[13px] text-text-secondary mb-7" style={{ animationDelay: "0.06s" }}>{items.length} saved items</div>
      {items.length === 0 ? <EmptyState icon="♡" title="Nothing saved yet" sub="Browse products and tap the heart icon to save them" /> : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {items.map((item: any, i: number) => { const p = item.product || item; return <ProductCard key={p.id} product={p} index={i} onAdd={addToCart} inWishlist={true} onWishlist={() => remove(p.id)} />; })}
        </div>
      )}
    </div>
  );
};

// ─── ACCOUNT PAGE ─────────────────────────────────────────────────────────────
const AccountPage = ({ user, notify, onLogout }: any) => {
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ")[1] || "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try { await api.updateProfile({ firstName, lastName, phone }); notify("Profile updated!"); }
    catch (e: any) { notify(e.message, "error"); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (newPass !== confirmPass) { notify("Passwords don't match", "error"); return; }
    setChangingPass(true);
    try { await api.changePassword({ currentPassword: oldPass, newPassword: newPass, confirmPassword: confirmPass }); notify("Password changed!"); setOldPass(""); setNewPass(""); setConfirmPass(""); }
    catch (e: any) { notify(e.message, "error"); }
    finally { setChangingPass(false); }
  };

  return (
    <div className="px-[5vw] pt-10 pb-20 w-full">
      <div className="font-mono text-[9px] text-primary tracking-[3px] mb-2">◆ SETTINGS</div>
      <h1 className="animate-fade-up font-display font-bold text-[52px] tracking-tight mb-7">My Account</h1>

      <GlassCard className="p-6 mb-4 animate-fade-up" style={{ animationDelay: "0.06s" }}>
        <div className="flex items-center gap-3.5 mb-5">
          <UserAvatar initials={(user?.name || "??").slice(0, 2)} size={48} />
          <div>
            <div className="font-body font-bold text-base">{user?.name}</div>
            <div className="text-xs text-text-secondary">{user?.email}</div>
          </div>
        </div>
        <GoldDivider />
        <div className="mt-[18px] flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <VInput label="First Name" value={firstName} onChange={setFirstName} />
            <VInput label="Last Name" value={lastName} onChange={setLastName} />
          </div>
          <VInput label="Email (read-only)" value={user?.email || ""} readOnly />
          <VInput label="Phone" value={phone} onChange={setPhone} placeholder="+91 98765 43210" />
          <VBtn variant="primary" loading={saving} onClick={saveProfile} className="self-start">Save Profile</VBtn>
        </div>
      </GlassCard>

      <GlassCard className="p-6 mb-4 animate-fade-up" style={{ animationDelay: "0.12s" }}>
        <div className="font-body font-bold text-sm mb-[18px]">Change Password</div>
        <div className="flex flex-col gap-3 mb-4">
          <VInput label="Current Password" value={oldPass} onChange={setOldPass} type="password" />
          <VInput label="New Password" value={newPass} onChange={setNewPass} type="password" />
          <VInput label="Confirm Password" value={confirmPass} onChange={setConfirmPass} type="password" />
        </div>
        <VBtn variant="secondary" loading={changingPass} onClick={changePassword}>Update Password</VBtn>
      </GlassCard>

      <GlassCard className="px-6 py-5 animate-fade-up" style={{ animationDelay: "0.18s" }}>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-body font-bold text-sm mb-1">Sign Out</div>
            <div className="text-xs text-text-secondary">End your current session</div>
          </div>
          <VBtn variant="danger" onClick={onLogout}>Logout</VBtn>
        </div>
      </GlassCard>
    </div>
  );
};

// ─── USER STORE LAYOUT ────────────────────────────────────────────────────────
const StoreLayout = () => {
  const { auth, handleLogout } = useAuth();
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const notify = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const loadCart = useCallback(async () => {
    try {
      const res = await api.getCart();
      let items: any[] = [];
      if (Array.isArray(res)) items = res;
      else if (Array.isArray(res?.cartItems)) items = res.cartItems;
      else if (Array.isArray(res?.items)) items = res.items;
      else if (Array.isArray(res?.data?.cartItems)) items = res.data.cartItems;
      setCart(items);
    } catch (e) { console.error("loadCart error:", e); }
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  const safeCart = Array.isArray(cart) ? cart : [];
  const cartCount = safeCart.reduce((a, b) => a + (b.quantity || 1), 0);

  const NAV = [
    { id: "home", label: "Home" }, { id: "shop", label: "Shop" }, { id: "orders", label: "Orders" }, { id: "wishlist", label: "Wishlist" }, { id: "account", label: "Account" },
  ];

  return (
    <div className="min-h-screen w-full bg-void overflow-x-hidden">
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] bg-gradient-to-br from-raised to-surface border-l-[3px] rounded-[10px] px-5 py-3.5 text-[13px] text-foreground flex items-center gap-3 shadow-2xl backdrop-blur-xl max-w-[360px] animate-fade-up ${toast.type === "error" ? "border-destructive" : "border-emerald"}`}>
          <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${toast.type === "error" ? "bg-destructive/15 text-destructive" : "bg-emerald/15 text-emerald"}`}>
            {toast.type === "error" ? "✕" : "✦"}
          </div>
          <span className="leading-relaxed">{toast.msg}</span>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-[100] bg-abyss/95 backdrop-blur-xl border-b border-border px-[5vw] flex items-center h-16 w-full gap-0">
        <div onClick={() => setPage("home")} className="cursor-pointer mr-12 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center text-[13px] text-primary-foreground font-black font-display">V</div>
          <div className="font-display font-bold text-xl tracking-tight">VOR<span className="gold-shimmer">TEX</span></div>
        </div>
        <div className="flex gap-0.5">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              className={`rounded-lg px-3.5 py-[7px] cursor-pointer font-body font-semibold text-[13px] transition-all tracking-wide border ${page === n.id ? "bg-primary-glow border-primary-dim/25 text-primary" : "bg-transparent border-transparent text-text-secondary hover:text-foreground hover:bg-surface"}`}>
              {n.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2.5 items-center">
          <button onClick={() => setCartOpen(true)} className={`rounded-[10px] px-4 py-2 cursor-pointer font-body font-semibold text-[13px] flex items-center gap-2 transition-all border active:scale-95 ${cartCount > 0 ? "bg-primary-glow border-primary/25 text-primary" : "bg-surface border-border text-text-secondary"}`}>
            <span>◈</span><span>Cart</span>
            {cartCount > 0 && <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-extrabold">{cartCount}</span>}
          </button>
          <UserAvatar initials={(auth?.name || "??").slice(0, 2)} size={32} variant="sapphire" />
          <button onClick={handleLogout} className="bg-transparent border-none text-text-dim cursor-pointer text-[11px] font-mono tracking-wider">LOGOUT</button>
        </div>
      </nav>
      <div className="h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      {cartOpen && <CartDrawer cart={safeCart} onClose={() => setCartOpen(false)} onCartChange={loadCart} notify={notify} />}
      {page === "home" && <HomePage setPage={setPage} notify={notify} onCartChange={loadCart} />}
      {page === "shop" && <ShopPage notify={notify} onCartChange={loadCart} />}
      {page === "orders" && <OrdersPage notify={notify} />}
      {page === "wishlist" && <WishlistPage notify={notify} onCartChange={loadCart} />}
      {page === "account" && <AccountPage user={auth} notify={notify} onLogout={handleLogout} />}
    </div>
  );
};

export default StoreLayout;
