import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, ArrowLeft, User, Mail, Phone, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
}

const Register = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptMarketing: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
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

  const handleCheckboxChange = (name: keyof FormData, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Número de teléfono inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await register({
      name: formData.name.trim(),
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
    });

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrors({ general: result.error || "Error al crear la cuenta" });
    }
    setIsSubmitting(false);
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
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-fresh-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">LE</span>
          </div>
          <span className="font-display font-bold text-xl text-gray-900 hidden sm:block">
            La Económica
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center p-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome Message */}
          <div className="text-center space-y-2 animate-fade-in">
            <h1 className="font-display font-bold text-3xl text-gray-900">
              Crear cuenta
            </h1>
            <p className="text-gray-600">
              Únete a La Económica y disfruta de los mejores precios
            </p>
          </div>

          {/* Register Form */}
          <Card className="animate-slide-in delay-200">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl text-center">Registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* General Error */}
                {errors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {errors.general}
                  </div>
                )}

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nombre completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Juan Pérez"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={cn(
                        "pl-10 h-12",
                        errors.name && "border-red-500 focus:border-red-500",
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

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

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Teléfono <span className="text-gray-400">(opcional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={cn(
                        "pl-10 h-12",
                        errors.phone && "border-red-500 focus:border-red-500",
                      )}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone}</p>
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

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirmar contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={cn(
                        "pl-10 pr-10 h-12",
                        errors.confirmPassword &&
                          "border-red-500 focus:border-red-500",
                      )}
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("acceptTerms", checked as boolean)
                      }
                      className={cn(
                        "mt-1",
                        errors.acceptTerms && "border-red-500",
                      )}
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor="acceptTerms"
                      className="text-sm leading-relaxed cursor-pointer"
                    >
                      Acepto los{" "}
                      <Link
                        to="/terms"
                        className="text-brand-600 hover:text-brand-700 underline"
                      >
                        términos y condiciones
                      </Link>{" "}
                      y la{" "}
                      <Link
                        to="/privacy"
                        className="text-brand-600 hover:text-brand-700 underline"
                      >
                        política de privacidad
                      </Link>
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-red-500 text-sm">{errors.acceptTerms}</p>
                  )}

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptMarketing"
                      checked={formData.acceptMarketing}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          "acceptMarketing",
                          checked as boolean,
                        )
                      }
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor="acceptMarketing"
                      className="text-sm leading-relaxed cursor-pointer text-gray-600"
                    >
                      Acepto recibir ofertas y promociones por email
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 btn-gradient shadow-glow"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Creando cuenta...
                    </div>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    to="/login"
                    state={{ from: location.state?.from }}
                    className="text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
