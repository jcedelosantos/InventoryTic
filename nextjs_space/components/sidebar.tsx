'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useClient } from '@/contexts/client-context';
import {
  LayoutDashboard,
  Monitor,
  KeyRound,
  CreditCard,
  Headphones,
  FolderKanban,
  LogOut,
  Building2,
  Users,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/equipos', label: 'Equipos', icon: Monitor },
  { href: '/licencias', label: 'Licencias', icon: KeyRound },
  { href: '/consumos', label: 'Consumos', icon: CreditCard },
  { href: '/soportes', label: 'Soportes', icon: Headphones },
  { href: '/proyectos', label: 'Proyectos', icon: FolderKanban },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { clients, selectedClientId, selectedClient, setSelectedClientId } = useClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-950 text-white flex flex-col z-50">
      {/* Branding Cedanet */}
      <div className="p-5 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Cedanet</h1>
            <p className="text-blue-300 text-[10px] tracking-wider uppercase">Solutions</p>
          </div>
        </div>
      </div>

      {/* Client Selector */}
      <div className="px-4 pt-4 pb-2" ref={dropdownRef}>
        <label className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mb-1.5 block">Cliente activo</label>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-blue-800/60 hover:bg-blue-800 rounded-lg text-sm transition-colors border border-blue-700/50"
        >
          <span className="truncate font-medium">
            {selectedClient ? selectedClient.nombre : 'Seleccionar cliente'}
          </span>
          <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && (
          <div className="mt-1 bg-blue-800 rounded-lg border border-blue-700/50 shadow-xl max-h-48 overflow-y-auto">
            <button
              onClick={() => { setSelectedClientId(null); setDropdownOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-700/60 transition-colors ${
                !selectedClientId ? 'bg-blue-700/40 text-teal-300 font-medium' : 'text-blue-200'
              }`}
            >
              Todos los clientes
            </button>
            {(clients ?? []).filter(c => c.activo).map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedClientId(c.id); setDropdownOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-700/60 transition-colors ${
                  selectedClientId === c.id ? 'bg-blue-700/40 text-teal-300 font-medium' : 'text-blue-200'
                }`}
              >
                {c.nombre}
              </button>
            ))}
            {(clients ?? []).filter(c => c.activo).length === 0 && (
              <p className="px-3 py-2 text-xs text-blue-400">No hay clientes registrados</p>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link
          href="/clientes"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            pathname === '/clientes' || pathname?.startsWith('/clientes/')
              ? 'bg-teal-600/40 text-teal-200 shadow-md'
              : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Clientes</span>
        </Link>
        <div className="border-t border-blue-800/60 my-2" />
        {menuItems?.map((item: any) => {
          const Icon = item?.icon;
          const isActive = pathname === item?.href || pathname?.startsWith?.(item?.href + '/');
          return (
            <Link
              key={item?.href}
              href={item?.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-700/60 text-white shadow-md'
                  : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
              }`}
            >
              {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm font-medium">{item?.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <button
          onClick={() => signOut?.({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-200 hover:bg-red-600/20 hover:text-red-300 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
