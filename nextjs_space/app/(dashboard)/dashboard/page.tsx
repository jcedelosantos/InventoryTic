'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, Monitor, KeyRound, CreditCard, Headphones, FolderKanban, AlertTriangle, TrendingUp, Download, FileText } from 'lucide-react';
import PageHeader from '@/components/page-header';
import StatCard from '@/components/stat-card';
import { formatUSD, formatDate, getDaysUntilExpiry, getExpiryStatus } from '@/lib/utils';
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(
  () => import('@/components/dashboard-charts').catch(() => {
    return { default: () => <div className="h-64 bg-white rounded-xl flex items-center justify-center text-gray-400">Error cargando gráficos. Recargue la página.</div> };
  }),
  { ssr: false, loading: () => <div className="h-64 bg-white rounded-xl animate-pulse" /> }
);

export default function DashboardPage() {
  const { data: session } = useSession() || {};
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modulo: 'todos' }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_TIC_Reverse.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) { console.error(err); }
    setExporting(false);
  };

  const handleExportExcel = async () => {
    try {
      const res = await fetch('/api/export?modulo=equipos');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Equipos.xlsx';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-white rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-white rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const counts = data?.counts ?? {};
  const totals = data?.totals ?? {};

  return (
    <div className="space-y-6 max-w-[1200px]">
      <PageHeader
        title="Dashboard"
        description={`Resumen ejecutivo del inventario tecnológico — Bienvenido, ${session?.user?.name ?? 'Administrador'}`}
        icon={LayoutDashboard}
        actions={
          <div className="flex gap-2">
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Excel
            </button>
            <button onClick={handleExportPDF} disabled={exporting} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <FileText className="w-4 h-4" /> {exporting ? 'Generando...' : 'PDF'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Equipos" value={String(counts?.equipment ?? 0)} subtitle={formatUSD(totals?.equipment)} icon={Monitor} color="bg-blue-600" />
        <StatCard title="Licencias" value={String(counts?.licenses ?? 0)} subtitle={formatUSD(totals?.licenses)} icon={KeyRound} color="bg-teal-600" />
        <StatCard title="Consumos/mes" value={String(counts?.consumptions ?? 0)} subtitle={formatUSD(totals?.monthlyConsumptions)} icon={CreditCard} color="bg-purple-600" />
        <StatCard title="Soportes" value={String(counts?.supports ?? 0)} subtitle={formatUSD(totals?.supports)} icon={Headphones} color="bg-orange-500" />
        <StatCard title="Proyectos" value={String(counts?.projects ?? 0)} subtitle={formatUSD(totals?.projects)} icon={FolderKanban} color="bg-indigo-600" />
        <StatCard title="Total Anual" value={formatUSD(totals?.grandTotal)} subtitle="Gasto tecnológico" icon={TrendingUp} color="bg-emerald-600" />
      </div>

      <DashboardCharts costDistribution={data?.costDistribution ?? []} typeDistribution={data?.typeDistribution ?? []} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Licencias por Vencer
          </h3>
          {(data?.alerts?.expiringSoon?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400">No hay licencias próximas a vencer</p>
          ) : (
            <div className="space-y-2">
              {(data?.alerts?.expiringSoon ?? []).map((l: any) => {
                const days = getDaysUntilExpiry(l?.fechaVencimiento);
                const status = getExpiryStatus(days);
                return (
                  <div key={l?.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                    <span className="text-sm font-medium text-gray-800">{l?.nombre}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{formatDate(l?.fechaVencimiento)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status?.color}`}>{days} días</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Licencias Vencidas
          </h3>
          {(data?.alerts?.expired?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400">No hay licencias vencidas</p>
          ) : (
            <div className="space-y-2">
              {(data?.alerts?.expired ?? []).map((l: any) => (
                <div key={l?.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                  <span className="text-sm font-medium text-gray-800">{l?.nombre}</span>
                  <span className="text-xs text-red-600 font-medium">{formatDate(l?.fechaVencimiento)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(data?.projects?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Proyectos en Curso</h3>
          <div className="space-y-3">
            {(data?.projects ?? []).map((p: any) => (
              <div key={p?.id} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 w-48 truncate">{p?.nombre}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      (p?.avance ?? 0) >= 80 ? 'bg-emerald-500' : (p?.avance ?? 0) >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(100, p?.avance ?? 0)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-12 text-right">{p?.avance ?? 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
