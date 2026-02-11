import React from 'react';
import { cn } from '@/lib/utils';

interface ValueCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  iconColor?: string;
  bgColor?: string;
  className?: string;
}

export default function ValueCard({
  icon,
  title,
  description,
  iconColor = "text-primary-200",
  bgColor = "bg-greyscale-700",
  className,
}: ValueCardProps) {
  return (
    <div className={cn(
      "flex flex-col items-center text-center p-2 md:p-2 gap-4",
      className
    )}>
      {/* Icon Circle */}
      {icon && (
        <div className={`${bgColor} p-6 rounded-full flex items-center justify-center w-24 h-24 md:w-24 md:h-24`}>
          <span className={cn("inline-flex [&_svg]:w-12 [&_svg]:h-12 md:[&_svg]:w-14 md:[&_svg]:h-14 [&_svg]:shrink-0", iconColor)}>
            {icon}
          </span>
        </div>
      )}

      {/* Title with decorative lines */}
      <div className="w-full">
        <h3 className="text-xl md:text-2xl font-semibold text-greyscale-0">
          {title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm md:text-sm text-greyscale-100 leading-relaxed">
        {description}
      </p>
    </div>
  );
}