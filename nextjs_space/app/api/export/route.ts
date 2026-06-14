export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const modulo = searchParams.get('modulo') || 'equipos';

    let data: any[] = [];
    let sheetName = 'Datos';

    switch (modulo) {
      case 'equipos': {
        const items = await prisma.equipment.findMany({ orderBy: { createdAt: 'desc' } });
        sheetName = 'Equipos';
        data = (items ?? []).map((i: any) => ({
          'Nombre': i?.nombre ?? '',
          'Dirección IP': i?.direccionIp ?? '',
          'Fabricante': i?.fabricante ?? '',
          'Dirección MAC': i?.direccionMac ?? '',
          'Tipo': i?.tipoEquipo ?? '',
          'Estado': i?.estado ?? '',
          'Responsable': i?.responsable ?? '',
          'Costo USD': i?.costoUsd ?? 0,
          'Número de Serie': i?.numeroSerie ?? '',
          'Comentarios': i?.comentarios ?? '',
        }));
        break;
      }
      case 'licencias': {
        const items = await prisma.license.findMany({ orderBy: { fechaVencimiento: 'asc' } });
        sheetName = 'Licencias';
        data = (items ?? []).map((i: any) => ({
          'Nombre': i?.nombre ?? '',
          'Proveedor': i?.proveedor ?? '',
          'Fecha Inicio': i?.fechaInicio ? new Date(i.fechaInicio).toLocaleDateString('es-DO') : '',
          'Fecha Vencimiento': i?.fechaVencimiento ? new Date(i.fechaVencimiento).toLocaleDateString('es-DO') : '',
          'Costo Anual USD': i?.costoAnual ?? 0,
          'Responsable': i?.responsable ?? '',
          'Estado': i?.estado ?? '',
          'Notas': i?.notas ?? '',
        }));
        break;
      }
      case 'consumos': {
        const items = await prisma.monthlyConsumption.findMany();
        sheetName = 'Consumos Mensuales';
        data = (items ?? []).map((i: any) => ({
          'Nombre': i?.nombre ?? '',
          'Costo Mensual USD': i?.costoMensual ?? 0,
          'Costo Anual USD': (i?.costoMensual ?? 0) * 12,
          'Responsable': i?.responsable ?? '',
          'Proveedor': i?.proveedor ?? '',
          'Estado': i?.estado ?? '',
        }));
        break;
      }
      case 'soportes': {
        const items = await prisma.thirdPartySupport.findMany();
        sheetName = 'Soportes';
        data = (items ?? []).map((i: any) => ({
          'Nombre': i?.nombre ?? '',
          'Contacto': i?.contacto ?? '',
          'Teléfono': i?.telefono ?? '',
          'Email': i?.email ?? '',
          'Servicios': i?.servicios ?? '',
          'Costo Mensual USD': i?.costoMensual ?? 0,
          'Costo Anual USD': i?.costoAnual ?? 0,
          'Estado': i?.estado ?? '',
        }));
        break;
      }
      case 'proyectos': {
        const items = await prisma.project.findMany();
        sheetName = 'Proyectos';
        data = (items ?? []).map((i: any) => ({
          'Nombre': i?.nombre ?? '',
          'Descripción': i?.descripcion ?? '',
          'Estado': i?.estado ?? '',
          'Responsable': i?.responsable ?? '',
          'Presupuesto USD': i?.presupuesto ?? 0,
          'Avance %': i?.avance ?? 0,
        }));
        break;
      }
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error al exportar' }, { status: 500 });
  }
}
