import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Eye,
  CreditCard,
  Users,
  Bell,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";

const Terms = () => {
  const sections = [
    {
      title: "1. Aceptación de los Términos",
      icon: Shield,
      content: [
        "Al acceder y utilizar La Económica, usted acepta estar sujeto a estos Términos y Condiciones de Uso.",
        "Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.",
        "Nos reservamos el derecho de modificar estos términos en cualquier momento sin previo aviso.",
      ],
    },
    {
      title: "2. Uso del Servicio",
      icon: Users,
      content: [
        "Nuestros servicios están destinados para uso personal y comercial legítimo.",
        "Se compromete a proporcionar información precisa y actualizada al registrarse.",
        "Es responsable de mantener la confidencialidad de su cuenta y contraseña.",
        "No debe utilizar nuestros servicios para actividades ilegales o no autorizadas.",
      ],
    },
    {
      title: "3. Privacidad y Protección de Datos",
      icon: Eye,
      content: [
        "Respetamos su privacidad y protegemos sus datos personales conforme a la ley.",
        "Recopilamos solo la información necesaria para brindar nuestros servicios.",
        "No compartimos su información personal con terceros sin su consentimiento.",
        "Implementamos medidas de seguridad para proteger sus datos.",
      ],
    },
    {
      title: "4. Pagos y Transacciones",
      icon: CreditCard,
      content: [
        "Aceptamos múltiples métodos de pago: efectivo, tarjetas y transferencias.",
        "Todas las transacciones están sujetas a verificación y aprobación.",
        "Los precios están sujetos a cambios sin previo aviso.",
        "Las devoluciones se procesan según nuestra política de reembolsos.",
      ],
    },
    {
      title: "5. Programa de Fidelidad",
      icon: Bell,
      content: [
        "Nuestro programa de puntos está sujeto a términos y condiciones específicos.",
        "Los puntos no tienen valor monetario y no son transferibles.",
        "Los puntos pueden expirar según las políticas del programa.",
        "Nos reservamos el derecho de modificar o cancelar el programa en cualquier momento.",
      ],
    },
    {
      title: "6. Limitación de Responsabilidad",
      icon: Gavel,
      content: [
        "La Económica no será responsable por daños indirectos o consecuentes.",
        "Nuestra responsabilidad total no excederá el monto de la transacci��n específica.",
        "No garantizamos la disponibilidad continua de nuestros servicios.",
        "El uso de nuestros servicios es bajo su propio riesgo.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Por favor, lea atentamente estos términos y condiciones antes de
              utilizar nuestros servicios en La Económica.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Última actualización: {new Date().toLocaleDateString("es-ES")}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-600" />
                Bienvenido a La Económica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Estos Términos y Condiciones de Uso ("Términos") rigen su acceso
                y uso de los servicios proporcionados por La Económica,
                incluyendo nuestro sitio web, aplicación móvil, y servicios de
                punto de venta. Al utilizar nuestros servicios, usted acepta
                cumplir con estos términos.
              </p>
            </CardContent>
          </Card>

          {/* Terms Sections */}
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-brand-600" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-brand-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>7. Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Si tiene preguntas sobre estos Términos y Condiciones, puede
                  contactarnos a través de:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">
                      Información General
                    </h4>
                    <p className="text-gray-600">Email: info@laeconomica.com</p>
                    <p className="text-gray-600">
                      Teléfono: +52 (555) 123-4567
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">
                      Soporte Técnico
                    </h4>
                    <p className="text-gray-600">
                      Email: soporte@laeconomica.com
                    </p>
                    <p className="text-gray-600">
                      Horario: Lunes a Viernes, 9:00 - 18:00
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Footer Actions */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Al continuar utilizando nuestros servicios, usted confirma que ha
              leído, entendido y acepta estos Términos y Condiciones.
            </p>

            <div className="flex gap-4 justify-center">
              <Link to="/">
                <Button variant="outline">Volver al inicio</Button>
              </Link>

              <Link to="/contact">
                <Button>Contactar soporte</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
