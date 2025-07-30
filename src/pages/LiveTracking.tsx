import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, Clock, Route, Navigation } from "lucide-react";

const LiveTrackingPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Seguimiento en Vivo
        </h1>
        <p className="text-gray-600">
          Rastrea tus pedidos en tiempo real con GPS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">GPS</div>
            <div className="text-sm text-gray-600">en tiempo real</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Truck className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">5-30 min</div>
            <div className="text-sm text-gray-600">tiempo estimado</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Navigation className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">Rutas</div>
            <div className="text-sm text-gray-600">optimizadas</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Seguimiento GPS en Vivo
            </h3>
            <p className="text-gray-600 mb-4">
              Esta funcionalidad estará disponible próximamente
            </p>
            <div className="space-y-2 text-sm text-gray-500 max-w-md mx-auto">
              <p>• Ubicación del repartidor en tiempo real</p>
              <p>• Tiempo estimado de llegada dinámico</p>
              <p>• Notificaciones de estado</p>
              <p>• Comunicación directa con el repartidor</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveTrackingPage;
