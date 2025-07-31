import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star } from "lucide-react";

/**
 * Sección Hero de la página principal
 * Contiene el mensaje principal, estadísticas y botones de acción
 */
export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-brand-500 via-brand-600 to-fresh-600 overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 opacity-10">
        <picture>
          <source
            media="(max-width: 640px)"
            srcSet="https://images.pexels.com/photos/2564460/pexels-photo-2564460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
          />
          <source
            media="(max-width: 1024px)"
            srcSet="https://images.pexels.com/photos/2564460/pexels-photo-2564460.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
          />
          <img
            src="https://images.pexels.com/photos/2564460/pexels-photo-2564460.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
            alt="Supermercado La Económica"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
        </picture>
      </div>
      <div className="container relative px-0 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Content */}
          <div className="text-white space-y-6 animate-slide-in">
            <Badge className="bg-white/20 text-white border-white/20 w-fit mx-auto py-1.5">
              <span className="font-sans text-xl">
                🚀 Entrega en 15 minutos
              </span>
            </Badge>

            <h1 className="font-sans font-bold text-4xl lg:text-6xl leading-tight">
              Todo lo que necesitas,
              <span className="block text-yellow-300 text-xl pb-1.5">
                <br />
                al alcance de tu mano
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto mt-4">
              Convenience store digital con entrega ultrarrápida. Miles de
              productos, inventario en tiempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-12 justify-center">
              <Button
                size="lg"
                className="bg-yellow-500 text-gray-900 hover:bg-yellow-400 shadow-lg font-semibold"
                asChild
              >
                <Link to="/shop" target="_blank" rel="noopener noreferrer">
                  <span className="font-sans text-xl">Explorar tienda</span>
                  <ArrowRight className="ml-2 h-4 w-4 text-3xl" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white shadow-sm text-shadow font-sans text-xl p-0"
                style={{
                  boxShadow: "1px 1px 3px 0px rgba(0, 0, 0, 1)",
                  textShadow: "1px 1px 3px rgba(0, 0, 0, 1)",
                  border: "1px solid rgba(255, 255, 255, 1)",
                }}
                asChild
              >
                <Link to="/favorites">
                  <Star className="mr-2 h-4 w-4" />
                  Ver favoritos
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-2.5 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold">15min</div>
                <div className="text-sm text-white/80">Entrega promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">2000+</div>
                <div className="text-sm text-white/80">Productos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">4.8★</div>
                <div className="text-sm text-white/80">Calificación</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
