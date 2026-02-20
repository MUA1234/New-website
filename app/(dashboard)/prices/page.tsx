'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, TrendingUp, TrendingDown, ShoppingCart, X, Plus, Minus,
  LayoutGrid, Wheat, Leaf, Drumstick, Milk, Fuel, Lightbulb, Pill, SprayCan,
  AlertTriangle, type LucideIcon,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { useAppStore } from '@/stores/useAppStore';
import { formatLKR, cn } from '@/lib/utils';
import GlassCard from '@/components/ui/GlassCard';
import LKRAmount from '@/components/ui/LKRAmount';
import EmptyState from '@/components/ui/EmptyState';
import type { PriceItem } from '@/types';

const CATEGORIES: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: 'all', label: 'All Items', Icon: LayoutGrid },
  { id: 'staples', label: 'Staples', Icon: Wheat },
  { id: 'vegetables', label: 'Vegetables', Icon: Leaf },
  { id: 'protein', label: 'Protein', Icon: Drumstick },
  { id: 'dairy', label: 'Dairy', Icon: Milk },
  { id: 'fuel', label: 'Fuel & Gas', Icon: Fuel },
  { id: 'utilities', label: 'Utilities', Icon: Lightbulb },
  { id: 'pharmacy', label: 'Pharmacy', Icon: Pill },
  { id: 'household', label: 'Household', Icon: SprayCan },
];

const MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];

