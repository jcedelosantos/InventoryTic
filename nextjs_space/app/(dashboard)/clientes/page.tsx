'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Plus, Pencil, Trash2, Building2, Phone, Mail, MapPin } from 'lucide-react';
import PageHeader from '@/components/page-header';
import Modal from '@/components/modal';
import { useClient } from '@/contexts/client-context';
import { toast } from 'sonner';

const emptyForm = {
  nombre: '', contacto: '', telefono: '', email: '', direccion: '', notas: '', activo: true,
};

export default function ClientesPage() {
  const { data: session } = useSession() || {};
  const { clients, refreshClients } = useClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const handleEdit = (c: any) => {
    setEditId(c?.id);
    setForm({
      nombre: c?.nombre ?? '',
      contacto: c?.contacto ?? '',
      telefono: c?.telefono ?? '',
      email: c?.email ?? '',
      direccion: c?.direccion ?? '',
      notas: c?.notas ?? '',
      activo: c?.activo ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editId ? `/api/clients/${editId}` : '/api/clients';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Error al guardar');
      toast.success(editId ? 'Cliente actualizado' : 'Cliente creado');
      setShowForm(false);
      setEditId(null);
      setForm({ ...emptyForm });
      await refreshClients();
    } catch (err: any) {
      toast.error(err?.message ?? 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente? Los registros asociados quedarán sin cliente asignado.')) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Cliente eliminado');
      await refreshClients();
    } catch (err: any) {
      toast.error(err?.message ?? 'Error');
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px]">
      <PageHeader
        title="Gestión de Clientes"
        description="Administra los clientes de Cedanet Solutions"
        icon={Users}
        actions={
          <button
            onClick={() => { setEditId(null); setForm({ ...emptyForm }); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nuevo Cliente
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(clients ?? []).map((c: any) => (
          <div key={c.id} className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow ${c.activo ? 'border-gray-100' : 'border-red-200 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {(c?.nombre ?? 'C')[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{c?.nombre}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c?.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c?.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(c)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4 text-blue-600" />
                </button>
                <button onClick={() => handleDelete(c?.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <div className="space-y-1.5 text-sm text-gray-600">
              {c?.contacto && <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-gray-400" />{c.contacto}</div>}
              {c?.telefono && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" />{c.telefono}</div>}
              {c?.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" />{c.email}</div>}
              {c?.direccion && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-gray-400" />{c.direccion}</div>}
            </div>
          </div>
        ))}
        {(clients ?? []).length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No hay clientes registrados</p>
            <p className="text-sm mt-1">Crea tu primer cliente para comenzar</p>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? 'Editar Cliente' : 'Nuevo Cliente'} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre del Cliente *</label>
            <input required value={form?.nombre ?? ''} onChange={(e) => setForm({ ...(form ?? {}), nombre: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 text-gray-800" placeholder="Ej: Reverse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Persona de Contacto</label>
              <input value={form?.contacto ?? ''} onChange={(e) => setForm({ ...(form ?? {}), contacto: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 text-gray-800" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Teléfono</label>
              <input value={form?.telefono ?? ''} onChange={(e) => setForm({ ...(form ?? {}), telefono: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 text-gray-800" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form?.email ?? ''} onChange={(e) => setForm({ ...(form ?? {}), email: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 text-gray-800" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <select value={form?.activo ? 'true' : 'false'} onChange={(e) => setForm({ ...(form ?? {}), activo: e.target.value === 'true' })}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 text-gray-800">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Dirección</label>
            <input value={form?.direccion ?? ''} onChange={(e) => setForm({ ...(form ?? {}), direccion: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 text-gray-800" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Notas</label>
            <textarea value={form?.notas ?? ''} onChange={(e) => setForm({ ...(form ?? {}), notas: e.target.value })} rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 text-gray-800 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
