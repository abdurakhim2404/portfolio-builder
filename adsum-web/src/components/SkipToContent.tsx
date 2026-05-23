'use client';

import React from 'react';

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:font-medium"
    >
      Skip to main content
    </a>
  );
}