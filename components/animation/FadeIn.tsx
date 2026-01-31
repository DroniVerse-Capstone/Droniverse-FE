'use client';

import { ReactNode } from 'react';
import { motion, Easing } from 'framer-motion';

interface FadeInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  from?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  distance?: number;
  className?: string;
  ease?: Easing | Easing[];
  onComplete?: () => void;
}

export const FadeIn = ({
  children,
  duration = 1,
  delay = 0,
  from = 'center',
  distance = 50,
  className = '',
  ease = 'easeOut',
  onComplete,
}: FadeInProps) => {
  const getInitialPosition = () => {
    switch (from) {
      case 'top':
        return { opacity: 0, y: -distance };
      case 'bottom':
        return { opacity: 0, y: distance };
      case 'left':
        return { opacity: 0, x: -distance };
      case 'right':
        return { opacity: 0, x: distance };
      case 'center':
        return { opacity: 0, scale: 0.8 };
      default:
        return { opacity: 0 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={getInitialPosition()}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      transition={{ duration, delay, ease }}
      onAnimationComplete={onComplete}
    >
      {children}
    </motion.div>
  );
};
