'use client';
import { useEffect, useState, useCallback } from 'react';
import { FolderKanban, Plus, Pencil, Trash2, Download } from 'lucide-react';
import PageHeader from '@/components/page-header';
import Modal from '@/components/modal';
import { formatUSD, formatDate } from '@/lib/utils';
import { useClient } from '@/contexts/client-context';
import { toast } from 'sonner';

const ESTADOS_PROYECTO = [
  { value: 'planificacion', label: 'Planificación', color: 'bg-blue-100 text-blue-800' },
  { value: 'en_progreso', label: 'En Progreso', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'pausado', label: 'Pausado', color: 'bg-orange-100 text-orange-800' },
  { value: 'completado', label: 'Completado', color: 'bg-green-100 text-green-800' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
];

const emptyForm = { nombre: '', descripcion: '', estado: 'en_progreso', responsable: '', presupuesto: 0, avance: 0, fechaInicio: '', fechaFin: '', notas: '' };

export default function ProyectosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);

  const { selectedClientId } = useClient();
  const fetchData = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedClientId) params.set('clientId', selectedClientId);
    fetch(`/api/projects?${params}`).then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, [selectedClientId]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...form,
      presupuesto: parseFloat(form?.presupuesto) || 0,
      avance: parseInt(form?.avance) || 0,
      fechaInicio: form?.fechaInicio ? new Date(form.fechaInicio).toISOString() : null,
      clientId: selectedClientId || undefined,
      fechaFin: form?.fechaFin ? new Date(form.fechaFin).toISOString() : null,
    };
    const url = editId ? `/api/projects/${editId}` : '/api/projects';
    const res = await fetch(url, { method: editId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { toast.error('Error'); return; }
    toast.success(editId ? 'Actualizado' : 'Creado');
    setShowForm(false); setForm({ ...emptyForm }); setEditId(null); fetchData();
  };

  const handleEdit = (item: any) => {
    setForm({
      nombre: item?.nombre ?? '', descripcion: item?.descripcion ?? '', estado: item?.estado ?? 'en_progreso',
      responsable: item?.responsable ?? '', presupuesto: item?.presupuesto ?? 0, avance: item?.avance ?? 0,
      fechaInicio: item?.fechaInicio ? new Date(item.fechaInicio).toISOString().split('T')[0] : '',
      fechaFin: item?.fechaFin ? new Date(item.fechaFin).toISOString().split('T')[0] : '',
      notas: item?.notas ?? '',
    });
    setEditId(item?.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' }); toast.success('Eliminado'); fetchData();
  };

  const totalPresupuesto = (items ?? []).reduce((s: number, i: any) => s + (i?.presupuesto ?? 0), 0);
  const getEstadoInfo = (v: string) => ESTADOS_PROYECTO.find(e => e.value === v) ?? { label: v, color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="space-y-6 max-w-[1200px]">
      <PageHeader title="Proyectos en Curso" description={`${items?.length ?? 0} proyectos — Presupuesto total: ${formatUSD(totalPresupuesto)}`} icon={FolderKanban}
        actions={<div className="flex gap-2">
          <button onClick={async () => { const r = await fetch('/api/export?modulo=proyectos'); if (r.ok) { const b = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'Proyectos.xlsx'; a.click(); }}} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"><Download className="w-4 h-4" /> Excel</button>
          <button onClick={() => { setForm({ ...emptyForm }); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium"><Plus className="w-4 h-4" /> Agregar</button>
        </div>}
      />

      {loading ? <div className="h-64 bg-white rounded-xl animate-pulse" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(items ?? []).map((p: any) => {
            const estadoInfo = getEstadoInfo(p?.estado ?? '');
            return (
              <div key={p?.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{p?.nombre}</h3>
                    {p?.descripcion && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.descripcion}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4 text-blue-600" /></button>
                    <button onClick={() => handleDelete(p?.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoInfo?.color}`}>{estadoInfo?.label}</span>
                  {p?.responsable && <span className="text-xs text-gray-500">• {p.responsable}</span>}
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Avance</span>
                    <span className="font-semibold text-gray-700">{p?.avance ?? 0}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${(p?.avance ?? 0) >= 80 ? 'bg-emerald-500' : (p?.avance ?? 0) >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min(100, p?.avance ?? 0)}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                  <span>Presupuesto: <span className="font-semibold text-gray-700">{formatUSD(p?.presupuesto)}</span></span>
                  {p?.fechaFin && <span>Fin: {formatDate(p.fechaFin)}</span>}
                </div>
              </div>
            );
          })}
          {(items?.length ?? 0) === 0 && <div className="col-span-2 text-center py-12 text-gray-400">No hay proyectos registrados</div>}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? 'Editar Proyecto' : 'Nuevo Proyecto'} maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-gray-700">Nombre *</label><input required value={form?.nombre ?? ''} onChange={(e) => setForm({ ...(form ?? {}), nombre: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Responsable</label><input value={form?.responsable ?? ''} onChange={(e) => setForm({ ...(form ?? {}), responsable: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Estado</label><select value={form?.estado ?? 'en_progreso'} onChange={(e) => setForm({ ...(form ?? {}), estado: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">{ESTADOS_PROYECTO.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
          <div><label className="text-sm font-medium text-gray-700">Presupuesto (USD)</label><input type="number" step="0.01" value={form?.presupuesto ?? 0} onChange={(e) => setForm({ ...(form ?? {}), presupuesto: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Avance (%)</label><input type="number" min="0" max="100" value={form?.avance ?? 0} onChange={(e) => setForm({ ...(form ?? {}), avance: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Fecha Inicio</label><input type="date" value={form?.fechaInicio ?? ''} onChange={(e) => setForm({ ...(form ?? {}), fechaInicio: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Fecha Fin</label><input type="date" value={form?.fechaFin ?? ''} onChange={(e) => setForm({ ...(form ?? {}), fechaFin: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium text-gray-700">Descripción</label><textarea value={form?.descripcion ?? ''} onChange={(e) => setForm({ ...(form ?? {}), descripcion: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium text-gray-700">Notas</label><textarea value={form?.notas ?? ''} onChange={(e) => setForm({ ...(form ?? {}), notas: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium">{editId ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
