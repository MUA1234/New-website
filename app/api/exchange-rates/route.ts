import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'data', 'exchange-rates.json');
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    return NextResponse.json(data);
  } catch {
    // Return fallback data if file not found
    return NextResponse.json({
      updated: new Date().toISOString().split('T')[0],
      base: 'LKR',
      rates: {
        USD: { rate: 302.50, symbol: '$', name: 'US Dollar', history: Array(30).fill(302.50) },
        EUR: { rate: 328.40, symbol: '€', name: 'Euro', history: Array(30).fill(328.40) },
        GBP: { rate: 383.20, symbol: '£', name: 'British Pound', history: Array(30).fill(383.20) },
        INR: { rate: 3.62, symbol: '₹', name: 'Indian Rupee', history: Array(30).fill(3.62) },
        AUD: { rate: 193.80, symbol: 'A$', name: 'Australian Dollar', history: Array(30).fill(193.80) },
        SAR: { rate: 80.65, symbol: '﷼', name: 'Saudi Riyal', history: Array(30).fill(80.65) },
        AED: { rate: 82.38, symbol: 'د.إ', name: 'UAE Dirham', history: Array(30).fill(82.38) },
        JPY: { rate: 2.04, symbol: '¥', name: 'Japanese Yen', history: Array(30).fill(2.04) },
        SGD: { rate: 224.30, symbol: 'S$', name: 'Singapore Dollar', history: Array(30).fill(224.30) },
        KRW: { rate: 0.225, symbol: '₩', name: 'South Korean Won', history: Array(30).fill(0.225) },
      },
    });
  }
}
