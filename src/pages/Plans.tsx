import { useEffect, useState, type FormEvent } from 'react';
import { planApi } from '../api';
import type { Plan, PlanRequest, FeatureCode } from '../types';
import { ALL_FEATURES, FEATURE_LABELS } from '../types';
import { formatFcfa } from '../utils';
import { Plus, Edit2, X } from 'lucide-react';

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => { setLoading(true); planApi.list().then((r) => setPlans(r.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openNew = () => { setEditing(null); setShowForm(true); };
  const openEdit = (p: Plan) => { setEditing(p); setShowForm(true); };
  const close = () => { setShowForm(false); setEditing(null); };

  const handleSave = async (data: PlanRequest) => {
    if (editing) {
      await planApi.update(editing.id, data);
    } else {
      await planApi.create(data);
    }
    close();
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Plans d'abonnement</h2>
        <button onClick={openNew} className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> Nouveau plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                  {p.description && <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>}
                </div>
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Edit2 size={14} /></button>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{formatFcfa(p.priceFcfa)}</span>
                <span className="text-xs text-gray-400">/ {p.durationDays}j</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.features.map((f) => (
                  <span key={f} className="px-2 py-0.5 rounded-full text-xs bg-primary-50 text-primary-700 font-medium">{FEATURE_LABELS[f]}</span>
                ))}
              </div>
              <div className="flex gap-2 text-xs">
                {p.isTrial && <span className="px-2 py-0.5 rounded bg-warning-50 text-warning-600">Essai</span>}
                <span className={`px-2 py-0.5 rounded ${p.isActive ? 'bg-success-50 text-success-600' : 'bg-gray-100 text-gray-400'}`}>
                  {p.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && <PlanFormModal plan={editing} onSave={handleSave} onClose={close} />}
    </div>
  );
}

function PlanFormModal({ plan, onSave, onClose }: { plan: Plan | null; onSave: (d: PlanRequest) => Promise<void>; onClose: () => void }) {
  const [name, setName] = useState(plan?.name ?? '');
  const [description, setDescription] = useState(plan?.description ?? '');
  const [price, setPrice] = useState(plan?.priceFcfa?.toString() ?? '');
  const [duration, setDuration] = useState(plan?.durationDays?.toString() ?? '30');
  const [isTrial, setIsTrial] = useState(plan?.isTrial ?? false);
  const [features, setFeatures] = useState<FeatureCode[]>(plan?.features ?? []);
  const [saving, setSaving] = useState(false);

  const toggleFeature = (f: FeatureCode) => {
    setFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ name, description: description || undefined, priceFcfa: parseInt(price) || 0, durationDays: parseInt(duration) || 30, isTrial, features });
    } catch { alert('Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{plan ? 'Modifier le plan' : 'Nouveau plan'}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border-gray-300 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full rounded-lg border-gray-300 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Durée (jours)</label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required className="w-full rounded-lg border-gray-300 text-sm" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isTrial} onChange={(e) => setIsTrial(e.target.checked)} className="rounded border-gray-300 text-primary-600" />
          Plan d'essai
        </label>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fonctionnalités</label>
          <div className="grid grid-cols-2 gap-2">
            {ALL_FEATURES.map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={features.includes(f)} onChange={() => toggleFeature(f)} className="rounded border-gray-300 text-primary-600" />
                {FEATURE_LABELS[f]}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
          <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {saving ? 'Enregistrement...' : plan ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}
