'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, Users, Briefcase, Wallet, CheckCircle2, ArrowRight, ShoppingCart, Bus, Home, Lightbulb, HeartPulse, GraduationCap, Package, LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '@/stores/useAppStore';
import { DISTRICTS, EMPLOYMENT_TYPES, formatLKR } from '@/lib/utils';

const HOUSEHOLD_SPENDING_STATS = [
  { label: 'Food & Groceries', percent: 38, color: '#16a085', Icon: ShoppingCart },
  { label: 'Transport', percent: 15, color: '#3498db', Icon: Bus },
  { label: 'Housing', percent: 22, color: '#e74c3c', Icon: Home },
  { label: 'Utilities', percent: 8, color: '#9b59b6', Icon: Lightbulb },
  { label: 'Healthcare', percent: 6, color: '#e74c3c', Icon: HeartPulse },
  { label: 'Education', percent: 7, color: '#f39c12', Icon: GraduationCap },
  { label: 'Other', percent: 4, color: '#95a5a6', Icon: Package },
];

const STEPS = [
  { id: 'welcome', title: 'Welcome to MiRupee' },
  { id: 'income', title: 'Your Monthly Income' },
  { id: 'profile', title: 'About You' },
  { id: 'done', title: "You're all set!" },
];

export default function LandingPage() {
  const router = useRouter();
  const { profile, setProfile } = useAppStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    monthlyIncome: '',
    householdSize: '1',
    district: 'colombo',
    employmentType: 'private' as const,
  });

  useEffect(() => {
    if (profile?.setupComplete) {
      router.replace('/dashboard');
    }
  }, [profile, router]);

  const handleStart = () => setStep(1);
  const handleNext = () => setStep((s) => s + 1);

  const handleFinish = () => {
    if (!form.monthlyIncome || parseFloat(form.monthlyIncome) <= 0) {
      toast.error('Please enter a valid monthly income');
      return;
    }
    setProfile({
      name: form.name || 'Friend',
      monthlyIncome: parseFloat(form.monthlyIncome.replace(/,/g, '')),
      householdSize: parseInt(form.householdSize),
      district: form.district,
      employmentType: form.employmentType,
      currency: 'LKR',
      theme: 'dark',
      language: 'en',
      setupComplete: true,
      createdAt: new Date().toISOString(),
    });
    toast.success('Welcome to MiRupee!');
    router.push('/dashboard');
  };

  if (profile?.setupComplete) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#e8b930]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#16a085]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0f3460]/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center"
            >
              {/* Hero */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-8"
              >
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#e8b930] to-[#c49a18] flex items-center justify-center shadow-[0_0_60px_rgba(232,185,48,0.4)] mx-auto">
                  <span className="text-6xl font-black text-black">₨</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-3xl font-black text-[#e8b930]">MiRupee</span>
                  <span className="text-lg text-white/40 font-['Noto_Sans_Sinhala']">මිරුපියල්</span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                  Take control of your finances.
                </p>
                <p className="text-lg text-[#e8b930] font-semibold mb-6">
                  Built for Sri Lanka.
                </p>
                <p className="text-white/60 text-base max-w-md mx-auto mb-10 leading-relaxed">
                  Track expenses in LKR, plan budgets, compare prices across districts,
                  calculate taxes, and build savings — all in one free app designed for
                  Sri Lankan families.
                </p>
              </motion.div>

              {/* Spending stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-md mb-10"
              >
                <p className="text-xs text-white/40 uppercase tracking-wider mb-4">
                  Average Sri Lankan Household Spending
                </p>
                <div className="space-y-2">
                  {HOUSEHOLD_SPENDING_STATS.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.08 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-sm w-4"><stat.Icon size={16} /></span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">{stat.label}</span>
                          <span style={{ color: stat.color }} className="font-medium">{stat.percent}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.percent}%` }}
                            transition={{ delay: 0.7 + i * 0.08, duration: 0.8 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: stat.color }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                className="flex items-center gap-3 bg-gradient-to-r from-[#e8b930] to-[#c49a18] text-black font-bold px-8 py-4 rounded-2xl text-lg shadow-[0_0_30px_rgba(232,185,48,0.4)] hover:shadow-[0_0_40px_rgba(232,185,48,0.6)] transition-shadow"
              >
                Get Started Free
                <ArrowRight size={20} />
              </motion.button>

              <p className="text-white/30 text-xs mt-4">No account needed. Your data stays on your device.</p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="income"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12"
            >
              <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#e8b930]/15 flex items-center justify-center mx-auto mb-4">
                    <Wallet size={32} className="text-[#e8b930]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">What&apos;s your monthly income?</h2>
                  <p className="text-white/50 text-sm">
                    This helps us give you personalized budget recommendations in LKR.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">Your Name (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Kamal"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="lkr-input w-full rounded-xl px-4 py-3 text-base"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">
                      Monthly Income (LKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e8b930] font-bold text-lg">₨</span>
                      <input
                        type="number"
                        placeholder="e.g., 75000"
                        value={form.monthlyIncome}
                        onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })}
                        className="lkr-input w-full rounded-xl px-4 py-3 pl-10 text-base"
                      />
                    </div>
                    {form.monthlyIncome && parseFloat(form.monthlyIncome) > 0 && (
                      <p className="text-xs text-[#16a085] mt-1">
                        ≈ {formatLKR(parseFloat(form.monthlyIncome))} per month
                      </p>
                    )}
                  </div>

                  {/* Quick income presets */}
                  <div className="flex flex-wrap gap-2">
                    {[25000, 50000, 75000, 100000, 150000, 200000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setForm({ ...form, monthlyIncome: amount.toString() })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          form.monthlyIncome === amount.toString()
                            ? 'bg-[#e8b930]/20 text-[#e8b930] border border-[#e8b930]/30'
                            : 'bg-white/5 text-white/50 hover:bg-white/10'
                        }`}
                      >
                        ₨ {(amount / 1000).toFixed(0)}K
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full mt-8 flex items-center justify-center gap-2 bg-gradient-to-r from-[#e8b930] to-[#c49a18] text-black font-bold px-6 py-4 rounded-xl"
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col items-center justify-center px-6 py-12"
            >
              <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#16a085]/15 flex items-center justify-center mx-auto mb-4">
                    <MapPin size={32} className="text-[#16a085]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
                  <p className="text-white/50 text-sm">
                    We use this to compare your spending with district averages.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block flex items-center gap-1">
                      <MapPin size={12} /> District
                    </label>
                    <select
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="lkr-input w-full rounded-xl px-4 py-3 text-base"
                    >
                      {DISTRICTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.name_si})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block flex items-center gap-1">
                      <Users size={12} /> Household Size
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, '6+'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setForm({ ...form, householdSize: size.toString() })}
                          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                            form.householdSize === size.toString()
                              ? 'bg-[#16a085]/20 text-[#16a085] border border-[#16a085]/30'
                              : 'bg-white/5 text-white/50 hover:bg-white/10'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block flex items-center gap-1">
                      <Briefcase size={12} /> Employment Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {EMPLOYMENT_TYPES.map((et) => (
                        <button
                          key={et.id}
                          onClick={() => setForm({ ...form, employmentType: et.id as typeof form.employmentType })}
                          className={`py-2.5 px-3 rounded-xl text-sm text-left transition-all ${
                            form.employmentType === et.id
                              ? 'bg-[#e8b930]/15 text-[#e8b930] border border-[#e8b930]/25'
                              : 'bg-white/5 text-white/50 hover:bg-white/10'
                          }`}
                        >
                          <div className="font-medium text-xs">{et.label}</div>
                          <div className="text-[10px] opacity-60 font-['Noto_Sans_Sinhala']">{et.label_si}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full mt-8 flex items-center justify-center gap-2 bg-gradient-to-r from-[#e8b930] to-[#c49a18] text-black font-bold px-6 py-4 rounded-xl"
                >
                  Launch Dashboard <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicator */}
        {step > 0 && (
          <div className="flex justify-center gap-2 pb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-[#e8b930] w-8' : 'bg-white/20 w-4'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
