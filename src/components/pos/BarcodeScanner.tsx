import React, { useState, useEffect, useRef } from "react";
import { Scan, Camera, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  loading?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onClose,
  loading = false,
}) => {
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Focus en el input manual al abrir
    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError("");
      setIsScanning(true);

      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("El navegador no soporta acceso a la cámara");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Cámara trasera en móviles
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // En un entorno real, aquí integrarías una librería como QuaggaJS o ZXing-JS
      // Por ahora simularemos el escáner
      toast({
        title: "Cámara activada",
        description: "Enfoca el código de barras en la cámara",
      });
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("No se pudo acceder a la cámara. Usa la entrada manual.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Simulación de escaneo automático (en producción usarías una librería real)
  const simulateScan = () => {
    // Simular códigos de barras comunes para testing
    const testCodes = [
      "7501234567890",
      "7502345678901",
      "7503456789012",
      "123456789012",
    ];

    const randomCode = testCodes[Math.floor(Math.random() * testCodes.length)];
    onScan(randomCode);
  };

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown}>
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            Manual
          </TabsTrigger>
          <TabsTrigger value="camera" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Cámara
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-code">Código de Barras</Label>
                  <Input
                    id="manual-code"
                    ref={inputRef}
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Ingresa el código manualmente..."
                    className="text-lg"
                    disabled={loading}
                    autoComplete="off"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={!manualCode.trim() || loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <Scan className="w-4 h-4 mr-2" />
                    )}
                    Buscar Producto
                  </Button>

                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Botón de prueba - solo para desarrollo */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Modo de prueba</p>
                <Button
                  variant="outline"
                  onClick={simulateScan}
                  className="w-full"
                >
                  Simular Escaneo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="camera" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {!isScanning ? (
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>

                  <div>
                    <h3 className="font-semibold">Escáner de cámara</h3>
                    <p className="text-sm text-muted-foreground">
                      Usa la cámara para escanear códigos de barras
                    </p>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={startCamera} className="flex-1">
                      <Camera className="w-4 h-4 mr-2" />
                      Activar Cámara
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full h-64 bg-black rounded-lg object-cover"
                      autoPlay
                      muted
                      playsInline
                    />

                    {/* Overlay de área de escaneo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-32 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                        <Scan className="w-8 h-8 text-white animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Coloca el código de barras dentro del recuadro
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={stopCamera}
                        className="flex-1"
                      >
                        Detener Cámara
                      </Button>

                      <Button variant="outline" onClick={simulateScan}>
                        Simular
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground text-center">
        Presiona Esc para cerrar
      </div>
    </div>
  );
};

export default BarcodeScanner;
