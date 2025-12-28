"use client";

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'rehab-estimator-color-favorites';

/**
 * Hook to manage favorite colors with localStorage persistence
 * 
 * Features:
 * - SSR-safe initialization
 * - Automatic localStorage sync
 * - Set-based O(1) lookups
 * 
 * @example
 * const { favorites, toggleFavorite, isFavorite, count } = useFavoriteColors();
 * 
 * // Toggle a color's favorite status
 * toggleFavorite(color.id);
 * 
 * // Check if a color is favorited
 * if (isFavorite(color.id)) { ... }
 */
export function useFavoriteColors() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    // SSR-safe initialization - return empty set on server
    if (typeof window === 'undefined') return new Set();
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that parsed value is an array
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
      return new Set();
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
      return new Set();
    }
  });

  // Re-initialize on client mount to handle SSR hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(new Set(parsed));
        }
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
    }
  }, []);

  // Persist to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch (error) {
      console.error('Failed to save favorites to localStorage:', error);
    }
  }, [favorites]);

  /**
   * Toggle a color's favorite status
   */
  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  /**
   * Check if a color is favorited
   */
  const isFavorite = useCallback((id: string) => {
    return favorites.has(id);
  }, [favorites]);

  /**
   * Add a color to favorites (idempotent)
   */
  const addFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  /**
   * Remove a color from favorites (idempotent)
   */
  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /**
   * Clear all favorites
   */
  const clearFavorites = useCallback(() => {
    setFavorites(new Set());
  }, []);

  return {
    /** Set of favorited color IDs */
    favorites,
    /** Toggle a color's favorite status */
    toggleFavorite,
    /** Check if a color is favorited */
    isFavorite,
    /** Add a color to favorites */
    addFavorite,
    /** Remove a color from favorites */
    removeFavorite,
    /** Clear all favorites */
    clearFavorites,
    /** Number of favorited colors */
    count: favorites.size,
  };
}
