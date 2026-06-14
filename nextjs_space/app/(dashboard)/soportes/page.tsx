'use client';
import { useEffect, useState, useCallback } from 'react';
import { Headphones, Plus, Pencil, Trash2, Download } from 'lucide-react';
import PageHeader from '@/components/page-header';
import DataTable from '@/components/data-table';
import Modal from '@/components/modal';
import { formatUSD } from '@/lib/utils';
import { toast } from 'sonner';

const emptyForm = { nombre: '', contacto: '', telefono: '', email: '', servicios: '', costoMensual: 0, costoAnual: 0, contrato: '', estado: 'activo' };

export default function SoportesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    fetch('/api/supports').then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, costoMensual: parseFloat(form?.costoMensual) || 0, costoAnual: parseFloat(form?.costoAnual) || 0 };
    const url = editId ? `/api/supports/${editId}` : '/api/supports';
    const res = await fetch(url, { method: editId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { toast.error('Error'); return; }
    toast.success(editId ? 'Actualizado' : 'Creado');
    setShowForm(false); setForm({ ...emptyForm }); setEditId(null); fetchData();
  };

  const handleEdit = (item: any) => {
    setForm({ nombre: item?.nombre ?? '', contacto: item?.contacto ?? '', telefono: item?.telefono ?? '', email: item?.email ?? '', servicios: item?.servicios ?? '', costoMensual: item?.costoMensual ?? 0, costoAnual: item?.costoAnual ?? 0, contrato: item?.contrato ?? '', estado: item?.estado ?? 'activo' });
    setEditId(item?.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar?')) return;
    await fetch(`/api/supports/${id}`, { method: 'DELETE' }); toast.success('Eliminado'); fetchData();
  };

  const totalAnual = (items ?? []).reduce((s: number, i: any) => s + (i?.costoAnual ?? 0), 0);

  const columns = [
    { key: 'nombre', label: 'Proveedor' },
    { key: 'contacto', label: 'Contacto', render: (v: any) => v ?? '-' },
    { key: 'servicios', label: 'Servicios', render: (v: any) => <span className="truncate max-w-[200px] block">{v ?? '-'}</span> },
    { key: 'costoMensual', label: 'Mensual', render: (v: any) => formatUSD(v) },
    { key: 'costoAnual', label: 'Anual', render: (v: any) => <span className="font-semibold">{formatUSD(v)}</span> },
    { key: 'estado', label: 'Estado', render: (v: any) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{v === 'activo' ? 'Activo' : 'Inactivo'}</span> },
  ];

  return (
    <div className="space-y-6 max-w-[1200px]">
      <PageHeader title="Soportes Tercerizados" description={`${items?.length ?? 0} proveedores — Total anual: ${formatUSD(totalAnual)}`} icon={Headphones}
        actions={<div className="flex gap-2">
          <button onClick={async () => { const r = await fetch('/api/export?modulo=soportes'); if (r.ok) { const b = await r.blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'Soportes.xlsx'; a.click(); }}} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"><Download className="w-4 h-4" /> Excel</button>
          <button onClick={() => { setForm({ ...emptyForm }); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium"><Plus className="w-4 h-4" /> Agregar</button>
        </div>}
      />

      {loading ? <div className="h-64 bg-white rounded-xl animate-pulse" /> : (
        <DataTable columns={columns} data={items} searchPlaceholder="Buscar soportes..."
          actions={(row: any) => (<div className="flex items-center gap-1 justify-end">
            <button onClick={() => handleEdit(row)} className="p-1.5 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4 text-blue-600" /></button>
            <button onClick={() => handleDelete(row?.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
          </div>)}
        />
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? 'Editar Soporte' : 'Nuevo Soporte'} maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-gray-700">Nombre *</label><input required value={form?.nombre ?? ''} onChange={(e) => setForm({ ...(form ?? {}), nombre: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Contacto</label><input value={form?.contacto ?? ''} onChange={(e) => setForm({ ...(form ?? {}), contacto: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Teléfono</label><input value={form?.telefono ?? ''} onChange={(e) => setForm({ ...(form ?? {}), telefono: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Email</label><input type="email" value={form?.email ?? ''} onChange={(e) => setForm({ ...(form ?? {}), email: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Costo Mensual (USD)</label><input type="number" step="0.01" value={form?.costoMensual ?? 0} onChange={(e) => setForm({ ...(form ?? {}), costoMensual: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Costo Anual (USD)</label><input type="number" step="0.01" value={form?.costoAnual ?? 0} onChange={(e) => setForm({ ...(form ?? {}), costoAnual: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium text-gray-700">Servicios</label><textarea value={form?.servicios ?? ''} onChange={(e) => setForm({ ...(form ?? {}), servicios: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium text-gray-700">Contrato / Notas</label><textarea value={form?.contrato ?? ''} onChange={(e) => setForm({ ...(form ?? {}), contrato: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium">{editId ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
