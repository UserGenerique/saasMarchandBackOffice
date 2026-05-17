import { useEffect, useState } from 'react';
import { merchantApi } from '../api';
import type { Merchant } from '../types';
import { formatDate } from '../utils';
import { Search, UserX, UserCheck, RefreshCw } from 'lucide-react';

export default function Merchants() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState<number | null>(null);

  const load = () => { setLoading(true); merchantApi.list().then((r) => setMerchants(r.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const toggle = async (m: Merchant) => {
    setActing(m.merchantId);
    try {
      const { data } = m.userActive ? await merchantApi.suspend(m.merchantId) : await merchantApi.reactivate(m.merchantId);
      setMerchants((prev) => prev.map((x) => (x.merchantId === data.merchantId ? data : x)));
    } catch { alert('Erreur'); }
    finally { setActing(null); }
  };

  const filtered = merchants.filter((m) => {
    const q = search.toLowerCase();
    return m.businessName.toLowerCase().includes(q) || m.fullName.toLowerCase().includes(q) || m.phone.includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-900">Marchands ({merchants.length})</h2>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600"><RefreshCw size={14} /> Rafraîchir</button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border-gray-300 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Commerce</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Propriétaire</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Téléphone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Expiration</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((m) => (
                <tr key={m.merchantId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.businessName}</td>
                  <td className="px-4 py-3 text-gray-600">{m.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{m.phone}</td>
                  <td className="px-4 py-3">{m.planName ?? <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3">
                    <StatusBadge active={m.userActive} subStatus={m.subscriptionStatus} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(m.subscriptionEnd)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(m)} disabled={acting === m.merchantId}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        m.userActive
                          ? 'bg-danger-50 text-danger-600 hover:bg-danger-100'
                          : 'bg-success-50 text-success-600 hover:bg-success-100'
                      } disabled:opacity-50`}>
                      {m.userActive ? <><UserX size={13} /> Suspendre</> : <><UserCheck size={13} /> Réactiver</>}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Aucun marchand trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ active, subStatus }: { active: boolean; subStatus: string | null }) {
  if (!active) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-danger-50 text-danger-600">Suspendu</span>;
  if (subStatus === 'ACTIVE') return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-success-50 text-success-600">Actif</span>;
  if (subStatus === 'EXPIRED') return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-600">Expiré</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">{subStatus ?? 'Aucun'}</span>;
}
