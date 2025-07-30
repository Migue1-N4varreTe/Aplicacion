import React, { createContext, useContext, useState, useEffect } from "react";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  images?: string[]; // Review images
  verified: boolean; // Verified purchase
  helpful: number; // Helpful votes
  notHelpful: number; // Not helpful votes
  tags: string[]; // Product aspects: quality, price, delivery, etc.
  pros: string[];
  cons: string[];
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  response?: {
    id: string;
    authorName: string;
    authorRole: "admin" | "seller";
    content: string;
    createdAt: Date;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedPurchases: number;
  aspectRatings: {
    quality: number;
    value: number;
    delivery: number;
    packaging: number;
  };
}

interface ReviewsContextType {
  reviews: Review[];
  getProductReviews: (productId: string) => Review[];
  getProductStats: (productId: string) => ReviewStats;
  getUserReviews: (userId: string) => Review[];
  addReview: (review: Omit<Review, "id" | "createdAt" | "updatedAt" | "isEdited" | "helpful" | "notHelpful">) => Review;
  updateReview: (reviewId: string, updates: Partial<Review>) => void;
  deleteReview: (reviewId: string) => void;
  markHelpful: (reviewId: string, helpful: boolean) => void;
  canUserReview: (userId: string, productId: string) => boolean;
  getUserReviewForProduct: (userId: string, productId: string) => Review | null;
  getFilteredReviews: (productId: string, filters: {
    rating?: number[];
    verified?: boolean;
    withImages?: boolean;
    sortBy?: "newest" | "oldest" | "highest" | "lowest" | "helpful";
  }) => Review[];
  getReviewSummary: () => {
    totalReviews: number;
    averageRating: number;
    recentReviews: Review[];
    topProducts: { productId: string; rating: number; reviewCount: number; }[];
  };
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewsProvider");
  }
  return context;
};

export const ReviewsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load reviews from localStorage on mount
  useEffect(() => {
    const savedReviews = localStorage.getItem("la_economica_reviews");
    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews);
        const reviewsWithDates = parsedReviews.map((review: any) => ({
          ...review,
          createdAt: new Date(review.createdAt),
          updatedAt: new Date(review.updatedAt),
          response: review.response ? {
            ...review.response,
            createdAt: new Date(review.response.createdAt),
          } : undefined,
        }));
        setReviews(reviewsWithDates);
      } catch (error) {
        console.error("Error loading reviews:", error);
        localStorage.removeItem("la_economica_reviews");
      }
    }
  }, []);

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("la_economica_reviews", JSON.stringify(reviews));
  }, [reviews]);

  const generateId = () => `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const getProductReviews = (productId: string): Review[] => {
    return reviews.filter(review => review.productId === productId);
  };

  const getProductStats = (productId: string): ReviewStats => {
    const productReviews = getProductReviews(productId);
    
    if (productReviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        verifiedPurchases: 0,
        aspectRatings: { quality: 0, value: 0, delivery: 0, packaging: 0 },
      };
    }

    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / productReviews.length;

    const ratingDistribution = productReviews.reduce((dist, review) => {
      dist[review.rating as keyof typeof dist]++;
      return dist;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

    const verifiedPurchases = productReviews.filter(review => review.verified).length;

    // Calculate aspect ratings (simplified)
    const aspectRatings = {
      quality: averageRating, // In a real app, this would be based on specific aspect ratings
      value: averageRating * 0.9,
      delivery: averageRating * 0.95,
      packaging: averageRating * 0.85,
    };

    return {
      averageRating,
      totalReviews: productReviews.length,
      ratingDistribution,
      verifiedPurchases,
      aspectRatings,
    };
  };

  const getUserReviews = (userId: string): Review[] => {
    return reviews.filter(review => review.userId === userId);
  };

  const addReview = (reviewData: Omit<Review, "id" | "createdAt" | "updatedAt" | "isEdited" | "helpful" | "notHelpful">): Review => {
    const newReview: Review = {
      ...reviewData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false,
      helpful: 0,
      notHelpful: 0,
    };

    setReviews(prev => [newReview, ...prev]);
    return newReview;
  };

  const updateReview = (reviewId: string, updates: Partial<Review>) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            ...updates, 
            updatedAt: new Date(),
            isEdited: true,
          }
        : review
    ));
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId));
  };

  const markHelpful = (reviewId: string, helpful: boolean) => {
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          helpful: helpful ? review.helpful + 1 : review.helpful,
          notHelpful: !helpful ? review.notHelpful + 1 : review.notHelpful,
        };
      }
      return review;
    }));
  };

  const canUserReview = (userId: string, productId: string): boolean => {
    // Check if user already reviewed this product
    const existingReview = reviews.find(
      review => review.userId === userId && review.productId === productId
    );
    return !existingReview;
  };

  const getUserReviewForProduct = (userId: string, productId: string): Review | null => {
    return reviews.find(
      review => review.userId === userId && review.productId === productId
    ) || null;
  };

  const getFilteredReviews = (
    productId: string, 
    filters: {
      rating?: number[];
      verified?: boolean;
      withImages?: boolean;
      sortBy?: "newest" | "oldest" | "highest" | "lowest" | "helpful";
    }
  ): Review[] => {
    let filtered = getProductReviews(productId);

    // Apply filters
    if (filters.rating && filters.rating.length > 0) {
      filtered = filtered.filter(review => filters.rating!.includes(review.rating));
    }

    if (filters.verified !== undefined) {
      filtered = filtered.filter(review => review.verified === filters.verified);
    }

    if (filters.withImages) {
      filtered = filtered.filter(review => review.images && review.images.length > 0);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case "highest":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case "helpful":
        filtered.sort((a, b) => b.helpful - a.helpful);
        break;
      default:
        // Default to newest
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return filtered;
  };

  const getReviewSummary = () => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const recentReviews = reviews
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);

    // Get top-rated products
    const productRatings = reviews.reduce((acc, review) => {
      if (!acc[review.productId]) {
        acc[review.productId] = { ratings: [], count: 0 };
      }
      acc[review.productId].ratings.push(review.rating);
      acc[review.productId].count++;
      return acc;
    }, {} as { [key: string]: { ratings: number[]; count: number } });

    const topProducts = Object.entries(productRatings)
      .map(([productId, data]) => ({
        productId,
        rating: data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length,
        reviewCount: data.count,
      }))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);

    return {
      totalReviews,
      averageRating,
      recentReviews,
      topProducts,
    };
  };

  const value: ReviewsContextType = {
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
  };

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
};
