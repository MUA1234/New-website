import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const id = searchParams.get('id');
  const difficulty = searchParams.get('difficulty');

  try {
    const filePath = join(process.cwd(), 'data', 'articles.json');
    let data = JSON.parse(readFileSync(filePath, 'utf-8'));

    if (id) {
      const found = data.find((a: { id: string }) => a.id === id);
      return NextResponse.json(found || null);
    }
    if (category) data = data.filter((a: { category: string }) => a.category === category);
    if (difficulty) data = data.filter((a: { difficulty: string }) => a.difficulty === difficulty);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
