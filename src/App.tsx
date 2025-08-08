import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import MobileErrorBoundary from "@/components/MobileErrorBoundary";
import { PageLoader } from "@/components/LoadingSpinner";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { CartProvider } from "@/contexts/CartContext";
import { SafeWebSocketProvider } from "@/contexts/SafeWebSocketContext";
import { ShoppingListProvider } from "@/contexts/ShoppingListContext";
import { AddressProvider } from "@/contexts/AddressContext";
import { ReviewsProvider } from "@/contexts/ReviewsContext";
import { PickupProvider } from "@/contexts/PickupContext";
import { FlashSalesProvider } from "@/contexts/FlashSalesContext";
import { EleventaProvider } from "@/contexts/EleventaContext";
import PermissionGuard from "@/components/PermissionGuard";
import AccessDenied from "@/components/AccessDenied";
import PerformanceOptimizer from "@/components/PerformanceOptimizer";
import { Toaster } from "@/components/ui/toaster";

// Emergency font reset on app load
if (typeof window !== 'undefined') {
  // Reset font scale immediately
  document.documentElement.style.setProperty('--font-scale', '1');
  // Clear any problematic localStorage values
  try {
    const savedFontSize = localStorage.getItem("fontSizePreference");
    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      if (size < 75 || size > 150) {
        localStorage.removeItem("fontSizePreference");
      }
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  // Remove font size classes
  document.body.classList.remove("font-size-small", "font-size-normal", "font-size-large", "font-size-xl");
}

// Core pages (loaded immediately)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Create a helper for lazy loading with error handling
const lazyWithErrorBoundary = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  componentName: string
) => {
  return lazy(() =>
    importFunc()
      .then((module) => {
        if (!module.default) {
          throw new Error(`Component ${componentName} does not have a default export`);
        }
        console.log(`✅ Successfully loaded component: ${componentName}`);
        return module;
      })
      .catch((error) => {
        console.error(`❌ Error loading component ${componentName}:`, error);

        // Check if it's a network error, syntax error, or missing export
        const errorType = error.message.includes('default export')
          ? 'Export Error'
          : error.message.includes('Unexpected token')
          ? 'Syntax Error'
          : 'Import Error';

        console.error(`Error type: ${errorType} in ${componentName}`);

        // Return a fallback component with detailed error info
        return {
          default: () => (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="text-center max-w-lg">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Error cargando: {componentName}
                </h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-700 text-sm font-mono">
                    {errorType}: {error.message}
                  </p>
                </div>
                <p className="text-gray-600 mb-4">
                  La página solicitada no se pudo cargar correctamente.
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors"
                >
                  Recargar página
                </button>
              </div>
            </div>
          )
        };
      })
  );
};

// Lazy loaded pages with error handling
const Favorites = lazyWithErrorBoundary(() => import("./pages/Favorites"), "Favorites");
const Shop = lazyWithErrorBoundary(() => import("./pages/Shop"), "Shop");
const Categories = lazyWithErrorBoundary(() => import("./pages/Categories"), "Categories");
const Offers = lazyWithErrorBoundary(() => import("./pages/Offers"), "Offers");
const Cart = lazyWithErrorBoundary(() => import("./pages/Cart"), "Cart");
const Login = lazyWithErrorBoundary(() => import("./pages/Login"), "Login");
const Register = lazyWithErrorBoundary(() => import("./pages/Register"), "Register");
const ForgotPassword = lazyWithErrorBoundary(() => import("./pages/ForgotPassword"), "ForgotPassword");
const Checkout = lazyWithErrorBoundary(() => import("./pages/Checkout"), "Checkout");
const Profile = lazyWithErrorBoundary(() => import("./pages/Profile"), "Profile");
const Orders = lazyWithErrorBoundary(() => import("./pages/Orders"), "Orders");
const Settings = lazyWithErrorBoundary(() => import("./pages/Settings"), "Settings");
const Help = lazyWithErrorBoundary(() => import("./pages/Help"), "Help");
const Contact = lazyWithErrorBoundary(() => import("./pages/Contact"), "Contact");
const Terms = lazyWithErrorBoundary(() => import("./pages/Terms"), "Terms");
const Privacy = lazyWithErrorBoundary(() => import("./pages/Privacy"), "Privacy");
const NewProducts = lazyWithErrorBoundary(() => import("./pages/NewProducts"), "NewProducts");

