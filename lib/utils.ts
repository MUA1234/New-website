import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import type { Transaction, ExpenseCategory, TaxCalculation, TaxSlab, LoanCalculation } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// LKR Formatter
export function formatLKR(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1000000) return `₨ ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₨ ${(amount / 1000).toFixed(1)}K`;
  }
  return `₨ ${amount.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseLKR(str: string): number {
  return parseFloat(str.replace(/[₨,\s]/g, '')) || 0;
}

// Category configs
export const CATEGORIES: Record<
  ExpenseCategory,
  { label: string; label_si: string; color: string; icon: string; bgColor: string }
> = {
  groceries: {
    label: 'Rice & Groceries',
    label_si: 'ආහාර',
    color: '#16a085',
    icon: '🛒',
    bgColor: 'rgba(22,160,133,0.15)',
  },
  transport: {
    label: 'Transport',
    label_si: 'ප්‍රවාහනය',
    color: '#3498db',
    icon: '🚌',
    bgColor: 'rgba(52,152,219,0.15)',
  },
  utilities: {
    label: 'Utilities',
    label_si: 'සේවා',
    color: '#9b59b6',
    icon: '💡',
    bgColor: 'rgba(155,89,182,0.15)',
  },
  rent: {
    label: 'Rent',
    label_si: 'කුලී',
    color: '#e74c3c',
    icon: '🏠',
    bgColor: 'rgba(231,76,60,0.15)',
  },
  education: {
    label: 'Education',
    label_si: 'අධ්‍යාපනය',
    color: '#f39c12',
    icon: '📚',
    bgColor: 'rgba(243,156,18,0.15)',
  },
  healthcare: {
    label: 'Healthcare',
    label_si: 'සෞඛ්‍ය',
    color: '#e74c3c',
    icon: '🏥',
    bgColor: 'rgba(231,76,60,0.15)',
  },
  clothing: {
    label: 'Clothing',
    label_si: 'ඇඳුම්',
    color: '#1abc9c',
    icon: '👗',
    bgColor: 'rgba(26,188,156,0.15)',
  },
  religious: {
    label: 'Religious/Donations',
    label_si: 'ආගමික',
    color: '#e8b930',
    icon: '🙏',
    bgColor: 'rgba(232,185,48,0.15)',
  },
  loans: {
    label: 'Loan Repayments',
    label_si: 'ණය',
    color: '#e74c3c',
    icon: '🏦',
    bgColor: 'rgba(231,76,60,0.15)',
  },
  entertainment: {
    label: 'Entertainment',
    label_si: 'විනෝදය',
    color: '#8e44ad',
    icon: '🎬',
    bgColor: 'rgba(142,68,173,0.15)',
  },
  savings: {
    label: 'Savings',
    label_si: 'ඉතිරිකිරීම',
    color: '#16a085',
    icon: '💰',
    bgColor: 'rgba(22,160,133,0.15)',
  },
  miscellaneous: {
    label: 'Miscellaneous',
    label_si: 'අනෙකුත්',
    color: '#95a5a6',
    icon: '📦',
    bgColor: 'rgba(149,165,166,0.15)',
  },
  income: {
    label: 'Income',
    label_si: 'ආදායම',
    color: '#e8b930',
    icon: '💵',
    bgColor: 'rgba(232,185,48,0.15)',
  },
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'groceries',
  'transport',
  'utilities',
  'rent',
  'education',
  'healthcare',
  'clothing',
  'religious',
  'loans',
  'entertainment',
  'savings',
  'miscellaneous',
];

export const DISTRICTS = [
  { id: 'colombo', name: 'Colombo', name_si: 'කොළඹ' },
  { id: 'gampaha', name: 'Gampaha', name_si: 'ගම්පහ' },
  { id: 'kalutara', name: 'Kalutara', name_si: 'කළුතර' },
  { id: 'kandy', name: 'Kandy', name_si: 'මහනුවර' },
  { id: 'matale', name: 'Matale', name_si: 'මාතලේ' },
  { id: 'nuwara-eliya', name: 'Nuwara Eliya', name_si: 'නුවරඑළිය' },
  { id: 'galle', name: 'Galle', name_si: 'ගාල්ල' },
  { id: 'matara', name: 'Matara', name_si: 'මාතර' },
  { id: 'hambantota', name: 'Hambantota', name_si: 'හම්බන්තොට' },
  { id: 'jaffna', name: 'Jaffna', name_si: 'යාපනය' },
  { id: 'kilinochchi', name: 'Kilinochchi', name_si: 'කිලිනොච්චිය' },
  { id: 'mullaitivu', name: 'Mullaitivu', name_si: 'මුලතිව්' },
  { id: 'mannar', name: 'Mannar', name_si: 'මන්නාරම' },
  { id: 'vavuniya', name: 'Vavuniya', name_si: 'වවුනියා' },
  { id: 'trincomalee', name: 'Trincomalee', name_si: 'මඩකලපුව' },
  { id: 'batticaloa', name: 'Batticaloa', name_si: 'මඩකලපුව' },
  { id: 'ampara', name: 'Ampara', name_si: 'අම්පාර' },
  { id: 'puttalam', name: 'Puttalam', name_si: 'පුත්තලම' },
  { id: 'kurunegala', name: 'Kurunegala', name_si: 'කුරුණෑගල' },
  { id: 'anuradhapura', name: 'Anuradhapura', name_si: 'අනුරාධපුරය' },
  { id: 'polonnaruwa', name: 'Polonnaruwa', name_si: 'පොළොන්නරුව' },
  { id: 'badulla', name: 'Badulla', name_si: 'බදුල්ල' },
  { id: 'monaragala', name: 'Monaragala', name_si: 'මොනරාගල' },
  { id: 'ratnapura', name: 'Ratnapura', name_si: 'රත්නපුර' },
  { id: 'kegalle', name: 'Kegalle', name_si: 'කෑගල්ල' },
];

export const EMPLOYMENT_TYPES = [
  { id: 'government', label: 'Government Employee', label_si: 'රජයේ සේවය' },
  { id: 'private', label: 'Private Sector', label_si: 'පෞද්ගලික අංශය' },
  { id: 'self-employed', label: 'Self Employed', label_si: 'ස්වයං රැකියා' },
  { id: 'freelancer', label: 'Freelancer', label_si: 'ෆ්‍රීලාන්සර්' },
  { id: 'student', label: 'Student', label_si: 'සිසුවා' },
  { id: 'unemployed', label: 'Unemployed', label_si: 'රැකියා විරහිත' },
];

// Transaction helpers
export function getMonthTransactions(transactions: Transaction[], month: string) {
  return transactions.filter((tx) => tx.date.startsWith(month));
}

export function getMonthExpenses(transactions: Transaction[], month: string) {
  return getMonthTransactions(transactions, month).filter((tx) => tx.type === 'expense');
}

export function getMonthIncome(transactions: Transaction[], month: string) {
  return getMonthTransactions(transactions, month)
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[]) {
  return transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
}

export function getCategoryTotal(transactions: Transaction[], category: ExpenseCategory) {
  return transactions
    .filter((tx) => tx.type === 'expense' && tx.category === category)
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function getMonthlyStats(transactions: Transaction[], monthlyIncome: number) {
  const now = new Date();
  const stats = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = format(date, 'yyyy-MM');
    const monthLabel = format(date, 'MMM yy');
    const expenses = getMonthExpenses(transactions, month).reduce((s, t) => s + t.amount, 0);
    const income = getMonthIncome(transactions, month) || (i === 0 ? monthlyIncome : monthlyIncome * (0.9 + Math.random() * 0.2));
    const savings = income - expenses;
    stats.push({
      month: monthLabel,
      income: Math.round(income),
      expenses: Math.round(expenses),
      savings: Math.round(savings),
      savingsRate: income > 0 ? Math.round((savings / income) * 100) : 0,
    });
  }
  return stats;
}

// Tax Calculator (Sri Lankan PAYE)
export function calculateTax(annualGross: number): TaxCalculation {
  const slabs: TaxSlab[] = [
    { range: 'First ₨ 1,200,000', rate: 6, taxable: 0, tax: 0 },
    { range: 'Next ₨ 500,000', rate: 12, taxable: 0, tax: 0 },
    { range: 'Next ₨ 500,000', rate: 18, taxable: 0, tax: 0 },
    { range: 'Next ₨ 500,000', rate: 24, taxable: 0, tax: 0 },
    { range: 'Next ₨ 500,000', rate: 30, taxable: 0, tax: 0 },
    { range: 'Balance', rate: 36, taxable: 0, tax: 0 },
  ];
  const limits = [1200000, 500000, 500000, 500000, 500000, Infinity];
  let remaining = annualGross;
  let totalTax = 0;

  slabs.forEach((slab, i) => {
    const taxable = Math.min(remaining, limits[i]);
    slab.taxable = taxable;
    slab.tax = taxable * (slab.rate / 100);
    totalTax += slab.tax;
    remaining -= taxable;
  });

  const monthlyGross = annualGross / 12;
  const epfEmployee = monthlyGross * 0.08;
  const epfEmployer = monthlyGross * 0.12;
  const etf = monthlyGross * 0.03;
  const monthlyTax = totalTax / 12;
  const netSalary = monthlyGross - epfEmployee - monthlyTax;

  return {
    grossSalary: monthlyGross,
    epfEmployee,
    epfEmployer,
    etf,
    taxableIncome: annualGross,
    taxAmount: totalTax,
    netSalary,
    effectiveRate: annualGross > 0 ? (totalTax / annualGross) * 100 : 0,
    slabs,
  };
}

// Loan Calculator
export function calculateLoan(
  principal: number,
  annualRate: number,
  tenureMonths: number
): LoanCalculation {
  const monthlyRate = annualRate / 100 / 12;
  const emi =
    monthlyRate === 0
      ? principal / tenureMonths
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;

  const amortizationSchedule = [];
  let balance = principal;
  for (let month = 1; month <= tenureMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance -= principalPaid;
    amortizationSchedule.push({
      month,
      payment: Math.round(emi),
      principal: Math.round(principalPaid),
      interest: Math.round(interest),
      balance: Math.max(0, Math.round(balance)),
    });
  }

  return { principal, annualRate, tenureMonths, emi, totalInterest, totalPayment, amortizationSchedule };
}

// Snowball vs Avalanche
export function calculateDebtPayoff(
  debts: { id: string; name: string; balance: number; interestRate: number; minimumPayment: number }[],
  extraPayment: number,
  method: 'snowball' | 'avalanche'
) {
  const sorted = [...debts].sort((a, b) =>
    method === 'snowball' ? a.balance - b.balance : b.interestRate - a.interestRate
  );
  let months = 0;
  let totalInterest = 0;
  const remaining = sorted.map((d) => ({ ...d, paid: false }));
  while (remaining.some((d) => !d.paid) && months < 600) {
    months++;
    let extra = extraPayment;
    remaining.forEach((d) => {
      if (d.paid) return;
      const interest = (d.balance * d.interestRate) / 100 / 12;
      totalInterest += interest;
      d.balance = d.balance + interest - d.minimumPayment;
      if (d.balance <= 0) {
        d.paid = true;
        extra += d.minimumPayment;
      }
    });
    const target = remaining.find((d) => !d.paid);
    if (target) target.balance -= extra;
    remaining.filter((d) => d.balance <= 0).forEach((d) => (d.paid = true));
  }
  return { months, totalInterest };
}

export function getChangeIndicator(current: number, previous: number) {
  if (previous === 0) return { pct: 0, direction: 'neutral' as const };
  const pct = ((current - previous) / previous) * 100;
  return {
    pct: Math.abs(pct),
    direction: pct > 0 ? ('up' as const) : pct < 0 ? ('down' as const) : ('neutral' as const),
  };
}
