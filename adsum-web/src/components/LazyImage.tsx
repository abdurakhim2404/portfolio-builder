'use client';

import React, { useState, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackType?: 'avatar' | 'project';
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  rotationDegrees?: number;
  priority?: boolean;
}

export default function LazyImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  fallbackType = 'project',
  flipHorizontal = false,
  flipVertical = false,
  rotationDegrees = 0,
  priority = false,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(priority);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(priority);
    setHasError(false);
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const normalizedRotation = ((rotationDegrees % 360) + 360) % 360;
  const transforms: string[] = [];
  if (normalizedRotation !== 0) transforms.push(`rotate(${normalizedRotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const transformStyle = transforms.length ? { transform: transforms.join(' ') } : undefined;

  if (hasError || !src) {
    if (fallbackType === 'avatar') {
      return (
        <div className={`flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 font-bold ${className}`}>
          {alt ? alt.charAt(0).toUpperCase() : 'U'}
        </div>
      );
    }
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 ${className}`}>
        <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs uppercase tracking-wider font-medium opacity-40">No Image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <div className="w-full h-full animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        </div>
      )}
      
      <img
        src={src}
        alt={alt || 'Portfolio image'}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        onLoad={handleLoad}
        onError={handleError}
        style={transformStyle}
        className={`transition-opacity duration-500 ease-in-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
        {...props}
      />
    </div>
  );
}