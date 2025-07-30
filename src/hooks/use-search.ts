import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { allProducts as products, Product } from "@/lib/data";
import { logger } from "@/lib/logger";

export interface UseSearchOptions {
  includeDescription?: boolean;
  includeTags?: boolean;
  includeBrand?: boolean;
}

export function useSearch(options: UseSearchOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );

  const {
    includeDescription = true,
    includeTags = true,
    includeBrand = false,
  } = options;

  // Sync search params with local state when URL changes
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam && searchParam !== searchQuery) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Update URL when search query changes
  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    const newParams = new URLSearchParams(searchParams);
    if (query.trim()) {
      newParams.set("search", query);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  // Filter products based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase();

    return products.filter((product) => {
      // Always search in name
      if (product.name?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in description if enabled
      if (
        includeDescription &&
        product.description?.toLowerCase().includes(query)
      ) {
        return true;
      }

      // Search in tags if enabled
      if (
        includeTags &&
        product.tags?.some((tag) => tag?.toLowerCase().includes(query))
      ) {
        return true;
      }

      // Search in brand if enabled
      if (includeBrand && product.brand?.toLowerCase().includes(query)) {
        return true;
      }

      return false;
    });
  }, [searchQuery, includeDescription, includeTags, includeBrand]);

  // Clear search
  const clearSearch = useCallback(() => {
    logger.userAction('search_cleared', { previousQuery: searchQuery });
    setSearchQuery("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    setSearchParams(newParams);
  }, [searchQuery, searchParams, setSearchParams]);

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const suggestions = new Set<string>();

    products.forEach(product => {
      // Add product names that start with the query
      if (product.name.toLowerCase().startsWith(query)) {
        suggestions.add(product.name);
      }

      // Add relevant tags
      if (includeTags) {
        product.tags?.forEach(tag => {
          if (tag.toLowerCase().startsWith(query)) {
            suggestions.add(tag);
          }
        });
      }

      // Add brand names
      if (includeBrand && product.brand?.toLowerCase().startsWith(query)) {
        suggestions.add(product.brand);
      }
    });

    return Array.from(suggestions).slice(0, 8); // Limit to 8 suggestions
  }, [searchQuery, includeTags, includeBrand]);

  // Search analytics
  const searchAnalytics = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const totalProducts = products.length;
    const resultsCount = searchResults.length;
    const successRate = (resultsCount / totalProducts) * 100;

    return {
      query: searchQuery,
      totalProducts,
      resultsCount,
      successRate: Math.round(successRate * 100) / 100,
      hasResults: resultsCount > 0,
      isEmpty: resultsCount === 0,
    };
  }, [searchQuery, searchResults.length]);

  // Log search events
  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        logger.userAction('search_performed', {
          query: searchQuery,
          resultCount: searchResults.length,
          options: { includeDescription, includeTags, includeBrand }
        });
      }, 1000); // Debounce logging

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, searchResults.length, includeDescription, includeTags, includeBrand]);

  return {
    searchQuery,
    searchResults,
    updateSearchQuery,
    clearSearch,
    searchSuggestions,
    searchAnalytics,
    hasActiveSearch: Boolean(searchQuery.trim()),
    resultCount: searchResults.length,
  };
}

