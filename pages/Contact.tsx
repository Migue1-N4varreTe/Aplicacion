import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  Building,
  Users,
  Briefcase,
  Heart,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
  priority: string;
}

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
    priority: "medium",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const contactReasons = [
    { value: "order-issue", label: "Problema con mi pedido" },
    { value: "payment-issue", label: "Problema de pago" },
    { value: "delivery-issue", label: "Problema de entrega" },
    { value: "product-feedback", label: "Comentarios sobre productos" },
    { value: "technical-support", label: "Soporte técnico" },
    { value: "partnership", label: "Alianzas comerciales" },
    { value: "press", label: "Prensa y medios" },
    { value: "other", label: "Otro" },
  ];

  const priorityLevels = [
    { value: "low", label: "Baja", color: "bg-green-100 text-green-700" },
    { value: "medium", label: "Media", color: "bg-yellow-100 text-yellow-700" },
    { value: "high", label: "Alta", color: "bg-red-100 text-red-700" },
    {
      value: "urgent",
      label: "Urgente",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  const officeLocations = [
    {
      name: "Oficina Principal",
      address: "Av. Presidente Masaryk 111, Polanco, CDMX 11560",
      phone: "Disponible en horario de oficina",
      email: "Formulario de contacto disponible",
      hours: "Lunes a Viernes: 9:00 AM - 6:00 PM",
      type: "Corporativo",
    },
    {
      name: "Centro de Distribución Norte",
      address:
        "Av. Instituto Politécnico Nacional 1936, Gustavo A. Madero, CDMX",
      phone: "Centro de distribución",
      email: "Solo operaciones logísticas",
      hours: "Lunes a Domingo: 9:00 AM - 9:00 PM",
      type: "Logística",
    },
    {
      name: "Centro de Distribución Sur",
      address: "Calz. de Tlalpan 4620, Tlalpan, CDMX",
      phone: "Centro de distribución",
      email: "Solo operaciones logísticas",
      hours: "Lunes a Domingo: 9:00 AM - 9:00 PM",
      type: "Logística",
    },
  ];

  const teamContacts = [
    {
      department: "Atención al Cliente",
      email: "Formulario de contacto",
      phone: "Chat en línea disponible",
      hours: "9:00 AM - 9:00 PM",
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      department: "Ventas Corporativas",
      email: "Formulario específico",
      phone: "Citas programadas",
      hours: "9:00 AM - 6:00 PM",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      department: "Prensa y Medios",
      email: "Contacto por formulario",
      phone: "Solicitud de entrevista",
      hours: "9:00 AM - 6:00 PM",
      icon: <Users className="w-5 h-5" />,
    },
    {
      department: "Recursos Humanos",
      email: "Portal de empleo",
      phone: "Consultas por formulario",
      hours: "9:00 AM - 5:00 PM",
      icon: <Heart className="w-5 h-5" />,
    },
  ];

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "El asunto es requerido";
    }

    if (!formData.category) {
      newErrors.category = "Selecciona una categoría";
    }

    if (!formData.message.trim()) {
      newErrors.message = "El mensaje es requerido";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "El mensaje debe tener al menos 10 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="container px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-display font-bold text-3xl text-gray-900 mb-4">
              ¡Mensaje enviado con éxito!
            </h1>
            <p className="text-gray-600 mb-8">
              Hemos recibido tu mensaje y te responderemos lo antes posible.
              Generalmente respondemos dentro de las próximas 2-4 horas durante
              horario hábil.
            </p>

            <div className="bg-white p-6 rounded-lg border mb-8">
              <h3 className="font-semibold mb-2">Número de referencia</h3>
              <p className="text-2xl font-mono text-brand-600 mb-4">
                #REF-{Date.now().toString().slice(-6)}
              </p>
              <p className="text-sm text-gray-600">
                Guarda este número para futuras referencias
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    subject: "",
                    category: "",
                    message: "",
                    priority: "medium",
                  });
                }}
                variant="outline"
              >
                Enviar otro mensaje
              </Button>

              <Button className="btn-gradient" asChild>
                <a href="/">Volver al inicio</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-500 to-fresh-500 text-white py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4">
              Contáctanos
            </h1>
            <p className="text-lg text-white/90">
              Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos
              pronto.
            </p>
          </div>
        </div>
      </section>

      <div className="container px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Envíanos un mensaje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Tu nombre completo"
                        className={cn(errors.name && "border-red-500")}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="tu@email.com"
                        className={cn(errors.email && "border-red-500")}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (opcional)</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+52 55 1234 5678"
                    />
                  </div>

                  {/* Subject and Category */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Asunto *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      placeholder="Describe brevemente tu consulta"
                      className={cn(errors.subject && "border-red-500")}
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-sm">{errors.subject}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoría *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger
                          className={cn(errors.category && "border-red-500")}
                        >
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactReasons.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-red-500 text-sm">
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Prioridad</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                          handleInputChange("priority", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center gap-2">
                                <Badge className={cn("text-xs", level.color)}>
                                  {level.label}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      placeholder="Describe tu consulta con el mayor detalle posible..."
                      rows={6}
                      className={cn(errors.message && "border-red-500")}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm">{errors.message}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {formData.message.length}/500 caracteres
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-gradient shadow-glow"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Enviando mensaje...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar mensaje
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Team Contacts - Moved below form */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Contactos por departamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamContacts.map((contact, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          {contact.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {contact.department}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 ml-11 space-y-1">
                        <p>📧 {contact.email}</p>
                        <p>📞 {contact.phone}</p>
                        <p>🕒 {contact.hours}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contacto rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-100 p-2 rounded-lg">
                      <Phone className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-sm text-gray-600">
                        Disponible por chat
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-fresh-100 p-2 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-fresh-600" />
                    </div>
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-sm text-gray-600">
                        Respuesta inmediata
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Mail className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-gray-600">
                        Formulario de contacto
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Horario</p>
                      <p className="text-sm text-gray-600">
                        9:00 AM - 11:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full btn-gradient">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Iniciar chat
                </Button>
              </CardContent>
            </Card>

            {/* Office Locations - Made vertical */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Nuestras oficinas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {officeLocations.map((location, index) => (
                  <div
                    key={index}
                    className="space-y-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{location.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {location.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{location.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{location.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span>{location.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{location.hours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Help Center Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">
              Centro de Ayuda
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encuentra respuestas rápidas a las preguntas más frecuentes sobre
              nuestros servicios
            </p>
          </div>

          {/* FAQ Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Preguntas Frecuentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Cuál es el horario de entrega?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Realizamos entregas de lunes a domingo de 9:00 AM a 8:00 PM.
                    Los pedidos realizados después de las 7:30 PM se entregarán
                    al día siguiente.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Cuál es el monto mínimo para delivery?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    El monto mínimo para delivery es de $25. Para pedidos
                    menores a $50 se aplica un costo de envío de $3.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Aceptan devoluciones?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Sí, aceptamos devoluciones de productos no perecederos
                    dentro de 24 horas de la compra, presentando el recibo
                    original.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Cómo puedo pagar mis compras?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Aceptamos efectivo, tarjetas de débito y crédito,
                    transferencias bancarias y pagos móviles como Zelle y Pago
                    Móvil.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Tienen programa de puntos o descuentos?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Sí, contamos con un programa de fidelidad donde acumulas
                    puntos con cada compra. También ofrecemos descuentos
                    especiales para adultos mayores.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Cómo puedo cancelar mi pedido?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Puedes cancelar tu pedido hasta 15 minutos después de
                    haberlo realizado. Llama al (0212) 555-0123 o contacta por
                    WhatsApp para cancelaciones.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Qué hago si mi pedido llega en mal estado?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Si recibes productos en mal estado, contáctanos
                    inmediatamente. Haremos el reemplazo sin costo adicional o
                    reembolso completo.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Ofrecen descuentos por compras al mayor?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Sí, ofrecemos descuentos especiales para compras al mayor.
                    Contacta a nuestro equipo comercial para conocer los precios
                    mayoristas.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Tienen productos orgánicos?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Sí, contamos con una sección especial de productos orgánicos
                    certificados, incluyendo frutas, verduras y productos
                    procesados.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Cómo funciona el delivery express?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    El delivery express entrega tu pedido en 15-30 minutos.
                    Disponible de 9:00 AM a 7:00 PM con un cargo adicional de
                    $5.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Puedo cambiar la dirección de entrega?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Sí, puedes cambiar la dirección hasta que el repartidor
                    salga de la tienda. Llámanos inmediatamente para hacer el
                    cambio.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Qué medidas de seguridad tienen para COVID-19?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Mantenemos estrictos protocolos de limpieza, desinfección de
                    productos, uso de mascarillas y entrega sin contacto si lo
                    solicitas.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Hacen facturas para empresas?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Sí, emitimos facturas para empresas. Solo necesitas
                    proporcionar los datos fiscales de tu empresa al momento del
                    pago.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Tienen aplicación móvil?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Próximamente lanzaremos nuestra app móvil. Por ahora puedes
                    usar nuestro sitio web optimizado para móviles.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Cómo reporto un problema con mi pedido?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Puedes reportar problemas por WhatsApp, teléfono, email o
                    usando el formulario de contacto en nuestra web.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Ofrecen servicio de catering?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Sí, ofrecemos servicio de catering para eventos corporativos
                    y familiares. Contacta con 48 horas de anticipación para
                    coordinarlo.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Puedo solicitar productos que no están en stock?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Sí, podemos conseguir productos especiales bajo pedido.
                    Consulta disponibilidad y tiempo de entrega con nuestro
                    equipo.
                  </p>
                </details>

                <details className="border-b border-gray-100 pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Cómo funcionan las promociones y ofertas?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Las ofertas se aplican automáticamente al agregar productos
                    al carrito. Revisa nuestra sección de ofertas para ver las
                    promociones vigentes.
                  </p>
                </details>

                <details className="pb-4">
                  <summary className="font-medium cursor-pointer text-gray-900 hover:text-brand-600">
                    ¿Tienen servicio al cliente 24/7?
                  </summary>
                  <p className="mt-2 text-sm text-gray-600">
                    Nuestro horario de atención es de 9:00 AM a 6:00 PM de lunes
                    a domingo. Para emergencias, dejanos un mensaje y te
                    contactaremos al día siguiente.
                  </p>
                </details>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guías y Tutoriales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <button
                    onClick={() =>
                      window.open("/tutorial-primer-pedido", "_blank")
                    }
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="bg-brand-500 text-white p-2 rounded-lg">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-sm">
                        Cómo hacer tu primer pedido
                      </h4>
                      <p className="text-xs text-gray-600">
                        Guía paso a paso para nuevos clientes
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => window.open("/gestionar-perfil", "_blank")}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="bg-fresh-500 text-white p-2 rounded-lg">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-sm">
                        Gestionar tu perfil
                      </h4>
                      <p className="text-xs text-gray-600">
                        Administra tu información personal y preferencias
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => window.open("/programa-lealtad", "_blank")}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="bg-yellow-500 text-white p-2 rounded-lg">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-sm">
                        Programa de puntos y descuentos
                      </h4>
                      <p className="text-xs text-gray-600">
                        Aprende a aprovechar al máximo nuestras ofertas
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      window.open("/seguimiento-pedidos", "_blank")
                    }
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="bg-red-500 text-white p-2 rounded-lg">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-sm">
                        Seguimiento de pedidos
                      </h4>
                      <p className="text-xs text-gray-600">
                        Monitorea el estado de tus pedidos en tiempo real
                      </p>
                    </div>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-4">
                    📹 Video Tutoriales
                  </h4>
                  <div className="grid gap-4">
                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500 text-white p-2 rounded-lg">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-blue-900">
                            Tutorial: Primer Pedido
                          </h5>
                          <p className="text-xs text-blue-700">
                            Guía paso a paso (8 min)
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            window.open(
                              "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                              "_blank",
                            )
                          }
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          Ver Video
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 text-white p-2 rounded-lg">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-blue-900">
                            Seleccionar Productos Frescos
                          </h5>
                          <p className="text-xs text-blue-700">
                            Tips y consejos (5 min)
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            window.open(
                              "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                              "_blank",
                            )
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                        >
                          Ver Video
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-500 text-white p-2 rounded-lg">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-blue-900">
                            Programa de Lealtad
                          </h5>
                          <p className="text-xs text-blue-700">
                            Maximiza tus puntos (6 min)
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            window.open(
                              "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                              "_blank",
                            )
                          }
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition-colors"
                        >
                          Ver Video
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-500 text-white p-2 rounded-lg">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-blue-900">
                            Métodos de Pago
                          </h5>
                          <p className="text-xs text-blue-700">
                            Todas las opciones (4 min)
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            window.open(
                              "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                              "_blank",
                            )
                          }
                          className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600 transition-colors"
                        >
                          Ver Video
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Help Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-brand-100 text-brand-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-medium mb-2">Chat en Vivo</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Habla directamente con nuestro equipo de soporte
                  </p>
                  <Button size="sm" variant="outline">
                    Iniciar Chat
                  </Button>
                </div>

                <div className="text-center">
                  <div className="bg-fresh-100 text-fresh-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="font-medium mb-2">Llámanos</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Atención telefónica de 9:00 AM a 6:00 PM
                  </p>
                  <Button size="sm" variant="outline">
                    (0212) 555-0123
                  </Button>
                </div>

                <div className="text-center">
                  <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="font-medium mb-2">Email Support</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Respuesta en menos de 2 horas
                  </p>
                  <Button size="sm" variant="outline">
                    ayuda@laeconomica.com
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
