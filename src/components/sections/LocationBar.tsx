import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Search, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationBarProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
}

/**
 * Barra de ubicación actual con diálogo para cambiar ubicación
 * Incluye geolocalización y búsqueda de ubicaciones
 */
export const LocationBar: React.FC<LocationBarProps> = ({
  currentLocation,
  onLocationChange,
}) => {
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const { toast } = useToast();

  const suggestedLocations = useMemo(() => [
    "Centro, Ciudad de México",
    "Roma Norte, Ciudad de México",
    "Condesa, Ciudad de México",
    "Polanco, Ciudad de México",
    "Santa Fe, Ciudad de México",
    "Coyoacán, Ciudad de México",
  ], []);

  const handleLocationChange = (newLocation: string) => {
    onLocationChange(newLocation);
    setIsLocationDialogOpen(false);
    setLocationSearch("");
    toast({
      title: "Ubicación actualizada",
      description: `Tu ubicación se cambió a: ${newLocation}`,
    });
  };

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // En una implementación real, aquí usarías un servicio de geocoding inverso
          const location = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          handleLocationChange(`Ubicación actual (${location})`);
        },
        (error) => {
          toast({
            title: "Error de ubicación",
            description: "No se pudo obtener tu ubicación actual",
            variant: "destructive",
          });
        },
      );
    } else {
      toast({
        title: "Error",
        description: "Tu navegador no soporta geolocalización",
        variant: "destructive",
      });
    }
  };

  const filteredLocations = suggestedLocations.filter((location) =>
    location.toLowerCase().includes(locationSearch.toLowerCase()),
  );

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="text-gray-600">Entregando en:</span>
            <span className="font-medium text-gray-900">
              {currentLocation}
            </span>
          </div>
          <Dialog
            open={isLocationDialogOpen}
            onOpenChange={setIsLocationDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-700"
              >
                Cambiar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Cambiar ubicación de entrega
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location-search">Buscar ubicación</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="location-search"
                      placeholder="Buscar colonias, calles..."
                      value={locationSearch}
                      onChange={(e) => setLocationSearch(e.target.value)}
                      className="pl-10"
                      aria-label="Buscar ubicación"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleUseCurrentLocation}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Usar mi ubicación actual
                </Button>

                <div className="space-y-2">
                  <Label>Ubicaciones sugeridas</Label>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {filteredLocations.map((location, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 text-left"
                        onClick={() => handleLocationChange(location)}
                      >
                        <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{location}</span>
                      </Button>
                    ))}
                  </div>
                  {filteredLocations.length === 0 && locationSearch && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No se encontraron ubicaciones
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};
