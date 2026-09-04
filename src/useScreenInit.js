import { useMemo } from 'react';
import { manifest } from './canvas.manifest.js';

export function useScreenInit() {
  return useMemo(() => {
    // Yalnızca yerel geliştirme ortamında tasarım önizlemesi için kullanılır; üretimde asla çalışmaz.
    if (!import.meta.env.DEV) return {};
    if (typeof window === 'undefined') return {};
    const screenId = new URLSearchParams(window.location.search).get('mp_screen');
    if (!screenId) return {};
    return manifest?.screens?.[screenId]?.state ?? {};
  }, []);
}