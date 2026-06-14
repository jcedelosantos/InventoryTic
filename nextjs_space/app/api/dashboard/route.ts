export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const [equipmentCount, equipment, licenses, consumptions, supports, projects] = await Promise.all([
      prisma.equipment.count(),
      prisma.equipment.findMany({ select: { costoUsd: true, tipoEquipo: true, estado: true } }),
      prisma.license.findMany(),
      prisma.monthlyConsumption.findMany(),
      prisma.thirdPartySupport.findMany(),
      prisma.project.findMany(),
    ]);

    const totalEquipment = equipment?.reduce((s: number, e: any) => s + (e?.costoUsd ?? 0), 0) ?? 0;
    const totalLicenses = licenses?.reduce((s: number, l: any) => s + (l?.costoAnual ?? 0), 0) ?? 0;
    const totalMonthly = consumptions?.reduce((s: number, c: any) => s + (c?.costoMensual ?? 0), 0) ?? 0;
    const totalSupports = supports?.reduce((s: number, sp: any) => s + (sp?.costoAnual ?? 0), 0) ?? 0;
    const totalProjects = projects?.reduce((s: number, p: any) => s + (p?.presupuesto ?? 0), 0) ?? 0;

    const now = new Date();
    const expiringSoon = (licenses ?? []).filter((l: any) => {
      if (!l?.fechaVencimiento) return false;
      const diff = new Date(l.fechaVencimiento).getTime() - now.getTime();
      return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000;
    });
    const expired = (licenses ?? []).filter((l: any) => {
      if (!l?.fechaVencimiento) return false;
      return new Date(l.fechaVencimiento).getTime() < now.getTime();
    });

    // Distribution by equipment type
    const typeDistribution: Record<string, number> = {};
    (equipment ?? []).forEach((e: any) => {
      const t = e?.tipoEquipo ?? 'otro';
      typeDistribution[t] = (typeDistribution[t] ?? 0) + 1;
    });

    // Cost distribution for pie chart
    const costDistribution = [
      { name: 'Equipos', value: totalEquipment },
      { name: 'Licencias', value: totalLicenses },
      { name: 'Consumos (anual)', value: totalMonthly * 12 },
      { name: 'Soportes', value: totalSupports },
      { name: 'Proyectos', value: totalProjects },
    ];

    return NextResponse.json({
      counts: {
        equipment: equipmentCount,
        licenses: licenses?.length ?? 0,
        consumptions: consumptions?.length ?? 0,
        supports: supports?.length ?? 0,
        projects: projects?.length ?? 0,
      },
      totals: {
        equipment: totalEquipment,
        licenses: totalLicenses,
        monthlyConsumptions: totalMonthly,
        annualConsumptions: totalMonthly * 12,
        supports: totalSupports,
        projects: totalProjects,
        grandTotal: totalEquipment + totalLicenses + (totalMonthly * 12) + totalSupports + totalProjects,
      },
      alerts: {
        expiringSoon: expiringSoon?.map((l: any) => ({ id: l?.id, nombre: l?.nombre, fechaVencimiento: l?.fechaVencimiento })) ?? [],
        expired: expired?.map((l: any) => ({ id: l?.id, nombre: l?.nombre, fechaVencimiento: l?.fechaVencimiento })) ?? [],
      },
      typeDistribution: Object.entries(typeDistribution ?? {}).map(([name, value]: [string, any]) => ({ name, value })),
      costDistribution,
      projects: projects?.map((p: any) => ({ id: p?.id, nombre: p?.nombre, avance: p?.avance ?? 0, estado: p?.estado })) ?? [],
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error en dashboard' }, { status: 500 });
  }
}
