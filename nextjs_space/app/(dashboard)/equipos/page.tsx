'use client';
import { useEffect, useState, useCallback } from 'react';
import { Monitor, Plus, Pencil, Trash2, Upload, Download, FileText } from 'lucide-react';
import PageHeader from '@/components/page-header';
import DataTable from '@/components/data-table';
import Modal from '@/components/modal';
import { formatUSD, formatDate } from '@/lib/utils';
import { useClient } from '@/contexts/client-context';
import { toast } from 'sonner';

const TIPOS = [
  { value: 'computadora', label: 'Computadora' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'servidor', label: 'Servidor' },
  { value: 'impresora', label: 'Impresora' },
  { value: 'camara', label: 'Cámara' },
  { value: 'repetidor', label: 'Repetidor' },
  { value: 'otro', label: 'Otro' },
];

const ESTADOS = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'mantenimiento', label: 'En Mantenimiento' },
  { value: 'baja', label: 'Dado de Baja' },
];

const emptyForm = {
  nombre: '', direccionIp: '', fabricante: '', direccionMac: '', comentarios: '',
  tipoEquipo: 'otro', numeroSerie: '', fechaCompra: '', garantia: '', estado: 'activo',
  responsable: '', costoUsd: 0,
};

export default function EquiposPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { selectedClientId, selectedClient } = useClient();
  const [filterTipo, setFilterTipo] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  const fetchData = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filterTipo) params.set('tipo', filterTipo);
    if (filterEstado) params.set('estado', filterEstado);
    if (selectedClientId) params.set('clientId', selectedClientId);
    fetch(`/api/equipment?${params}`)
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search, filterTipo, filterEstado, selectedClientId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        ...form,
        costoUsd: parseFloat(form?.costoUsd) || 0,
        fechaCompra: form?.fechaCompra ? new Date(form.fechaCompra).toISOString() : null,
        garantia: form?.garantia ? new Date(form.garantia).toISOString() : null,
        direccionIp: form?.direccionIp || null,
        direccionMac: form?.direccionMac || null,
        clientId: selectedClientId || undefined,
      };
      const url = editId ? `/api/equipment/${editId}` : '/api/equipment';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); toast.error(err?.error || 'Error'); return; }
      toast.success(editId ? 'Equipo actualizado' : 'Equipo creado');
      setShowForm(false);
      setForm({ ...emptyForm });
      setEditId(null);
      fetchData();
    } catch (err: any) { toast.error('Error al guardar'); console.error(err); }
  };

  const handleEdit = (item: any) => {
    setForm({
      nombre: item?.nombre ?? '',
      direccionIp: item?.direccionIp ?? '',
      fabricante: item?.fabricante ?? '',
      direccionMac: item?.direccionMac ?? '',
      comentarios: item?.comentarios ?? '',
      tipoEquipo: item?.tipoEquipo ?? 'otro',
      numeroSerie: item?.numeroSerie ?? '',
      fechaCompra: item?.fechaCompra ? new Date(item.fechaCompra).toISOString().split('T')[0] : '',
      garantia: item?.garantia ? new Date(item.garantia).toISOString().split('T')[0] : '',
      estado: item?.estado ?? 'activo',
      responsable: item?.responsable ?? '',
      costoUsd: item?.costoUsd ?? 0,
    });
    setEditId(item?.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este equipo?')) return;
    try {
      await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
      toast.success('Equipo eliminado');
      fetchData();
    } catch (err: any) { toast.error('Error'); console.error(err); }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.getElementById('importFile') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) { toast.error('Selecciona un archivo'); return; }
    const formData = new FormData();
    formData.append('file', file);
    if (selectedClientId) formData.append('clientId', selectedClientId);
    try {
      const res = await fetch('/api/import', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Importados: ${data?.imported ?? 0}, Omitidos: ${data?.skipped ?? 0}`);
        setShowImport(false);
        fetchData();
      } else { toast.error(data?.error || 'Error al importar'); }
    } catch (err: any) { toast.error('Error al importar'); console.error(err); }
  };

  const handleExport = async (format: string) => {
    try {
      if (format === 'excel') {
        const ep = new URLSearchParams({ modulo: 'equipos' });
        if (selectedClientId) ep.set('clientId', selectedClientId);
        const res = await fetch(`/api/export?${ep}`);
        if (res.ok) {
          const blob = await res.blob();
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Equipos.xlsx'; a.click();
        }
      } else {
        const res = await fetch('/api/export-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modulo: 'equipos', clientId: selectedClientId }) });
        if (res.ok) {
          const blob = await res.blob();
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Equipos.pdf'; a.click();
        }
      }
    } catch (err: any) { console.error(err); }
  };

  const tipoLabel = (v: string) => TIPOS.find(t => t.value === v)?.label ?? v;
  const estadoLabel = (v: string) => ESTADOS.find(s => s.value === v)?.label ?? v;

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'numeroSerie', label: 'Serial / SN', render: (v: any) => v ? <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{v}</span> : <span className="text-gray-400">-</span> },
    { key: 'direccionIp', label: 'IP', render: (v: any) => v ?? '-' },
    { key: 'fabricante', label: 'Fabricante', render: (v: any) => v ?? '-' },
    { key: 'tipoEquipo', label: 'Tipo', render: (v: any) => <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">{tipoLabel(v ?? 'otro')}</span> },
    { key: 'estado', label: 'Estado', render: (v: any) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v === 'activo' ? 'bg-green-100 text-green-800' : v === 'inactivo' ? 'bg-gray-100 text-gray-600' : v === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{estadoLabel(v ?? 'activo')}</span> },
    { key: 'responsable', label: 'Responsable', render: (v: any) => v ?? '-' },
    { key: 'costoUsd', label: 'Costo', render: (v: any) => formatUSD(v) },
  ];

  return (
    <div className="space-y-6 max-w-[1200px]">
      <PageHeader
        title="Equipos Tecnológicos"
        description="Inventario completo de dispositivos y equipos de red"
        icon={Monitor}
        actions={
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Upload className="w-4 h-4" /> Importar
            </button>
            <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Excel
            </button>
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
              <FileText className="w-4 h-4" /> PDF
            </button>
            <button onClick={() => { setForm({ ...emptyForm }); setEditId(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700">
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700">
          <option value="">Todos los estados</option>
          {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? <div className="h-64 bg-white rounded-xl animate-pulse" /> : (
        <DataTable
          columns={columns}
          data={items}
          searchPlaceholder="Buscar por nombre, IP, fabricante, MAC..."
          actions={(row: any) => (
            <div className="flex items-center gap-1 justify-end">
              <button onClick={() => handleEdit(row)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><Pencil className="w-4 h-4 text-blue-600" /></button>
              <button onClick={() => handleDelete(row?.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
            </div>
          )}
        />
      )}

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? 'Editar Equipo' : 'Nuevo Equipo'} maxWidth="max-w-3xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-gray-700">Nombre *</label><input required value={form?.nombre ?? ''} onChange={(e) => setForm({ ...(form ?? {}), nombre: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Dirección IP</label><input value={form?.direccionIp ?? ''} onChange={(e) => setForm({ ...(form ?? {}), direccionIp: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" placeholder="10.0.0.X" /></div>
          <div><label className="text-sm font-medium text-gray-700">Fabricante</label><input value={form?.fabricante ?? ''} onChange={(e) => setForm({ ...(form ?? {}), fabricante: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Dirección MAC</label><input value={form?.direccionMac ?? ''} onChange={(e) => setForm({ ...(form ?? {}), direccionMac: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" placeholder="XX:XX:XX:XX:XX:XX" /></div>
          <div><label className="text-sm font-medium text-gray-700">Tipo de Equipo</label><select value={form?.tipoEquipo ?? 'otro'} onChange={(e) => setForm({ ...(form ?? {}), tipoEquipo: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">{TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          <div><label className="text-sm font-medium text-gray-700">Estado</label><select value={form?.estado ?? 'activo'} onChange={(e) => setForm({ ...(form ?? {}), estado: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">{ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
          <div><label className="text-sm font-medium text-gray-700">Serial / SN</label><input value={form?.numeroSerie ?? ''} placeholder="Ej: SN-12345678" onChange={(e) => setForm({ ...(form ?? {}), numeroSerie: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Responsable</label><input value={form?.responsable ?? ''} onChange={(e) => setForm({ ...(form ?? {}), responsable: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Fecha de Compra</label><input type="date" value={form?.fechaCompra ?? ''} onChange={(e) => setForm({ ...(form ?? {}), fechaCompra: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Garantía hasta</label><input type="date" value={form?.garantia ?? ''} onChange={(e) => setForm({ ...(form ?? {}), garantia: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div><label className="text-sm font-medium text-gray-700">Costo (USD)</label><input type="number" step="0.01" value={form?.costoUsd ?? 0} onChange={(e) => setForm({ ...(form ?? {}), costoUsd: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div className="md:col-span-2"><label className="text-sm font-medium text-gray-700">Comentarios</label><textarea value={form?.comentarios ?? ''} onChange={(e) => setForm({ ...(form ?? {}), comentarios: e.target.value })} rows={2} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-800" /></div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors">{editId ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal open={showImport} onClose={() => setShowImport(false)} title="Importar Equipos desde Excel/CSV">
        <form onSubmit={handleImport} className="space-y-4">
          <p className="text-sm text-gray-500">El archivo debe contener las columnas: Nombre, Dirección IP, Fabricante, Dirección MAC, Comentarios</p>
          <input type="file" id="importFile" accept=".xlsx,.xls,.csv" className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowImport(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium">Importar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
