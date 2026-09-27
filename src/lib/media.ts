import type { ImageMetadata } from "astro";
const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/uploads/**/*.{png,jpg,jpeg,webp,avif,svg}",
  { eager: true },
);
export function mediaImage(path: string): ImageMetadata {
  const image = images[path]?.default;
  if (!image)
    throw new Error(`Image not found: ${path}. Upload it in Pages CMS first.`);
  return image;
}
