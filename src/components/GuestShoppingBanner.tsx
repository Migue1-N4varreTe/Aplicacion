import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const GuestShoppingBanner = () => {
  const { isAuthenticated } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if user is authenticated or banner is dismissed
  if (isAuthenticated || isDismissed) {
    return null;
  }

  return (
    <Alert className="border-blue-200 bg-blue-50 relative">
      <ShoppingBag className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center justify-between pr-6">
          <div className="flex-1">
            <strong>¡Puedes comprar sin registrarte!</strong> Continúa como
            invitado o{" "}
            <Link to="/login" className="underline hover:text-blue-900">
              inicia sesión
            </Link>{" "}
            para obtener beneficios exclusivos.
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              asChild
            >
              <Link to="/register">
                <User className="h-3 w-3 mr-1" />
                Crear cuenta
              </Link>
            </Button>
          </div>
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
        onClick={() => setIsDismissed(true)}
      >
        <X className="h-3 w-3" />
      </Button>
    </Alert>
  );
};

export default GuestShoppingBanner;
