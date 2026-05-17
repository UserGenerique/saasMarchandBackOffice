import { useEffect, useState, type FormEvent } from 'react';
import { subscriptionApi, planApi, merchantApi } from '../api';
import type { Subscription, Plan, Merchant, SubscriptionPayment } from '../types';
import { formatFcfa, formatDate } from '../utils';
import { Plus, CreditCard, X } from 'lucide-react';

export default function Subscriptions() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [paymentSub, setPaymentSub] = useState<Subscription | null>(null);

  const load = () => { setLoading(true); subscriptionApi.list().then((r) => setSubs(r.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Abonnements ({subs.length})</h2>
        <button onClick={() => setShowAssign(true)} className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> Assigner un plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Commerce</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Début</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fin</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subs.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.merchant?.businessName ?? '—'}</td>
                  <td className="px-4 py-3">{s.plan?.name ?? '—'}</td>
                  <td className="px-4 py-3"><SubStatus status={s.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(s.startDate)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(s.endDate)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setPaymentSub(s)} className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-medium">
                      <CreditCard size={13} /> Paiements
                    </button>
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucun abonnement</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAssign && <AssignModal onClose={() => setShowAssign(false)} onDone={() => { setShowAssign(false); load(); }} />}
      {paymentSub && <PaymentsModal sub={paymentSub} onClose={() => setPaymentSub(null)} />}
    </div>
  );
}

function SubStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-success-50 text-success-600',
    EXPIRED: 'bg-warning-50 text-warning-600',
    SUSPENDED: 'bg-danger-50 text-danger-600',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>{status}</span>;
}

function AssignModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [merchantId, setMerchantId] = useState('');
  const [planId, setPlanId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([merchantApi.list(), planApi.list()]).then(([m, p]) => { setMerchants(m.data); setPlans(p.data); });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await subscriptionApi.assign({ merchantId: parseInt(merchantId), planId: parseInt(planId) });
      onDone();
    } catch { alert('Erreur lors de l\'assignation'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Assigner un plan</h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commerçant</label>
          <select value={merchantId} onChange={(e) => setMerchantId(e.target.value)} required className="w-full rounded-lg border-gray-300 text-sm">
            <option value="">Sélectionner...</option>
            {merchants.map((m) => <option key={m.merchantId} value={m.merchantId}>{m.businessName} — {m.fullName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
          <select value={planId} onChange={(e) => setPlanId(e.target.value)} required className="w-full rounded-lg border-gray-300 text-sm">
            <option value="">Sélectionner...</option>
            {plans.filter((p) => p.isActive).map((p) => <option key={p.id} value={p.id}>{p.name} — {formatFcfa(p.priceFcfa)}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Annuler</button>
          <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {saving ? '...' : 'Assigner'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PaymentsModal({ sub, onClose }: { sub: Subscription; onClose: () => void }) {
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [saving, setSaving] = useState(false);

  const loadPayments = () => { setLoading(true); subscriptionApi.payments(sub.id).then((r) => setPayments(r.data)).finally(() => setLoading(false)); };
  useEffect(loadPayments, [sub.id]);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await subscriptionApi.recordPayment(sub.id, { amountFcfa: parseInt(amount), paymentMethod: method || undefined });
      setAmount('');
      setMethod('');
      loadPayments();
    } catch { alert('Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Paiements — {sub.merchant?.businessName}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>

        {/* Payment list */}
        {loading ? (
          <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" /></div>
        ) : payments.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun paiement enregistré</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="font-medium text-gray-800">{formatFcfa(p.amountFcfa)}</span>
                  {p.paymentMethod && <span className="ml-2 text-gray-400">({p.paymentMethod})</span>}
                </div>
                <span className="text-gray-500">{formatDate(p.paymentDate)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Add payment */}
        <form onSubmit={handleAdd} className="border-t border-gray-200 pt-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Nouveau paiement</p>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="Montant (FCFA)" className="rounded-lg border-gray-300 text-sm" />
            <input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Méthode (opt.)" className="rounded-lg border-gray-300 text-sm" />
          </div>
          <button type="submit" disabled={saving} className="w-full bg-success-600 hover:bg-success-500 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {saving ? '...' : 'Enregistrer le paiement'}
          </button>
        </form>
      </div>
    </div>
  );
}
