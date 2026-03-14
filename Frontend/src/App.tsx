import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AuthPage from "@/pages/AuthPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import StoreLayout from "@/pages/store/StoreLayout";

const AppContent = () => {
  const { auth } = useAuth();

  if (!auth) return <AuthPage />;
  if (auth.role?.toUpperCase().includes("ADMIN")) return <AdminLayout />;
  return <StoreLayout />;
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
