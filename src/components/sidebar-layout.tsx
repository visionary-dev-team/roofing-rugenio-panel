'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { adminConfig } from '@/config/admin-navigation.config';
import {
  LayoutDashboard,
  Wrench,
  Image as ImageIcon,
  Users,
  Settings,
  Building2,
  LogOut,
  Boxes,
  Loader2,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Wrench,
  ImageIcon,
  Users,
  Settings,
  Building2,
  Boxes,
};

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, loading, logout } = useAuth();

  // Guard de seguridad del cliente
  useEffect(() => {
    if (!loading && !token) {
      router.push('/');
    }
  }, [loading, token, router]);

  // Si está verificando el token JWT o no hay sesión, mostrar pantalla de carga segura
  if (loading || !token) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-400 space-y-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium">Verificando sesión segura...</p>
      </div>
    );
  }

  // Filtrar ítems de navegación activos (enabled: true)
  const activeNavigation = adminConfig.navigation.filter((item) => item.enabled);
  const HeaderIcon = iconMap[adminConfig.logoIcon] || Building2;

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Logo & Brand Header Dinámico */}
          <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-lg font-bold">
              <HeaderIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">{adminConfig.appName}</h1>
              <p className="text-xs text-slate-400">{adminConfig.appSubtitle}</p>
            </div>
          </div>

          {/* Navigation Links Dinámicos desde JSON/Config */}
          <nav className="p-4 space-y-1.5">
            {activeNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const IconComponent = iconMap[item.iconName] || LayoutDashboard;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 mr-3 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="truncate mr-2">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Administrador'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@rugerios.com'}</p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-900 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
