'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  duration?: number;
  className?: string;
  stagger?: boolean;
}

export default function AnimatedSection({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className = '',
  stagger = false,
}: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration,
        delay,
        staggerChildren: stagger ? 0.1 : undefined,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}