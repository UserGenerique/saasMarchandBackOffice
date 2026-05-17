import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsApi, subscriptionApi, merchantApi } from '../api';
import type { AdminStats, Subscription, Merchant } from '../types';
import { formatFcfa, formatDate } from '../utils';
import { Users, UserCheck, UserX, Clock, Banknote, TrendingUp, AlertTriangle, Plus, MessageSquare, Package, CreditCard } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [expiring, setExpiring] = useState<Subscription[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([statsApi.get(), subscriptionApi.expiring(), merchantApi.list()])
      .then(([s, e, m]) => {
        setStats(s.data);
        setExpiring(Array.isArray(e.data) ? e.data : []);
        setMerchants(m.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;
  if (!stats) return <p className="text-red-500">Erreur de chargement</p>;

  const pieData = [
    { name: 'Actifs', value: stats.activeMerchants, color: '#22c55e' },
    { name: 'Expirés', value: stats.expiredMerchants, color: '#f59e0b' },
    { name: 'Suspendus', value: stats.suspendedMerchants, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const recentMerchants = [...merchants].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de TissuGest — {merchants.length} marchands</p>
        </div>
        <button onClick={() => navigate('/subscriptions')} className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> Assigner un plan
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={Users} label="Total marchands" value={stats.totalMerchants} color="text-primary-600" bg="bg-primary-50" />
        <StatCard icon={UserCheck} label="Actifs" value={stats.activeMerchants} color="text-success-600" bg="bg-success-50" />
        <StatCard icon={UserX} label="Suspendus" value={stats.suspendedMerchants} color="text-danger-600" bg="bg-danger-50" />
        <StatCard icon={Clock} label="Expirent (7j)" value={stats.expiringNext7Days} color="text-warning-600" bg="bg-warning-50" />
        <StatCard icon={TrendingUp} label="Abonnements" value={stats.activeSubscriptions ?? 0} color="text-accent-600" bg="bg-accent-50" />
      </div>

      {/* Revenue — gradient cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-success-500 to-success-600 rounded-xl p-6 text-white shadow-lg shadow-success-200">
          <div className="flex items-center gap-3 mb-2 opacity-80"><Banknote size={20} /><span className="text-sm">Revenu ce mois</span></div>
          <p className="text-3xl font-bold">{formatFcfa(stats.revenueCurrentMonth ?? 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg shadow-primary-200">
          <div className="flex items-center gap-3 mb-2 opacity-80"><Banknote size={20} /><span className="text-sm">Revenu total</span></div>
          <p className="text-3xl font-bold">{formatFcfa(stats.revenueTotal ?? 0)}</p>
        </div>
      </div>

      {/* Middle row: Chart + Expiring + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Répartition</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-8">Aucun marchand</p>}
        </div>

        {/* Expiring */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning-500" /> Expirations proches
          </h3>
          {expiring.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <Clock size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Aucune dans les 7 prochains jours</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {expiring.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm bg-warning-50 rounded-lg px-3 py-2">
                  <span className="font-medium text-gray-700 truncate mr-2">{s.merchant?.businessName ?? '—'}</span>
                  <span className="text-warning-600 text-xs whitespace-nowrap">{formatDate(s.endDate)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={16} className="text-primary-500" /> Dernières inscriptions
          </h3>
          <div className="space-y-2">
            {recentMerchants.map((m) => (
              <div key={m.merchantId} className="flex items-center gap-3 text-sm border-b border-gray-100 pb-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {m.businessName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-700 truncate">{m.businessName}</p>
                  <p className="text-xs text-gray-400">{m.fullName}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${m.userActive ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'}`}>
                  {m.planName ?? 'Sans plan'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction icon={Users} label="Marchands" desc="Gérer les comptes" onClick={() => navigate('/merchants')} />
          <QuickAction icon={Package} label="Plans" desc="Tarifs & features" onClick={() => navigate('/plans')} />
          <QuickAction icon={CreditCard} label="Abonnements" desc="Assigner & paiements" onClick={() => navigate('/subscriptions')} />
          <QuickAction icon={MessageSquare} label="Messagerie" desc="SMS & WhatsApp" onClick={() => navigate('/messaging')} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: { icon: typeof Users; label: string; value: number; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bg}`}><Icon size={18} className={color} /></div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 truncate">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, desc, onClick }: { icon: typeof Users; label: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-primary-50 hover:border-primary-200 transition-all text-left group">
      <div className="p-2 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors">
        <Icon size={18} className="text-primary-600" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </button>
  );
}
