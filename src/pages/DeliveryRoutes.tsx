import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Route, MapPin, Truck } from "lucide-react";

const DeliveryRoutesPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rutas de Entrega</h1>
        <p className="text-gray-600">Optimización automática de rutas de delivery</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <Route className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Optimización de Rutas</h3>
            <p className="text-gray-600">Funcionalidad próximamente disponible</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryRoutesPage;
