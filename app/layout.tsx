import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import ThemeProvider from '@/components/layout/ThemeProvider';

export const metadata: Metadata = {
  title: 'MiRupee (මිරුපියල්) — Sri Lankan Personal Finance',
  description:
    'Take control of your finances. Built for Sri Lanka. Track expenses, plan budgets, compare prices, calculate taxes — all in LKR.',
  keywords: 'Sri Lanka finance, LKR budget, personal finance, expense tracker, cost of living',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">₨</text></svg>',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(10, 10, 20, 0.95)',
                color: '#f8f5f0',
                border: '1px solid rgba(232, 185, 48, 0.3)',
                backdropFilter: 'blur(12px)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#16a085', secondary: '#f8f5f0' },
              },
              error: {
                iconTheme: { primary: '#e74c3c', secondary: '#f8f5f0' },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
