export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const items = await prisma.monthlyConsumption.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const data = await request.json();
    const item = await prisma.monthlyConsumption.create({ data });
    return NextResponse.json(item);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || 'Error' }, { status: 500 });
  }
}
