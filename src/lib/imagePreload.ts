// =====================================================
// IMAGE PRELOAD — Preload critical profile avatars
// Inserts <link rel="preload"> for above-the-fold images
// =====================================================

/**
 * Preload an image by URL.
 * Inserts a <link rel="preload" as="image"> in the document head.
 */
export function preloadImage(url: string, crossOrigin?: 'anonymous' | 'use-credentials'): void {
  if (typeof document === 'undefined') return;

  // Avoid duplicate preloads
  const existing = document.querySelector(`link[rel="preload"][href="${url}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  if (crossOrigin) link.crossOrigin = crossOrigin;

  document.head.appendChild(link);
}

/**
 * Preload multiple images in parallel (max concurrency).
 * Uses fetch with low priority to avoid blocking critical resources.
 */
export async function preloadImages(
  urls: string[],
  options: { maxConcurrent?: number; priority?: 'high' | 'low' } = {},
): Promise<void> {
  const { maxConcurrent = 4, priority = 'low' } = options;

  // Add fetch hints
  for (const url of urls.slice(0, maxConcurrent)) {
    preloadImage(url, 'anonymous');
  }

  // For remaining images, use Image() constructor (lower priority)
  const remaining = urls.slice(maxConcurrent);
  let index = 0;

  const loadNext = async (): Promise<void> => {
    while (index < remaining.length) {
      const i = index++;
      const url = remaining[i];
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      });
    }
  };

  // Run N concurrent loaders
  const workers = Array.from({ length: Math.min(maxConcurrent, remaining.length) }, () => loadNext());
  await Promise.all(workers);
}

/**
 * Preload the first N profile avatar URLs.
 * Call this in the grid page with the visible profiles.
 */
export function preloadProfileAvatars(
  profiles: Array<{ avatar_url?: string | null; avatar?: string | null }>,
  count = 6,
): void {
  const urls = profiles
    .slice(0, count)
    .map((p) => p.avatar_url || p.avatar)
    .filter((url): url is string => !!url && url !== '/placeholder.svg');

  for (const url of urls) {
    preloadImage(url, 'anonymous');
  }
}

export default {
  preloadImage,
  preloadImages,
  preloadProfileAvatars,
};
