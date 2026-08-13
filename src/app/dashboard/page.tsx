'use client';

import React, { useEffect, useState } from 'react';
import { SidebarLayout } from '@/components/sidebar-layout';
import { apiFetch } from '@/lib/api-client';
import { Service, PortfolioItem } from '@/types/api';
import Link from 'next/link';
import { Wrench, Image as ImageIcon, Plus, ArrowRight, Activity, Database } from 'lucide-react';

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Service[]>('/services').catch(() => []),
      apiFetch<PortfolioItem[]>('/portfolio').catch(() => []),
    ]).then(([servicesData, portfolioData]) => {
      setServices(servicesData);
      setPortfolio(portfolioData);
      setLoading(false);
    });
  }, []);

  return (
    <SidebarLayout>
      <div className="space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-slate-800 to-slate-950 p-8 rounded-2xl border border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
              Panel de Control Administrativo
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Administra los Servicios y el Portafolio de proyectos. Todos los cambios se actualizan en tiempo real en la página web.
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/dashboard/services"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" />
              <span>Gestionar Servicios</span>
            </Link>
            <Link
              href="/dashboard/portfolio"
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm border border-slate-700 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Gestionar Portafolio</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Servicios Publicados</p>
              <p className="text-3xl font-bold text-white mt-1">{loading ? '...' : services.length}</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Proyectos de Portafolio</p>
              <p className="text-3xl font-bold text-white mt-1">{loading ? '...' : portfolio.length}</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">API Backend Status</p>
              <p className="text-sm font-bold text-emerald-400 mt-1 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Conectado (HTTPS)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Management Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Services Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                <h2 className="font-bold text-lg text-white">Servicios Dinámicos</h2>
              </div>
              <Link href="/dashboard/services" className="text-xs text-amber-400 hover:underline flex items-center">
                Ver todos <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500 py-4">Cargando servicios...</p>
            ) : services.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No hay servicios registrados aún.</p>
            ) : (
              <div className="space-y-3">
                {services.slice(0, 4).map((srv) => (
                  <div key={srv.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-white text-sm">{srv.title}</h3>
                      <p className="text-xs text-slate-400 font-mono">/services/{srv.slug}</p>
                    </div>
                    <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full">Activo</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portfolio Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-lg text-white">Últimos Proyectos</h2>
              </div>
              <Link href="/dashboard/portfolio" className="text-xs text-blue-400 hover:underline flex items-center">
                Ver todos <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500 py-4">Cargando portafolio...</p>
            ) : portfolio.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No hay proyectos de portafolio creados.</p>
            ) : (
              <div className="space-y-3">
                {portfolio.slice(0, 4).map((item) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                      <p className="text-xs text-slate-400">{item.city || 'Aurora'}, {item.state || 'IL'}</p>
                    </div>
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                      {item.images?.length || 0} fotos
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </SidebarLayout>
  );
}
