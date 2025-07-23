import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

interface AccessDeniedProps {
  requiredPermission?: string;
  requiredRole?: string;
  requiredLevel?: number;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredPermission,
  requiredRole,
  requiredLevel,
}) => {
  const { user } = useAuth();

  const getPermissionDescription = (permission: string) => {
    switch (permission) {
      case "reports:view":
        return "acceso a reportes";
      case "staff:view":
        return "panel de administración";
      case "clients:view":
        return "gestión de clientes";
      case "system:config":
        return "configuración del sistema";
      case "inventory:view":
        return "gestión de inventario";
      case "sales:create":
        return "punto de venta";
      default:
        return permission;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {!user ? (
              <>
                <p className="text-gray-600">
                  Necesitas iniciar sesión para acceder a esta página.
                </p>
                <Link to="/login">
                  <Button className="w-full">
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-600">
                  No tienes los permisos necesarios para acceder a esta página.
                </p>
                {requiredPermission && (
                  <p className="text-sm text-gray-500">
                    Se requiere:{" "}
                    <span className="font-medium">
                      {getPermissionDescription(requiredPermission)}
                    </span>
                  </p>
                )}
                {requiredLevel && (
                  <p className="text-sm text-gray-500">
                    Nivel mínimo requerido:{" "}
                    <span className="font-medium">{requiredLevel}</span>
                  </p>
                )}
                <div className="pt-4">
                  <p className="text-xs text-gray-400 mb-4">
                    Tu rol actual:{" "}
                    <span className="font-medium">{user.role}</span>
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Si necesitas acceso, contacta a tu administrador.
                  </p>
                </div>
              </>
            )}

            <Link to="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessDenied;
