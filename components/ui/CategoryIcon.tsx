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
  sm: { container: 'h-8 w-8', iconSize: 14, label: 'text-xs' },
  md: { container: 'h-10 w-10', iconSize: 18, label: 'text-sm' },
  lg: { container: 'h-12 w-12', iconSize: 22, label: 'text-sm' },
};

export default function CategoryIcon({
  category,
  size = 'md',
  showLabel = false,
  className,
}: CategoryIconProps) {
  const cat = CATEGORIES[category] || CATEGORIES.miscellaneous;
  const sizes = sizeMap[size];
  const IconComponent = cat.Icon;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-xl flex-shrink-0',
          sizes.container
        )}
        style={{ backgroundColor: cat.bgColor }}
      >
        <IconComponent size={sizes.iconSize} style={{ color: cat.color }} />
      </div>
      {showLabel && (
        <span className={cn('text-white/60 text-center leading-tight', sizes.label)}>
          {cat.label}
        </span>
      )}
    </div>
  );
}
