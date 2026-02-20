// Core Types for MiRupee App

export interface UserProfile {
  name: string;
  monthlyIncome: number;
  householdSize: number;
  district: string;
  employmentType: 'government' | 'private' | 'self-employed' | 'freelancer' | 'student' | 'unemployed';
  currency: 'LKR';
  theme: 'dark' | 'light';
  language: 'en' | 'si';
  setupComplete: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  type: 'expense' | 'income';
  createdAt: string;
}

export type ExpenseCategory =
  | 'groceries'
  | 'transport'
  | 'utilities'
  | 'rent'
  | 'education'
  | 'healthcare'
  | 'clothing'
  | 'religious'
  | 'loans'
  | 'entertainment'
  | 'savings'
  | 'miscellaneous'
  | 'income';

export type PaymentMethod = 'cash' | 'card' | 'bank-transfer' | 'digital-wallet';

export interface Budget {
  category: ExpenseCategory;
  limit: number;
  spent: number;
  month: string; // YYYY-MM
}

export interface MonthlyBudget {
  month: string;
  budgets: Record<ExpenseCategory, number>;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  color: string;
  category: string;
  createdAt: string;
  milestones: number[]; // percentages celebrated
}

export interface LoanCalculation {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  amortizationSchedule: AmortizationEntry[];
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  type: string;
}

export interface TaxCalculation {
  grossSalary: number;
  epfEmployee: number;
  epfEmployer: number;
  etf: number;
  taxableIncome: number;
  taxAmount: number;
  netSalary: number;
  effectiveRate: number;
  slabs: TaxSlab[];
}

export interface TaxSlab {
  range: string;
  rate: number;
  taxable: number;
  tax: number;
}

export interface PriceItem {
  id: string;
  name: string;
  name_si: string;
  category: string;
  unit: string;
  current_price: number;
  price_history: number[];
  district_prices: Record<string, number>;
  price_change_pct: number;
  price_alert: boolean;
}

export interface DistrictCost {
  id: string;
  name: string;
  name_si: string;
  region: string;
  monthly_costs: {
    rent_single: number;
    rent_family: number;
    groceries_single: number;
    groceries_family: number;
    transport: number;
    utilities: number;
    education_child: number;
    healthcare: number;
    entertainment: number;
  };
}

export interface Article {
  id: string;
  title: string;
  title_si: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  reading_time: number;
  tags: string[];
  content: string;
  quiz: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface ExchangeRate {
  rate: number;
  symbol: string;
  name: string;
  history: number[];
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  household_size: number;
  district: string;
  monthly_income: number;
  budgets: Record<string, number>;
}

export interface MonthlyStats {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}

export interface CategoryInsight {
  category: ExpenseCategory;
  currentMonth: number;
  lastMonth: number;
  changePercent: number;
  vsDistrictAverage: number;
}
