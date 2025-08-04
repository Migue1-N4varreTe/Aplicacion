import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { allProducts as products, Product } from "@/lib/data";

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
  const clearSearch = () => {
    setSearchQuery("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    setSearchParams(newParams);
  };

  return {
    searchQuery,
    searchResults,
    updateSearchQuery,
    clearSearch,
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
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPriceFilter("");
    setSearchParams({});
  };

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

    // Computed
    hasActiveFilters: activeFiltersCount > 0,
    resultCount: filteredProducts.length,
  };
}
