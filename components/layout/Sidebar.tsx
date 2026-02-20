'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Target,
  TrendingUp,
  Calculator,
  PiggyBank,
  BookOpen,
  Settings,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/useAppStore';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', label_si: 'ප්‍රධාන' },
  { href: '/expenses', icon: Receipt, label: 'Expenses', label_si: 'වියදම්' },
  { href: '/budget', icon: Target, label: 'Budget', label_si: 'අයවැය' },
  { href: '/prices', icon: ShoppingCart, label: 'Prices', label_si: 'මිල ගණන්' },
  { href: '/loans', icon: Calculator, label: 'Loans', label_si: 'ණය' },
  { href: '/savings', icon: PiggyBank, label: 'Savings', label_si: 'ඉතිරිකිරීම' },
  { href: '/tax', icon: TrendingUp, label: 'Tax', label_si: 'බදු' },
  { href: '/learn', icon: BookOpen, label: 'Learn', label_si: 'ඉගෙන ගන්න' },
  { href: '/settings', icon: Settings, label: 'Settings', label_si: 'සැකසීම්' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useAppStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 z-40',
        'border-r border-white/10',
        'bg-sapphire/80 backdrop-blur-xl'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10 min-h-[64px]">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-[#c49a18] flex items-center justify-center text-lg font-black text-sapphire shadow-gold">
          ₨
        </div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-lg font-black text-gold leading-none">MiRupee</div>
              <div className="text-[10px] text-white/30 font-['Noto_Sans_Sinhala']">මිරුපියල්</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group',
                  isActive
                    ? 'bg-gold/15 text-gold border border-gold/20'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                )}
              >
                <Icon
                  size={20}
                  className={cn(
                    'flex-shrink-0 transition-colors',
                    isActive ? 'text-gold' : 'text-current'
                  )}
                />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 min-w-0"
                    >
                      <div className="text-sm font-medium leading-none">{item.label}</div>
                      <div className="text-[10px] opacity-50 mt-0.5 font-['Noto_Sans_Sinhala']">
                        {item.label_si}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="p-2 border-t border-white/10 space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && (
            <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
