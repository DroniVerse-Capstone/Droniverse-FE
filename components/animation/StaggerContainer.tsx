'use client';

import { ReactNode, Children } from 'react';
import { Easing, motion } from 'framer-motion';

interface StaggerContainerProps {
  children: ReactNode;
  stagger?: number;
  duration?: number;
  delay?: number;
  from?: 'top' | 'bottom' | 'left' | 'right' | 'scale';
  distance?: number;
  className?: string;
  childClassName?: string;
  ease?: Easing | Easing[];
}

export const StaggerContainer = ({
  children,
  stagger = 0.1,
  duration = 0.6,
  delay = 0,
  from = 'bottom',
  distance = 50,
  className = '',
  childClassName = '',
  ease = 'easeOut',
}: StaggerContainerProps) => {
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
      case 'scale':
        return { opacity: 0, scale: 0 };
      default:
        return { opacity: 0 };
    }
  };

  const childrenArray = Children.toArray(children);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const childVariants = {
    hidden: getInitialPosition(),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration,
        ease,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {childrenArray.map((child, index) => (
        <motion.div key={index} className={childClassName} variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
