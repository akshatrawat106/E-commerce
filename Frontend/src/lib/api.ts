const BASE_URL = "http://localhost:8080/api";

class ApiClient {
  private _token: string | null = null;

  setToken(t: string) { this._token = t; }
  clearToken() { this._token = null; }

  async request(method: string, path: string, body?: unknown) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this._token) headers["Authorization"] = `Bearer ${this._token}`;
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data.data ?? data;
  }

  get = (p: string) => this.request("GET", p);
  post = (p: string, b?: unknown) => this.request("POST", p, b);
  put = (p: string, b?: unknown) => this.request("PUT", p, b);
  patch = (p: string, b?: unknown) => this.request("PATCH", p, b);
  delete = (p: string) => this.request("DELETE", p);

  // Auth
  login = (email: string, password: string) => this.post("/auth/login", { email, password });
  register = (data: { email: string; password: string; firstName: string; lastName: string }) => this.post("/auth/register", data);
  getMe = () => this.get("/auth/me");
  updateProfile = (data: { firstName: string; lastName: string; phone?: string }) => this.put("/auth/me", data);
  changePassword = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => this.post("/auth/change-password", data);

  // Products
  getProducts = () => this.get("/products");
  getFeatured = () => this.get("/products/featured");
  searchProducts = (q: string) => this.get(`/products/search?keyword=${encodeURIComponent(q)}`);
  getProductsByCategory = (id: number, page = 0) => this.get(`/products/category/${id}?page=${page}&size=12`);
  getProduct = (id: number) => this.get(`/products/${id}`);
  createProduct = (data: unknown) => this.post("/products", data);
  updateProduct = (id: number, data: unknown) => this.put(`/products/${id}`, data);
  deleteProduct = (id: number) => this.delete(`/products/${id}`);

  // Categories
  getCategories = () => this.get("/categories");
  createCategory = (data: unknown) => this.post("/categories", data);
  updateCategory = (id: number, data: unknown) => this.put(`/categories/${id}`, data);
  deleteCategory = (id: number) => this.delete(`/categories/${id}`);

  // Cart
  getCart = () => this.get("/cart");
  addToCart = (productId: number, quantity: number) => this.post("/cart/items", { productId, quantity });
  updateCartItem = (itemId: number, quantity: number) => this.patch(`/cart/items/${itemId}?quantity=${quantity}`);
  removeFromCart = (itemId: number) => this.delete(`/cart/items/${itemId}`);
  clearCart = () => this.delete("/cart");

  // Orders
  getMyOrders = () => this.get("/orders/my");
  getOrder = (id: number) => this.get(`/orders/${id}`);
  placeOrder = (data: unknown) => this.post("/orders", data);
  verifyPayment = (data: unknown) => this.post("/payments/verify", data);
  cancelOrder = (id: number) => this.patch(`/orders/${id}/cancel`);
  trackOrder = (num: string) => this.get(`/orders/track/${num}`);
  getAllOrders = (page = 0, size = 15, status?: string) => this.get(`/orders?page=${page}&size=${size}${status && status !== "ALL" ? `&status=${status}` : ""}`);
  updateOrderStatus = (id: number, status: string) => this.patch(`/orders/${id}/status?status=${status}`);
  updatePaymentStatus = (id: number, status: string) => this.patch(`/orders/${id}/payment-status?status=${status}`);
  updateShippingStatus = (id: number, status: string) => this.patch(`/orders/${id}/shipping-status?status=${status}`);
  getOrdersByUser = (userId: number) => this.get(`/orders/user/${userId}`);

  // Wishlist
  getWishlist = () => this.get("/wishlist");
  addToWishlist = (productId: number) => this.post(`/wishlist/${productId}`);
  removeFromWishlist = (productId: number) => this.delete(`/wishlist/${productId}`);
  checkWishlist = (productId: number) => this.get(`/wishlist/${productId}/check`);

  // Reviews
  getProductReviews = (productId: number) => this.get(`/reviews/product/${productId}`);
  getProductRating = (productId: number) => this.get(`/reviews/product/${productId}/rating`);
  submitReview = (productId: number, data: unknown) => this.post(`/reviews/product/${productId}`, data);
  deleteReview = (reviewId: number) => this.delete(`/reviews/${reviewId}`);

  // Coupons
  validateCoupon = (code: string, amount: number) => this.get(`/coupons/validate?code=${code}&orderAmount=${amount}`);
  getAllCoupons = () => this.get("/coupons");
  createCoupon = (data: unknown) => this.post("/coupons", data);
  deleteCoupon = (id: number) => this.delete(`/coupons/${id}`);
  toggleCoupon = (id: number, active: boolean) => this.patch(`/coupons/${id}/status?active=${active}`);

  // Admin
  getDashboard = () => this.get("/admin/dashboard");
  getLowStock = (t = 10) => this.get(`/admin/products/low-stock?threshold=${t}`);
  updateStock = (id: number, qty: number) => this.patch(`/admin/products/${id}/stock?quantity=${qty}`);
  toggleFeatured = (id: number, featured: boolean) => this.patch(`/admin/products/${id}/featured?featured=${featured}`);
  toggleProductActive = (id: number, active: boolean) => this.patch(`/admin/products/${id}/status?active=${active}`);

  // Users
  getAllUsers = (page = 0) => this.get(`/users?page=${page}&size=20`);
  searchUsers = (q: string) => this.get(`/users/search?query=${encodeURIComponent(q)}`);
  toggleUserStatus = (id: number, active: boolean) => this.patch(`/users/${id}/status?active=${active}`);
  updateUserRole = (id: number, role: string) => this.patch(`/users/${id}/role?role=${role}`);

  // Addresses
  getAddresses = () => this.get("/addresses");
  addAddress = (data: unknown) => this.post("/addresses", data);
  deleteAddress = (id: number) => this.delete(`/addresses/${id}`);
}

export const api = new ApiClient();
