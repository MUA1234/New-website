import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');

  try {
    const filePath = join(process.cwd(), 'data', 'district-costs.json');
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    if (district) {
      const found = data.find((d: { id: string }) => d.id === district);
      return NextResponse.json(found || data[0]);
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
