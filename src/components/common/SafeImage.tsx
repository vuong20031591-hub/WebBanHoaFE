"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/mappers/product";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

function shouldBypassOptimizer(src: string): boolean {
  if (!src.startsWith("http://") && !src.startsWith("https://")) {
    return false;
  }

  try {
    const url = new URL(src);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_PRODUCT_IMAGE,
  unoptimized,
  onError,
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized={unoptimized || shouldBypassOptimizer(currentSrc)}
      onError={(event) => {
        onError?.(event);
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
