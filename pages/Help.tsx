import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Package,
  CreditCard,
  Truck,
  MapPin,
  Star,
  ShoppingBag,
  User,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Download,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful?: number;
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "¿Cuál es el tiempo de entrega?",
    answer:
      "Nuestro tiempo de entrega estándar es de 15-20 minutos. Para entregas express, garantizamos la entrega en 10 minutos. El tiempo puede variar según la distancia y la disponibilidad de repartidores.",
    category: "entrega",
    tags: ["tiempo", "entrega", "express"],
    helpful: 42,
  },
  {
    id: "2",
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), PayPal, Mercado Pago, y pago en efectivo en tiendas OXXO. También puedes pagar contra entrega en efectivo.",
    category: "pago",
    tags: ["pago", "tarjeta", "efectivo", "paypal"],
    helpful: 38,
  },
  {
    id: "3",
    question: "¿Puedo cancelar mi pedido?",
    answer:
      "Sí, puedes cancelar tu pedido sin costo si aún está en estado 'Confirmado' o 'Preparando'. Una vez que el repartidor esté en camino, la cancelación puede tener un costo del 10% del total del pedido.",
    category: "pedidos",
    tags: ["cancelar", "pedido", "costo"],
    helpful: 35,
  },
  {
    id: "4",
    question: "¿Qué hago si falta un producto en mi pedido?",
    answer:
      "Si falta algún producto, contáctanos inmediatamente a través del chat en vivo o por WhatsApp. Te reembolsaremos el producto faltante o te lo enviaremos en la siguiente entrega disponible.",
    category: "pedidos",
    tags: ["falta", "producto", "reembolso"],
    helpful: 29,
  },
  {
    id: "5",
    question: "¿Cobran por la entrega?",
    answer:
      "La entrega estándar tiene un costo de $25. La entrega express cuesta $45. Las entregas son gratuitas en pedidos mayores a $300. Los miembros VIP tienen entregas gratuitas en todos los pedidos.",
    category: "entrega",
    tags: ["costo", "entrega", "gratis", "vip"],
    helpful: 44,
  },
  {
    id: "6",
    question: "¿Cómo funciona el programa de puntos?",
    answer:
      "Ganas 1 punto por cada $10 gastados. Los puntos se pueden canjear por descuentos: 100 puntos = $10 de descuento. También ganas puntos por reseñas (50 puntos) y por referir amigos (100 puntos).",
    category: "programa",
    tags: ["puntos", "descuento", "reseñas", "referidos"],
    helpful: 31,
  },
];

const helpArticles: HelpArticle[] = [
  {
    id: "1",
    title: "Cómo hacer tu primer pedido",
    description:
      "Guía paso a paso para realizar tu primera compra en La Economica",
    category: "primeros-pasos",
    readTime: "3 min",
    icon: <ShoppingBag className="w-5 h-5" />,
    popular: true,
  },
  {
    id: "2",
    title: "Gestionar tu cuenta",
    description:
      "Aprende a configurar tu perfil, direcciones y métodos de pago",
    category: "cuenta",
    readTime: "4 min",
    icon: <User className="w-5 h-5" />,
    popular: true,
  },
  {
    id: "3",
    title: "Seguimiento de pedidos",
    description:
      "Cómo rastrear tu pedido desde la confirmación hasta la entrega",
    category: "pedidos",
    readTime: "2 min",
    icon: <Package className="w-5 h-5" />,
  },
  {
    id: "4",
    title: "Programa de lealtad",
    description:
      "Maximiza tus beneficios con nuestro sistema de puntos y recompensas",
    category: "programa",
    readTime: "5 min",
    icon: <Star className="w-5 h-5" />,
  },
  {
    id: "5",
    title: "Política de devoluciones",
    description: "Todo lo que necesitas saber sobre reembolsos y cambios",
    category: "politicas",
    readTime: "3 min",
    icon: <Shield className="w-5 h-5" />,
  },
  {
    id: "6",
    title: "Zonas de entrega",
    description:
      "Consulta si hacemos entregas en tu área y horarios disponibles",
    category: "entrega",
    readTime: "2 min",
    icon: <MapPin className="w-5 h-5" />,
  },
];

