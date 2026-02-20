'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { formatLKR } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  formatAsCurrency?: boolean;
  duration?: number;
  className?: string;
  compact?: boolean;
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  formatAsCurrency = false,
  duration = 1000,
  className = '',
  compact = false,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const startValueRef = useRef(0);

  useEffect(() => {
    if (!inView) return;

    const startValue = startValueRef.current;
    const startTime = Date.now();
    const endValue = value;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);
      if (progress < 1) {
        animationRef.current = setTimeout(animate, 16);
      } else {
        startValueRef.current = endValue;
      }
    };

    if (animationRef.current) clearTimeout(animationRef.current);
    animate();

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [value, inView, duration]);

  const formatted = formatAsCurrency
    ? formatLKR(displayValue, compact)
    : `${prefix}${Math.round(displayValue).toLocaleString('en-LK')}${suffix}`;

  return (
    <span ref={ref} className={`rupee-symbol tabular-nums ${className}`}>
      {formatted}
    </span>
  );
}
