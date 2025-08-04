import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Search,
  ShoppingCart,
  CreditCard,
  MapPin,
  Play,
  Clock,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  content: string;
  image?: string;
  videoUrl?: string;
  tips: string[];
}

const TutorialPrimerPedido = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: "Registro en La Económica",
      description: "Crea tu cuenta o continúa como invitado",
      content:
        "Para comenzar, puedes crear una cuenta para acceder a beneficios exclusivos como puntos de lealtad, historial de compras y ofertas personalizadas. También puedes continuar como invitado si prefieres una compra rápida.",
      tips: [
        "Con cuenta registrada obtienes puntos de lealtad",
        "Guarda tus direcciones favoritas",
        "Recibe ofertas personalizadas por email",
        "Historial completo de compras",
      ],
    },
    {
      id: 2,
      title: "Explorar Productos",
      description:
        "Navega por nuestras categorías y encuentra lo que necesitas",
      content:
        "Utiliza la barra de búsqueda o navega por categorías como Frutas y Verduras, Lácteos, Carnicería y Cremería, etc. Cada producto muestra precio, disponibilidad y tiempo de entrega.",
      videoUrl: "https://www.youtube.com/embed/ejemplo-productos",
      tips: [
        "Usa filtros para encontrar productos más rápido",
        "Revisa las ofertas especiales marcadas en rojo",
        "Los productos orgánicos tienen un símbolo especial",
        "Verifica el stock disponible antes de agregar",
      ],
    },
    {
      id: 3,
      title: "Agregar al Carrito",
      description: "Selecciona cantidad y agrega productos a tu carrito",
      content:
        "Haz clic en 'Agregar al carrito' en cada producto. Puedes ajustar las cantidades directamente desde el carrito. Los productos se venden por kilo o por pieza según el tipo.",
      tips: [
        "Revisa las unidades de medida (kg/pieza)",
        "Ajusta cantidades desde el carrito",
        "Los productos frescos tienen tiempo de entrega más rápido",
        "Aprovecha los descuentos por cantidad",
      ],
    },
    {
      id: 4,
      title: "Revisar Carrito",
      description: "Verifica tu pedido antes de proceder al checkout",
      content:
        "En el carrito puedes ver el resumen completo: productos, cantidades, precios y total. Asegúrate de revisar todo antes de continuar al checkout.",
      tips: [
        "Verifica que todos los productos estén correctos",
        "Revisa las cantidades y precios",
        "Aplica cupones de descuento si tienes",
        "Calcula el monto mínimo para delivery gratuito ($50)",
      ],
    },
    {
      id: 5,
      title: "Información de Entrega",
      description: "Proporciona tu dirección y datos de contacto",
      content:
        "Ingresa tu dirección completa, incluyendo referencias para facilitar la entrega. Si eres cliente registrado, puedes usar direcciones guardadas previamente.",
      tips: [
        "Sé específico con las referencias de ubicación",
        "Verifica que tu zona esté dentro del área de entrega (2km)",
        "Incluye número de teléfono actualizado",
        "Especifica si necesitas subir a un piso",
      ],
    },
    {
      id: 6,
      title: "Método de Pago",
      description: "Selecciona cómo prefieres pagar tu pedido",
      content:
        "Aceptamos efectivo, tarjetas de débito/crédito, transferencias bancarias, Zelle y Pago Móvil. Elige el método que más te convenga.",
      tips: [
        "Efectivo: ten cambio exacto o billetes grandes",
        "Tarjeta: verificamos al momento de la entrega",
        "Pago Móvil: envía captura de confirmación",
        "Transferencia: incluye número de referencia",
      ],
    },
    {
      id: 7,
      title: "Confirmar Pedido",
      description: "Revisa todo y confirma tu orden",
      content:
        "Último paso: revisa toda la información, horario de entrega estimado y total a pagar. Una vez confirmado, recibirás un número de seguimiento.",
      tips: [
        "Guarda el número de pedido para seguimiento",
        "Recibirás notificaciones por WhatsApp/SMS",
        "Tiempo de entrega: 15-30 min (express) o 45-60 min (normal)",
        "Puedes cancelar hasta 15 minutos después de confirmar",
      ],
    },
    {
      id: 8,
      title: "Seguimiento y Entrega",
      description: "Monitorea tu pedido hasta que llegue a tu puerta",
      content:
        "Recibirás actualizaciones en tiempo real sobre el estado de tu pedido. Nuestro repartidor te contactará al llegar a tu dirección.",
      tips: [
        "Mantén tu teléfono disponible",
        "Prepara el método de pago seleccionado",
        "Si no estás, coordina con alguien para recibir",
        "Revisa los productos al recibirlos",
      ],
    },
  ];

  const currentStepData =
    steps.find((step) => step.id === currentStep) || steps[0];
  const progress = (currentStep / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepId: number) => {
    setCurrentStep(stepId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-brand-500 to-fresh-500 text-white py-12">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/contact")}
              className="text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Centro de Ayuda
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Play className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl lg:text-4xl">
                  Cómo Hacer Tu Primer Pedido
                </h1>
                <p className="text-white/90 text-lg">
                  Guía paso a paso para nuevos clientes
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Progreso del tutorial</span>
                <span className="text-sm font-medium">
                  Paso {currentStep} de {steps.length}
                </span>
              </div>
              <Progress value={progress} className="bg-white/20" />
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar - Steps Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pasos del Tutorial</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {steps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => goToStep(step.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-all",
                        "hover:bg-gray-50 flex items-center gap-3",
                        currentStep === step.id &&
                          "bg-brand-50 border border-brand-200",
                        currentStep > step.id && "text-green-600",
                      )}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                          currentStep === step.id && "bg-brand-500 text-white",
                          currentStep > step.id && "bg-green-500 text-white",
                          currentStep < step.id && "bg-gray-200 text-gray-600",
                        )}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-tight">
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {step.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Current Step */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="bg-brand-50 text-brand-700"
                    >
                      Paso {currentStep}
                    </Badge>
                    <div>
                      <CardTitle className="text-xl">
                        {currentStepData.title}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">
                        {currentStepData.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Video if available */}
                  {currentStepData.videoUrl && (
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <iframe
                        src={currentStepData.videoUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                        title={`Tutorial: ${currentStepData.title}`}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {currentStepData.content}
                    </p>
                  </div>

                  {/* Tips */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Consejos útiles
                    </h4>
                    <ul className="space-y-2">
                      {currentStepData.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-blue-800"
                        >
                          <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Anterior
                    </Button>

                    <div className="text-sm text-gray-500">
                      {currentStep} / {steps.length}
                    </div>

                    {currentStep < steps.length ? (
                      <Button
                        onClick={nextStep}
                        className="btn-gradient flex items-center gap-2"
                      >
                        Siguiente
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate("/shop")}
                        className="btn-gradient flex items-center gap-2"
                      >
                        Empezar a Comprar
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-auto p-4"
                      onClick={() => navigate("/shop")}
                    >
                      <Search className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Explorar Tienda</div>
                        <div className="text-xs text-gray-500">
                          Ver productos
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-auto p-4"
                      onClick={() => navigate("/contact")}
                    >
                      <Clock className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Horarios</div>
                        <div className="text-xs text-gray-500">
                          9:00 AM - 8:00 PM
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center gap-2 h-auto p-4"
                      onClick={() => navigate("/contact")}
                    >
                      <MapPin className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-medium">Zona de Entrega</div>
                        <div className="text-xs text-gray-500">
                          Radio de 2km
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialPrimerPedido;
