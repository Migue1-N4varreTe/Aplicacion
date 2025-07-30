import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Calendar, Package } from "lucide-react";

const RecurringOrdersPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedidos Recurrentes</h1>
        <p className="text-gray-600">Automatiza tus compras regulares</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <RotateCcw className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Compras Automáticas</h3>
            <p className="text-gray-600">Funcionalidad próximamente disponible</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecurringOrdersPage;
