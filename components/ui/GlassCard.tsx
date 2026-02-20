'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  gold?: boolean;
  emerald?: boolean;
  coral?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className,
  delay = 0,
  hover = true,
  gold = false,
  emerald = false,
  coral = false,
  onClick,
}: GlassCardProps) {
  const borderColor = gold
    ? 'border-gold/30 shadow-gold/20'
    : emerald
    ? 'border-emerald/30 shadow-emerald/20'
    : coral
    ? 'border-coral/30 shadow-coral/20'
    : 'border-white/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl border backdrop-blur-md',
        'bg-royal/40 dark:bg-royal/40',
        borderColor,
        'shadow-glass',
        'transition-shadow duration-300',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
