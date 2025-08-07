import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, ArrowLeft, Smartphone, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from state or default to home
  const from = location.state?.from?.pathname || "/";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error: any) {
      setErrors({
        submit: error.message || "Error al iniciar sesión. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLogin = async (email: string, password: string) => {
    setFormData({ email, password });
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error: any) {
      setErrors({
        submit: error.message || "Error al iniciar sesión. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-fresh-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">LE</span>
          </div>
          <span className="font-display font-bold text-xl text-gray-900 hidden sm:block">
            La Económica
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome Message */}
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="font-display font-bold text-3xl text-gray-900">
              ¡Bienvenido de vuelta!
            </h1>
            <p className="text-gray-600">
              Inicia sesión para continuar con tus compras
            </p>
          </div>

          {/* Login Form */}
          <Card className="animate-slide-in delay-200">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl text-center">
                Iniciar Sesión
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* General Error */}
                {errors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {errors.general}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={cn(
                        "pl-10 h-12",
                        errors.email && "border-red-500 focus:border-red-500",
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={cn(
                        "pl-10 pr-10 h-12",
                        errors.password &&
                          "border-red-500 focus:border-red-500",
                      )}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Error Display */}
                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 btn-gradient shadow-glow"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Iniciando sesión...
                    </div>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              {/* Demo Accounts */}
              <div className="space-y-3">
                <p className="text-xs text-gray-500 text-center">
                  Cuentas de demostración
                </p>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs"
                    onClick={() =>
                      quickLogin("admin@laeconomica.com", "password123")
                    }
                    disabled={isSubmitting}
                  >
                    👨‍💻 Desarrollador (Acceso Total)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs"
                    onClick={() =>
                      quickLogin("owner@laeconomica.com", "password123")
                    }
                    disabled={isSubmitting}
                  >
                    👔 Propietario (Gestión)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs"
                    onClick={() =>
                      quickLogin("manager@laeconomica.com", "password123")
                    }
                    disabled={isSubmitting}
                  >
                    📊 Gerente (Operaciones)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs"
                    onClick={() =>
                      quickLogin("supervisor@laeconomica.com", "password123")
                    }
                    disabled={isSubmitting}
                  >
                    👥 Supervisor (Turnos)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs"
                    onClick={() =>
                      quickLogin("cashier@laeconomica.com", "password123")
                    }
                    disabled={isSubmitting}
                  >
                    🛒 Cajero (POS)
                  </Button>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes cuenta?{" "}
                  <Link
                    to="/register"
                    state={{ from: location.state?.from }}
                    className="text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center animate-slide-in delay-400">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-brand-600 text-xl">⚡</span>
              </div>
              <p className="text-xs text-gray-600">Entrega express</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-fresh-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-fresh-600 text-xl">🛡️</span>
              </div>
              <p className="text-xs text-gray-600">Compra segura</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 text-xl">📱</span>
              </div>
              <p className="text-xs text-gray-600">App móvil</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
