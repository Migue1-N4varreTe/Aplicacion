import React from "react";
import { Link } from "react-router-dom";
import { quickCategories } from "@/lib/data";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Sección de categorías rápidas - scroll horizontal en una línea
 * Adaptable para todos los dispositivos con indicadores de scroll
 */
export const QuickCategories: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <section className="py-5 bg-white">
      <div className="container mx-auto px-4">
        {/* Universal horizontal scroll layout for all devices */}
        <div className="flex overflow-x-auto scrollbar-hide snap-scroll adaptive-gap py-2">
          {quickCategories.map((cat, index) => (
            <Link
              key={cat.name}
              to="/shop"
              className={`flex items-center justify-center adaptive-gap btn-spacing rounded-xl transition-all hover:scale-105 hover:shadow-md ${cat.color} text-white font-medium whitespace-nowrap flex-shrink-0 snap-item btn-text text-safe
                xs:px-3 xs:py-2 xs:text-xs
                sm:px-4 sm:py-3 sm:text-sm
                md:px-5 md:py-4 md:text-base
                lg:px-6 lg:py-4 lg:text-lg
                xl:px-7 xl:py-4 xl:text-xl
                min-w-[100px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px] xl:min-w-[180px]
                max-w-[120px] sm:max-w-[140px] md:max-w-[160px] lg:max-w-[200px] xl:max-w-[220px]
                animate-slide-in container-safe`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl flex-shrink-0">{cat.icon}</span>
              <span className="leading-tight text-center font-sans text-ellipsis-safe">
                {cat.name === "Delivery rápido" && isMobile ? "Delivery" : cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Scroll indicators */}
        <div className="flex justify-center mt-2 gap-1">
          {quickCategories.map((_, index) => (
            <div
              key={`indicator-${index}`}
              className="w-1.5 h-1.5 rounded-full bg-gray-300 transition-colors"
            />
          ))}
        </div>
      </div>
    </section>
  );
};
