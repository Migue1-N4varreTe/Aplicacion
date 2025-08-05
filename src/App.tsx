import { Toaster } from "@/components/ui/toaster";
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
import PermissionGuard from "@/components/PermissionGuard";
import AccessDenied from "@/components/AccessDenied";

// Core pages (loaded immediately)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Helper function for lazy loading with error handling
const lazyWithErrorBoundary = (importFunc: () => Promise<any>, componentName: string = "Unknown") => {
  return lazy(() =>
    importFunc()
      .then((module) => {
        // Validate that the module has a default export
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
                <div className="space-y-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 mr-4"
                  >
                    Recargar página
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                  >
                    Ir al inicio
                  </button>
                </div>
              </div>
            </div>
          ),
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

// User onboarding pages (lazy loaded)
const TutorialPrimerPedido = lazyWithErrorBoundary(() => import("./pages/TutorialPrimerPedido"), "TutorialPrimerPedido");
const GestionarPerfil = lazyWithErrorBoundary(() => import("./pages/GestionarPerfil"), "GestionarPerfil");
const SeguimientoPedidos = lazyWithErrorBoundary(() => import("./pages/SeguimientoPedidos"), "SeguimientoPedidos");
const ProgramaLealtad = lazyWithErrorBoundary(() => import("./pages/ProgramaLealtad"), "ProgramaLealtad");

const queryClient = new QueryClient();

const App = () => (
  <MobileErrorBoundary>
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <SafeWebSocketProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-500 mx-auto mb-4"></div>
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">Cargando página...</h2>
                        <p className="text-gray-500">Por favor espera un momento</p>
                      </div>
                    </div>
                  }>
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
                      <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                      />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route
                        path="/tutorial-primer-pedido"
                        element={<TutorialPrimerPedido />}
                      />
                      <Route
                        path="/gestionar-perfil"
                        element={<GestionarPerfil />}
                      />
                      <Route
                        path="/seguimiento-pedidos"
                        element={<SeguimientoPedidos />}
                      />
                      <Route
                        path="/programa-lealtad"
                        element={<ProgramaLealtad />}
                      />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route
                        path="/admin"
                        element={
                          <PermissionGuard
                            permission="staff:view"
                            fallback={
                              <AccessDenied requiredPermission="staff:view" />
                            }
                          >
                            <Admin />
                          </PermissionGuard>
                        }
                      />
                      <Route
                        path="/inventory"
                        element={
                          <PermissionGuard
                            permission="inventory:view"
                            fallback={
                              <AccessDenied requiredPermission="inventory:view" />
                            }
                          >
                            <Inventory />
                          </PermissionGuard>
                        }
                      />
                      <Route
                        path="/pos"
                        element={
                          <PermissionGuard
                            permission="sales:create"
                            fallback={
                              <AccessDenied requiredPermission="sales:create" />
                            }
                          >
                            <POS />
                          </PermissionGuard>
                        }
                      />
                      <Route
                        path="/reports"
                        element={
                          <PermissionGuard
                            permission="reports:view"
                            fallback={
                              <AccessDenied requiredPermission="reports:view" />
                            }
                          >
                            <Reports />
                          </PermissionGuard>
                        }
                      />
                      <Route
                        path="/employees"
                        element={
                          <PermissionGuard
                            permission="staff:view"
                            fallback={
                              <AccessDenied requiredPermission="staff:view" />
                            }
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
                            fallback={
                              <AccessDenied requiredPermission="clients:view" />
                            }
                          >
                            <Clients />
                          </PermissionGuard>
                        }
                      />
                      <Route
                        path="/system-config"
                        element={
                          <PermissionGuard
                            permission="system:config"
                            fallback={
                              <AccessDenied requiredPermission="system:config" />
                            }
                          >
                            <SystemConfig />
                          </PermissionGuard>
                        }
                      />
                      <Route
                        path="/database-test"
                        element={<DatabaseTest />}
                      />
                      <Route
                        path="/pos-weight"
                        element={
                          <PermissionGuard
                            permission="sales:create"
                            fallback={
                              <AccessDenied requiredPermission="sales:create" />
                            }
                          >
                            <WeightAwarePOS />
                          </PermissionGuard>
                        }
                      />
                      <Route
                        path="/categories-migration"
                        element={
                          <PermissionGuard
                            permission="inventory:manage"
                            fallback={
                              <AccessDenied requiredPermission="inventory:manage" />
                            }
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
                            fallback={
                              <AccessDenied requiredPermission="inventory:manage" />
                            }
                          >
                            <CategoriesAdmin />
                          </PermissionGuard>
                        }
                      />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </SafeWebSocketProvider>
            </CartProvider>
          </FavoritesProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  </MobileErrorBoundary>
);

export default App;
