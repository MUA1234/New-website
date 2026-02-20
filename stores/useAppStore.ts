import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  UserProfile,
  Transaction,
  MonthlyBudget,
  SavingsGoal,
  ExpenseCategory,
} from '@/types';
import { format } from 'date-fns';

interface AppState {
  // User
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactions: (ids: string[]) => void;

  // Budgets
  monthlyBudgets: MonthlyBudget[];
  setMonthBudget: (month: string, category: ExpenseCategory, limit: number) => void;
  setMonthBudgets: (month: string, budgets: Record<string, number>) => void;
  getCurrentBudget: () => MonthlyBudget | null;

  // Savings Goals
  savingsGoals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'milestones'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  // Articles read
  articlesRead: string[];
  markArticleRead: (id: string) => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Reset
  resetAllData: () => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),

      transactions: [],
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [
            {
              ...tx,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
            ...state.transactions,
          ],
        })),
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        })),
      deleteTransactions: (ids) =>
        set((state) => ({
          transactions: state.transactions.filter((tx) => !ids.includes(tx.id)),
        })),

      monthlyBudgets: [],
      setMonthBudget: (month, category, limit) =>
        set((state) => {
          const existing = state.monthlyBudgets.find((b) => b.month === month);
          if (existing) {
            return {
              monthlyBudgets: state.monthlyBudgets.map((b) =>
                b.month === month
                  ? { ...b, budgets: { ...b.budgets, [category]: limit } }
                  : b
              ),
            };
          }
          return {
            monthlyBudgets: [
              ...state.monthlyBudgets,
              { month, budgets: { [category]: limit } as Record<ExpenseCategory, number> },
            ],
          };
        }),
      setMonthBudgets: (month, budgets) =>
        set((state) => {
          const existing = state.monthlyBudgets.find((b) => b.month === month);
          if (existing) {
            return {
              monthlyBudgets: state.monthlyBudgets.map((b) =>
                b.month === month ? { ...b, budgets: { ...b.budgets, ...budgets } } : b
              ),
            };
          }
          return {
            monthlyBudgets: [
              ...state.monthlyBudgets,
              { month, budgets: budgets as Record<ExpenseCategory, number> },
            ],
          };
        }),
      getCurrentBudget: () => {
        const month = format(new Date(), 'yyyy-MM');
        return get().monthlyBudgets.find((b) => b.month === month) || null;
      },

      savingsGoals: [],
      addGoal: (goal) =>
        set((state) => ({
          savingsGoals: [
            ...state.savingsGoals,
            {
              ...goal,
              id: generateId(),
              createdAt: new Date().toISOString(),
              milestones: [],
            },
          ],
        })),
      updateGoal: (id, updates) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),
      deleteGoal: (id) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        })),
      contributeToGoal: (id, amount) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) => {
            if (g.id !== id) return g;
            const newAmount = Math.min(g.currentAmount + amount, g.targetAmount);
            const progress = (newAmount / g.targetAmount) * 100;
            const milestones = [...g.milestones];
            [25, 50, 75, 100].forEach((m) => {
              if (progress >= m && !milestones.includes(m)) {
                milestones.push(m);
              }
            });
            return { ...g, currentAmount: newAmount, milestones };
          }),
        })),

      articlesRead: [],
      markArticleRead: (id) =>
        set((state) => ({
          articlesRead: state.articlesRead.includes(id)
            ? state.articlesRead
            : [...state.articlesRead, id],
        })),

      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      resetAllData: () =>
        set({
          profile: null,
          transactions: [],
          monthlyBudgets: [],
          savingsGoals: [],
          articlesRead: [],
          theme: 'dark',
        }),
    }),
    {
      name: 'mirupee-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