export default function PricesPage() {
  const { profile } = useAppStore();
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<PriceItem | null>(null);
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [showBasket, setShowBasket] = useState(false);

  useEffect(() => {
    fetch('/api/prices?limit=100')
      .then((r) => r.json())
      .then((d) => { setItems(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.name_si.includes(search)) return false;
      return true;
    });
  }, [items, category, search]);

  const basketTotal = useMemo(() => {
    return Object.entries(basket).reduce((sum, [id, qty]) => {
      const item = items.find((i) => i.id === id);
      return sum + (item ? item.current_price * qty : 0);
    }, 0);
  }, [basket, items]);

  const basketItemCount = Object.values(basket).reduce((s, v) => s + v, 0);

  const addToBasket = (id: string) => setBasket((b) => ({ ...b, [id]: (b[id] || 0) + 1 }));
  const removeFromBasket = (id: string) => setBasket((b) => {
    const n = { ...b };
    if (n[id] > 1) n[id]--; else delete n[id];
    return n;
  });

  const getHistoryData = (item: PriceItem) =>
    (item.price_history || []).map((p, i) => ({ month: MONTHS[i] || `M${i + 1}`, price: p }));

  const getDistrictPrices = (item: PriceItem) =>
    Object.entries(item.district_prices || {}).slice(0, 8).map(([d, p]) => ({
      district: d.charAt(0).toUpperCase() + d.slice(1).substring(0, 6),
      price: p,
    }));

  return (
    <div className="p-4 md:p-6 space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Price Tracker</h1>
          <p className="text-white/40 text-sm">Sri Lanka essential prices · Updated Jan 2025</p>
        </div>
        <button onClick={() => setShowBasket(true)}
          className="relative flex items-center gap-2 bg-[#16a085]/20 text-[#16a085] px-4 py-2.5 rounded-xl hover:bg-[#16a085]/30">
          <ShoppingCart size={18} />
          <span className="text-sm font-medium hidden sm:block">Basket</span>
          {basketItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#e8b930] text-black text-xs font-bold rounded-full flex items-center justify-center">
              {basketItemCount}
            </span>
          )}
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setCategory(cat.id)}
            className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all flex-shrink-0',
              category === cat.id ? 'bg-[#e8b930]/20 text-[#e8b930] border border-[#e8b930]/30' : 'bg-white/5 text-white/50 hover:bg-white/10')}>
            <cat.Icon size={16} />
            <span className="hidden sm:block">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items... (e.g., rice, petrol, milk)"
          className="lkr-input w-full rounded-xl pl-9 pr-4 py-2.5 text-sm" />
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-4 h-24 skeleton" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item, i) => (
            <GlassCard key={item.id} delay={i * 0.02} className="p-4 cursor-pointer" onClick={() => setSelectedItem(item)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90 truncate">{item.name}</p>
                  <p className="text-xs text-white/40 font-['Noto_Sans_Sinhala'] truncate">{item.name_si}</p>
                  <p className="text-xs text-white/30 mt-0.5">{item.unit}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-bold text-[#e8b930]">
                    ₨ {item.current_price.toLocaleString()}
                  </div>
                  <div className={cn('flex items-center gap-0.5 text-xs justify-end mt-0.5',
                    item.price_change_pct > 0 ? 'text-[#e74c3c]' : 'text-[#16a085]')}>
                    {item.price_change_pct > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(item.price_change_pct).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                {item.price_alert && (
                  <span className="text-xs bg-[#e74c3c]/15 text-[#e74c3c] px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle size={12} /> Price alert</span>
                )}
                <button onClick={(e) => { e.stopPropagation(); addToBasket(item.id); }}
                  className="ml-auto p-1.5 rounded-lg bg-[#16a085]/15 text-[#16a085] hover:bg-[#16a085]/25">
                  {basket[item.id] ? <span className="text-xs font-bold px-1">{basket[item.id]}</span> : <Plus size={13} />}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Search size={48} className="text-white/20" />} title="No items found" description="Try a different category or search term" />
      )}

      {/* Item detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-lg glass-card p-6 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedItem.name}</h3>
                  <p className="text-sm text-white/40 font-['Noto_Sans_Sinhala']">{selectedItem.name_si}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2 rounded-xl bg-white/5 text-white/50"><X size={18} /></button>
              </div>

              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-3xl font-black text-[#e8b930]">₨ {selectedItem.current_price.toLocaleString()}</p>
                  <p className="text-sm text-white/50">per {selectedItem.unit}</p>
                </div>
                <div className={cn('flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full',
                  selectedItem.price_change_pct > 0 ? 'bg-[#e74c3c]/15 text-[#e74c3c]' : 'bg-[#16a085]/15 text-[#16a085]')}>
                  {selectedItem.price_change_pct > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(selectedItem.price_change_pct).toFixed(1)}% vs last month
                </div>
              </div>

              {/* Price history chart */}
              {selectedItem.price_history && selectedItem.price_history.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-3">12-Month Price History</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={getHistoryData(selectedItem)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => `${v}`} />
                      <RTooltip formatter={(v: number) => [`₨ ${v}`, 'Price']} contentStyle={{
                        background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px', color: '#f8f5f0', fontSize: '12px'
                      }} />
                      <Line type="monotone" dataKey="price" stroke="#e8b930" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* District prices */}
              {getDistrictPrices(selectedItem).length > 0 && (
                <div className="mb-5">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Price by District</p>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={getDistrictPrices(selectedItem)}>
                      <XAxis dataKey="district" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <RTooltip formatter={(v: number) => [`₨ ${v}`, 'Price']} contentStyle={{
                        background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px'
                      }} />
                      <Bar dataKey="price" fill="#16a085" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { addToBasket(selectedItem.id); setSelectedItem(null); }}
                  className="flex-1 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#e8b930] to-[#c49a18]">
                  Add to Basket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Basket modal */}
      <AnimatePresence>
        {showBasket && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowBasket(false)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md glass-card p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Grocery Basket Calculator</h3>
                <button onClick={() => setShowBasket(false)} className="p-2 rounded-xl bg-white/5 text-white/50"><X size={18} /></button>
              </div>
              {basketItemCount === 0 ? (
                <EmptyState icon={<ShoppingCart size={48} className="text-white/20" />} title="Basket is empty" description="Add items from the price list to calculate your monthly grocery bill" />
              ) : (
                <>
                  <div className="space-y-3 mb-5">
                    {Object.entries(basket).map(([id, qty]) => {
                      const item = items.find((i) => i.id === id);
                      if (!item) return null;
                      return (
                        <div key={id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/80 truncate">{item.name}</p>
                            <p className="text-xs text-white/40">₨ {item.current_price} × {qty}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => removeFromBasket(id)}
                              className="w-7 h-7 rounded-lg bg-white/10 text-white/60 flex items-center justify-center hover:bg-white/20">
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-bold text-white w-4 text-center">{qty}</span>
                            <button onClick={() => addToBasket(id)}
                              className="w-7 h-7 rounded-lg bg-white/10 text-white/60 flex items-center justify-center hover:bg-white/20">
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="text-right w-20">
                            <p className="text-sm font-bold text-[#e8b930]">₨ {(item.current_price * qty).toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">Estimated Total</span>
                      <span className="text-2xl font-black text-[#e8b930]">₨ {basketTotal.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-1">Monthly grocery estimate for your basket</p>
                    <button onClick={() => { setBasket({}); setShowBasket(false); }}
                      className="w-full mt-4 py-2.5 rounded-xl text-sm text-white/60 bg-white/5 hover:bg-white/10">
                      Clear Basket
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
