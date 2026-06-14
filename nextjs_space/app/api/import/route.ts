export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string | null;
    if (!file) return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook?.SheetNames?.[0];
    if (!sheetName) return NextResponse.json({ error: 'Archivo vacío' }, { status: 400 });
    const sheet = workbook?.Sheets?.[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet ?? {}) ?? [];

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const nombre = row?.['Nombre'] ?? row?.['nombre'] ?? row?.['NOMBRE'] ?? '';
        const ip = row?.['Dirección IP'] ?? row?.['direccion_ip'] ?? row?.['IP'] ?? row?.['ip'] ?? null;
        const fabricante = row?.['Fabricante'] ?? row?.['fabricante'] ?? null;
        const mac = row?.['Dirección MAC'] ?? row?.['direccion_mac'] ?? row?.['MAC'] ?? row?.['mac'] ?? null;
        const comentarios = row?.['Comentarios'] ?? row?.['comentarios'] ?? null;
        const serial = row?.['Serial'] ?? row?.['serial'] ?? row?.['SN'] ?? row?.['sn'] ?? row?.['Serial / SN'] ?? row?.['Número de Serie'] ?? row?.['numero_serie'] ?? null;

        if (!nombre && !ip) { skipped++; continue; }

        // Check for duplicates by IP or MAC
        if (ip) {
          const existingIp = await prisma.equipment.findUnique({ where: { direccionIp: ip } });
          if (existingIp) { skipped++; continue; }
        }
        if (mac) {
          const existingMac = await prisma.equipment.findUnique({ where: { direccionMac: mac } });
          if (existingMac) { skipped++; continue; }
        }

        await prisma.equipment.create({
          data: {
            nombre: String(nombre || ip || 'Sin nombre'),
            direccionIp: ip ? String(ip) : null,
            fabricante: fabricante ? String(fabricante) : null,
            direccionMac: mac ? String(mac) : null,
            comentarios: comentarios ? String(comentarios) : null,
            numeroSerie: serial ? String(serial) : null,
            tipoEquipo: inferDeviceType(fabricante),
            estado: 'activo',
            clientId: clientId || undefined,
          },
        });
        imported++;
      } catch (err: any) {
        errors.push(err?.message ?? 'Error desconocido');
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: rows?.length ?? 0,
      errors: errors?.slice(0, 5) ?? [],
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error al importar archivo' }, { status: 500 });
  }
}

function inferDeviceType(fabricante: string | null | undefined): string {
  if (!fabricante) return 'otro';
  const f = fabricante.toLowerCase();
  if (f.includes('apple') || f.includes('samsung') || f.includes('huawei') || f.includes('lg') || f.includes('sony') || f.includes('htc') || f.includes('murata') || f.includes('tct')) return 'telefono';
  if (f.includes('hewlett') || f.includes('dell') || f.includes('microsoft') || f.includes('pegatron')) return 'computadora';
  if (f.includes('hikvision')) return 'camara';
  if (f.includes('ubiquiti') || f.includes('d-link')) return 'repetidor';
  if (f.includes('verifone') || f.includes('ingenico')) return 'otro';
  if (f.includes('epson') || f.includes('hp') || f.includes('canon')) return 'impresora';
  return 'otro';
}
