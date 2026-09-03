import React from "react";
import { getImageInfo } from "@/lib/image-manifest";

type PostImageProps = React.ComponentProps<"img">;

// One <img> for post bodies, with the two things a plain markdown image is
// missing: a WebP source (roughly a third of the bytes on the big diagrams)
// and intrinsic width/height so the layout doesn't jump when it loads.
//
// The <picture> wrapper uses display:contents so it adds no box of its own —
// every existing layout class still applies to the <img>, unchanged.
export function PostImage({ src, alt, className, ...rest }: PostImageProps) {
  const { width, height, webp } = getImageInfo(typeof src === "string" ? src : "");

  const img = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
      {...rest}
    />
  );

  if (!webp) return img;

  return (
    <picture style={{ display: "contents" }}>
      <source srcSet={webp} type="image/webp" />
      {img}
    </picture>
  );
}
