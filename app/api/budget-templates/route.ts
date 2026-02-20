import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');

  try {
    const filePath = join(process.cwd(), 'data', 'budget-templates.json');
    let data = JSON.parse(readFileSync(filePath, 'utf-8'));

    if (district) {
      data = data.filter((t: { district: string }) => t.district === district || t.district === 'all');
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
