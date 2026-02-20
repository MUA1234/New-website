'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import {
  Plus, Search, Filter, Trash2, Download, X, CheckSquare, Square,
  RefreshCw, Calendar, ChevronDown, Receipt
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip,
} from 'recharts';
import toast from 'react-hot-toast';
import { useAppStore } from '@/stores/useAppStore';
import {
  formatLKR, CATEGORIES, EXPENSE_CATEGORIES, getCategoryTotal, cn
} from '@/lib/utils';
import GlassCard from '@/components/ui/GlassCard';
import LKRAmount from '@/components/ui/LKRAmount';
import CategoryIcon from '@/components/ui/CategoryIcon';
import EmptyState from '@/components/ui/EmptyState';
import type { ExpenseCategory, Transaction } from '@/types';

function AddExpenseModal({ onClose }: { onClose: () => void }) {
  const { addTransaction } = useAppStore();
  const [form, setForm] = useState({
    amount: '', category: 'groceries' as ExpenseCategory,
    date: format(new Date(), 'yyyy-MM-dd'), description: '',
    paymentMethod: 'cash' as const, notes: '', isRecurring: false,
    recurringFrequency: 'monthly' as const, type: 'expense' as 'expense' | 'income',
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    addTransaction({ ...form, amount });
    toast.success('Transaction added!');
    onClose();
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-md glass-card p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Add Transaction</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-white/50"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            {(['expense', 'income'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                className={cn('flex-1 py-2.5 text-sm font-medium capitalize', form.type === t
                  ? t === 'expense' ? 'bg-coral/20 text-[#e74c3c]' : 'bg-emerald/20 text-[#16a085]'
                  : 'text-white/40')}>{t}</button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e8b930] font-bold">₨</span>
            <input type="number" step="0.01" placeholder="0.00" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="lkr-input w-full rounded-xl px-4 py-3 pl-9 text-xl font-bold" required />
          </div>
          {form.type === 'expense' && (
            <div className="grid grid-cols-4 gap-2">
              {EXPENSE_CATEGORIES.slice(0, 8).map((cat) => {
                const c = CATEGORIES[cat];
                return (
                  <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
                    className={cn('flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all border',
                      form.category === cat ? 'border-2 scale-105' : 'border-white/10')}
                    style={form.category === cat ? { borderColor: c.color, backgroundColor: c.bgColor } : {}}>
                    <c.Icon size={16} style={{ color: c.color }} />
                    <span className="text-[10px] text-white/60 leading-none">{c.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          )}
          <input type="text" placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="lkr-input w-full rounded-xl px-4 py-3 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="lkr-input w-full rounded-xl px-3 py-2.5 text-sm" />
            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as typeof form.paymentMethod })}
              className="lkr-input w-full rounded-xl px-3 py-2.5 text-sm">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="digital-wallet">Digital Wallet</option>
            </select>
          </div>
          <textarea placeholder="Notes (optional)" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="lkr-input w-full rounded-xl px-4 py-3 text-sm resize-none" rows={2} />
          <button type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-black bg-gradient-to-r from-[#e8b930] to-[#c49a18]">
            Add {form.type === 'expense' ? 'Expense' : 'Income'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function ExpensesPage() {
  const { transactions, deleteTransaction, deleteTransactions } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return transactions
      .filter((tx) => {
        if (search && !tx.description?.toLowerCase().includes(search.toLowerCase()) && 
            !CATEGORIES[tx.category]?.label.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
        if (filterMethod !== 'all' && tx.paymentMethod !== filterMethod) return false;
        if (dateFrom && tx.date < dateFrom) return false;
        if (dateTo && tx.date > dateTo) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, filterCategory, filterMethod, dateFrom, dateTo]);

  const grouped = useMemo(() => {
    const g: Record<string, Transaction[]> = {};
    filtered.forEach((tx) => { if (!g[tx.date]) g[tx.date] = []; g[tx.date].push(tx); });
    return g;
  }, [filtered]);

  const categoryData = EXPENSE_CATEGORIES.map((cat) => ({
    name: CATEGORIES[cat].label, value: getCategoryTotal(filtered, cat), color: CATEGORIES[cat].color,
  })).filter((d) => d.value > 0);

  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Type', 'Notes'];
    const rows = filtered.map((tx) => [
      tx.date, tx.description, CATEGORIES[tx.category]?.label || tx.category,
      tx.amount, tx.paymentMethod, tx.type, tx.notes || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mirupee-expenses.csv'; a.click();
    toast.success('Exported to CSV!');
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };
  const handleBulkDelete = () => {
    if (!selected.length) return;
    deleteTransactions(selected);
    setSelected([]);
    toast.success(`${selected.length} transactions deleted`);
  };

  const totalShown = filtered.reduce((s, t) => t.type === 'expense' ? s + t.amount : s, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="text-white/40 text-sm">Track every rupee · <span className="text-[#e74c3c]">{formatLKR(totalShown, true)}</span> total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="p-2.5 rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors">
            <Download size={18} />
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-[#e8b930] text-black font-bold px-4 py-2.5 rounded-xl">
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      {/* Category breakdown mini chart */}
      {categoryData.length > 0 && (
        <GlassCard className="p-4" delay={0.1} hover={false}>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={25} outerRadius={38} dataKey="value" paddingAngle={2}>
                    {categoryData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 flex-1">
              {categoryData.slice(0, 6).map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-white/50">{d.name.split(' ')[0]}</span>
                  <span className="text-white/70 font-medium">{formatLKR(d.value, true)}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..." className="lkr-input w-full rounded-xl pl-9 pr-4 py-2.5 text-sm" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={cn('flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors', showFilters ? 'bg-[#e8b930]/20 text-[#e8b930]' : 'bg-white/5 text-white/50 hover:bg-white/10')}>
            <Filter size={16} /> Filters
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'all')}
                  className="lkr-input rounded-xl px-3 py-2 text-sm">
                  <option value="all">All Categories</option>
                  {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORIES[c].label}</option>)}
                </select>
                <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}
                  className="lkr-input rounded-xl px-3 py-2 text-sm">
                  <option value="all">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="digital-wallet">Digital Wallet</option>
                </select>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From date" className="lkr-input rounded-xl px-3 py-2 text-sm" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To date" className="lkr-input rounded-xl px-3 py-2 text-sm" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk actions */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="flex items-center justify-between bg-[#e74c3c]/15 border border-[#e74c3c]/20 rounded-xl px-4 py-3">
            <span className="text-sm text-[#e74c3c]">{selected.length} selected</span>
            <div className="flex gap-2">
              <button onClick={() => setSelected([])} className="text-xs text-white/50 hover:text-white px-3 py-1.5 rounded-lg bg-white/5">Clear</button>
              <button onClick={handleBulkDelete}
                className="flex items-center gap-1 text-xs text-[#e74c3c] bg-[#e74c3c]/15 px-3 py-1.5 rounded-lg hover:bg-[#e74c3c]/25">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transactions grouped by date */}
      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, txs], gi) => {
            const dayTotal = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            return (
              <GlassCard key={date} className="overflow-hidden" delay={gi * 0.05} hover={false}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-white/30" />
                    <span className="text-sm font-semibold text-white/70">
                      {format(parseISO(date), 'EEEE, dd MMM yyyy')}
                    </span>
                  </div>
                  <span className="text-xs text-[#e74c3c] font-medium">{formatLKR(dayTotal, true)}</span>
                </div>
                <div className="divide-y divide-white/5">
                  {txs.map((tx, i) => (
                    <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors group">
                      <button onClick={() => toggleSelect(tx.id)} className="flex-shrink-0 text-white/30 hover:text-white/60">
                        {selected.includes(tx.id) ? <CheckSquare size={16} className="text-[#e8b930]" /> : <Square size={16} />}
                      </button>
                      <CategoryIcon category={tx.type === 'income' ? 'income' : tx.category} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate">{tx.description || CATEGORIES[tx.category]?.label || 'Transaction'}</p>
                        <p className="text-xs text-white/30 flex items-center gap-1">{tx.paymentMethod} {tx.isRecurring ? <span className="inline-flex items-center gap-0.5">· <RefreshCw size={12} /> Recurring</span> : ''}</p>
                      </div>
                      <div className="text-right">
                        <LKRAmount amount={tx.amount} size="sm" color={tx.type === 'income' ? 'gold' : 'coral'} showSign={tx.type === 'income'} />
                      </div>
                      <button onClick={() => { deleteTransaction(tx.id); toast.success('Deleted'); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-[#e74c3c]/10 text-[#e74c3c] hover:bg-[#e74c3c]/20 transition-all">
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={<Receipt size={48} className="text-white/20" />} title="No transactions found"
          description={search || filterCategory !== 'all' ? 'Try adjusting your filters' : 'Add your first transaction to get started!'}
          action={
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-[#e8b930] text-black font-bold px-6 py-3 rounded-xl">
              <Plus size={18} /> Add Transaction
            </button>
          } />
      )}

      {/* FAB */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdd(true)}
        className="sm:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-[#e8b930] to-[#c49a18] flex items-center justify-center shadow-[0_4px_20px_rgba(232,185,48,0.5)] text-black">
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>

      <AnimatePresence>
        {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
}
