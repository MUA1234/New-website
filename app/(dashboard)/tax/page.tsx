'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Info, TrendingDown, BadgeDollarSign, PiggyBank, Building2, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { formatLKR, calculateTax } from '@/lib/utils';
import GlassCard from '@/components/ui/GlassCard';
import LKRAmount from '@/components/ui/LKRAmount';

const TOOLTIP_STYLE = {
  background: 'rgba(0,0,0,0.9)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#f8f5f0',
  fontSize: '12px',
};

function InfoRow({ label, value, color = 'default', sub }: { label: string; value: string; color?: 'gold' | 'emerald' | 'coral' | 'default'; sub?: string }) {
  const colorMap = { gold: 'text-[#e8b930]', emerald: 'text-[#16a085]', coral: 'text-[#e74c3c]', default: 'text-white' };
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm text-white/70">{label}</p>
        {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
      </div>
      <p className={`text-sm font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  );
}

export default function TaxPage() {
  const { profile } = useAppStore();
  const [monthlySalary, setMonthlySalary] = useState(
    profile?.monthlyIncome || 75000
  );

  const annualGross = monthlySalary * 12;
  const result = useMemo(() => calculateTax(annualGross), [annualGross]);

  const slabColors = ['#16a085', '#3498db', '#f39c12', '#e67e22', '#e74c3c', '#8e44ad'];

  return (
    <div className="p-4 md:p-6 space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Tax Calculator</h1>
        <p className="text-white/40 text-sm">Sri Lanka PAYE tax · EPF & ETF deductions · 2023/24</p>
      </div>

      {/* Salary input */}
      <GlassCard className="p-5" delay={0.05}>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-white/80">Monthly Gross Salary</label>
          <span className="text-[#e8b930] font-bold text-lg">{formatLKR(monthlySalary, true)}</span>
        </div>
        <input
          type="range" min={10000} max={500000} step={5000} value={monthlySalary}
          onChange={(e) => setMonthlySalary(Number(e.target.value))}
          className="w-full mb-3"
        />
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e8b930] font-bold text-sm">₨</span>
          <input
            type="number" value={monthlySalary}
            onChange={(e) => setMonthlySalary(Math.max(0, Number(e.target.value)))}
            className="lkr-input w-full rounded-xl px-4 py-3 pl-9 text-base font-bold"
          />
        </div>
        <p className="text-xs text-white/30 mt-2">Annual gross: {formatLKR(annualGross)}</p>
      </GlassCard>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Monthly Gross', value: result.grossSalary, color: 'gold' as const, icon: <BadgeDollarSign size={16} />, sub: 'Before deductions' },
          { label: 'EPF (8%)', value: result.epfEmployee, color: 'emerald' as const, icon: <PiggyBank size={16} />, sub: 'Employee contribution' },
          { label: 'PAYE Tax', value: result.taxAmount / 12, color: 'coral' as const, icon: <Building2 size={16} />, sub: `${result.effectiveRate.toFixed(1)}% effective rate` },
          { label: 'Net Take-Home', value: result.netSalary, color: 'emerald' as const, icon: <CheckCircle2 size={16} />, sub: 'After all deductions' },
        ].map((item, i) => (
          <GlassCard key={item.label} className="p-4" delay={0.1 + i * 0.05}>
            <div className="flex items-center gap-1.5 mb-2 text-white/40">
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </div>
            <LKRAmount amount={item.value} size="lg" color={item.color} />
            <p className="text-[10px] text-white/30 mt-1">{item.sub}</p>
          </GlassCard>
        ))}
      </div>

      {/* PAYE slab breakdown */}
      <GlassCard className="p-5" delay={0.25} hover={false}>
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Calculator size={16} className="text-[#e8b930]" />
          PAYE Tax Slab Breakdown
        </h3>
        <div className="space-y-2">
          {result.slabs.map((slab, i) => {
            const pct = annualGross > 0 ? (slab.taxable / annualGross) * 100 : 0;
            return (
              <motion.div
                key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex items-center gap-3"
              >
                <div className="w-24 flex-shrink-0">
                  <p className="text-xs text-white/50">{slab.range}</p>
                  <p className="text-xs font-bold" style={{ color: slabColors[i] }}>{slab.rate}% tax</p>
                </div>
                <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.07 }}
                    className="h-full rounded-lg flex items-center justify-end pr-2"
                    style={{ backgroundColor: `${slabColors[i]}30`, borderRight: slab.taxable > 0 ? `2px solid ${slabColors[i]}` : 'none' }}
                  >
                    {slab.taxable > 0 && (
                      <span className="text-[10px] font-medium" style={{ color: slabColors[i] }}>
                        {formatLKR(slab.taxable, true)}
                      </span>
                    )}
                  </motion.div>
                </div>
                <div className="w-24 text-right flex-shrink-0">
                  <p className="text-xs font-bold text-white/70">{formatLKR(slab.tax, true)}</p>
                  <p className="text-[10px] text-white/30">tax</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-sm font-semibold text-white/60">Total Annual Tax</span>
          <span className="text-lg font-black text-[#e74c3c]">{formatLKR(result.taxAmount)}</span>
        </div>
      </GlassCard>

      {/* EPF & ETF breakdown */}
      <GlassCard className="p-5" delay={0.3} hover={false}>
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <PiggyBank size={16} className="text-[#16a085]" />
          EPF & ETF Contributions (Monthly)
        </h3>
        <InfoRow label="Gross Salary" value={formatLKR(result.grossSalary)} color="gold" />
        <InfoRow
          label="EPF — Employee (8%)"
          value={`− ${formatLKR(result.epfEmployee)}`}
          color="coral"
          sub="Deducted from your salary"
        />
        <InfoRow
          label="EPF — Employer (12%)"
          value={`+ ${formatLKR(result.epfEmployer)}`}
          color="emerald"
          sub="Added by employer on your behalf"
        />
        <InfoRow
          label="ETF — Employer (3%)"
          value={formatLKR(result.etf)}
          color="emerald"
          sub="Employee Trust Fund (employer pays)"
        />
        <InfoRow
          label="PAYE Tax (monthly)"
          value={`− ${formatLKR(result.taxAmount / 12)}`}
          color="coral"
          sub={`Effective rate: ${result.effectiveRate.toFixed(2)}%`}
        />
        <div className="mt-3 p-3 bg-[#16a085]/10 rounded-xl border border-[#16a085]/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Net Take-Home Pay</span>
            <span className="text-xl font-black text-[#16a085]">{formatLKR(result.netSalary)}</span>
          </div>
          <p className="text-xs text-white/40 mt-0.5">Per month after EPF (8%) and PAYE tax</p>
        </div>
      </GlassCard>

      {/* Info box */}
      <GlassCard className="p-4" delay={0.4} hover={false}>
        <div className="flex gap-3">
          <Info size={16} className="text-[#e8b930] flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white/80">About Sri Lanka PAYE Tax</p>
            <p className="text-xs text-white/50">
              Pay As You Earn (PAYE) is withheld by your employer monthly. The first Rs 1.2M annually (Rs 100K/month)
              is taxed at 6%. Rates rise progressively to 36% for income above Rs 3.2M/year.
            </p>
            <p className="text-xs text-white/50">
              EPF contributions earn approximately 9% interest annually and are accessible at retirement (age 55+)
              or upon resignation. ETF is paid fully by the employer.
            </p>
            <p className="text-xs text-white/30">
              Based on Inland Revenue Act No. 24 of 2017. Consult a tax professional for personalised advice.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
