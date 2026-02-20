'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInMonths, parseISO } from 'date-fns';
import { Plus, X, Target, Trash2, ChevronRight, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '@/stores/useAppStore';
import { formatLKR, cn } from '@/lib/utils';
import GlassCard from '@/components/ui/GlassCard';
import LKRAmount from '@/components/ui/LKRAmount';
import ProgressRing from '@/components/ui/ProgressRing';
import EmptyState from '@/components/ui/EmptyState';
import type { SavingsGoal } from '@/types';

const GOAL_TEMPLATES = [
  { name: 'Emergency Fund', icon: '🛡️', color: '#e74c3c', category: 'emergency', description: '3 months of expenses as safety net', factor: 3 },
  { name: 'Down Payment', icon: '🏠', color: '#3498db', category: 'housing', description: 'Save for your dream home deposit', factor: null },
  { name: 'Wedding Fund', icon: '💍', color: '#e8b930', category: 'personal', description: 'Your special day savings', factor: null },
  { name: 'Education Fund', icon: '🎓', color: '#9b59b6', category: 'education', description: "Child's education or your own", factor: null },
  { name: 'Vehicle Purchase', icon: '🏍️', color: '#16a085', category: 'transport', description: 'Motorbike, car, or three-wheeler', factor: null },
  { name: 'Foreign Trip', icon: '✈️', color: '#1abc9c', category: 'travel', description: 'Explore beyond Sri Lanka', factor: null },
  { name: 'Start a Business', icon: '💼', color: '#f39c12', category: 'business', description: 'Fund your entrepreneurial dream', factor: null },
  { name: 'Fixed Deposit', icon: '🏦', color: '#2ecc71', category: 'investment', description: 'FD at a Sri Lankan bank', factor: null },
];

const COLORS = ['#e8b930', '#16a085', '#3498db', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c', '#e91e63'];

function GoalCard({ goal, onContribute, onDelete }: { goal: SavingsGoal; onContribute: () => void; onDelete: () => void }) {
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const monthsLeft = goal.deadline ? Math.max(differenceInMonths(parseISO(goal.deadline), new Date()), 0) : null;
  const monthlyNeeded = monthsLeft && monthsLeft > 0 ? (goal.targetAmount - goal.currentAmount) / monthsLeft : null;

  return (
    <GlassCard className="p-5" hover={false}>
      <div className="flex items-start gap-4">
        <ProgressRing progress={progress} size={72} strokeWidth={6} color={goal.color}>
          <div className="text-2xl">{goal.icon}</div>
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-white truncate">{goal.name}</h3>
              <p className="text-xs text-white/40 mt-0.5">{goal.category}</p>
            </div>
            <button onClick={onDelete} className="p-1.5 rounded-lg text-white/20 hover:text-[#e74c3c] hover:bg-[#e74c3c]/10 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold" style={{ color: goal.color }}>{formatLKR(goal.currentAmount, true)}</span>
              <span className="text-xs text-white/30">/ {formatLKR(goal.targetAmount, true)}</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs font-medium text-white/60">{progress.toFixed(0)}% complete</span>
              {monthsLeft !== null && (
                <span className="text-xs text-white/40">{monthsLeft}m remaining</span>
              )}
            </div>
          </div>
          {monthlyNeeded && monthlyNeeded > 0 && (
            <p className="text-xs text-white/40 mt-1.5">
              Save {formatLKR(monthlyNeeded, true)}/month to reach goal on time
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: goal.color }}
        />
      </div>

      {/* Milestones */}
      {goal.milestones.length > 0 && (
        <div className="flex gap-1.5 mt-3">
          {goal.milestones.map((m) => (
            <span key={m} className="text-xs bg-[#e8b930]/15 text-[#e8b930] px-2 py-0.5 rounded-full">
              🎉 {m}%
            </span>
          ))}
        </div>
      )}

      <button onClick={onContribute}
        className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold border border-white/10 hover:border-[#16a085]/40 hover:text-[#16a085] text-white/50 transition-all">
        + Contribute
      </button>
    </GlassCard>
  );
}

function AddGoalModal({ onClose }: { onClose: () => void }) {
  const { addGoal } = useAppStore();
  const [form, setForm] = useState({
    name: '', targetAmount: '', deadline: '', priority: 'medium' as const,
    icon: '🎯', color: '#e8b930', category: 'personal',
  });
  const [templateSelected, setTemplateSelected] = useState<string | null>(null);

  const selectTemplate = (t: typeof GOAL_TEMPLATES[0]) => {
    setForm({ ...form, name: t.name, icon: t.icon, color: t.color, category: t.category });
    setTemplateSelected(t.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.targetAmount);
    if (!form.name || !amount || amount <= 0) { toast.error('Fill in all required fields'); return; }
    addGoal({ ...form, targetAmount: amount, currentAmount: 0, priority: form.priority });
    toast.success('Goal created! 🎯');
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-lg glass-card p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Create Savings Goal</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-white/50"><X size={18} /></button>
        </div>

        {/* Templates */}
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Quick Templates</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {GOAL_TEMPLATES.map((t) => (
            <button key={t.name} onClick={() => selectTemplate(t)}
              className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs transition-all border',
                templateSelected === t.name ? 'border-2 scale-105' : 'border-white/10 hover:border-white/20')}
              style={templateSelected === t.name ? { borderColor: t.color, backgroundColor: `${t.color}20` } : {}}>
              <span className="text-2xl">{t.icon}</span>
              <span className="text-white/50 leading-none text-center">{t.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-white/40 mb-1 block">Goal Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Emergency Fund" className="lkr-input w-full rounded-xl px-4 py-3 text-sm" required />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Color</label>
              <div className="flex gap-1.5 flex-wrap">
                {COLORS.slice(0, 4).map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    className={cn('w-8 h-8 rounded-lg transition-transform', form.color === c ? 'scale-125 ring-2 ring-white/30' : '')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e8b930] font-bold">₨</span>
            <input type="number" step={1000} placeholder="Target amount" value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              className="lkr-input w-full rounded-xl px-4 py-3 pl-9 text-base" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Target Date</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="lkr-input w-full rounded-xl px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as typeof form.priority })}
                className="lkr-input w-full rounded-xl px-3 py-2.5 text-sm">
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>
          </div>

          <button type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-[#1a1a2e] bg-gradient-to-r from-[#e8b930] to-[#c49a18]">
            Create Goal
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ContributeModal({ goal, onClose }: { goal: SavingsGoal; onClose: () => void }) {
  const { contributeToGoal } = useAppStore();
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(amount);
    if (!a || a <= 0) { toast.error('Enter a valid amount'); return; }

    const prevPct = (goal.currentAmount / goal.targetAmount) * 100;
    contributeToGoal(goal.id, a);
    const newPct = ((goal.currentAmount + a) / goal.targetAmount) * 100;

    [25, 50, 75, 100].forEach((milestone) => {
      if (prevPct < milestone && newPct >= milestone) {
        toast.success(`🎉 ${milestone}% milestone reached for "${goal.name}"!`);
        try {
          import('canvas-confetti').then((m) => {
            m.default({ particleCount: 100, spread: 70, origin: { y: 0.6 },
              colors: ['#e8b930', '#16a085', '#f8f5f0'] });
          });
        } catch {}
      }
    });
    if (newPct < 100) toast.success(`₨ ${a.toLocaleString()} added to ${goal.name}!`);
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm glass-card p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">{goal.icon}</div>
          <h3 className="font-bold text-white">{goal.name}</h3>
          <p className="text-sm text-white/40">{formatLKR(goal.currentAmount)} of {formatLKR(goal.targetAmount)}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e8b930] font-bold">₨</span>
            <input type="number" step={100} placeholder="Amount to add" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="lkr-input w-full rounded-xl px-4 py-3 pl-9 text-xl font-bold text-center" required autoFocus />
          </div>
          <div className="flex gap-2">
            {[1000, 5000, 10000, 25000].map((a) => (
              <button key={a} type="button" onClick={() => setAmount(a.toString())}
                className="flex-1 py-2 rounded-lg text-xs bg-white/5 text-white/50 hover:bg-white/10">{(a/1000).toFixed(0)}K</button>
            ))}
          </div>
          <button type="submit"
            className="w-full py-3.5 rounded-xl font-bold text-[#1a1a2e] bg-gradient-to-r from-[#16a085] to-[#0e7a65]">
            Contribute
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function SavingsPage() {
  const { savingsGoals, deleteGoal } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [contributing, setContributing] = useState<SavingsGoal | null>(null);

  const totalSaved = savingsGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((s, g) => s + g.targetAmount, 0);
  const completedGoals = savingsGoals.filter((g) => g.currentAmount >= g.targetAmount);

  return (
    <div className="p-4 md:p-6 space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Savings Goals</h1>
          <p className="text-white/40 text-sm">
            {formatLKR(totalSaved, true)} saved of {formatLKR(totalTarget, true)} total
            {completedGoals.length > 0 && ` · ${completedGoals.length} completed 🎉`}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#e8b930] text-[#1a1a2e] font-bold px-4 py-2.5 rounded-xl">
          <Plus size={18} /> New Goal
        </button>
      </div>

      {savingsGoals.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {savingsGoals.map((goal, i) => (
            <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <GoalCard
                goal={goal}
                onContribute={() => setContributing(goal)}
                onDelete={() => { deleteGoal(goal.id); toast.success('Goal deleted'); }}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState icon="🏆" title="No savings goals yet"
          description="Create your first goal — emergency fund, wedding, house deposit, or anything you're saving for!"
          action={
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-[#e8b930] text-[#1a1a2e] font-bold px-6 py-3 rounded-xl">
              <Plus size={18} /> Create First Goal
            </button>
          }
        />
      )}

      {/* Tips */}
      <GlassCard className="p-5" delay={0.3} hover={false}>
        <h3 className="font-semibold text-white mb-3">💡 Savings Tips for Sri Lankans</h3>
        <div className="space-y-2">
          {[
            '🏦 Park your emergency fund in a savings account at Bank of Ceylon, People\'s Bank, or NSB for 5-7% p.a.',
            '📊 Use Fixed Deposits (FDs) for goals 6+ months away — current rates: 9-12% p.a.',
            '🎯 Automate transfers on salary day — out of sight, out of mind!',
            '💰 The National Savings Bank (NSB) offers reliable savings products specifically for Sri Lankans.',
            '📈 EPF earns around 9% annually — don\'t withdraw it unless absolutely necessary.',
          ].map((tip, i) => (
            <p key={i} className="text-sm text-white/60 py-1 border-b border-white/5 last:border-0">{tip}</p>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence>
        {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} />}
        {contributing && <ContributeModal goal={contributing} onClose={() => setContributing(null)} />}
      </AnimatePresence>
    </div>
  );
}
