import React, { useState } from "react";
import { useReviews, Review } from "@/contexts/ReviewsContext";
import { allProducts } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { StarRating, RatingDistribution } from "@/components/ui/star-rating";
import {
  Plus,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Camera,
  Edit,
  Trash2,
  Flag,
  User,
  Calendar,
  Tag,
  TrendingUp,
  Award,
  ShoppingBag,
  MoreVertical,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const ReviewsPage = () => {
  const {
    reviews,
    getProductReviews,
    getProductStats,
    getUserReviews,
    addReview,
    updateReview,
    deleteReview,
    markHelpful,
    canUserReview,
    getUserReviewForProduct,
    getFilteredReviews,
    getReviewSummary,
  } = useReviews();

  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest" | "helpful">("newest");
  const [filters, setFilters] = useState({
    rating: [] as number[],
    verified: undefined as boolean | undefined,
    withImages: false,
  });

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    productId: "",
    rating: 5,
    title: "",
    comment: "",
    pros: [""],
    cons: [""],
    tags: [] as string[],
  });

  const summary = getReviewSummary();
  const currentUser = { id: "user_123", name: "Usuario Actual" }; // Mock user

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDisplayedReviews = () => {
    if (selectedProduct) {
      return getFilteredReviews(selectedProduct, { ...filters, sortBy });
    }

    let allReviews = reviews;
    
    // Apply search filter
    if (searchTerm) {
      const searchProducts = filteredProducts.map(p => p.id);
      allReviews = allReviews.filter(review => 
        searchProducts.includes(review.productId) ||
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    switch (selectedTab) {
      case "my-reviews":
        allReviews = getUserReviews(currentUser.id);
        break;
      case "verified":
        allReviews = allReviews.filter(review => review.verified);
        break;
      case "with-images":
        allReviews = allReviews.filter(review => review.images && review.images.length > 0);
        break;
    }

    // Apply additional filters
    if (filters.rating.length > 0) {
      allReviews = allReviews.filter(review => filters.rating.includes(review.rating));
    }

    if (filters.verified !== undefined) {
      allReviews = allReviews.filter(review => review.verified === filters.verified);
    }

    if (filters.withImages) {
      allReviews = allReviews.filter(review => review.images && review.images.length > 0);
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        allReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "oldest":
        allReviews.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case "highest":
        allReviews.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        allReviews.sort((a, b) => a.rating - b.rating);
        break;
      case "helpful":
        allReviews.sort((a, b) => b.helpful - a.helpful);
        break;
    }

    return allReviews;
  };

  const handleWriteReview = (productId?: string) => {
    if (productId) {
      setReviewForm(prev => ({ ...prev, productId }));
    }
    setShowWriteReview(true);
  };

  const handleSubmitReview = () => {
    if (!reviewForm.productId || !reviewForm.title || !reviewForm.comment) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const newReview = addReview({
      productId: reviewForm.productId,
      userId: currentUser.id,
      userName: currentUser.name,
      rating: reviewForm.rating,
      title: reviewForm.title,
      comment: reviewForm.comment,
      pros: reviewForm.pros.filter(p => p.trim()),
      cons: reviewForm.cons.filter(c => c.trim()),
      tags: reviewForm.tags,
      verified: true, // Mock verified purchase
    });

    toast({
      title: "Reseña publicada",
      description: "Tu reseña se ha publicado exitosamente",
    });

    setShowWriteReview(false);
    setReviewForm({
      productId: "",
      rating: 5,
      title: "",
      comment: "",
      pros: [""],
      cons: [""],
      tags: [],
    });
  };

  const handleHelpful = (reviewId: string, helpful: boolean) => {
    markHelpful(reviewId, helpful);
    toast({
      title: helpful ? "Marcado como útil" : "Marcado como no útil",
      description: "Gracias por tu feedback",
    });
  };

  const displayedReviews = getDisplayedReviews();

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reseñas y Calificaciones</h1>
          <p className="text-gray-600 mt-1">Comparte tu experiencia y lee opiniones de otros clientes</p>
        </div>
        <Button onClick={() => handleWriteReview()}>
          <Plus className="h-4 w-4 mr-2" />
          Escribir Reseña
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reseñas</p>
                <p className="text-2xl font-bold">{summary.totalReviews}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calificación Promedio</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{summary.averageRating.toFixed(1)}</p>
                  <StarRating rating={summary.averageRating} size="sm" />
                </div>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mis Reseñas</p>
                <p className="text-2xl font-bold text-green-600">{getUserReviews(currentUser.id).length}</p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Productos Reseñados</p>
                <p className="text-2xl font-bold text-purple-600">{summary.topProducts.length}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Buscar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar productos o reseñas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Calificación</Label>
                <div className="space-y-2 mt-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.rating.includes(rating)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({
                              ...prev,
                              rating: [...prev.rating, rating]
                            }));
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              rating: prev.rating.filter(r => r !== rating)
                            }));
                          }
                        }}
                      />
                      <StarRating rating={rating} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.verified === true}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({
                        ...prev,
                        verified: checked ? true : undefined
                      }))
                    }
                  />
                  <Label className="text-sm">Solo compras verificadas</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.withImages}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({
                        ...prev,
                        withImages: checked as boolean
                      }))
                    }
                  />
                  <Label className="text-sm">Con imágenes</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sort */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ordenar por</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguos</SelectItem>
                  <SelectItem value="highest">Calificación más alta</SelectItem>
                  <SelectItem value="lowest">Calificación más baja</SelectItem>
                  <SelectItem value="helpful">Más útiles</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Todas las Reseñas</TabsTrigger>
              <TabsTrigger value="my-reviews">Mis Reseñas</TabsTrigger>
              <TabsTrigger value="verified">Verificadas</TabsTrigger>
              <TabsTrigger value="with-images">Con Imágenes</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              {displayedReviews.map((review) => {
                const product = allProducts.find(p => p.id === review.productId);
                if (!product) return null;

                return (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{review.userName}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {review.createdAt.toLocaleDateString()}
                              {review.verified && (
                                <>
                                  <span>•</span>
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span className="text-green-600">Compra verificada</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {review.userId === currentUser.id && (
                              <>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem>
                              <Flag className="h-4 w-4 mr-2" />
                              Reportar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={review.rating} />
                          <h3 className="font-medium">{review.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Producto: <span className="font-medium">{product.name}</span>
                        </p>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>

                      {(review.pros.length > 0 || review.cons.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {review.pros.length > 0 && (
                            <div>
                              <p className="font-medium text-green-600 mb-2">Lo que me gustó:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {review.pros.map((pro, index) => (
                                  <li key={index}>• {pro}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {review.cons.length > 0 && (
                            <div>
                              <p className="font-medium text-red-600 mb-2">Lo que no me gustó:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {review.cons.map((con, index) => (
                                  <li key={index}>• {con}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {review.tags.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {review.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHelpful(review.id, true)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {review.helpful}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHelpful(review.id, false)}
                          >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            {review.notHelpful}
                          </Button>
                        </div>
                        {canUserReview(currentUser.id, review.productId) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWriteReview(review.productId)}
                          >
                            Escribir mi reseña
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {displayedReviews.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay reseñas
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {selectedTab === "my-reviews" 
                        ? "No has escrito ninguna reseña aún"
                        : "No se encontraron reseñas con los filtros seleccionados"
                      }
                    </p>
                    <Button onClick={() => handleWriteReview()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Escribir Primera Reseña
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </Tabs>
        </div>
      </div>

      {/* Write Review Dialog */}
      <Dialog open={showWriteReview} onOpenChange={setShowWriteReview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Escribir Reseña</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {!reviewForm.productId && (
              <div>
                <Label>Seleccionar Producto</Label>
                <Select 
                  value={reviewForm.productId} 
                  onValueChange={(value) => setReviewForm(prev => ({ ...prev, productId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elige un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {allProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Calificación</Label>
              <StarRating
                rating={reviewForm.rating}
                interactive
                size="lg"
                onChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
              />
            </div>

            <div>
              <Label htmlFor="title">Título de la reseña</Label>
              <Input
                id="title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Resume tu experiencia"
              />
            </div>

            <div>
              <Label htmlFor="comment">Comentario</Label>
              <Textarea
                id="comment"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Comparte tu experiencia con este producto"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowWriteReview(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitReview}>
                Publicar Reseña
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsPage;
