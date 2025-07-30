import React, { useState, useEffect } from "react";
import { useFlashSales } from "@/contexts/FlashSalesContext";
import { allProducts } from "@/lib/data";
import { useCartActions } from "@/hooks/use-cart-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  Clock,
  ShoppingCart,
  Users,
  TrendingUp,
  Timer,
  AlertCircle,
  Check,
  Star,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FlashSalesPage = () => {
  const {
    activeFlashSales,
    upcomingFlashSales,
    getTimeRemaining,
    getDiscountedPrice,
    purchaseFlashSaleItem,
    canUserPurchase,
    getUserPurchases,
  } = useFlashSales();

  const { addToCartWithNotification } = useCartActions();
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentUser = { id: "user_123" }; // Mock user

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePurchase = (saleId: string, productId: string, quantity: number = 1) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    if (canUserPurchase(currentUser.id, saleId, quantity)) {
      const success = purchaseFlashSaleItem(saleId, quantity, currentUser.id);
      if (success) {
        addToCartWithNotification(productId, quantity, product.name);
      }
    }
  };

  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold text-gray-900">Ofertas Flash</h1>
          <Zap className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-gray-600 text-lg">
          Descuentos increíbles por tiempo limitado. ¡No te los pierdas!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Flame className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{activeFlashSales.length}</div>
            <div className="text-sm text-gray-600">Ofertas Activas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{upcomingFlashSales.length}</div>
            <div className="text-sm text-gray-600">Próximamente</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">85%</div>
            <div className="text-sm text-gray-600">Promedio Vendido</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Ofertas Activas ({activeFlashSales.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Próximamente ({upcomingFlashSales.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeFlashSales.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Zap className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay ofertas flash activas
                </h3>
                <p className="text-gray-600">
                  Revisa más tarde o ve las ofertas que vienen próximamente
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeFlashSales.map((sale) => {
                const timeRemaining = getTimeRemaining(sale.id);
                const progress = ((sale.quantitySold / sale.totalQuantityAvailable) * 100);
                const isUrgent = timeRemaining && (timeRemaining.hours < 1);
                
                return (
                  <Card key={sale.id} className={cn(
                    "relative overflow-hidden transition-all hover:shadow-lg",
                    isUrgent && "border-red-300 shadow-red-100"
                  )}>
                    {/* Flash Sale Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-red-500 text-white animate-pulse">
                        <Flame className="h-3 w-3 mr-1" />
                        FLASH SALE
                      </Badge>
                    </div>

                    {/* Urgency Badge */}
                    {isUrgent && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge variant="destructive" className="animate-bounce">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          ¡Última hora!
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-3 pt-12">
                      <CardTitle className="text-lg">{sale.title}</CardTitle>
                      <p className="text-sm text-gray-600">{sale.description}</p>
                      
                      {/* Timer */}
                      {timeRemaining && (
                        <div className={cn(
                          "flex items-center gap-2 text-sm",
                          isUrgent ? "text-red-600" : "text-orange-600"
                        )}>
                          <Timer className="h-4 w-4" />
                          <span className="font-mono font-bold">
                            {formatTime(timeRemaining)}
                          </span>
                          <span>restantes</span>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Products */}
                      <div className="space-y-3">
                        {sale.productIds.map((productId: string) => {
                          const product = allProducts.find(p => p.id === productId);
                          if (!product) return null;

                          const originalPrice = product.price;
                          const discountedPrice = getDiscountedPrice(sale.id, originalPrice);
                          const savings = originalPrice - discountedPrice;
                          const discountPercentage = Math.round((savings / originalPrice) * 100);
                          const userPurchases = getUserPurchases(currentUser.id, sale.id);
                          const canBuy = canUserPurchase(currentUser.id, sale.id, 1);

                          return (
                            <div key={productId} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium">{product.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xl font-bold text-red-600">
                                      ${discountedPrice.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                      ${originalPrice.toFixed(2)}
                                    </span>
                                    <Badge variant="outline" className="text-red-600">
                                      -{discountPercentage}%
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-green-600 font-medium">
                                    Ahorras ${savings.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {/* Purchase Info */}
                              <div className="space-y-2 mb-3">
                                {userPurchases > 0 && (
                                  <div className="flex items-center gap-2 text-sm text-green-600">
                                    <Check className="h-4 w-4" />
                                    Has comprado {userPurchases} de {sale.maxQuantityPerUser} permitidos
                                  </div>
                                )}
                                
                                <div className="text-sm text-gray-600">
                                  Máximo {sale.maxQuantityPerUser} por cliente
                                </div>
                              </div>

                              <Button
                                className="w-full"
                                onClick={() => handlePurchase(sale.id, productId)}
                                disabled={!canBuy}
                              >
                                {!canBuy ? (
                                  userPurchases >= sale.maxQuantityPerUser ? "Límite alcanzado" : "Agotado"
                                ) : (
                                  <>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Agregar al Carrito
                                  </>
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Vendidos: {sale.quantitySold}/{sale.totalQuantityAvailable}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        {progress > 75 && (
                          <p className="text-sm text-red-600 font-medium">
                            ¡Pocas unidades disponibles!
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingFlashSales.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay ofertas programadas
                </h3>
                <p className="text-gray-600">
                  Las nuevas ofertas flash aparecerán aquí próximamente
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingFlashSales.map((sale) => {
                const timeToStart = getTimeRemaining(sale.id);
                
                return (
                  <Card key={sale.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Próximamente
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{sale.title}</CardTitle>
                      <p className="text-sm text-gray-600">{sale.description}</p>
                      
                      {timeToStart && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <Timer className="h-4 w-4" />
                          <span>Comienza en: </span>
                          <span className="font-mono font-bold">
                            {formatTime(timeToStart)}
                          </span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <Users className="h-4 w-4" />
                          <span>Cantidad disponible: {sale.totalQuantityAvailable}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-700 mt-1">
                          <Star className="h-4 w-4" />
                          <span>Máximo {sale.maxQuantityPerUser} por cliente</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlashSalesPage;
