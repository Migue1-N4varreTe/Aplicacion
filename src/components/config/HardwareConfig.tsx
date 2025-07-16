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
  Printer,
  ScanBarcode,
  Monitor,
  Wifi,
  Usb,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Zap,
  HardDrive,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Device {
  id: string;
  name: string;
  type: "printer" | "scanner" | "display" | "other";
  status: "connected" | "disconnected" | "error";
  connection: "usb" | "network" | "bluetooth";
  address?: string;
  model?: string;
  enabled: boolean;
}

interface PrinterSettings {
  paperSize: string;
  printQuality: string;
  autocut: boolean;
  copies: number;
  header: boolean;
  footer: boolean;
}

const HardwareConfig = () => {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "1",
      name: "Impresora Principal",
      type: "printer",
      status: "connected",
      connection: "usb",
      address: "USB001",
      model: "Epson TM-T20III",
      enabled: true,
    },
    {
      id: "2",
      name: "Escáner de Códigos",
      type: "scanner",
      status: "connected",
      connection: "usb",
      address: "USB002",
      model: "Honeywell MS5145",
      enabled: true,
    },
    {
      id: "3",
      name: "Pantalla Cliente",
      type: "display",
      status: "disconnected",
      connection: "network",
      address: "192.168.1.100",
      model: 'Monitor LED 19"',
      enabled: false,
    },
    {
      id: "4",
      name: "Impresora Cocina",
      type: "printer",
      status: "error",
      connection: "network",
      address: "192.168.1.101",
      model: "Star TSP143III",
      enabled: true,
    },
  ]);

  const [printerSettings, setPrinterSettings] = useState<PrinterSettings>({
    paperSize: "80mm",
    printQuality: "normal",
    autocut: true,
    copies: 1,
    header: true,
    footer: true,
  });

  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: "",
    type: "printer" as const,
    connection: "usb" as const,
    address: "",
    model: "",
  });

  const { toast } = useToast();

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "printer":
        return Printer;
      case "scanner":
        return ScanBarcode;
      case "display":
        return Monitor;
      default:
        return HardDrive;
    }
  };

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case "usb":
        return Usb;
      case "network":
        return Wifi;
      case "bluetooth":
        return Zap;
      default:
        return Usb;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "disconnected":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Conectado";
      case "disconnected":
        return "Desconectado";
      case "error":
        return "Error";
      default:
        return "Desconocido";
    }
  };

  const handleTestDevice = async (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId);
    if (!device) return;

    toast({
      title: "Probando dispositivo",
      description: `Iniciando prueba de ${device.name}...`,
    });

    // Simulate device test
    setTimeout(() => {
      toast({
        title: "Prueba completada",
        description: `${device.name} respondió correctamente`,
      });
    }, 2000);
  };

  const handleToggleDevice = (deviceId: string) => {
    setDevices(
      devices.map((device) =>
        device.id === deviceId
          ? { ...device, enabled: !device.enabled }
          : device,
      ),
    );
  };

  const handleAddDevice = () => {
    if (!newDevice.name || !newDevice.address) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const device: Device = {
      id: Date.now().toString(),
      name: newDevice.name,
      type: newDevice.type,
      status: "disconnected",
      connection: newDevice.connection,
      address: newDevice.address,
      model: newDevice.model,
      enabled: true,
    };

    setDevices([...devices, device]);
    setNewDevice({
      name: "",
      type: "printer",
      connection: "usb",
      address: "",
      model: "",
    });
    setIsAddingDevice(false);

    toast({
      title: "Dispositivo agregado",
      description: "El dispositivo ha sido configurado",
    });
  };

  const handleDeleteDevice = (deviceId: string) => {
    setDevices(devices.filter((device) => device.id !== deviceId));
    toast({
      title: "Dispositivo eliminado",
      description: "El dispositivo ha sido removido",
    });
  };

  const handlePrintTest = () => {
    toast({
      title: "Imprimiendo prueba",
      description: "Enviando página de prueba a la impresora principal...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Device Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Printer className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Impresoras</p>
                <p className="text-2xl font-bold text-gray-900">
                  {devices.filter((d) => d.type === "printer").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ScanBarcode className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Escáneres</p>
                <p className="text-2xl font-bold text-gray-900">
                  {devices.filter((d) => d.type === "scanner").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Monitor className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pantallas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {devices.filter((d) => d.type === "display").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conectados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {devices.filter((d) => d.status === "connected").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <HardDrive className="h-5 w-5 mr-2" />
              Dispositivos Configurados
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Detectar Dispositivos
              </Button>
              <Dialog open={isAddingDevice} onOpenChange={setIsAddingDevice}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Dispositivo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuevo Dispositivo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="device-name">Nombre</Label>
                      <Input
                        id="device-name"
                        placeholder="Nombre del dispositivo"
                        value={newDevice.name}
                        onChange={(e) =>
                          setNewDevice({ ...newDevice, name: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="device-type">Tipo</Label>
                      <Select
                        value={newDevice.type}
                        onValueChange={(value: any) =>
                          setNewDevice({ ...newDevice, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="printer">Impresora</SelectItem>
                          <SelectItem value="scanner">Escáner</SelectItem>
                          <SelectItem value="display">Pantalla</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="device-connection">Conexión</Label>
                      <Select
                        value={newDevice.connection}
                        onValueChange={(value: any) =>
                          setNewDevice({ ...newDevice, connection: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usb">USB</SelectItem>
                          <SelectItem value="network">Red</SelectItem>
                          <SelectItem value="bluetooth">Bluetooth</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="device-address">Dirección/Puerto</Label>
                      <Input
                        id="device-address"
                        placeholder={
                          newDevice.connection === "usb"
                            ? "COM1, USB001"
                            : "192.168.1.100"
                        }
                        value={newDevice.address}
                        onChange={(e) =>
                          setNewDevice({
                            ...newDevice,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="device-model">Modelo (opcional)</Label>
                      <Input
                        id="device-model"
                        placeholder="Modelo del dispositivo"
                        value={newDevice.model}
                        onChange={(e) =>
                          setNewDevice({ ...newDevice, model: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingDevice(false)}
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleAddDevice}>Agregar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Conexión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Habilitado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => {
                const DeviceIcon = getDeviceIcon(device.type);
                const ConnectionIcon = getConnectionIcon(device.connection);

                return (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <DeviceIcon className="h-5 w-5 mr-3 text-gray-600" />
                        <div>
                          <div className="font-medium">{device.name}</div>
                          {device.model && (
                            <div className="text-sm text-gray-500">
                              {device.model}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {device.type === "printer" && "Impresora"}
                        {device.type === "scanner" && "Escáner"}
                        {device.type === "display" && "Pantalla"}
                        {device.type === "other" && "Otro"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <ConnectionIcon className="h-4 w-4 mr-2 text-gray-600" />
                        <div>
                          <div className="text-sm">
                            {device.connection.toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {device.address}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge className={getStatusColor(device.status)}>
                          {getStatusText(device.status)}
                        </Badge>
                        {device.status === "error" && (
                          <AlertTriangle className="h-4 w-4 ml-2 text-red-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={device.enabled}
                        onCheckedChange={() => handleToggleDevice(device.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestDevice(device.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDevice(device.id)}
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

      {/* Printer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Printer className="h-5 w-5 mr-2" />
            Configuración de Impresión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="paper-size">Tamaño de Papel</Label>
                <Select
                  value={printerSettings.paperSize}
                  onValueChange={(value) =>
                    setPrinterSettings({ ...printerSettings, paperSize: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="58mm">58mm (Pequeño)</SelectItem>
                    <SelectItem value="80mm">80mm (Estándar)</SelectItem>
                    <SelectItem value="A4">A4 (Carta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="print-quality">Calidad de Impresión</Label>
                <Select
                  value={printerSettings.printQuality}
                  onValueChange={(value) =>
                    setPrinterSettings({
                      ...printerSettings,
                      printQuality: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="copies">Número de Copias</Label>
                <Input
                  id="copies"
                  type="number"
                  min="1"
                  max="5"
                  value={printerSettings.copies}
                  onChange={(e) =>
                    setPrinterSettings({
                      ...printerSettings,
                      copies: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autocut"
                  checked={printerSettings.autocut}
                  onCheckedChange={(checked) =>
                    setPrinterSettings({ ...printerSettings, autocut: checked })
                  }
                />
                <Label htmlFor="autocut">Corte automático de papel</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="header"
                  checked={printerSettings.header}
                  onCheckedChange={(checked) =>
                    setPrinterSettings({ ...printerSettings, header: checked })
                  }
                />
                <Label htmlFor="header">Imprimir encabezado</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="footer"
                  checked={printerSettings.footer}
                  onCheckedChange={(checked) =>
                    setPrinterSettings({ ...printerSettings, footer: checked })
                  }
                />
                <Label htmlFor="footer">Imprimir pie de página</Label>
              </div>

              <Button onClick={handlePrintTest} className="w-full">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Página de Prueba
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanner Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ScanBarcode className="h-5 w-5 mr-2" />
            Configuración de Escáner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="scan-mode">Modo de Escaneo</Label>
                <Select defaultValue="auto">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="continuous">Continuo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="beep-volume">Volumen del Beep</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Silencioso</SelectItem>
                    <SelectItem value="low">Bajo</SelectItem>
                    <SelectItem value="medium">Medio</SelectItem>
                    <SelectItem value="high">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-enter" defaultChecked />
                <Label htmlFor="auto-enter">Enter automático</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="code-validation" defaultChecked />
                <Label htmlFor="code-validation">Validación de códigos</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="scan-feedback" defaultChecked />
                <Label htmlFor="scan-feedback">Feedback visual</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HardwareConfig;
