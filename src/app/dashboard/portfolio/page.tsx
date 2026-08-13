'use client';

import React, { useEffect, useState } from 'react';
import { SidebarLayout } from '@/components/sidebar-layout';
import { apiFetch, uploadFileToS3 } from '@/lib/api-client';
import { PortfolioItem, Service } from '@/types/api';
import { Image as ImageIcon, Plus, Trash2, Edit3, Upload, Loader2, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';

export default function PortfolioAdminPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Aurora');
  const [state, setState] = useState('IL');
  const [serviceId, setServiceId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState<{ url: string; s3Key: string; caption?: string; isCover?: boolean }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const [portfolioData, servicesData] = await Promise.all([
        apiFetch<PortfolioItem[]>('/portfolio'),
        apiFetch<Service[]>('/services'),
      ]);
      setPortfolio(portfolioData);
      setServices(servicesData);
      if (servicesData.length > 0 && !serviceId) {
        setServiceId(servicesData[0].id);
      }
    } catch {
      // API empty or error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { fileUrl, s3Key } = await uploadFileToS3(file, 'portfolio');
      setImages((prev) => [
        ...prev,
        {
          url: fileUrl,
          s3Key,
          caption: file.name,
          isCover: prev.length === 0,
        },
      ]);
      setStatusMessage({ type: 'success', text: 'Imagen subida exitosamente a AWS S3.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al subir la imagen.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const payload = {
      title,
      description,
      city,
      state,
      serviceId,
      isFeatured,
      images,
    };

    try {
      if (editingId) {
        await apiFetch(`/portfolio/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setStatusMessage({ type: 'success', text: 'Proyecto de portafolio actualizado.' });
      } else {
        await apiFetch('/portfolio', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setStatusMessage({ type: 'success', text: 'Nuevo Proyecto creado exitosamente.' });
      }

      resetForm();
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al guardar el proyecto.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setCity(item.city || 'Aurora');
    setState(item.state || 'IL');
    setServiceId(item.serviceId);
    setIsFeatured(item.isFeatured || false);
    setImages(item.images || []);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto del portafolio?')) return;
    try {
      await apiFetch(`/portfolio/${id}`, { method: 'DELETE' });
      fetchData();
      setStatusMessage({ type: 'success', text: 'Proyecto eliminado.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al eliminar.' });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCity('Aurora');
    setState('IL');
    setIsFeatured(false);
    setImages([]);
    if (services.length > 0) setServiceId(services[0].id);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="flex justify-between items-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-blue-400" />
              <span>Gestión del Portafolio de Proyectos</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Administra la galería de proyectos completados e imágenes del catálogo.
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center space-x-2 shadow-lg shadow-blue-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Proyecto</span>
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-4 rounded-xl border text-sm font-medium flex items-center space-x-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Portfolio Items Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Cargando portafolio...</div>
        ) : portfolio.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No hay proyectos en el portafolio</h3>
            <p className="text-xs text-slate-400">Presiona &quot;Crear Proyecto&quot; para subir la primera galería de fotos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((item) => {
              const coverImg = item.images?.find((img) => img.isCover)?.url || item.images?.[0]?.url;
              return (
                <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="h-48 bg-slate-900 overflow-hidden relative">
                      {coverImg ? (
                        <img src={coverImg} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-600">Sin Imagen</div>
                      )}
                      <div className="absolute top-2 right-2 bg-slate-950/80 text-blue-400 text-xs px-2.5 py-1 rounded-md border border-slate-800 flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{item.city}, {item.state}</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-lg text-white">{item.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <span className="text-xs text-slate-400">{item.images?.length || 0} imágenes</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs flex items-center space-x-1 border border-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl my-8">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white">
                  {editingId ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Título del Proyecto</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Full Roof Replacement in Aurora"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Ciudad</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Aurora"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Estado</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="IL"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Servicio Asociado</label>
                    <select
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      {services.map((srv) => (
                        <option key={srv.id} value={srv.id}>{srv.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Descripción del Trabajo</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción detallada de los materiales instalados..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Image Upload & Gallery */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">Galería de Imágenes</label>
                    <label className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer flex items-center space-x-1.5 transition-all">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Agregar Imagen</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>

                  {images.length === 0 ? (
                    <div className="bg-slate-950 border border-dashed border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500">
                      No se han subido fotos a este proyecto todavía.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative group bg-slate-950 rounded-xl overflow-hidden border border-slate-800 h-28">
                          <img src={img.url} alt={img.caption || 'Foto'} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center space-x-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingId ? 'Guardar Cambios' : 'Crear Proyecto'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </SidebarLayout>
  );
}
