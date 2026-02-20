'use client';

import { CATEGORIES } from '@/lib/utils';
import type { ExpenseCategory } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryIconProps {
  category: ExpenseCategory;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: 'h-8 w-8 text-base', label: 'text-xs' },
  md: { container: 'h-10 w-10 text-xl', label: 'text-sm' },
  lg: { container: 'h-12 w-12 text-2xl', label: 'text-sm' },
};

export default function CategoryIcon({
  category,
  size = 'md',
  showLabel = false,
  className,
}: CategoryIconProps) {
  const cat = CATEGORIES[category] || CATEGORIES.miscellaneous;
  const sizes = sizeMap[size];

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-xl flex-shrink-0',
          sizes.container
        )}
        style={{ backgroundColor: cat.bgColor, color: cat.color }}
      >
        <span role="img" aria-label={cat.label}>
          {cat.icon}
        </span>
      </div>
      {showLabel && (
        <span className={cn('text-white/60 text-center leading-tight', sizes.label)}>
          {cat.label}
        </span>
      )}
    </div>
  );
}
