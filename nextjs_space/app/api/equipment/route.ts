export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tipo = searchParams.get('tipo') || '';
    const estado = searchParams.get('estado') || '';
    const where: any = {};
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { direccionIp: { contains: search } },
        { fabricante: { contains: search, mode: 'insensitive' } },
        { direccionMac: { contains: search, mode: 'insensitive' } },
        { responsable: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (tipo) where.tipoEquipo = tipo;
    if (estado) where.estado = estado;
    const items = await prisma.equipment.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error al obtener equipos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const data = await request.json();
    const item = await prisma.equipment.create({ data });
    return NextResponse.json(item);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || 'Error al crear equipo' }, { status: 500 });
  }
}
