'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  title_si?: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'gold' | 'emerald' | 'coral' | 'blue' | 'default';
  delay?: number;
  compact?: boolean;
  subtitle?: string;
}

const colorMap = {
  gold: { text: 'text-[#e8b930]', bg: 'bg-[#e8b930]/10', border: true },
  emerald: { text: 'text-[#16a085]', bg: 'bg-[#16a085]/10', border: false },
  coral: { text: 'text-[#e74c3c]', bg: 'bg-[#e74c3c]/10', border: false },
  blue: { text: 'text-blue-400', bg: 'bg-blue-400/10', border: false },
  default: { text: 'text-white', bg: 'bg-white/5', border: false },
};

export default function StatCard({
  title,
  title_si,
  value,
  change,
  changeLabel,
  icon,
  color = 'default',
  delay = 0,
  compact = false,
  subtitle,
}: StatCardProps) {
  const colors = colorMap[color];
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <GlassCard
      delay={delay}
      gold={color === 'gold'}
      emerald={color === 'emerald'}
      coral={color === 'coral'}
      className="p-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider truncate">
              {title}
            </p>
          </div>
          {title_si && (
            <p className="text-xs text-white/30 mb-2 font-['Noto_Sans_Sinhala']">{title_si}</p>
          )}
          <div className={cn('text-2xl font-bold mt-1', colors.text)}>
            <AnimatedCounter value={value} formatAsCurrency compact={compact} duration={1200} />
          </div>
          {subtitle && (
            <p className="text-xs text-white/40 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn('p-2.5 rounded-xl flex-shrink-0 ml-3', colors.bg)}>
            <div className={colors.text}>{icon}</div>
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
              isPositive
                ? 'text-emerald bg-emerald/10'
                : isNegative
                ? 'text-coral bg-coral/10'
                : 'text-white/40 bg-white/5'
            )}
          >
            {isPositive ? (
              <TrendingUp size={11} />
            ) : isNegative ? (
              <TrendingDown size={11} />
            ) : (
              <Minus size={11} />
            )}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
          {changeLabel && (
            <span className="text-xs text-white/40">{changeLabel}</span>
          )}
        </div>
      )}
    </GlassCard>
  );
}
