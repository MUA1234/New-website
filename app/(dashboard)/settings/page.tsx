'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, MapPin, Briefcase, DollarSign, Users, Download, RotateCcw,
  Save, ChevronRight, AlertTriangle, CheckCircle2, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '@/stores/useAppStore';
import { DISTRICTS, EMPLOYMENT_TYPES, formatLKR, cn } from '@/lib/utils';
import GlassCard from '@/components/ui/GlassCard';
import type { UserProfile } from '@/types';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'income', label: 'Income & Budget', icon: DollarSign },
  { id: 'data', label: 'Data & Privacy', icon: Shield },
];

export default function SettingsPage() {
  const { profile, updateProfile, transactions, savingsGoals, monthlyBudgets, resetAllData } = useAppStore();
  const [section, setSection] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || '',
    district: profile?.district || 'colombo',
    employmentType: (profile?.employmentType || 'private') as UserProfile['employmentType'],
    householdSize: profile?.householdSize || 1,
    monthlyIncome: profile?.monthlyIncome || 0,
    language: profile?.language || 'en',
  });

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Please enter your name'); return; }
    updateProfile({
      name: form.name.trim(),
      district: form.district,
      employmentType: form.employmentType as UserProfile['employmentType'],
      householdSize: form.householdSize,
      monthlyIncome: form.monthlyIncome,
      language: form.language as 'en' | 'si',
    });
    setSaved(true);
    toast.success('Settings saved!');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = {
      profile,
      transactions,
      savingsGoals,
      monthlyBudgets,
      exportedAt: new Date().toISOString(),
      app: 'MiRupee',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirupee-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Data exported!');
  };

  const handleReset = () => {
    resetAllData();
    setConfirmReset(false);
    toast.success('All data cleared');
    window.location.href = '/';
  };

  return (
    <div className="p-4 md:p-6 space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm">Manage your profile and preferences</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setSection(id)}
            className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5',
              section === id ? 'bg-[#e8b930]/20 text-[#e8b930]' : 'text-white/40 hover:text-white/60')}>
            <Icon size={14} />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {section === 'profile' && (
        <div className="space-y-4">
          <GlassCard className="p-5" delay={0.05}>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><User size={16} /> Personal Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Display Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="lkr-input w-full rounded-xl px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block flex items-center gap-1"><MapPin size={12} /> District</label>
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="lkr-input w-full rounded-xl px-4 py-3 text-sm"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block flex items-center gap-1"><Briefcase size={12} /> Employment Type</label>
                <select
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value as UserProfile['employmentType'] })}
                  className="lkr-input w-full rounded-xl px-4 py-3 text-sm"
                >
                  {EMPLOYMENT_TYPES.map((e) => (
                    <option key={e.id} value={e.id}>{e.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block flex items-center gap-1"><Users size={12} /> Household Size</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button key={n} type="button"
                      onClick={() => setForm({ ...form, householdSize: n })}
                      className={cn('flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border',
                        form.householdSize === n
                          ? 'bg-[#e8b930]/20 text-[#e8b930] border-[#e8b930]/30'
                          : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10')}>
                      {n}{n === 6 ? '+' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Language</label>
                <div className="flex gap-2">
                  {([['en', 'English'], ['si', 'සිංහල']] as const).map(([code, label]) => (
                    <button key={code} type="button"
                      onClick={() => setForm({ ...form, language: code })}
                      className={cn('flex-1 py-2.5 rounded-xl text-sm font-medium border',
                        form.language === code
                          ? 'bg-[#e8b930]/20 text-[#e8b930] border-[#e8b930]/30'
                          : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10')}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          <button onClick={handleSave}
            className={cn('w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all',
              saved ? 'bg-[#16a085] text-white' : 'bg-gradient-to-r from-[#e8b930] to-[#c49a18] text-black')}>
            {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      )}

      {section === 'income' && (
        <div className="space-y-4">
          <GlassCard className="p-5" delay={0.05}>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><DollarSign size={16} /> Income Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Monthly Income (LKR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e8b930] font-bold">₨</span>
                  <input
                    type="number"
                    value={form.monthlyIncome || ''}
                    onChange={(e) => setForm({ ...form, monthlyIncome: Number(e.target.value) })}
                    placeholder="75000"
                    className="lkr-input w-full rounded-xl px-4 py-3 pl-9 text-base font-bold"
                  />
                </div>
                <p className="text-xs text-white/30 mt-1">
                  {form.monthlyIncome > 0 ? `Annual: ${formatLKR(form.monthlyIncome * 12)}` : 'Used for budget recommendations and tax calculations'}
                </p>
              </div>

              <input type="range" min={0} max={500000} step={5000} value={form.monthlyIncome}
                onChange={(e) => setForm({ ...form, monthlyIncome: Number(e.target.value) })}
                className="w-full" />
            </div>
          </GlassCard>

          {/* Stats summary */}
          <GlassCard className="p-5" delay={0.1} hover={false}>
            <h3 className="font-semibold text-white mb-4">Your Data Summary</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Transactions', value: transactions.length },
                { label: 'Savings Goals', value: savingsGoals.length },
                { label: 'Budget Months', value: monthlyBudgets.length },
              ].map((stat) => (
                <div key={stat.label} className="p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-black text-[#e8b930]">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <button onClick={handleSave}
            className={cn('w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all',
              saved ? 'bg-[#16a085] text-white' : 'bg-gradient-to-r from-[#e8b930] to-[#c49a18] text-black')}>
            {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      )}

      {section === 'data' && (
        <div className="space-y-4">
          {/* Export */}
          <GlassCard className="p-5" delay={0.05}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#16a085]/15 flex items-center justify-center flex-shrink-0">
                <Download size={18} className="text-[#16a085]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Export Your Data</h3>
                <p className="text-sm text-white/50 mt-0.5 mb-3">
                  Download all your transactions, goals, and budgets as a JSON file.
                  Your data stays on your device — we never upload anything.
                </p>
                <button onClick={handleExport}
                  className="flex items-center gap-2 bg-[#16a085]/15 text-[#16a085] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#16a085]/25 transition-colors">
                  <Download size={16} /> Export JSON
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Privacy note */}
          <GlassCard className="p-5" delay={0.1} hover={false}>
            <div className="flex items-start gap-3">
              <Shield size={16} className="text-[#e8b930] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">100% Private & Local</p>
                <p className="text-sm text-white/50 leading-relaxed">
                  MiRupee stores all your financial data exclusively in your browser's local storage.
                  No accounts, no servers, no uploads. Your data never leaves your device.
                  Clearing browser data or using a different device will lose your data — export regularly.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Reset */}
          <GlassCard className="p-5 border-[#e74c3c]/20" delay={0.15}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#e74c3c]/15 flex items-center justify-center flex-shrink-0">
                <RotateCcw size={18} className="text-[#e74c3c]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Reset All Data</h3>
                <p className="text-sm text-white/50 mt-0.5 mb-3">
                  Permanently delete all transactions, goals, budgets, and your profile.
                  This cannot be undone.
                </p>
                {!confirmReset ? (
                  <button onClick={() => setConfirmReset(true)}
                    className="flex items-center gap-2 bg-[#e74c3c]/10 text-[#e74c3c] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#e74c3c]/20 transition-colors">
                    <RotateCcw size={16} /> Reset All Data
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-[#e74c3c]/10 rounded-xl border border-[#e74c3c]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={16} className="text-[#e74c3c]" />
                      <p className="text-sm font-semibold text-[#e74c3c]">Are you sure?</p>
                    </div>
                    <p className="text-xs text-white/50 mb-4">
                      This will delete all {transactions.length} transactions, {savingsGoals.length} goals,
                      and your profile. Consider exporting first.
                    </p>
                    <div className="flex gap-3">
                      <button onClick={() => setConfirmReset(false)}
                        className="flex-1 py-2.5 rounded-xl text-sm bg-white/10 text-white/60 hover:bg-white/15">
                        Cancel
                      </button>
                      <button onClick={handleReset}
                        className="flex-1 py-2.5 rounded-xl text-sm bg-[#e74c3c] text-white font-bold hover:bg-[#c0392b]">
                        Yes, Delete All
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* App version */}
          <div className="text-center py-4 space-y-1">
            <p className="text-xs text-white/20">MiRupee (මිරුපියල්) v1.0.0</p>
            <p className="text-xs text-white/15">Built for Sri Lankan personal finance</p>
          </div>
        </div>
      )}
    </div>
  );
}
