export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const { modulo } = await request.json();
    const [equipment, licenses, consumptions, supports, projects] = await Promise.all([
      prisma.equipment.findMany(),
      prisma.license.findMany(),
      prisma.monthlyConsumption.findMany(),
      prisma.thirdPartySupport.findMany(),
      prisma.project.findMany(),
    ]);

    const totalEquip = (equipment ?? []).reduce((s: number, e: any) => s + (e?.costoUsd ?? 0), 0);
    const totalLic = (licenses ?? []).reduce((s: number, l: any) => s + (l?.costoAnual ?? 0), 0);
    const totalCons = (consumptions ?? []).reduce((s: number, c: any) => s + (c?.costoMensual ?? 0), 0) * 12;
    const totalSup = (supports ?? []).reduce((s: number, s2: any) => s + (s2?.costoAnual ?? 0), 0);
    const totalProj = (projects ?? []).reduce((s: number, p: any) => s + (p?.presupuesto ?? 0), 0);
    const grandTotal = totalEquip + totalLic + totalCons + totalSup + totalProj;

    const fmtUSD = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

    let html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><style>
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; font-size: 12px; }
      h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; font-size: 22px; }
      h2 { color: #1e40af; font-size: 16px; margin-top: 30px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }
      table { width: 100%; border-collapse: collapse; margin: 10px 0 20px; }
      th { background: #1e40af; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }
      td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
      tr:nth-child(even) { background: #f8fafc; }
      .summary-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 15px; margin: 15px 0; }
      .summary-row { display: flex; justify-content: space-between; padding: 4px 0; }
      .total { font-weight: bold; font-size: 14px; color: #1e40af; border-top: 2px solid #1e40af; padding-top: 8px; margin-top: 8px; }
      .header-info { color: #64748b; margin-bottom: 20px; }
    </style></head><body>`;

    html += `<h1>Reporte de Inventario Tecnológico</h1>`;
    html += `<div class="header-info"><strong>Cliente:</strong> Reverse | <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-DO', { year: 'numeric', month: 'long', day: 'numeric' })} | <strong>Moneda:</strong> USD</div>`;

    html += `<div class="summary-box">`;
    html += `<h2 style="margin-top:0;border:none;">Resumen de Gastos Anuales</h2>`;
    html += `<div class="summary-row"><span>Equipos Tecnológicos (${equipment?.length ?? 0})</span><span>${fmtUSD(totalEquip)}</span></div>`;
    html += `<div class="summary-row"><span>Licencias Anuales (${licenses?.length ?? 0})</span><span>${fmtUSD(totalLic)}</span></div>`;
    html += `<div class="summary-row"><span>Consumos Mensuales ×12 (${consumptions?.length ?? 0})</span><span>${fmtUSD(totalCons)}</span></div>`;
    html += `<div class="summary-row"><span>Soportes Tercerizados (${supports?.length ?? 0})</span><span>${fmtUSD(totalSup)}</span></div>`;
    html += `<div class="summary-row"><span>Proyectos en Curso (${projects?.length ?? 0})</span><span>${fmtUSD(totalProj)}</span></div>`;
    html += `<div class="summary-row total"><span>TOTAL ANUAL</span><span>${fmtUSD(grandTotal)}</span></div>`;
    html += `</div>`;

    if (!modulo || modulo === 'todos' || modulo === 'equipos') {
      html += `<h2>Equipos Tecnológicos</h2><table><tr><th>Nombre</th><th>Serial / SN</th><th>IP</th><th>MAC</th><th>Fabricante</th><th>Tipo</th><th>Estado</th><th>Costo</th></tr>`;
      (equipment ?? []).forEach((e: any) => {
        html += `<tr><td>${e?.nombre ?? ''}</td><td>${e?.numeroSerie ?? '-'}</td><td>${e?.direccionIp ?? ''}</td><td>${e?.direccionMac ?? ''}</td><td>${e?.fabricante ?? ''}</td><td>${e?.tipoEquipo ?? ''}</td><td>${e?.estado ?? ''}</td><td>${fmtUSD(e?.costoUsd ?? 0)}</td></tr>`;
      });
      html += `</table>`;
    }

    if (!modulo || modulo === 'todos' || modulo === 'licencias') {
      html += `<h2>Licencias Anuales</h2><table><tr><th>Nombre</th><th>Proveedor</th><th>Vencimiento</th><th>Costo Anual</th><th>Estado</th></tr>`;
      (licenses ?? []).forEach((l: any) => {
        html += `<tr><td>${l?.nombre ?? ''}</td><td>${l?.proveedor ?? ''}</td><td>${fmtDate(l?.fechaVencimiento)}</td><td>${fmtUSD(l?.costoAnual ?? 0)}</td><td>${l?.estado ?? ''}</td></tr>`;
      });
      html += `</table>`;
    }

    if (!modulo || modulo === 'todos' || modulo === 'consumos') {
      html += `<h2>Consumos Mensuales</h2><table><tr><th>Nombre</th><th>Mensual</th><th>Anual</th><th>Responsable</th></tr>`;
      (consumptions ?? []).forEach((c: any) => {
        html += `<tr><td>${c?.nombre ?? ''}</td><td>${fmtUSD(c?.costoMensual ?? 0)}</td><td>${fmtUSD((c?.costoMensual ?? 0) * 12)}</td><td>${c?.responsable ?? ''}</td></tr>`;
      });
      html += `</table>`;
    }

    if (!modulo || modulo === 'todos' || modulo === 'soportes') {
      html += `<h2>Soportes Tercerizados</h2><table><tr><th>Nombre</th><th>Contacto</th><th>Servicios</th><th>Costo Anual</th></tr>`;
      (supports ?? []).forEach((s: any) => {
        html += `<tr><td>${s?.nombre ?? ''}</td><td>${s?.contacto ?? ''}</td><td>${s?.servicios ?? ''}</td><td>${fmtUSD(s?.costoAnual ?? 0)}</td></tr>`;
      });
      html += `</table>`;
    }

    if (!modulo || modulo === 'todos' || modulo === 'proyectos') {
      html += `<h2>Proyectos en Curso</h2><table><tr><th>Nombre</th><th>Estado</th><th>Avance</th><th>Presupuesto</th><th>Responsable</th></tr>`;
      (projects ?? []).forEach((p: any) => {
        html += `<tr><td>${p?.nombre ?? ''}</td><td>${p?.estado ?? ''}</td><td>${p?.avance ?? 0}%</td><td>${fmtUSD(p?.presupuesto ?? 0)}</td><td>${p?.responsable ?? ''}</td></tr>`;
      });
      html += `</table>`;
    }

    html += `</body></html>`;

    // Generate PDF
    const createRes = await fetch('https://apps.abacus.ai/api/createConvertHtmlToPdfRequest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        html_content: html,
        pdf_options: { format: 'A4', landscape: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }, print_background: true },
        base_url: process.env.NEXTAUTH_URL || '',
      }),
    });

    if (!createRes.ok) return NextResponse.json({ error: 'Error generando PDF' }, { status: 500 });
    const { request_id } = await createRes.json();
    if (!request_id) return NextResponse.json({ error: 'No request_id' }, { status: 500 });

    let attempts = 0;
    while (attempts < 120) {
      await new Promise(r => setTimeout(r, 1000));
      const statusRes = await fetch('https://apps.abacus.ai/api/getConvertHtmlToPdfStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id, deployment_token: process.env.ABACUSAI_API_KEY }),
      });
      const statusResult = await statusRes.json();
      if (statusResult?.status === 'SUCCESS' && statusResult?.result?.result) {
        const pdfBuffer = Buffer.from(statusResult.result.result, 'base64');
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Reporte_TIC_Reverse_${new Date().toISOString().split('T')[0]}.pdf"`,
          },
        });
      }
      if (statusResult?.status === 'FAILED') return NextResponse.json({ error: 'Fallo al generar PDF' }, { status: 500 });
      attempts++;
    }
    return NextResponse.json({ error: 'Tiempo agotado' }, { status: 500 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error al generar PDF' }, { status: 500 });
  }
}
