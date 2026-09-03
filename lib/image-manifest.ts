import manifest from './image-manifest.json';

// Written by scripts/optimize-images.mjs. Each entry is
// [intrinsicWidth, intrinsicHeight, hasWebpSibling].
type Entry = [number, number, number];

export interface ImageInfo {
  width?: number;
  height?: number;
  webp?: string;
}

// Markdown keeps pointing at the original PNG/JPG/GIF. This resolves the two
// things the renderer needs on top of that: the intrinsic size (so the browser
// reserves the box and the image doesn't shove the article down when it loads)
// and the sibling .webp, offered through a <picture> source.
export function getImageInfo(src: string): ImageInfo {
  const entry = (manifest as Record<string, Entry>)[src.split(/[?#]/)[0]];
  if (!entry) return {};
  const [width, height, hasWebp] = entry;
  return {
    width,
    height,
    webp: hasWebp ? src.replace(/\.(png|jpe?g|gif)(?=$|[?#])/i, '.webp') : undefined,
  };
}
