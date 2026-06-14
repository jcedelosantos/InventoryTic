'use client';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#0D9488', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#EC4899', '#6366F1'];

const typeLabels: Record<string, string> = {
  computadora: 'Computadora',
  laptop: 'Laptop',
  tablet: 'Tablet',
  telefono: 'Teléfono',
  servidor: 'Servidor',
  impresora: 'Impresora',
  camara: 'Cámara',
  repetidor: 'Repetidor',
  otro: 'Otro',
};

interface Props {
  costDistribution: any[];
  typeDistribution: any[];
}

export default function DashboardCharts({ costDistribution, typeDistribution }: Props) {
  const safeCost = costDistribution ?? [];
  const safeType = (typeDistribution ?? []).map((t: any) => ({ ...(t ?? {}), name: typeLabels?.[t?.name] ?? t?.name ?? 'Otro' }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Distribución de Gastos Anuales</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={safeCost}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {safeCost.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS?.[i % COLORS.length] ?? '#3B82F6'} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `$${Number(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} contentStyle={{ fontSize: 11 }} />
              <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Equipos por Tipo</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeType} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
              <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
              <YAxis tickLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="value" name="Cantidad" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
