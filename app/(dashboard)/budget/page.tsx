'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Target, ChevronDown, ChevronUp, X, Check, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import { useAppStore } from '@/stores/useAppStore';
import { formatLKR, CATEGORIES, EXPENSE_CATEGORIES, getCategoryTotal, cn } from '@/lib/utils';
import GlassCard from '@/components/ui/GlassCard';
import LKRAmount from '@/components/ui/LKRAmount';
import type { ExpenseCategory, BudgetTemplate } from '@/types';

export default function BudgetPage() {
  const { transactions, monthlyBudgets, setMonthBudget, setMonthBudgets, profile } = useAppStore();
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [districtCosts, setDistrictCosts] = useState<Record<string, number>>({});
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const currentMonth = format(new Date(), 'yyyy-MM');
  const currentBudget = monthlyBudgets.find((b) => b.month === currentMonth);

  useEffect(() => {
    fetch('/api/budget-templates').then((r) => r.json()).then(setTemplates).catch(() => {});
    if (profile?.district) {
      fetch(`/api/district-costs?district=${profile.district}`)
        .then((r) => r.json())
        .then((d) => {
          if (d?.monthly_costs) {
            const costs: Record<string, number> = {
              groceries: profile.householdSize > 1 ? d.monthly_costs.groceries_family : d.monthly_costs.groceries_single,
              transport: d.monthly_costs.transport,
              utilities: d.monthly_costs.utilities,
              rent: profile.householdSize > 1 ? d.monthly_costs.rent_family : d.monthly_costs.rent_single,
              education: d.monthly_costs.education_child,
              healthcare: d.monthly_costs.healthcare,
              entertainment: d.monthly_costs.entertainment,
            };
            setDistrictCosts(costs);
          }
        }).catch(() => {});
    }
  }, [profile]);

  const monthExpenses = useMemo(
    () => transactions.filter((t) => t.date.startsWith(currentMonth) && t.type === 'expense'),
    [transactions, currentMonth]
  );

  const getBudgetLimit = (cat: ExpenseCategory) => currentBudget?.budgets[cat] || 0;
  const getSpent = (cat: ExpenseCategory) => getCategoryTotal(monthExpenses, cat);
  const getProgress = (cat: ExpenseCategory) => {
    const limit = getBudgetLimit(cat);
    return limit > 0 ? Math.min((getSpent(cat) / limit) * 100, 100) : 0;
  };

  const totalBudget = EXPENSE_CATEGORIES.reduce((s, c) => s + getBudgetLimit(c), 0);
  const totalSpent = EXPENSE_CATEGORIES.reduce((s, c) => s + getSpent(c), 0);
  const overBudgetCats = EXPENSE_CATEGORIES.filter((c) => getBudgetLimit(c) > 0 && getSpent(c) > getBudgetLimit(c));

  const handleSliderChange = (cat: ExpenseCategory, value: number) => {
    setMonthBudget(currentMonth, cat, value);
  };

  const applyTemplate = (template: BudgetTemplate) => {
    setMonthBudgets(currentMonth, template.budgets);
    setShowTemplates(false);
    toast.success(`Applied "${template.name}" template!`);
  };

  const applySuggestions = () => {
    if (Object.keys(districtCosts).length === 0) { toast.error('No district data available'); return; }
    const budgets: Record<string, number> = {
      groceries: districtCosts.groceries || 20000,
      transport: districtCosts.transport || 8000,
      utilities: districtCosts.utilities || 5000,
      rent: districtCosts.rent || 25000,
      education: districtCosts.education || 5000,
      healthcare: districtCosts.healthcare || 3000,
      entertainment: districtCosts.entertainment || 5000,
      clothing: 3000, religious: 2000, loans: 0, savings: (profile?.monthlyIncome || 50000) * 0.15,
      miscellaneous: 5000,
    };
    setMonthBudgets(currentMonth, budgets);
    toast.success('Smart suggestions applied!');
  };

  const barData = EXPENSE_CATEGORIES.filter((c) => getBudgetLimit(c) > 0 || getSpent(c) > 0).map((cat) => ({
    name: CATEGORIES[cat].label.split(' ')[0],
    budget: getBudgetLimit(cat),
    spent: getSpent(cat),
    color: CATEGORIES[cat].color,
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Budget Planner</h1>
          <p className="text-white/40 text-sm">{format(new Date(), 'MMMM yyyy')} · <span className="text-[#e8b930]">{formatLKR(totalBudget, true)}</span> budgeted</p>
        </div>
        <div className="flex gap-2">
          <button onClick={applySuggestions} className="flex items-center gap-1.5 text-sm bg-[#16a085]/15 text-[#16a085] px-3 py-2 rounded-xl hover:bg-[#16a085]/25">
            <Target size={15} /> Smart Suggest
          </button>
          <button onClick={() => setShowTemplates(true)} className="flex items-center gap-1.5 text-sm bg-[#e8b930]/15 text-[#e8b930] px-3 py-2 rounded-xl hover:bg-[#e8b930]/25">
            Templates
          </button>
        </div>
      </div>

      {/* Overspending alerts */}
      <AnimatePresence>
        {overBudgetCats.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-[#e74c3c]/10 border border-[#e74c3c]/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-[#e74c3c]" />
              <span className="text-sm font-semibold text-[#e74c3c]">Over Budget!</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {overBudgetCats.map((cat) => (
                <span key={cat} className="text-xs bg-[#e74c3c]/15 text-[#e74c3c] px-2.5 py-1 rounded-full">
                  {CATEGORIES[cat].icon} {CATEGORIES[cat].label}: {formatLKR(getSpent(cat) - getBudgetLimit(cat), true)} over
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget chart */}
      {barData.length > 0 && (
        <GlassCard className="p-5" delay={0.1} hover={false}>
          <h3 className="font-semibold text-white mb-4">Budget vs Actual</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <RTooltip formatter={(value: number) => [formatLKR(value), '']} contentStyle={{
                background: 'rgba(15,52,96,0.95)', border: '1px solid rgba(232,185,48,0.2)',
                borderRadius: '12px', color: '#f8f5f0', fontSize: '12px'
              }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }} />
              <Bar dataKey="budget" name="Budget" fill="#e8b930" opacity={0.5} radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Spent" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.spent > entry.budget && entry.budget > 0 ? '#e74c3c' : '#16a085'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Category sliders */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Set Category Budgets</h3>
        {EXPENSE_CATEGORIES.map((cat, i) => {
          const limit = getBudgetLimit(cat);
          const spent = getSpent(cat);
          const progress = getProgress(cat);
          const isOver = limit > 0 && spent > limit;
          const isWarning = limit > 0 && progress >= 75 && !isOver;
          const c = CATEGORIES[cat];
          return (
            <GlassCard key={cat} className="p-4" delay={0.1 + i * 0.03}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: c.bgColor }}>{c.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/80">{c.label}</span>
                    <div className="flex items-center gap-1">
                      {isOver && <AlertTriangle size={12} className="text-[#e74c3c]" />}
                      {isWarning && <AlertTriangle size={12} className="text-[#f39c12]" />}
                      <span className="text-xs font-bold" style={{ color: isOver ? '#e74c3c' : isWarning ? '#f39c12' : c.color }}>
                        {formatLKR(spent, true)}
                      </span>
                      <span className="text-xs text-white/30">/ {limit > 0 ? formatLKR(limit, true) : 'No limit'}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              {limit > 0 && (
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.1 + i * 0.03 }}
                    className="h-full rounded-full transition-colors"
                    style={{ backgroundColor: isOver ? '#e74c3c' : isWarning ? '#f39c12' : '#16a085' }}
                  />
                </div>
              )}
              {/* Slider */}
              <div className="flex items-center gap-3">
                <input
                  type="range" min={0} max={100000} step={1000} value={limit}
                  onChange={(e) => handleSliderChange(cat, parseInt(e.target.value))}
                  className="flex-1"
                  style={{ accentColor: c.color }}
                />
                <input
                  type="number" value={limit || ''} onChange={(e) => handleSliderChange(cat, parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="lkr-input w-28 rounded-lg px-2 py-1.5 text-xs text-right"
                />
              </div>
              {districtCosts[cat] && (
                <p className="text-xs text-white/30 mt-1">
                  District avg: {formatLKR(districtCosts[cat], true)}
                </p>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Summary */}
      <GlassCard className="p-5" delay={0.5} hover={false}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-white/40 mb-1">Total Budget</p>
            <LKRAmount amount={totalBudget} size="lg" color="gold" />
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Total Spent</p>
            <LKRAmount amount={totalSpent} size="lg" color={totalSpent > totalBudget && totalBudget > 0 ? 'coral' : 'default'} />
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Remaining</p>
            <LKRAmount amount={Math.max(totalBudget - totalSpent, 0)} size="lg" color="emerald" />
          </div>
        </div>
      </GlassCard>

      {/* Templates modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTemplates(false)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-lg glass-card p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Budget Templates</h3>
                <button onClick={() => setShowTemplates(false)} className="p-2 rounded-xl bg-white/5 text-white/50"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                {templates.length > 0 ? templates.map((t) => (
                  <motion.div key={t.id} whileHover={{ scale: 1.01 }}
                    className="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors border border-white/10"
                    onClick={() => applyTemplate(t)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{t.name}</p>
                        <p className="text-xs text-white/50 mt-0.5">{t.description}</p>
                      </div>
                      <div className="text-right">
                        <LKRAmount amount={t.monthly_income} size="sm" color="gold" />
                        <p className="text-xs text-white/40 mt-0.5">income</p>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-8 text-white/40">
                    <p className="text-4xl mb-3">📋</p>
                    <p>Loading templates...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