const contactMethods = [
  {
    id: "chat",
    title: "Chat en vivo",
    description: "Respuesta inmediata de lunes a domingo",
    icon: <MessageCircle className="w-6 h-6" />,
    availability: "9:00 AM - 11:00 PM",
    action: "Iniciar chat",
    primary: true,
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "Mensajes y soporte por WhatsApp",
    icon: <Phone className="w-6 h-6" />,
    availability: "9:00 AM - 9:00 PM",
    action: "Contactar por WhatsApp",
    link: "https://wa.me/584125550123",
  },
  {
    id: "email",
    title: "Email",
    description: "Respuesta en menos de 24 horas",
    icon: <Mail className="w-6 h-6" />,
    availability: "Lun-Dom",
    action: "Enviar email",
    link: "mailto:ayuda@laeconomica.com",
  },
  {
    id: "phone",
    title: "Teléfono",
    description: "Atención personalizada por teléfono",
    icon: <Phone className="w-6 h-6" />,
    availability: "9:00 AM - 9:00 PM",
    action: "Llamar",
    link: "tel:+584125550123",
  },
];

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter FAQs based on search and category
  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: "all", name: "Todas", icon: <HelpCircle className="w-4 h-4" /> },
    { id: "entrega", name: "Entrega", icon: <Truck className="w-4 h-4" /> },
    { id: "pago", name: "Pagos", icon: <CreditCard className="w-4 h-4" /> },
    { id: "pedidos", name: "Pedidos", icon: <Package className="w-4 h-4" /> },
    { id: "programa", name: "Programa", icon: <Star className="w-4 h-4" /> },
    { id: "cuenta", name: "Cuenta", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-500 to-fresh-500 text-white py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display font-bold text-4xl lg:text-5xl mb-4">
              ¿En qué podemos ayudarte?
            </h1>
            <p className="text-lg text-white/90 mb-8">
              Encuentra respuestas rápidas a tus preguntas o contáctanos
              directamente
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar en la ayuda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 text-base bg-white text-gray-900 border-0"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 py-12">
        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">Preguntas frecuentes</TabsTrigger>
            <TabsTrigger value="guides">Guías y tutoriales</TabsTrigger>
            <TabsTrigger value="contact">Contactar soporte</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-8">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  {category.icon}
                  {category.name}
                </Button>
              ))}
            </div>

            {/* FAQ Results */}
            {filteredFAQs.length > 0 ? (
              <div className="space-y-6">
                <div className="text-gray-600">
                  {filteredFAQs.length} pregunta
                  {filteredFAQs.length !== 1 ? "s" : ""} encontrada
                  {filteredFAQs.length !== 1 ? "s" : ""}
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className={`bg-white border border-gray-200 rounded-lg px-6 animate-slide-in delay-${index * 100}`}
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-6">
                        <div className="flex items-start gap-3">
                          <div className="bg-brand-100 p-2 rounded-lg mt-1">
                            <HelpCircle className="w-4 h-4 text-brand-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-base">
                              {faq.question}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {
                                  categories.find((c) => c.id === faq.category)
                                    ?.name
                                }
                              </Badge>
                              {faq.helpful && (
                                <span className="text-xs text-gray-500">
                                  {faq.helpful} personas encontraron esto útil
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="ml-12">
                          <p className="text-gray-700 leading-relaxed mb-4">
                            {faq.answer}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {faq.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>¿Te resultó útil?</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                              >
                                👍
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                              >
                                👎
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              /* No Results */
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  No encontramos resultados
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No hay preguntas que coincidan con tu búsqueda. Intenta con
                  otros términos o contáctanos directamente.
                </p>
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  Limpiar búsqueda
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
                Guías y tutoriales
              </h2>
              <p className="text-gray-600">
                Aprende a usar La Economica con nuestras guías paso a paso
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpArticles.map((article, index) => (
                <Card
                  key={article.id}
                  className={`cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg animate-scale-in delay-${index * 100}`}
                  onClick={() => {
                    if (article.id === "1") {
                      window.open("/tutorial-primer-pedido", "_blank");
                    } else if (article.id === "2") {
                      window.open("/gestionar-perfil", "_blank");
                    } else if (article.id === "3") {
                      window.open("/seguimiento-pedidos", "_blank");
                    } else if (article.id === "4") {
                      window.open("/programa-lealtad", "_blank");
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-brand-100 p-3 rounded-lg">
                        {article.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {article.title}
                          </h3>
                          {article.popular && (
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {article.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-0 h-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (article.id === "1") {
                                window.open(
                                  "/tutorial-primer-pedido",
                                  "_blank",
                                );
                              } else if (article.id === "2") {
                                window.open("/gestionar-perfil", "_blank");
                              } else if (article.id === "3") {
                                window.open("/seguimiento-pedidos", "_blank");
                              } else if (article.id === "4") {
                                window.open("/programa-lealtad", "_blank");
                              }
                            }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Video Tutorials */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="font-display font-bold text-2xl mb-4">
                  Tutoriales en video
                </h3>
                <p className="text-white/90 mb-6">
                  Aprende visualmente con nuestros videotutoriales paso a paso
                </p>
                <Button
                  className="bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() =>
                    window.open("/contact#video-tutoriales", "_blank")
                  }
                >
                  <Play className="w-4 h-4 mr-2" />
                  Ver videos
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
                Contactar soporte
              </h2>
              <p className="text-gray-600">
                Nuestro equipo está aquí para ayudarte cuando lo necesites
              </p>
            </div>

            {/* Contact Methods */}
            <div className="grid md:grid-cols-2 gap-6">
              {contactMethods.map((method, index) => (
                <Card
                  key={method.id}
                  className={cn(
                    "cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg animate-scale-in",
                    method.primary && "border-brand-500 bg-brand-50",
                  )}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          method.primary
                            ? "bg-brand-500 text-white"
                            : "bg-gray-100 text-gray-600",
                        )}
                      >
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {method.title}
                          {method.primary && (
                            <Badge className="ml-2 bg-brand-500">
                              Recomendado
                            </Badge>
                          )}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {method.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                          <Clock className="w-4 h-4" />
                          <span>{method.availability}</span>
                        </div>
                        {method.link ? (
                          <Button
                            asChild
                            className={method.primary ? "btn-gradient" : ""}
                            variant={method.primary ? "default" : "outline"}
                          >
                            <a
                              href={method.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {method.action}
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </a>
                          </Button>
                        ) : (
                          <Button
                            className={method.primary ? "btn-gradient" : ""}
                            variant={method.primary ? "default" : "outline"}
                            onClick={() => {
                              if (method.id === "chat") {
                                window.open("/contact", "_blank");
                              }
                            }}
                          >
                            {method.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Status Banner */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">
                      Todos los sistemas operando normalmente
                    </h3>
                    <p className="text-sm text-green-700">
                      Última actualización: Hoy a las 14:30 PM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4" asChild>
                <Link to="/orders">
                  <div className="text-center">
                    <Package className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Ver mis pedidos</div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto p-4" asChild>
                <Link to="/profile">
                  <div className="text-center">
                    <User className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Mi cuenta</div>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Download className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Descargar app</div>
                </div>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Help;
