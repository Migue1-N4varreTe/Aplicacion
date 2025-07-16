import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  DollarSign,
  Percent,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Receipt,
  Building,
  Smartphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  name: string;
  type: "cash" | "card" | "digital" | "transfer";
  enabled: boolean;
  fee: number;
  icon: React.ComponentType<any>;
  config?: any;
}

interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: "fixed" | "percentage";
  enabled: boolean;
  categories: string[];
}

const PaymentSettings = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "1",
      name: "Efectivo",
      type: "cash",
      enabled: true,
      fee: 0,
      icon: DollarSign,
    },
    {
      id: "2",
      name: "Tarjeta de Débito",
      type: "card",
      enabled: true,
      fee: 2.5,
      icon: CreditCard,
    },
    {
      id: "3",
      name: "Tarjeta de Crédito",
      type: "card",
      enabled: true,
      fee: 3.5,
      icon: CreditCard,
    },
    {
      id: "4",
      name: "Pago Móvil",
      type: "digital",
      enabled: true,
      fee: 0,
      icon: Smartphone,
    },
    {
      id: "5",
      name: "Transferencia Bancaria",
      type: "transfer",
      enabled: false,
      fee: 1.0,
      icon: Building,
    },
  ]);

  const [taxRates, setTaxRates] = useState<TaxRate[]>([
    {
      id: "1",
      name: "IVA General",
      rate: 16,
      type: "percentage",
      enabled: true,
      categories: ["general"],
    },
    {
      id: "2",
      name: "IVA Reducido",
      rate: 8,
      type: "percentage",
      enabled: true,
      categories: ["alimentos", "medicinas"],
    },
    {
      id: "3",
      name: "Exento",
      rate: 0,
      type: "percentage",
      enabled: true,
      categories: ["basicos"],
    },
  ]);

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    name: "",
    type: "cash" as const,
    fee: 0,
  });

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const { toast } = useToast();

  const handleTogglePaymentMethod = (id: string) => {
    setPaymentMethods((methods) =>
      methods.map((method) =>
        method.id === id ? { ...method, enabled: !method.enabled } : method,
      ),
    );

    toast({
      title: "Método de pago actualizado",
      description: "El estado del método de pago ha sido cambiado",
    });
  };

  const handleUpdateFee = (id: string, fee: number) => {
    setPaymentMethods((methods) =>
      methods.map((method) => (method.id === id ? { ...method, fee } : method)),
    );
  };

  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod.name) {
      toast({
        title: "Error",
        description: "El nombre del método de pago es requerido",
        variant: "destructive",
      });
      return;
    }

    const method: PaymentMethod = {
      id: Date.now().toString(),
      name: newPaymentMethod.name,
      type: newPaymentMethod.type,
      enabled: true,
      fee: newPaymentMethod.fee,
      icon: CreditCard, // Default icon
    };

    setPaymentMethods([...paymentMethods, method]);
    setNewPaymentMethod({ name: "", type: "cash", fee: 0 });
    setIsAddingPayment(false);

    toast({
      title: "Método agregado",
      description: "El nuevo método de pago ha sido configurado",
    });
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods((methods) =>
      methods.filter((method) => method.id !== id),
    );
    toast({
      title: "Método eliminado",
      description: "El método de pago ha sido removido",
    });
  };

  const handleToggleTax = (id: string) => {
    setTaxRates((rates) =>
      rates.map((rate) =>
        rate.id === id ? { ...rate, enabled: !rate.enabled } : rate,
      ),
    );
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "cash":
        return "bg-green-100 text-green-800";
      case "card":
        return "bg-blue-100 text-blue-800";
      case "digital":
        return "bg-purple-100 text-purple-800";
      case "transfer":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentTypeName = (type: string) => {
    switch (type) {
      case "cash":
        return "Efectivo";
      case "card":
        return "Tarjeta";
      case "digital":
        return "Digital";
      case "transfer":
        return "Transferencia";
      default:
        return "Otro";
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Métodos de Pago
            </span>
            <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Método
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Método de Pago</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payment-name">Nombre</Label>
                    <Input
                      id="payment-name"
                      placeholder="Nombre del método de pago"
                      value={newPaymentMethod.name}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="payment-type">Tipo</Label>
                    <Select
                      value={newPaymentMethod.type}
                      onValueChange={(value: any) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          type: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="card">Tarjeta</SelectItem>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="transfer">Transferencia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="payment-fee">Comisión (%)</Label>
                    <Input
                      id="payment-fee"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0.0"
                      value={newPaymentMethod.fee}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          fee: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingPayment(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handleAddPaymentMethod}>Agregar</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Método</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <TableRow key={method.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <IconComponent className="h-5 w-5 mr-3 text-gray-600" />
                        <span className="font-medium">{method.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentTypeColor(method.type)}>
                        {getPaymentTypeName(method.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={method.fee}
                          onChange={(e) =>
                            handleUpdateFee(
                              method.id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-20"
                        />
                        <Percent className="h-4 w-4 text-gray-400" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={method.enabled}
                          onCheckedChange={() =>
                            handleTogglePaymentMethod(method.id)
                          }
                        />
                        {method.enabled ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tax Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Configuración de Impuestos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Impuesto</TableHead>
                <TableHead>Tasa</TableHead>
                <TableHead>Categorías</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxRates.map((tax) => (
                <TableRow key={tax.id}>
                  <TableCell className="font-medium">{tax.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-lg font-semibold">{tax.rate}</span>
                      <Percent className="h-4 w-4 ml-1 text-gray-400" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tax.categories.map((category, index) => (
                        <Badge key={index} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={tax.enabled}
                        onCheckedChange={() => handleToggleTax(tax.id)}
                      />
                      {tax.enabled ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Exchange Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Tasas de Cambio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="usd-rate">USD a VES</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="usd-rate"
                  type="number"
                  step="0.01"
                  placeholder="36.50"
                  defaultValue="36.50"
                />
                <span className="text-sm text-gray-500">Bs/USD</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="eur-rate">EUR a VES</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="eur-rate"
                  type="number"
                  step="0.01"
                  placeholder="39.20"
                  defaultValue="39.20"
                />
                <span className="text-sm text-gray-500">Bs/EUR</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Última Actualización</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm">29/11/2024 10:30 AM</span>
                <Button variant="outline" size="sm">
                  Actualizar
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Building className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Tasas Automáticas</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Las tasas de cambio se pueden actualizar automáticamente desde
                  el BCV. Configura la frecuencia de actualización en la sección
                  de General.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Configuración de Facturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="invoice-prefix">Prefijo de Facturas</Label>
                <Input
                  id="invoice-prefix"
                  placeholder="FACT-"
                  defaultValue="FACT-"
                />
              </div>

              <div>
                <Label htmlFor="invoice-number">Próximo Número</Label>
                <Input
                  id="invoice-number"
                  type="number"
                  placeholder="1001"
                  defaultValue="1001"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-invoice" defaultChecked />
                <Label htmlFor="auto-invoice">Numeración automática</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="require-client" />
                <Label htmlFor="require-client">
                  Requerir datos del cliente
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="footer-text">Texto del pie de página</Label>
                <Input
                  id="footer-text"
                  placeholder="¡Gracias por su compra!"
                  defaultValue="¡Gracias por su compra!"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="print-logo" defaultChecked />
                <Label htmlFor="print-logo">Imprimir logo en factura</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="email-receipt" />
                <Label htmlFor="email-receipt">Enviar factura por email</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="sms-receipt" />
                <Label htmlFor="sms-receipt">Enviar resumen por SMS</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettings;
