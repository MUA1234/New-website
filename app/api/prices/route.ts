import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const filePath = join(process.cwd(), 'data', 'prices.json');
    let data = JSON.parse(readFileSync(filePath, 'utf-8'));

    if (category) data = data.filter((item: { category: string }) => item.category === category);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((item: { name: string; name_si: string }) =>
        item.name.toLowerCase().includes(q) || item.name_si.includes(q)
      );
    }

    const total = data.length;
    const paginated = data.slice((page - 1) * limit, page * limit);

    return NextResponse.json({ items: paginated, total, page, limit });
  } catch {
    return NextResponse.json({ items: [], total: 0, page: 1, limit });
  }
}
