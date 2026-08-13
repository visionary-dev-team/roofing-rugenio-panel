'use client';

import React, { useEffect, useState } from 'react';
import { SidebarLayout } from '@/components/sidebar-layout';
import { apiFetch, uploadFileToS3 } from '@/lib/api-client';
import { Service } from '@/types/api';
import { Wrench, Plus, Trash2, Edit3, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [short, setShort] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [features, setFeatures] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchServices = async () => {
    try {
      const data = await apiFetch<Service[]>('/services');
      setServices(data);
    } catch {
      // API error or empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { fileUrl } = await uploadFileToS3(file, 'services');
      setImage(fileUrl);
      setStatusMessage({ type: 'success', text: 'Imagen subida a AWS S3 exitosamente.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al subir la imagen a S3.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const payload = {
      title,
      slug,
      short,
      description,
      image: image || 'https://via.placeholder.com/600x400',
      features: features.split('\n').filter((f) => f.trim() !== ''),
      steps: [
        { title: 'Free Inspection', detail: 'We assess your current roof and give an honest quote.' },
        { title: 'Installation', detail: 'Our crew installs your new system efficiently.' }
      ]
    };

    try {
      if (editingId) {
        await apiFetch(`/services/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setStatusMessage({ type: 'success', text: 'Servicio actualizado correctamente.' });
      } else {
        await apiFetch('/services', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setStatusMessage({ type: 'success', text: 'Nuevo Servicio creado exitosamente.' });
      }

      resetForm();
      setModalOpen(false);
      fetchServices();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al guardar el servicio.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (srv: Service) => {
    setEditingId(srv.id);
    setTitle(srv.title);
    setSlug(srv.slug);
    setShort(srv.short);
    setDescription(srv.description || '');
    setImage(srv.image);
    setFeatures(srv.features ? srv.features.join('\n') : '');
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio? Se eliminará de la web.')) return;
    try {
      await apiFetch(`/services/${id}`, { method: 'DELETE' });
      fetchServices();
      setStatusMessage({ type: 'success', text: 'Servicio eliminado.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al eliminar.' });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setShort('');
    setDescription('');
    setImage('');
    setFeatures('');
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="flex justify-between items-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              <span>Gestión de Servicios</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Crea, edita y administra los servicios del catálogo que se muestran en el sitio web.
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Servicio</span>
          </button>
        </div>

        {/* Alerts */}
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

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Cargando catálogo de servicios desde la API...</div>
        ) : services.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Wrench className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No hay servicios registrados</h3>
            <p className="text-xs text-slate-400">Haz clic en &quot;Crear Servicio&quot; para dar de alta el primer servicio en la base de datos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <div key={srv.id} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-44 bg-slate-900 overflow-hidden relative">
                    <img src={srv.image || 'https://via.placeholder.com/600x400'} alt={srv.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 bg-slate-950/80 text-amber-400 text-xs px-2.5 py-1 rounded-md font-mono border border-slate-800">
                      /{srv.slug}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-lg text-white">{srv.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{srv.short}</p>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-800 flex justify-end space-x-2 bg-slate-900/50">
                  <button
                    onClick={() => handleEdit(srv)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(srv.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs flex items-center space-x-1 border border-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl my-8">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white">
                  {editingId ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Título del Servicio</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Roof Replacement"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Slug (URL amigable)</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="roof-replacement"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Resumen Corto (Breve descripción)</label>
                  <input
                    type="text"
                    required
                    value={short}
                    onChange={(e) => setShort(e.target.value)}
                    placeholder="Full tear-off and new installs built to outlast the next storm."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Descripción Completa</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles completos del servicio..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Imagen Principal</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="URL de la imagen principal"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <label className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-xl text-xs cursor-pointer flex items-center space-x-1.5 border border-slate-700">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Cargar Imagen</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Características (Una por línea)</label>
                  <textarea
                    rows={3}
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="Complete tear-off & disposal&#10;Architectural shingles&#10;Upgraded underlayment"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
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
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center space-x-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{editingId ? 'Guardar Cambios' : 'Crear Servicio'}</span>
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
