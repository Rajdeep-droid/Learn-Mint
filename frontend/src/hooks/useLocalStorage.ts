"use client";

// ============================================================================
// useLocalStorage — Generic localStorage hook with SSR safety
// ============================================================================

import { useState, useCallback, useEffect } from "react";

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (SSR safe)
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        setStoredValue(defaultValue);
      }
    } catch {
      setStoredValue(defaultValue);
    }
    setHydrated(true);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue =
          value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch {
          // Storage full or unavailable
        }
        return nextValue;
      });
    },
    [key]
  );

  const clearValue = useCallback(() => {
    setStoredValue(defaultValue);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  }, [key, defaultValue]);

  // Return default during SSR, actual value after hydration
  return [hydrated ? storedValue : defaultValue, setValue, clearValue];
}