// Admin pages (lazy loaded)
const Admin = lazyWithErrorBoundary(() => import("./pages/Admin"), "Admin");
const Inventory = lazyWithErrorBoundary(() => import("./pages/Inventory"), "Inventory");
const POS = lazyWithErrorBoundary(() => import("./pages/POS"), "POS");
const Reports = lazyWithErrorBoundary(() => import("./pages/Reports"), "Reports");
const Employees = lazyWithErrorBoundary(() => import("./pages/Employees"), "Employees");
const Clients = lazyWithErrorBoundary(() => import("./pages/Clients"), "Clients");
const SystemConfig = lazyWithErrorBoundary(() => import("./pages/SystemConfig"), "SystemConfig");
const DatabaseTest = lazyWithErrorBoundary(() => import("./pages/DatabaseTest"), "DatabaseTest");
const WeightAwarePOS = lazyWithErrorBoundary(() => import("./pages/WeightAwarePOS"), "WeightAwarePOS");
const CategoriesMigration = lazyWithErrorBoundary(() => import("./pages/CategoriesMigration"), "CategoriesMigration");
const CategoriesAdmin = lazyWithErrorBoundary(() => import("./pages/CategoriesAdmin"), "CategoriesAdmin");
const AppTest = lazyWithErrorBoundary(() => import("./pages/AppTest"), "AppTest");

// User onboarding pages (lazy loaded)
const TutorialPrimerPedido = lazyWithErrorBoundary(() => import("./pages/TutorialPrimerPedido"), "TutorialPrimerPedido");
const GestionarPerfil = lazyWithErrorBoundary(() => import("./pages/GestionarPerfil"), "GestionarPerfil");
const SeguimientoPedidos = lazyWithErrorBoundary(() => import("./pages/SeguimientoPedidos"), "SeguimientoPedidos");
const ProgramaLealtad = lazyWithErrorBoundary(() => import("./pages/ProgramaLealtad"), "ProgramaLealtad");
const Addresses = lazyWithErrorBoundary(() => import("./pages/Addresses"), "Addresses");

const queryClient = new QueryClient();

