'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Plus, Trash2, TrendingDown, AlertCircle, Scale, CheckCircle2, AlertTriangle, XCircle, Lightbulb, Snowflake, Mountain } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend,
} from 'recharts';
import { useAppStore } from '@/stores/useAppStore';
import { formatLKR, calculateLoan, calculateDebtPayoff, cn } from '@/lib/utils';
import GlassCard from '@/components/ui/GlassCard';
import LKRAmount from '@/components/ui/LKRAmount';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import type { DebtItem } from '@/types';

const LOAN_PRESETS = [
  { name: 'Housing Loan', rate: 10.0, tenure: 240, minRate: 7, maxRate: 12 },
  { name: 'Personal Loan', rate: 18.0, tenure: 60, minRate: 14, maxRate: 24 },
  { name: 'Vehicle Loan', rate: 11.5, tenure: 60, minRate: 8, maxRate: 15 },
  { name: 'Education Loan', rate: 6.0, tenure: 84, minRate: 4, maxRate: 8 },
  { name: 'Microfinance', rate: 30.0, tenure: 24, minRate: 24, maxRate: 36 },
];

const genId = () => Date.now().toString(36);

export default function LoansPage() {
  const { profile } = useAppStore();
  const [tab, setTab] = useState<'emi' | 'debt' | 'compare'>('emi');

  // EMI Calculator state
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(12);
  const [tenure, setTenure] = useState(60);
  const [preset, setPreset] = useState<string | null>(null);

  // Debt payoff state
  const [debts, setDebts] = useState<DebtItem[]>([
    { id: genId(), name: 'Credit Card', balance: 150000, interestRate: 24, minimumPayment: 5000, type: 'credit-card' },
    { id: genId(), name: 'Personal Loan', balance: 300000, interestRate: 18, minimumPayment: 9000, type: 'personal' },
  ]);
  const [extraPayment, setExtraPayment] = useState(5000);
  const [payoffMethod, setPayoffMethod] = useState<'snowball' | 'avalanche'>('avalanche');

  // Compare state
  const [loan1, setLoan1] = useState({ principal: 1000000, rate: 12, tenure: 60 });
  const [loan2, setLoan2] = useState({ principal: 1000000, rate: 15, tenure: 48 });

  const emiResult = useMemo(() => calculateLoan(principal, rate, tenure), [principal, rate, tenure]);
  const snowball = useMemo(() => calculateDebtPayoff(debts, extraPayment, 'snowball'), [debts, extraPayment]);
  const avalanche = useMemo(() => calculateDebtPayoff(debts, extraPayment, 'avalanche'), [debts, extraPayment]);
  const loan1Result = useMemo(() => calculateLoan(loan1.principal, loan1.rate, loan1.tenure), [loan1]);
  const loan2Result = useMemo(() => calculateLoan(loan2.principal, loan2.rate, loan2.tenure), [loan2]);

  const monthlyIncome = profile?.monthlyIncome || 75000;
  const dtiRatio = (emiResult.emi / monthlyIncome) * 100;

  const amortChartData = emiResult.amortizationSchedule
    .filter((_, i) => i % Math.max(1, Math.floor(tenure / 12)) === 0)
    .map((e) => ({ month: `M${e.month}`, principal: e.principal, interest: e.interest, balance: e.balance }));

  const addDebt = () => {
    setDebts((d) => [...d, { id: genId(), name: 'New Debt', balance: 100000, interestRate: 18, minimumPayment: 3000, type: 'personal' }]);
  };
  const removeDebt = (id: string) => setDebts((d) => d.filter((x) => x.id !== id));
  const updateDebt = (id: string, field: keyof DebtItem, value: string | number) => {
    setDebts((d) => d.map((x) => x.id === id ? { ...x, [field]: typeof value === 'string' ? value : Number(value) } : x));
  };

  const tabs = [
    { key: 'emi' as const, icon: <Calculator size={14} />, label: 'EMI Calc' },
    { key: 'debt' as const, icon: <TrendingDown size={14} />, label: 'Debt Payoff' },
    { key: 'compare' as const, icon: <Scale size={14} />, label: 'Compare' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Loan & Debt Tools</h1>
        <p className="text-white/40 text-sm">EMI calculator · Debt payoff planner · Loan comparison</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {tabs.map(({ key, icon, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5', tab === key ? 'bg-[#e8b930]/20 text-[#e8b930]' : 'text-white/40 hover:text-white/60')}>
            {icon} {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'emi' && (
          <motion.div key="emi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Loan type presets */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {LOAN_PRESETS.map((p) => (
                <button key={p.name} onClick={() => { setPrincipal(p.name.includes('Housing') ? 3000000 : 500000); setRate(p.rate); setTenure(p.tenure); setPreset(p.name); }}
                  className={cn('flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                    preset === p.name ? 'bg-[#e8b930]/20 text-[#e8b930] border border-[#e8b930]/30' : 'bg-white/5 text-white/50 hover:bg-white/10')}>
                  {p.name}
                  <span className="block text-[10px] opacity-60">{p.minRate}–{p.maxRate}% p.a.</span>
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Inputs */}
              <GlassCard className="p-5" delay={0.1}>
                <h3 className="font-semibold text-white mb-4">Loan Details</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-white/50">Principal Amount</label>
                      <span className="text-xs text-[#e8b930] font-bold">{formatLKR(principal, true)}</span>
                    </div>
                    <input type="range" min={10000} max={10000000} step={10000} value={principal}
                      onChange={(e) => setPrincipal(Number(e.target.value))} className="w-full" />
                    <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))}
                      className="lkr-input w-full rounded-xl px-3 py-2 text-sm mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-white/50">Interest Rate (% p.a.)</label>
                      <span className="text-xs text-[#e8b930] font-bold">{rate}%</span>
                    </div>
                    <input type="range" min={0} max={40} step={0.5} value={rate}
                      onChange={(e) => setRate(Number(e.target.value))} className="w-full" />
                    <input type="number" step={0.5} value={rate} onChange={(e) => setRate(Number(e.target.value))}
                      className="lkr-input w-full rounded-xl px-3 py-2 text-sm mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs text-white/50">Tenure (months)</label>
                      <span className="text-xs text-[#e8b930] font-bold">{tenure}m ({(tenure / 12).toFixed(1)}yr)</span>
                    </div>
                    <input type="range" min={6} max={360} step={6} value={tenure}
                      onChange={(e) => setTenure(Number(e.target.value))} className="w-full" />
                    <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
                      className="lkr-input w-full rounded-xl px-3 py-2 text-sm mt-2" />
                  </div>
                </div>
              </GlassCard>

              {/* Results */}
              <GlassCard className="p-5" delay={0.15} gold>
                <h3 className="font-semibold text-white mb-4">Results</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-[#e8b930]/10 rounded-xl text-center border border-[#e8b930]/20">
                    <p className="text-xs text-white/50 mb-1">Monthly EMI</p>
                    <p className="text-3xl font-black text-[#e8b930]">Rs {Math.round(emiResult.emi).toLocaleString()}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-xl text-center">
                      <p className="text-xs text-white/40 mb-1">Total Payment</p>
                      <p className="text-sm font-bold text-white">{formatLKR(emiResult.totalPayment, true)}</p>
                    </div>
                    <div className="p-3 bg-[#e74c3c]/10 rounded-xl text-center">
                      <p className="text-xs text-white/40 mb-1">Total Interest</p>
                      <p className="text-sm font-bold text-[#e74c3c]">{formatLKR(emiResult.totalInterest, true)}</p>
                    </div>
                  </div>
                  {/* DTI */}
                  <div className={cn('p-3 rounded-xl border', dtiRatio <= 30 ? 'bg-[#16a085]/10 border-[#16a085]/20' : dtiRatio <= 40 ? 'bg-[#f39c12]/10 border-[#f39c12]/20' : 'bg-[#e74c3c]/10 border-[#e74c3c]/20')}>
                    <div className="flex items-center gap-2">
                      {dtiRatio > 40 && <AlertCircle size={14} className="text-[#e74c3c]" />}
                      <p className="text-xs text-white/60">Debt-to-Income Ratio: <strong className={dtiRatio <= 30 ? 'text-[#16a085]' : dtiRatio <= 40 ? 'text-[#f39c12]' : 'text-[#e74c3c]'}>{dtiRatio.toFixed(1)}%</strong></p>
                    </div>
                    <p className="text-xs text-white/30 mt-0.5 flex items-center gap-1">{dtiRatio <= 30 ? <><CheckCircle2 size={12} className="text-[#16a085]" /> Healthy DTI ratio</> : dtiRatio <= 40 ? <><AlertTriangle size={12} className="text-[#f39c12]" /> Moderate — keep eye on expenses</> : <><XCircle size={12} className="text-[#e74c3c]" /> High DTI — risky financial position</>}</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Amortization chart */}
            <GlassCard className="p-5" delay={0.2} hover={false}>
              <h3 className="font-semibold text-white mb-4">Amortization Schedule</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={amortChartData}>
                  <defs>
                    <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e8b930" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e8b930" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <RTooltip formatter={(v: number) => [formatLKR(v), '']} contentStyle={{
                    background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: '#f8f5f0', fontSize: '12px'
                  }} />
                  <Area type="monotone" dataKey="balance" name="Outstanding Balance" stroke="#e8b930" fill="url(#balGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="interest" name="Interest" stroke="#e74c3c" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        )}

        {tab === 'debt' && (
          <motion.div key="debt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Debt items */}
            <div className="space-y-3">
              {debts.map((debt, i) => (
                <GlassCard key={debt.id} className="p-4" delay={i * 0.05}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Debt Name</label>
                      <input value={debt.name} onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                        className="lkr-input w-full rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Balance (Rs)</label>
                      <input type="number" value={debt.balance} onChange={(e) => updateDebt(debt.id, 'balance', e.target.value)}
                        className="lkr-input w-full rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Rate (% p.a.)</label>
                      <input type="number" step={0.5} value={debt.interestRate} onChange={(e) => updateDebt(debt.id, 'interestRate', e.target.value)}
                        className="lkr-input w-full rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-white/40 mb-1 block">Min Payment</label>
                        <input type="number" value={debt.minimumPayment} onChange={(e) => updateDebt(debt.id, 'minimumPayment', e.target.value)}
                          className="lkr-input w-full rounded-lg px-2 py-1.5 text-sm" />
                      </div>
                      <button onClick={() => removeDebt(debt.id)}
                        className="mt-5 p-2 rounded-lg bg-[#e74c3c]/10 text-[#e74c3c] hover:bg-[#e74c3c]/20 self-start">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
              <button onClick={addDebt}
                className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/40 hover:border-[#e8b930]/40 hover:text-[#e8b930] flex items-center justify-center gap-2 transition-colors">
                <Plus size={16} /> Add Debt
              </button>
            </div>

            {/* Extra payment */}
            <GlassCard className="p-4" delay={0.2}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white/70">Extra Monthly Payment</label>
                <span className="text-[#e8b930] font-bold">Rs {extraPayment.toLocaleString()}</span>
              </div>
              <input type="range" min={0} max={50000} step={500} value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))} className="w-full" />
            </GlassCard>

            {/* Strategy comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              {[{ method: 'snowball', result: snowball, icon: <Snowflake size={14} />, label: 'Snowball', desc: 'Pay smallest debts first', color: '#3498db' },
                { method: 'avalanche', result: avalanche, icon: <Mountain size={14} />, label: 'Avalanche', desc: 'Pay highest interest first', color: '#9b59b6' }
              ].map((s) => (
                <GlassCard key={s.method} className="p-4 cursor-pointer" delay={0.25}
                  onClick={() => setPayoffMethod(s.method as 'snowball' | 'avalanche')}
                  gold={payoffMethod === s.method}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white flex items-center gap-1.5">{s.icon} {s.label}</p>
                      <p className="text-xs text-white/40">{s.desc}</p>
                    </div>
                    {payoffMethod === s.method && <span className="text-[#e8b930] text-xs flex items-center gap-1"><CheckCircle2 size={12} /> Selected</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <p className="text-xs text-white/40">Payoff Time</p>
                      <p className="font-bold text-white">{s.result.months}m</p>
                      <p className="text-xs text-white/30">({(s.result.months / 12).toFixed(1)} yrs)</p>
                    </div>
                    <div className="p-2 bg-[#e74c3c]/10 rounded-lg">
                      <p className="text-xs text-white/40">Total Interest</p>
                      <p className="font-bold text-[#e74c3c]">{formatLKR(s.result.totalInterest, true)}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            <GlassCard className="p-4" delay={0.3} hover={false}>
              <p className="text-sm text-white/60 flex items-start gap-1.5">
                <Lightbulb size={14} className="flex-shrink-0 mt-0.5" /> <span><strong className="text-white">Avalanche method</strong> saves more money on interest.
                <strong className="text-white"> Snowball method</strong> gives faster psychological wins by clearing small debts first.
                Most Sri Lankan financial advisors recommend the avalanche method for high-interest debts.</span>
              </p>
            </GlassCard>
          </motion.div>
        )}

        {tab === 'compare' && (
          <motion.div key="compare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { state: loan1, setState: setLoan1, label: 'Loan Option A', color: '#e8b930', result: loan1Result },
                { state: loan2, setState: setLoan2, label: 'Loan Option B', color: '#16a085', result: loan2Result },
              ].map((l, i) => (
                <GlassCard key={i} className="p-5" delay={0.1 + i * 0.05} gold={i === 0} emerald={i === 1}>
                  <h3 className="font-semibold mb-4" style={{ color: l.color }}>{l.label}</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Principal (Rs)', key: 'principal', min: 10000, max: 10000000, step: 10000 },
                      { label: 'Rate (% p.a.)', key: 'rate', min: 1, max: 40, step: 0.5 },
                      { label: 'Tenure (months)', key: 'tenure', min: 6, max: 360, step: 6 },
                    ].map((field) => (
                      <div key={field.key}>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs text-white/40">{field.label}</label>
                          <span className="text-xs font-bold" style={{ color: l.color }}>
                            {l.state[field.key as keyof typeof l.state].toLocaleString()}
                          </span>
                        </div>
                        <input type="range" min={field.min} max={field.max} step={field.step}
                          value={l.state[field.key as keyof typeof l.state]}
                          onChange={(e) => l.setState({ ...l.state, [field.key]: Number(e.target.value) })}
                          className="w-full" />
                      </div>
                    ))}
                    <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-white/40">EMI</p>
                        <p className="text-sm font-bold" style={{ color: l.color }}>Rs {Math.round(l.result.emi).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Interest</p>
                        <p className="text-sm font-bold text-[#e74c3c]">{formatLKR(l.result.totalInterest, true)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Total</p>
                        <p className="text-sm font-bold text-white">{formatLKR(l.result.totalPayment, true)}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Comparison bar chart */}
            <GlassCard className="p-5" delay={0.2} hover={false}>
              <h3 className="font-semibold text-white mb-4">Side-by-Side Comparison</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[
                  { name: 'Monthly EMI', A: Math.round(loan1Result.emi), B: Math.round(loan2Result.emi) },
                  { name: 'Total Interest', A: Math.round(loan1Result.totalInterest), B: Math.round(loan2Result.totalInterest) },
                  { name: 'Total Payment', A: Math.round(loan1Result.totalPayment), B: Math.round(loan2Result.totalPayment) },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <RTooltip formatter={(v: number) => [formatLKR(v), '']} contentStyle={{
                    background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: '#f8f5f0', fontSize: '12px'
                  }} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }} />
                  <Bar dataKey="A" name="Option A" fill="#e8b930" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="B" name="Option B" fill="#16a085" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-white/40 mt-3 text-center flex items-center justify-center gap-1">
                {loan1Result.totalInterest < loan2Result.totalInterest
                  ? <><CheckCircle2 size={12} className="text-[#16a085]" /> Option A saves you {formatLKR(loan2Result.totalInterest - loan1Result.totalInterest, true)} in interest</>
                  : <><CheckCircle2 size={12} className="text-[#16a085]" /> Option B saves you {formatLKR(loan1Result.totalInterest - loan2Result.totalInterest, true)} in interest</>}
              </p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