// Hook specifically for product filtering with multiple criteria
export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [sortBy, setSortBy] = useState("popular");
  const [priceFilter, setPriceFilter] = useState("");

  // Sync URL params with local state
  useEffect(() => {
    const searchParam = searchParams.get("search");
    const categoryParam = searchParams.get("category");

    if (searchParam !== searchQuery) {
      setSearchQuery(searchParam || "");
    }
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam || "");
    }
  }, [searchParams]);

  // Update search query and URL
  const updateSearchQuery = (query: string) => {
    setSearchQuery(query);
    updateUrlParams({ search: query });
  };

  // Update category and URL
  const updateCategory = (category: string) => {
    setSelectedCategory(category);
    updateUrlParams({ category });
  };

  // Helper to update URL params
  const updateUrlParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.trim()) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    setSearchParams(newParams);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.tags?.some((tag) =>
            tag?.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    // Price filter
    if (priceFilter) {
      const [min, max] = priceFilter.split("-").map(Number);
      filtered = filtered.filter((product) => {
        if (max) {
          return product.price >= min && product.price <= max;
        } else {
          return product.price >= min;
        }
      });
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // popular
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, priceFilter]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    logger.userAction('filters_cleared', {
      previousFilters: {
        search: searchQuery,
        category: selectedCategory,
        price: priceFilter,
        sort: sortBy,
      }
    });
    setSearchQuery("");
    setSelectedCategory("");
    setPriceFilter("");
    setSearchParams({});
  }, [searchQuery, selectedCategory, priceFilter, sortBy, setSearchParams]);

  // Filter analytics
  const filterAnalytics = useMemo(() => {
    const activeFilters = {
      search: Boolean(searchQuery),
      category: Boolean(selectedCategory),
      price: Boolean(priceFilter),
    };

    const activeCount = Object.values(activeFilters).filter(Boolean).length;
    const filterEffectiveness = products.length > 0
      ? (filteredProducts.length / products.length) * 100
      : 0;

    return {
      activeFilters,
      activeCount,
      totalProducts: products.length,
      filteredCount: filteredProducts.length,
      filterEffectiveness: Math.round(filterEffectiveness * 100) / 100,
      isNarrowingResults: filterEffectiveness < 50,
      currentSort: sortBy,
    };
  }, [searchQuery, selectedCategory, priceFilter, sortBy, filteredProducts.length]);

  // Advanced search features
  const performAdvancedSearch = useCallback((criteria: {
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    brands?: string[];
    categories?: string[];
    tags?: string[];
    minRating?: number;
  }) => {
    logger.userAction('advanced_search', { criteria });

    let results = [...products];

    if (criteria.minPrice !== undefined) {
      results = results.filter(p => p.price >= criteria.minPrice!);
    }

    if (criteria.maxPrice !== undefined) {
      results = results.filter(p => p.price <= criteria.maxPrice!);
    }

    if (criteria.inStock !== undefined) {
      results = results.filter(p => p.inStock === criteria.inStock);
    }

    if (criteria.brands && criteria.brands.length > 0) {
      results = results.filter(p => p.brand && criteria.brands!.includes(p.brand));
    }

    if (criteria.categories && criteria.categories.length > 0) {
      results = results.filter(p => criteria.categories!.includes(p.category));
    }

    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter(p =>
        p.tags?.some(tag => criteria.tags!.includes(tag))
      );
    }

    if (criteria.minRating !== undefined) {
      results = results.filter(p => p.rating >= criteria.minRating!);
    }

    return results;
  }, []);

  // Smart sorting based on user preferences
  const smartSort = useCallback((products: Product[], userPreferences?: {
    preferredBrands?: string[];
    preferredCategories?: string[];
    priceRange?: [number, number];
  }) => {
    if (!userPreferences) return products;

    return products.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Boost preferred brands
      if (userPreferences.preferredBrands) {
        if (a.brand && userPreferences.preferredBrands.includes(a.brand)) scoreA += 10;
        if (b.brand && userPreferences.preferredBrands.includes(b.brand)) scoreB += 10;
      }

      // Boost preferred categories
      if (userPreferences.preferredCategories) {
        if (userPreferences.preferredCategories.includes(a.category)) scoreA += 5;
        if (userPreferences.preferredCategories.includes(b.category)) scoreB += 5;
      }

      // Boost products in preferred price range
      if (userPreferences.priceRange) {
        const [min, max] = userPreferences.priceRange;
        if (a.price >= min && a.price <= max) scoreA += 3;
        if (b.price >= min && b.price <= max) scoreB += 3;
      }

      return scoreB - scoreA;
    });
  }, []);



  // Active filters count
  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    priceFilter,
  ].filter(Boolean).length;

  return {
    // State
    searchQuery,
    selectedCategory,
    sortBy,
    priceFilter,
    filteredProducts,
    activeFiltersCount,
    // Actions
    updateSearchQuery,
    updateCategory,
    setSortBy,
    setPriceFilter,
    clearFilters,
    performAdvancedSearch,
    smartSort,

    // Analytics and insights
    filterAnalytics,

    // Computed
    hasActiveFilters: activeFiltersCount > 0,
    resultCount: filteredProducts.length,
  };
}
