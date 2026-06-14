'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Monitor,
  KeyRound,
  CreditCard,
  Headphones,
  FolderKanban,
  LogOut,
  Shield,
} from 'lucide-react';

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

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-950 text-white flex flex-col z-50">
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Inventario TIC</h1>
            <p className="text-blue-300 text-xs">Reverse</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
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