const App = () => (
  <MobileErrorBoundary>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <FavoritesProvider>
              <CartProvider>
                <ShoppingListProvider>
                  <AddressProvider>
                    <ReviewsProvider>
                      <PickupProvider>
                        <FlashSalesProvider>
                          <EleventaProvider autoConnect={false} autoSync={false}>
                            <SafeWebSocketProvider>
                              <Toaster />
                              <Sonner />
                              <BrowserRouter>
                                <PerformanceOptimizer>
                                  <Suspense fallback={<PageLoader />}>
                                    <Routes>
                                      <Route path="/" element={<Index />} />
                                      <Route path="/shop" element={<Shop />} />
                                      <Route path="/categories" element={<Categories />} />
                                      <Route path="/offers" element={<Offers />} />
                                      <Route path="/new" element={<NewProducts />} />
                                      <Route path="/cart" element={<Cart />} />
                                      <Route path="/favorites" element={<Favorites />} />
                                      <Route path="/login" element={<Login />} />
                                      <Route path="/register" element={<Register />} />
                                      <Route path="/forgot-password" element={<ForgotPassword />} />
                                      <Route path="/checkout" element={<Checkout />} />
                                      <Route path="/profile" element={<Profile />} />
                                      <Route path="/orders" element={<Orders />} />
                                      <Route path="/settings" element={<Settings />} />
                                      <Route path="/help" element={<Help />} />
                                      <Route path="/contact" element={<Contact />} />
                                      <Route path="/tutorial-primer-pedido" element={<TutorialPrimerPedido />} />
                                      <Route path="/gestionar-perfil" element={<GestionarPerfil />} />
                                      <Route path="/seguimiento-pedidos" element={<SeguimientoPedidos />} />
                                      <Route path="/programa-lealtad" element={<ProgramaLealtad />} />
                                      <Route path="/terms" element={<Terms />} />
                                      <Route path="/privacy" element={<Privacy />} />
                                      <Route path="/addresses" element={<Addresses />} />
                                      <Route path="/app-test" element={<AppTest />} />
                                      
                                      {/* Admin routes with permission guards */}
                                      <Route
                                        path="/admin"
                                        element={
                                          <PermissionGuard
                                            permission="admin:access"
                                            fallback={<AccessDenied requiredPermission="admin:access" />}
                                          >
                                            <Admin />
                                          </PermissionGuard>
                                        }
                                      />
                                      <Route
                                        path="/inventory"
                                        element={
                                          <PermissionGuard
                                            permission="inventory:manage"
                                            fallback={<AccessDenied requiredPermission="inventory:manage" />}
                                          >
                                            <Inventory />
                                          </PermissionGuard>
                                        }
                                      />
                                      <Route
                                        path="/pos"
                                        element={
                                          <PermissionGuard
                                            permission="sales:access"
                                            fallback={<AccessDenied requiredPermission="sales:access" />}
                                          >
                                            <POS />
                                          </PermissionGuard>
                                        }
                                      />
                                      <Route
                                        path="/weight-pos"
                                        element={
                                          <PermissionGuard
                                            permission="sales:access"
                                            fallback={<AccessDenied requiredPermission="sales:access" />}
                                          >
                                            <WeightAwarePOS />
                                          </PermissionGuard>
                                        }
                                      />
                                      <Route
                                        path="/reports"
                                        element={
                                          <PermissionGuard
                                            permission="reports:view"
                                            fallback={<AccessDenied requiredPermission="reports:view" />}
                                          >
                                            <Reports />
                                          </PermissionGuard>
                                        }
                                      />
                                      <Route
                                        path="/employees"
                                        element={
                                          <PermissionGuard
                                            permission="employees:manage"
                                            fallback={<AccessDenied requiredPermission="employees:manage" />}
                                          >
                                            <Employees />
                                          </PermissionGuard>
                                        }
                                      />
                                      <Route
                                        path="/clients"
                                        element={
                                          <PermissionGuard
                                            permission="clients:view"
                                            fallback={<AccessDenied requiredPermission="clients:view" />}
                                          >
                                            <Clients />
                                          </PermissionGuard>
                                        }
                                      />
                                      <Route
                                        path="/system-config"
                                        element={
                                          <PermissionGuard
                                            permission="system:configure"
                                            fallback={<AccessDenied requiredPermission="system:configure" />}
                                          >
                                            <SystemConfig />
                                          </PermissionGuard>
                                        }
                                      />
                                      <Route
                                        path="/database-test"
                                        element={
                                          <PermissionGuard
                                            permission="system:test"
                                            fallback={<AccessDenied requiredPermission="system:test" />}
                                          >
                                            <DatabaseTest />
                                          </PermissionGuard>
                                        }
                                      />
                                      <Route
                                        path="/categories-migration"
                                        element={
                                          <PermissionGuard
                                            permission="inventory:manage"
                                            fallback={<AccessDenied requiredPermission="inventory:manage" />}
                                          >
                                            <CategoriesMigration />
                                          </PermissionGuard>
                                        }
                                      />
                                      <Route
                                        path="/categories-admin"
                                        element={
                                          <PermissionGuard
                                            permission="inventory:manage"
                                            fallback={<AccessDenied requiredPermission="inventory:manage" />}
                                          >
                                            <CategoriesAdmin />
                                          </PermissionGuard>
                                        }
                                      />
                                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                                      <Route path="*" element={<NotFound />} />
                                    </Routes>
                                  </Suspense>
                                </PerformanceOptimizer>
                              </BrowserRouter>
                            </SafeWebSocketProvider>
                          </EleventaProvider>
                        </FlashSalesProvider>
                      </PickupProvider>
                    </ReviewsProvider>
                  </AddressProvider>
                </ShoppingListProvider>
              </CartProvider>
            </FavoritesProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </MobileErrorBoundary>
);

export default App;
