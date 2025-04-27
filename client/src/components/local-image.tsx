import React, { useState } from 'react';

interface LocalImageProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}

export default function LocalImage({ src, fallbackSrc, alt, className }: LocalImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      console.error(`Image failed to load: ${src}, using fallback`);
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className} 
      onError={handleError}
    />
  );
}