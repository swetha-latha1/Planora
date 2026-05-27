'use client';
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initial: T, userId?: string | null) {
  const storageKey = userId ? `${userId}:${key}` : key;
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    if (!userId) return;
    const stored = localStorage.getItem(storageKey);
    setValue(stored ? JSON.parse(stored) : initial);
  }, [storageKey, userId]);

  const set = (v: T) => {
    setValue(v);
    localStorage.setItem(storageKey, JSON.stringify(v));
  };

  return [value, set] as const;
}
