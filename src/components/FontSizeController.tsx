import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Type, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FontSizeControllerProps {
  className?: string;
}

const FontSizeController = ({ className }: FontSizeControllerProps) => {
  const [fontSize, setFontSize] = useState(100); // Porcentaje del tamaño base
  const [isOpen, setIsOpen] = useState(false);

  // Cargar configuración guardada al inicializar
  useEffect(() => {
    const savedFontSize = localStorage.getItem("fontSizePreference");
    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      setFontSize(size);
      applyFontSize(size);
    }
  }, []);

  // Aplicar el tamaño de fuente al DOM
  const applyFontSize = (size: number) => {
    const scale = size / 100;
    document.documentElement.style.setProperty(
      "--font-scale",
      scale.toString(),
    );

    // Aplicar clases CSS según el tamaño
    const body = document.body;
    body.classList.remove(
      "font-size-small",
      "font-size-normal",
      "font-size-large",
      "font-size-xl",
    );

    if (size <= 85) {
      body.classList.add("font-size-small");
    } else if (size <= 115) {
      body.classList.add("font-size-normal");
    } else if (size <= 140) {
      body.classList.add("font-size-large");
    } else {
      body.classList.add("font-size-xl");
    }
  };

  // Manejar cambios en el slider
  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    applyFontSize(newSize);
    localStorage.setItem("fontSizePreference", newSize.toString());
  };

  // Funciones para botones rápidos
  const decreaseFont = () => {
    const newSize = Math.max(fontSize - 10, 75);
    handleFontSizeChange([newSize]);
  };

  const increaseFont = () => {
    const newSize = Math.min(fontSize + 10, 150);
    handleFontSizeChange([newSize]);
  };

  const resetFont = () => {
    handleFontSizeChange([100]);
  };

  const getFontSizeLabel = () => {
    if (fontSize <= 85) return "Pequeño";
    if (fontSize <= 115) return "Normal";
    if (fontSize <= 140) return "Grande";
    return "Extra Grande";
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            aria-label="Ajustar tamaño de letra"
          >
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Texto</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 z-50" align="end">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Tamaño de Letra
                </h3>
                <p className="text-sm text-gray-600">
                  Ajusta el tamaño del texto para mejor lectura
                </p>
              </div>

              {/* Controles rápidos */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decreaseFont}
                  disabled={fontSize <= 75}
                  className="flex items-center gap-1"
                >
                  <ZoomOut className="h-3 w-3" />
                  <span className="text-xs">A</span>
                </Button>

                <div className="text-center">
                  <div className="text-lg font-semibold text-brand-600">
                    {fontSize}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {getFontSizeLabel()}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={increaseFont}
                  disabled={fontSize >= 150}
                  className="flex items-center gap-1"
                >
                  <ZoomIn className="h-3 w-3" />
                  <span className="text-sm">A</span>
                </Button>
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <Label htmlFor="font-size-slider" className="text-sm">
                  Tamaño personalizado
                </Label>
                <Slider
                  id="font-size-slider"
                  min={75}
                  max={150}
                  step={5}
                  value={[fontSize]}
                  onValueChange={handleFontSizeChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>75%</span>
                  <span>100%</span>
                  <span>150%</span>
                </div>
              </div>

              {/* Vista previa */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="text-xs text-gray-500 mb-2">Vista previa:</div>
                <div style={{ fontSize: `${fontSize}%` }}>
                  <div className="font-medium">La Económica</div>
                  <div className="text-sm text-gray-600">
                    Este es un ejemplo de cómo se verá el texto con el tamaño
                    seleccionado.
                  </div>
                </div>
              </div>

              {/* Botón reset */}
              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFont}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <RotateCcw className="h-3 w-3" />
                  Restablecer
                </Button>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FontSizeController;
