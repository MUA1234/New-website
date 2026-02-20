'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Target,
  ShoppingCart,
  MoreHorizontal,
  Calculator,
  PiggyBank,
  BookOpen,
  Settings,
  TrendingUp,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const primaryNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/expenses', icon: Receipt, label: 'Expenses' },
  { href: '/budget', icon: Target, label: 'Budget' },
  { href: '/prices', icon: ShoppingCart, label: 'Prices' },
];

const moreNav = [
  { href: '/loans', icon: Calculator, label: 'Loans' },
  { href: '/savings', icon: PiggyBank, label: 'Savings' },
  { href: '/tax', icon: TrendingUp, label: 'Tax' },
  { href: '/learn', icon: BookOpen, label: 'Learn' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreNav.some((item) => pathname.startsWith(item.href));

  return (
    <>
      {/* More Drawer Overlay */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed bottom-16 left-0 right-0 z-50 mx-4 mb-2"
            >
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white/70">More Options</span>
                  <button onClick={() => setMoreOpen(false)}>
                    <X size={18} className="text-white/50" />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {moreNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className="flex flex-col items-center gap-1.5 py-2"
                      >
                        <div
                          className={cn(
                            'h-10 w-10 rounded-xl flex items-center justify-center transition-colors',
                            isActive ? 'bg-gold/15 text-gold' : 'bg-white/5 text-white/50'
                          )}
                        >
                          <Icon size={20} />
                        </div>
                        <span className={cn('text-[10px]', isActive ? 'text-gold' : 'text-white/40')}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <nav className="lg:hidden mobile-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-sapphire/95 backdrop-blur-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center gap-1 py-1"
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-200',
                      isActive ? 'bg-gold/15 text-gold scale-110' : 'text-white/40'
                    )}
                  >
                    <Icon size={20} />
                  </div>
                  <span className={cn('text-[9px] font-medium', isActive ? 'text-gold' : 'text-white/30')}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}

          {/* More button */}
          <button className="flex-1" onClick={() => setMoreOpen(!moreOpen)}>
            <motion.div
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center gap-1 py-1"
            >
              <div
                className={cn(
                  'h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-200',
                  (isMoreActive || moreOpen) ? 'bg-gold/15 text-gold scale-110' : 'text-white/40'
                )}
              >
                <MoreHorizontal size={20} />
              </div>
              <span className={cn('text-[9px] font-medium', (isMoreActive || moreOpen) ? 'text-gold' : 'text-white/30')}>
                More
              </span>
            </motion.div>
          </button>
        </div>
      </nav>
    </>
  );
}
