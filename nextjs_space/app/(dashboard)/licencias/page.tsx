'use client';
import { useEffect, useState, useCallback } from 'react';
import { KeyRound, Plus, Pencil, Trash2, Download, FileText } from 'lucide-react';
import PageHeader from '@/components/page-header';
import DataTable from '@/components/data-table';
import Modal from '@/components/modal';
import { formatUSD, formatDate, getDaysUntilExpiry, getExpiryStatus } from '@/lib/utils';
import { toast } from 'sonner';

const emptyForm = {
  nombre: '', categoria: '', proveedor: '', fechaInicio: '', fechaVencimiento: '',
  costoAnual: 0, responsable: '', estado: 'activa', notas: '',
};

export default function LicenciasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    fetch('/api/licenses').then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        ...form,
        costoAnual: parseFloat(form?.costoAnual) || 0,
        fechaInicio: form?.fechaInicio ? new Date(form.fechaInicio).toISOString() : null,
        fechaVencimiento: form?.fechaVencimiento ? new Date(form.fechaVencimiento).toISOString() : null,
      };
      const url = editId ? `/api/licenses/${editId}` : '/api/licenses';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); toast.error(err?.error || 'Error'); return; }
      toast.success(editId ? 'Licencia actualizada' : 'Licencia creada');
      setShowForm(false); setForm({ ...emptyForm }); setEditId(null); fetchData();
    } catch (err: any) { toast.error('Error'); console.error(err); }
  };

  const handleEdit = (item: any) => {
    setForm({
      nombre: item?.nombre ?? '', categoria: item?.categoria ?? '', proveedor: item?.proveedor ?? '',
      fechaInicio: item?.fechaInicio ? new Date(item.fechaInicio).toISOString().split('T')[0] : '',
      fechaVencimiento: item?.fechaVencimiento ? new Date(item.fechaVencimiento).toISOString().split('T')[0] : '',
      costoAnual: item?.costoAnual ?? 0, responsable: item?.responsable ?? '',
      estado: item?.estado ?? 'activa', notas: item?.notas ?? '',
    });
    setEditId(item?.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta licencia?')) return;
    await fetch(`/api/licenses/${id}`, { method: 'DELETE' });
    toast.success('Licencia eliminada'); fetchData();
  };

  const handleExport = async (format: string) => {
    const url = format === 'excel' ? '/api/export?modulo=licencias' : '/api/export-pdf';
    const opts = format === 'excel' ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modulo: 'licencias' }) };
    const res = await fetch(url, opts);
    if (res.ok) { const blob = await res.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `Licencias.${format === 'excel' ? 'xlsx' : 'pdf'}`; a.click(); }
  };

  const totalAnual = (items ?? []).reduce((s: number, i: any) => s + (i?.costoAnual ?? 0), 0);

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'proveedor', label: 'Proveedor', render: (v: any) => v ?? '-' },
    { key: 'fechaVencimiento', label: 'Vencimiento', render: (v: any, row: any) => {
      const days = getDaysUntilExpiry(v);
      const status = getExpiryStatus(days);
      return (<div className="flex items-center gap-2">
        <span className="text-sm">{formatDate(v)}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${status?.color}`}>{status?.label}</span>
      </div>);
    }},
    { key: 'costoAnual', label: 'Costo Anual', render: (v: any) => <span className="font-semibold">{formatUSD(v)}</span> },
    { key: 'responsable', label: 'Responsable', render: (v: any) => v ?? '-' },
  ];

  return (
    <div className="space-y-6 max-w-[1200px]">
      <PageHeader title="Licencias Anuales" description={`Gestión de ${items?.length ?? 0} licencias — Total: ${formatUSD(totalAnual)}/año`} icon={KeyRound}
        actions={<div className="flex gap-2">
          <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"><Download className="w-4 h-4" /> Excel</button>
          <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"><FileText className="w-4 h-4" /> PDF</button>
          <button onClick={() => { setForm({ ...emptyForm }); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors"><Plus className="w-4 h-4" /> Agregar</button>
        </div>}
      />

      {loading ? <div className="h-64 bg-white rounded-xl animate-pulse" /> : (
        <DataTable columns={columns} data={items} searchPlaceholder="Buscar licencias..."
          actions={(row: any) => (<div className="flex items-center gap-1 justify-end">
            <button onClick={() => handleEdit(row)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4 text-blue-600" /></button>
            <button onClick={() => handleDelete(row?.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
          </div>)}
        />
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? 'Editar Licencia' : 'Nueva Licencia'}>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-gray-700">Nombre *</label><input required value={form?.nombre ?? ''} onChange={(e) => setForm({ ...(form ?? {}), nombre: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Proveedor</label><input value={form?.proveedor ?? ''} onChange={(e) => setForm({ ...(form ?? {}), proveedor: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Fecha Inicio</label><input type="date" value={form?.fechaInicio ?? ''} onChange={(e) => setForm({ ...(form ?? {}), fechaInicio: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Fecha Vencimiento</label><input type="date" value={form?.fechaVencimiento ?? ''} onChange={(e) => setForm({ ...(form ?? {}), fechaVencimiento: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Costo Anual (USD)</label><input type="number" step="0.01" value={form?.costoAnual ?? 0} onChange={(e) => setForm({ ...(form ?? {}), costoAnual: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Responsable</label><input value={form?.responsable ?? ''} onChange={(e) => setForm({ ...(form ?? {}), responsable: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Estado</label><select value={form?.estado ?? 'activa'} onChange={(e) => setForm({ ...(form ?? {}), estado: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"><option value="activa">Activa</option><option value="por_vencer">Por Vencer</option><option value="vencida">Vencida</option><option value="cancelada">Cancelada</option></select></div>
          <div><label className="text-sm font-medium text-gray-700">Categoría</label><input value={form?.categoria ?? ''} onChange={(e) => setForm({ ...(form ?? {}), categoria: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
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
