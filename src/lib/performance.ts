/**
 * Performance utilities for monitoring and optimization
 */

// Web Vitals tracking
export interface WebVitalsMetric {
  name: "CLS" | "FCP" | "FID" | "LCP" | "TTFB" | "INP";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

type WebVitalsCallback = (metric: WebVitalsMetric) => void;

// Dynamic import for web-vitals (optional dependency)
export async function reportWebVitals(onReport: WebVitalsCallback) {
  try {
    // @ts-ignore - optional dependency
    const { onCLS, onFCP, onFID, onLCP, onTTFB, onINP } = await import("web-vitals");
    onCLS(onReport);
    onFCP(onReport);
    onFID(onReport);
    onLCP(onReport);
    onTTFB(onReport);
    onINP(onReport);
  } catch {
    // web-vitals not installed, skip
    console.log("Web Vitals tracking not available");
  }
}

// Memory usage monitoring
export function getMemoryUsage(): { usedJSHeapSize: number; totalJSHeapSize: number } | null {
  // Chrome-only API
  const perf = performance as Performance & { 
    memory?: { usedJSHeapSize: number; totalJSHeapSize: number } 
  };
  if (perf.memory) {
    return {
      usedJSHeapSize: perf.memory.usedJSHeapSize,
      totalJSHeapSize: perf.memory.totalJSHeapSize,
    };
  }
  return null;
}

// Measure component render time
export function measureRender(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 16) { // More than 1 frame at 60fps
      console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`);
    }
  };
}

// Prefetch a route
export function prefetchRoute(path: string) {
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = path;
  document.head.appendChild(link);
}

// Preload critical resources
export function preloadResource(
  url: string,
  as: "script" | "style" | "image" | "font" | "fetch"
) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = url;
  link.as = as;
  if (as === "font") {
    link.crossOrigin = "anonymous";
  }
  document.head.appendChild(link);
}

// Image loading optimization
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif" | "auto";
  } = {}
): string {
  const { width, height, quality = 80, format = "auto" } = options;

  // Handle Unsplash images
  if (url.includes("unsplash.com")) {
    const imageUrl = new URL(url);
    if (width) imageUrl.searchParams.set("w", width.toString());
    if (height) imageUrl.searchParams.set("h", height.toString());
    imageUrl.searchParams.set("q", quality.toString());
    imageUrl.searchParams.set("auto", "format");
    imageUrl.searchParams.set("fit", "crop");
    return imageUrl.toString();
  }

  return url;
}

// Check if browser supports modern image formats
export function supportsWebP(): boolean {
  const canvas = document.createElement("canvas");
  if (canvas.getContext && canvas.getContext("2d")) {
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }
  return false;
}

export function supportsAvif(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src =
      "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgABpAlAQwCAkUAAAAYAAQYSgN/8QqC";
  });
}

// Connection-aware loading
export function getConnectionQuality(): "slow" | "fast" | "unknown" {
  // @ts-ignore - navigator.connection is not in all browsers
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return "unknown";
  
  const effectiveType = connection.effectiveType;
  if (effectiveType === "slow-2g" || effectiveType === "2g") return "slow";
  if (effectiveType === "3g") return "slow";
  return "fast";
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Check if user prefers reduced data
export function prefersReducedData(): boolean {
  // @ts-ignore
  const connection = navigator.connection;
  return connection?.saveData === true;
}

export default {
  reportWebVitals,
  getMemoryUsage,
  measureRender,
  prefetchRoute,
  preloadResource,
  getOptimizedImageUrl,
  supportsWebP,
  supportsAvif,
  getConnectionQuality,
  prefersReducedMotion,
  prefersReducedData,
};
