'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subMonths } from 'date-fns';
import {
  Plus, Wallet, TrendingUp, TrendingDown, PiggyBank, Zap,
  X, ChevronRight, RefreshCw, DollarSign, AlertTriangle,
  Lightbulb, BarChart3, Landmark, ShoppingCart, Smartphone,
  Target, CreditCard, Home, BookOpen, CheckCircle2, Receipt,
  Banknote, Building2
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import { useAppStore } from '@/stores/useAppStore';
import {
  formatLKR, CATEGORIES, EXPENSE_CATEGORIES, getMonthlyStats,
  getCategoryTotal, getMonthExpenses, getChangeIndicator, cn
} from '@/lib/utils';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import LKRAmount from '@/components/ui/LKRAmount';
import CategoryIcon from '@/components/ui/CategoryIcon';
import ProgressRing from '@/components/ui/ProgressRing';
import EmptyState from '@/components/ui/EmptyState';
import type { ExpenseCategory, Transaction } from '@/types';

const TIPS = [
  "Set aside at least 10% of your income as savings before spending.",
  "Review your expenses every Sunday to stay on track with your budget.",
  "Keep 3-6 months of expenses in an emergency fund (FD or savings account).",
  "Switch to CEB's off-peak hours to reduce your electricity bill.",
  "Buy rice and essentials in bulk when prices are low to save money.",
  "Use FriMi or Genie digital wallets for cashback on everyday purchases.",
  "The 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
  "Avoid credit card debt — interest rates can be 24-36% per year in Sri Lanka.",
  "If renting, your rent should ideally not exceed 30% of your monthly income.",
  "Educate yourself about EPF — it's your free retirement fund!",
];

const TOOLTIP_STYLE = {
  background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px', color: '#f8f5f0', fontSize: '12px'
};

function AddExpenseModal({ onClose }: { onClose: () => void }) {
  const { addTransaction, profile } = useAppStore();
  const [form, setForm] = useState({
    amount: '',
    category: 'groceries' as ExpenseCategory,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    paymentMethod: 'cash' as const,
    notes: '',
    isRecurring: false,
    recurringFrequency: 'monthly' as const,
    type: 'expense' as 'expense' | 'income',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    addTransaction({ ...form, amount });
    toast.success(`₨ ${formatLKR(amount)} added!`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md glass-card p-6 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Add Transaction</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t })}
                className={cn('flex-1 py-2.5 text-sm font-medium capitalize transition-colors', form.type === t
                  ? t === 'expense' ? 'bg-coral/20 text-coral' : 'bg-emerald/20 text-emerald'
                  : 'text-white/40 hover:text-white/60')}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e8b930] font-bold">₨</span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="lkr-input w-full rounded-xl px-4 py-3 pl-9 text-xl font-bold"
              required
            />
          </div>

          {/* Category */}
          {form.type === 'expense' && (
            <div className="grid grid-cols-4 gap-2">
              {EXPENSE_CATEGORIES.slice(0, 8).map((cat) => {
                const c = CATEGORIES[cat];
                const CatIcon = c.Icon;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={cn('flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all', form.category === cat
                      ? 'border-2 scale-105' : 'border border-white/10 hover:border-white/20')}
                    style={form.category === cat ? { borderColor: c.color, backgroundColor: c.bgColor } : {}}
                  >
                    <CatIcon size={16} style={{ color: c.color }} />
                    <span className="text-[10px] text-white/60 leading-none">{c.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Description */}
          <input
            type="text"
            placeholder="Description (e.g., Keells grocery run)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="lkr-input w-full rounded-xl px-4 py-3 text-sm"
          />

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="lkr-input w-full rounded-xl px-3 py-2.5 text-sm"
            />
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as typeof form.paymentMethod })}
              className="lkr-input w-full rounded-xl px-3 py-2.5 text-sm"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="digital-wallet">Digital Wallet</option>
            </select>
          </div>

          {/* Recurring */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, isRecurring: !form.isRecurring })}
              className={cn('w-10 h-6 rounded-full transition-colors relative', form.isRecurring ? 'bg-[#e8b930]' : 'bg-white/10')}
            >
              <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', form.isRecurring ? 'translate-x-5' : 'translate-x-1')} />
            </button>
            <span className="text-sm text-white/60">Recurring</span>
            {form.isRecurring && (
              <select
                value={form.recurringFrequency}
                onChange={(e) => setForm({ ...form, recurringFrequency: e.target.value as typeof form.recurringFrequency })}
                className="lkr-input rounded-lg px-2 py-1 text-xs flex-1"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-black bg-gradient-to-r from-[#e8b930] to-[#c49a18] hover:shadow-[0_0_20px_rgba(232,185,48,0.4)] transition-shadow"
          >
            Add {form.type === 'expense' ? 'Expense' : 'Income'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { profile, transactions, getCurrentBudget } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, { rate: number; symbol: string; name: string }>>({});
  const [tipIndex, setTipIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTipIndex(Math.floor(Math.random() * TIPS.length));
    fetch('/api/exchange-rates')
      .then((r) => r.json())
      .then((d) => setExchangeRates(d.rates || {}))
      .catch(() => {});
  }, []);

  const currentMonth = format(new Date(), 'yyyy-MM');
  const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM');

  const currentMonthTx = transactions.filter((t) => t.date.startsWith(currentMonth));
  const lastMonthTx = transactions.filter((t) => t.date.startsWith(lastMonth));

  const totalExpenses = currentMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalIncome = currentMonthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0) || (profile?.monthlyIncome ?? 0);
  const lastMonthExpenses = lastMonthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = Math.max(totalIncome - totalExpenses, 0);
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  const expenseChange = getChangeIndicator(totalExpenses, lastMonthExpenses);

  // Category donut data
  const donutData = EXPENSE_CATEGORIES.map((cat) => ({
    name: CATEGORIES[cat].label,
    value: getCategoryTotal(currentMonthTx, cat),
    color: CATEGORIES[cat].color,
  })).filter((d) => d.value > 0);

  // Monthly trend data
  const trendData = mounted ? getMonthlyStats(transactions, profile?.monthlyIncome || 75000) : [];

  // Budget health
  const budget = getCurrentBudget();
  const totalBudget = budget ? Object.values(budget.budgets).reduce((s, v) => s + v, 0) : 0;
  const budgetUsedPct = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  // Recent transactions
  const recentTx = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  // Insights
  const insights: string[] = [];
  if (expenseChange.direction === 'up' && expenseChange.pct > 10) {
    insights.push(`Your expenses are ${expenseChange.pct.toFixed(0)}% higher than last month.`);
  }
  if (savingsRate < 10 && totalIncome > 0) {
    insights.push(`Try to save at least 10% of income. You're currently at ${savingsRate.toFixed(1)}%.`);
  }
  const topCategory = donutData.sort((a, b) => b.value - a.value)[0];
  if (topCategory) {
    insights.push(`Highest spend: ${topCategory.name} (${formatLKR(topCategory.value, true)})`);
  }
  if (savings > 5000) {
    insights.push(`You've saved ${formatLKR(savings, true)} this month. Keep it up!`);
  }
  if (insights.length === 0) insights.push('Add your first transaction to see insights here.');

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="p-4 md:p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            <span className="text-[#e8b930]">{profile?.name || 'Friend'}</span>
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            {format(new Date(), 'EEEE, dd MMMM yyyy')} · {profile?.district || 'Sri Lanka'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="hidden sm:flex items-center gap-2 bg-[#e8b930] text-black font-bold px-4 py-2.5 rounded-xl hover:bg-[#f0cc5a] transition-colors"
        >
          <Plus size={18} /> Add
        </button>
      </div>

      {/* Tip of the day */}
      <GlassCard className="p-4 border-l-4 border-[#e8b930]" delay={0.05} hover={false}>
        <div className="flex items-start gap-3">
          <Lightbulb size={18} className="text-[#e8b930] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-white/70">{TIPS[tipIndex]}</p>
        </div>
      </GlassCard>

      {/* Stats row */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <StatCard title="Monthly Income" title_si="මාසික ආදායම" value={totalIncome} color="gold"
            icon={<Wallet size={20} />} delay={0.1} subtitle="LKR" />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Total Expenses" title_si="සියලු වියදම්" value={totalExpenses} color="coral"
            icon={<TrendingDown size={20} />} change={expenseChange.direction === 'up' ? expenseChange.pct : -expenseChange.pct}
            changeLabel="vs last month" delay={0.15} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Savings" title_si="ඉතිරිකිරීම" value={savings} color="emerald"
            icon={<PiggyBank size={20} />} delay={0.2} />
        </motion.div>
        <motion.div variants={item}>
          <StatCard title="Savings Rate" title_si="ඉතිරි අනුපාතය" value={savingsRate} color="blue"
            icon={<TrendingUp size={20} />} delay={0.25} subtitle="%" />
        </motion.div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Spending breakdown */}
        <GlassCard className="lg:col-span-1 p-5" delay={0.3}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#e8b930] rounded-full" />
            Spending Breakdown
          </h3>
          {donutData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}>
                    {donutData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RTooltip formatter={(value: number) => [formatLKR(value), '']} contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {donutData.slice(0, 5).map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-white/60 truncate max-w-[120px]">{d.name}</span>
                    </div>
                    <span className="text-white/80 font-medium">{formatLKR(d.value, true)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon={<BarChart3 size={48} className="text-white/20" />} title="No expenses yet" description="Add your first expense to see the breakdown" />
          )}
        </GlassCard>

        {/* Monthly trend */}
        <GlassCard className="lg:col-span-2 p-5" delay={0.35}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#16a085] rounded-full" />
            6-Month Trend
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e8b930" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e8b930" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e74c3c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <RTooltip formatter={(value: number) => [formatLKR(value), '']} contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#e8b930" fill="url(#incomeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#e74c3c" fill="url(#expenseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Budget health */}
        <GlassCard className="p-5" delay={0.4}>
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#9b59b6] rounded-full" />
            Budget Health
          </h3>
          <div className="flex flex-col items-center">
            <ProgressRing progress={budgetUsedPct} size={120} strokeWidth={10} color="#e8b930">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{Math.round(budgetUsedPct)}%</div>
                <div className="text-xs text-white/40">used</div>
              </div>
            </ProgressRing>
            <p className="text-sm text-white/50 mt-4 text-center">
              {totalBudget > 0
                ? `${formatLKR(totalExpenses, true)} of ${formatLKR(totalBudget, true)} budget`
                : 'Set up a budget to track health'}
            </p>
            {budgetUsedPct >= 80 && totalBudget > 0 && (
              <div className="mt-3 text-xs text-[#e74c3c] bg-[#e74c3c]/10 px-3 py-1.5 rounded-full flex items-center gap-1">
                <AlertTriangle size={12} /> Approaching budget limit!
              </div>
            )}
          </div>
        </GlassCard>

        {/* Recent transactions */}
        <GlassCard className="lg:col-span-2 p-5" delay={0.45}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-[#3498db] rounded-full" />
              Recent Transactions
            </h3>
            <a href="/expenses" className="text-xs text-[#e8b930] hover:text-[#f0cc5a] flex items-center gap-1">
              View all <ChevronRight size={12} />
            </a>
          </div>
          {recentTx.length > 0 ? (
            <div className="space-y-2">
              {recentTx.map((tx: Transaction, i: number) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <CategoryIcon category={tx.type === 'income' ? 'income' : tx.category} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{tx.description || CATEGORIES[tx.category]?.label || 'Transaction'}</p>
                    <p className="text-xs text-white/30">{tx.date} · {tx.paymentMethod}</p>
                  </div>
                  <LKRAmount amount={tx.amount} size="sm" color={tx.type === 'income' ? 'gold' : 'coral'} />
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Receipt size={48} className="text-white/20" />} title="No transactions yet" description="Tap + to add your first expense" />
          )}
        </GlassCard>
      </div>

      {/* Insights */}
      <GlassCard className="p-5" delay={0.5} hover={false}>
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Zap size={16} className="text-[#e8b930]" /> Smart Insights
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="p-3 bg-white/5 rounded-xl text-sm text-white/70 leading-relaxed"
            >
              {insight}
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Exchange rates */}
      {Object.keys(exchangeRates).length > 0 && (
        <GlassCard className="p-5" delay={0.55} hover={false}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <DollarSign size={16} className="text-[#16a085]" /> Exchange Rates (LKR)
            </h3>
            <span className="text-xs text-white/30">Simulated daily rates</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {Object.entries(exchangeRates).slice(0, 10).map(([code, data]) => (
              <div key={code} className="p-2.5 bg-white/5 rounded-xl text-center">
                <div className="text-lg font-bold text-[#e8b930]">{data.symbol}</div>
                <div className="text-xs text-white/40 mb-1">{code}</div>
                <div className="text-sm font-semibold text-white">₨ {data.rate.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddModal(true)}
        className="sm:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-[#e8b930] to-[#c49a18] flex items-center justify-center shadow-[0_4px_20px_rgba(232,185,48,0.5)] text-black"
      >
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>

      <AnimatePresence>
        {showAddModal && <AddExpenseModal onClose={() => setShowAddModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
