import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Database,
  Eye,
  Lock,
  Users,
  Share2,
  Bell,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

const Privacy = () => {
  const sections = [
    {
      title: "1. Información que Recopilamos",
      icon: Database,
      content: [
        "Información personal: nombre, email, teléfono, dirección de facturación y envío.",
        "Información de cuenta: credenciales de acceso, preferencias y configuraciones.",
        "Datos de transacciones: historial de compras, métodos de pago, cupones utilizados.",
        "Información del dispositivo: dirección IP, tipo de navegador, sistema operativo.",
        "Datos de uso: páginas visitadas, tiempo de navegación, productos visualizados.",
      ],
    },
    {
      title: "2. Cómo Utilizamos su Información",
      icon: Eye,
      content: [
        "Procesar y completar sus transacciones de compra.",
        "Gestionar su cuenta y proporcionar atención al cliente.",
        "Personalizar su experiencia y mostrar contenido relevante.",
        "Enviar comunicaciones sobre pedidos, promociones y actualizaciones.",
        "Mejorar nuestros servicios y desarrollar nuevas funcionalidades.",
        "Cumplir con obligaciones legales y regulatorias.",
      ],
    },
    {
      title: "3. Compartir Información",
      icon: Share2,
      content: [
        "No vendemos, alquilamos o intercambiamos su información personal con terceros.",
        "Podemos compartir datos con proveedores de servicios de confianza (procesadores de pago, servicios de envío).",
        "Compartimos información cuando sea requerido por ley o autoridades competentes.",
        "En caso de fusión o adquisición, sus datos pueden transferirse al nuevo propietario.",
        "Con su consentimiento explícito para fines específicos.",
      ],
    },
    {
      title: "4. Seguridad de Datos",
      icon: Lock,
      content: [
        "Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos.",
        "Utilizamos cifrado SSL/TLS para proteger la transmisión de datos sensibles.",
        "Acceso restringido a información personal solo para empleados autorizados.",
        "Auditorías regulares de seguridad y actualizaciones de sistemas.",
        "Procedimientos de respuesta a incidentes para brechas de seguridad.",
      ],
    },
    {
      title: "5. Sus Derechos",
      icon: Users,
      content: [
        "Derecho de acceso: puede solicitar una copia de sus datos personales.",
        "Derecho de rectificación: puede corregir información inexacta o incompleta.",
        "Derecho de supresión: puede solicitar la eliminación de sus datos personales.",
        "Derecho de portabilidad: puede solicitar sus datos en formato estructurado.",
        "Derecho de oposición: puede oponerse al procesamiento de sus datos.",
        "Derecho a retirar el consentimiento en cualquier momento.",
      ],
    },
    {
      title: "6. Cookies y Tecnologías Similares",
      icon: Bell,
      content: [
        "Utilizamos cookies esenciales para el funcionamiento del sitio web.",
        "Cookies de rendimiento para analizar el uso y mejorar la experiencia.",
        "Cookies de funcionalidad para recordar sus preferencias.",
        "Cookies de marketing para mostrar anuncios relevantes (con su consentimiento).",
        "Puede gestionar las preferencias de cookies en la configuración de su navegador.",
      ],
    },
    {
      title: "7. Retención de Datos",
      icon: FileText,
      content: [
        "Conservamos sus datos personales solo durante el tiempo necesario para los fines establecidos.",
        "Datos de cuenta: mientras mantenga una cuenta activa con nosotros.",
        "Datos de transacciones: según requerimientos legales y fiscales (generalmente 7 años).",
        "Datos de marketing: hasta que retire su consentimiento.",
        "Datos técnicos: generalmente se eliminan después de 24 meses.",
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
              Política de Privacidad
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              En La Económica, valoramos y respetamos su privacidad. Esta
              política explica cómo recopilamos, utilizamos y protegemos su
              información personal.
            </p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <Badge variant="secondary" className="text-sm">
                Última actualización: {new Date().toLocaleDateString("es-ES")}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Cumple con GDPR y LFPDPPP
              </Badge>
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
                Nuestro Compromiso con su Privacidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  La Económica se compromete a proteger y respetar su
                  privacidad. Esta Política de Privacidad describe cómo
                  recopilamos, utilizamos, compartimos y protegemos su
                  información personal cuando utiliza nuestros servicios.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Principios Fundamentales
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Transparencia en el manejo de datos</li>
                    <li>• Minimización de datos recopilados</li>
                    <li>• Seguridad y protección robusta</li>
                    <li>• Respeto a sus derechos de privacidad</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
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

          {/* Data Subject Rights */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Shield className="w-5 h-5" />
                Ejercer sus Derechos de Privacidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-green-700">
                  Para ejercer cualquiera de sus derechos de privacidad, puede
                  contactarnos a través de:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-800">
                      Oficial de Protección de Datos
                    </h4>
                    <p className="text-green-700 text-sm">
                      Email: privacidad@laeconomica.com
                    </p>
                    <p className="text-green-700 text-sm">
                      Teléfono: +52 (555) 123-4567 ext. 101
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-800">
                      Tiempo de Respuesta
                    </h4>
                    <p className="text-green-700 text-sm">
                      Responderemos en un máximo de 20 días hábiles
                    </p>
                    <p className="text-green-700 text-sm">
                      Solicitudes urgentes: 72 horas
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-green-200 rounded p-3">
                  <p className="text-green-800 text-sm font-medium">
                    💡 Consejo: Para acelerar su solicitud, incluya información
                    específica sobre qué datos desea acceder, corregir o
                    eliminar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>8. Contacto y Actualizaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Si tiene preguntas sobre esta Política de Privacidad o
                  nuestras prácticas de datos:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">
                      Información General
                    </h4>
                    <p className="text-gray-600">Email: info@laeconomica.com</p>
                    <p className="text-gray-600">
                      Dirección: Av. Principal 123, Ciudad
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">
                      Actualizaciones
                    </h4>
                    <p className="text-gray-600">
                      Le notificaremos cambios significativos
                    </p>
                    <p className="text-gray-600">
                      Revise periódicamente esta política
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Nota:</strong> Esta política puede actualizarse
                    periódicamente. Los cambios entrarán en vigor inmediatamente
                    después de su publicación en nuestro sitio web.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Footer Actions */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-500">
              Al continuar utilizando nuestros servicios, usted confirma que ha
              leído, entendido y acepta esta Política de Privacidad.
            </p>

            <div className="flex gap-4 justify-center">
              <Link to="/">
                <Button variant="outline">Volver al inicio</Button>
              </Link>

              <Link to="/contact">
                <Button>Contactar DPO</Button>
              </Link>

              <Link to="/terms">
                <Button variant="outline">Ver Términos</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
