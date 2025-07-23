import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Store,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import PermissionGuard from "@/components/PermissionGuard";
import FontSizeController from "@/components/FontSizeController";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { favoriteCount } = useFavorites();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Tienda", href: "/shop" },
    { name: "Categorías", href: "/categories" },
    { name: "Ofertas", href: "/offers" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Store className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                La Económica
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:ml-5 md:flex md:space-x-5">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === item.href
                      ? "border-green-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {/* Staff links for authorized users */}
              <PermissionGuard permission="sales:create">
                <Link
                  to="/pos"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === "/pos"
                      ? "border-green-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  POS
                </Link>
              </PermissionGuard>
              <PermissionGuard permission="inventory:view">
                <Link
                  to="/inventory"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === "/inventory"
                      ? "border-green-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Inventario
                </Link>
              </PermissionGuard>
              <PermissionGuard permission="reports:view">
                <Link
                  to="/reports"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === "/reports"
                      ? "border-green-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Reportes
                </Link>
              </PermissionGuard>
              <PermissionGuard permission="staff:view">
                <Link
                  to="/employees"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === "/employees"
                      ? "border-green-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Empleados
                </Link>
              </PermissionGuard>
              <PermissionGuard permission="clients:view">
                <Link
                  to="/clients"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === "/clients"
                      ? "border-green-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Clientes
                </Link>
              </PermissionGuard>
              <PermissionGuard permission="staff:view">
                <Link
                  to="/admin"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors ${
                    location.pathname === "/admin"
                      ? "border-green-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              </PermissionGuard>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden sm:flex items-center flex-1 max-w-lg mx-5">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-8 py-2 w-full ml-2.5"
                />
              </div>
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            {/* Favorites */}
            <Link
              to="/favorites"
              className="relative p-2 hover:bg-gray-100 rounded-md"
            >
              <Heart
                className={`h-6 w-6 text-2xl ${
                  favoriteCount > 0
                    ? "text-red-500 fill-current"
                    : "text-gray-600"
                }`}
              />
              {favoriteCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500">
                  {favoriteCount}
                </Badge>
              )}
            </Link>

            {/* Font Size Controller */}
            <FontSizeController />

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-md"
            >
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs bg-green-500">
                  {totalItems}
                </Badge>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden md:block text-sm">
                      {user.first_name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {user.role === "LEVEL_5_DEVELOPER" && "Desarrollador"}
                      {user.role === "LEVEL_4_OWNER" && "Propietario"}
                      {user.role === "LEVEL_3_MANAGER" && "Gerente"}
                      {user.role === "LEVEL_2_SUPERVISOR" && "Supervisor"}
                      {user.role === "LEVEL_1_CASHIER" && "Cajero"}
                    </Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Mis Pedidos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <PermissionGuard permission="sales:create">
                    <DropdownMenuItem asChild>
                      <Link to="/pos" className="flex items-center">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        POS
                      </Link>
                    </DropdownMenuItem>
                  </PermissionGuard>
                  <PermissionGuard permission="inventory:view">
                    <DropdownMenuItem asChild>
                      <Link to="/inventory" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Inventario
                      </Link>
                    </DropdownMenuItem>
                  </PermissionGuard>
                  <PermissionGuard permission="reports:view">
                    <DropdownMenuItem asChild>
                      <Link to="/reports" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Reportes
                      </Link>
                    </DropdownMenuItem>
                  </PermissionGuard>
                  <PermissionGuard permission="staff:view">
                    <DropdownMenuItem asChild>
                      <Link to="/employees" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Empleados
                      </Link>
                    </DropdownMenuItem>
                  </PermissionGuard>
                  <PermissionGuard permission="clients:view">
                    <DropdownMenuItem asChild>
                      <Link to="/clients" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Clientes
                      </Link>
                    </DropdownMenuItem>
                  </PermissionGuard>
                  <PermissionGuard permission="system:config">
                    <DropdownMenuItem asChild>
                      <Link to="/system-config" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Configuración
                      </Link>
                    </DropdownMenuItem>
                  </PermissionGuard>
                  <PermissionGuard permission="staff:view">
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Panel Admin
                      </Link>
                    </DropdownMenuItem>
                  </PermissionGuard>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2.5 font-happy text-xl"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 font-happy text-xl"
                  >
                    <span className="font-happy text-white">Registrarse</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {/* Mobile search */}
              <div className="px-3 py-2">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full"
                    />
                  </div>
                </form>
              </div>

              {/* Mobile navigation */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    location.pathname === item.href
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile staff links */}
              <PermissionGuard permission="sales:create">
                <Link
                  to="/pos"
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    location.pathname === "/pos"
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="inline h-4 w-4 mr-2" />
                  POS
                </Link>
              </PermissionGuard>
              <PermissionGuard permission="inventory:view">
                <Link
                  to="/inventory"
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    location.pathname === "/inventory"
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="inline h-4 w-4 mr-2" />
                  Inventario
                </Link>
              </PermissionGuard>
              <PermissionGuard permission="reports:view">
                <Link
                  to="/reports"
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    location.pathname === "/reports"
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="inline h-4 w-4 mr-2" />
                  Reportes
                </Link>
              </PermissionGuard>
              <PermissionGuard permission="staff:view">
                <Link
                  to="/employees"
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    location.pathname === "/employees"
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="inline h-4 w-4 mr-2" />
                  Empleados
                </Link>
              </PermissionGuard>
              <PermissionGuard permission="clients:view">
                <Link
                  to="/clients"
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    location.pathname === "/clients"
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="inline h-4 w-4 mr-2" />
                  Clientes
                </Link>
              </PermissionGuard>
              <PermissionGuard permission="system:config">
                <Link
                  to="/system-config"
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    location.pathname === "/system-config"
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="inline h-4 w-4 mr-2" />
                  Configuración
                </Link>
              </PermissionGuard>
              <PermissionGuard permission="staff:view">
                <Link
                  to="/admin"
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    location.pathname === "/admin"
                      ? "text-green-600 bg-green-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="inline h-4 w-4 mr-2" />
                  Panel Admin
                </Link>
              </PermissionGuard>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
