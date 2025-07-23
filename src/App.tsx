import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
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

// Lazy loaded pages
const Favorites = lazy(() => import("./pages/Favorites"));
const Shop = lazy(() => import("./pages/Shop"));
const Categories = lazy(() => import("./pages/Categories"));
const Offers = lazy(() => import("./pages/Offers"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Profile = lazy(() => import("./pages/Profile"));
const Orders = lazy(() => import("./pages/Orders"));
const Settings = lazy(() => import("./pages/Settings"));
const Help = lazy(() => import("./pages/Help"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NewProducts = lazy(() => import("./pages/NewProducts"));

// Admin pages (lazy loaded)
const Admin = lazy(() => import("./pages/Admin"));
const Inventory = lazy(() => import("./pages/Inventory"));
const POS = lazy(() => import("./pages/POS"));
const Reports = lazy(() => import("./pages/Reports"));
const Employees = lazy(() => import("./pages/Employees"));
const Clients = lazy(() => import("./pages/Clients"));
const SystemConfig = lazy(() => import("./pages/SystemConfig"));

// User onboarding pages (lazy loaded)
const TutorialPrimerPedido = lazy(() => import("./pages/TutorialPrimerPedido"));
const GestionarPerfil = lazy(() => import("./pages/GestionarPerfil"));
const SeguimientoPedidos = lazy(() => import("./pages/SeguimientoPedidos"));
const ProgramaLealtad = lazy(() => import("./pages/ProgramaLealtad"));

const queryClient = new QueryClient();

const App = () => (
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
);

export default App;
