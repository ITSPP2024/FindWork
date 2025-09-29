import React, { useState } from 'react';
import { cn } from "../../lib/utils";

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2920&auto=format&fit=crop",
  className,
  ...props
}) {
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt}
      onError={() => setError(true)}
      className={cn("object-cover", className)}
      {...props}
    />
  );
}