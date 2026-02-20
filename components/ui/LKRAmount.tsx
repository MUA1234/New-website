'use client';

import { cn } from '@/lib/utils';

interface LKRAmountProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: 'gold' | 'emerald' | 'coral' | 'default' | 'muted';
  compact?: boolean;
  showSign?: boolean;
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl font-semibold',
  '2xl': 'text-2xl font-bold',
};

const colorMap = {
  gold: 'text-[#e8b930]',
  emerald: 'text-[#16a085]',
  coral: 'text-[#e74c3c]',
  default: 'text-white',
  muted: 'text-white/60',
};

export default function LKRAmount({
  amount,
  className,
  size = 'md',
  color = 'default',
  compact = false,
  showSign = false,
}: LKRAmountProps) {
  const formatted = compact
    ? amount >= 1000000
      ? `${(amount / 1000000).toFixed(1)}M`
      : amount >= 1000
      ? `${(amount / 1000).toFixed(1)}K`
      : amount.toFixed(2)
    : amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const sign = showSign && amount > 0 ? '+' : '';

  return (
    <span className={cn('rupee-symbol tabular-nums', sizeMap[size], colorMap[color], className)}>
      {sign}₨&nbsp;{formatted}
    </span>
  );
}
