import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RotateCcw, Package, Clock, CheckCircle, AlertTriangle, Search } from "lucide-react";

const ReturnsPage = () => {
  const [selectedTab, setSelectedTab] = useState("request");

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Devoluciones y Reembolsos
        </h1>
        <p className="text-gray-600">
          Gestiona tus devoluciones de forma fácil y rápida
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <RotateCcw className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">30 días</div>
            <div className="text-sm text-gray-600">para devolver</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">24-48h</div>
            <div className="text-sm text-gray-600">tiempo de proceso</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">Gratis</div>
            <div className="text-sm text-gray-600">devolución en tienda</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <RotateCcw className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sistema de Devoluciones
            </h3>
            <p className="text-gray-600 mb-4">
              Esta funcionalidad estará disponible próximamente
            </p>
            <div className="space-y-2 text-sm text-gray-500 max-w-md mx-auto">
              <p>• Solicitud de devolución en línea</p>
              <p>• Seguimiento del proceso</p>
              <p>• Reembolso automático</p>
              <p>• Devolución en tienda física</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReturnsPage;
