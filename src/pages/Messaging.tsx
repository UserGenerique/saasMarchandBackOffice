import { useEffect, useState, type FormEvent } from 'react';
import { merchantApi } from '../api';
import api from '../api';
import type { Merchant } from '../types';
import { formatDate } from '../utils';
import { MessageSquare, Settings, Search, CheckCircle, XCircle, Send, X } from 'lucide-react';

interface MessagingConfig {
  shopId: number;
  shopName: string;
  provider: string;
  enabled: boolean;
  hasCredentials: boolean;
  sender: string;
  countryCode: string;
}

interface MessageLog {
  id: number;
  recipientPhone: string;
  recipientName: string | null;
  provider: string;
  messageType: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function Messaging() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [config, setConfig] = useState<MessagingConfig | null>(null);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    merchantApi.list().then((r) => setMerchants(r.data)).finally(() => setLoading(false));
  }, []);

  const selectMerchant = async (m: Merchant) => {
    setSelectedMerchant(m);
    try {
      const [cfgRes, logsRes] = await Promise.all([
        api.get<MessagingConfig>(`/admin/messaging/config/${m.merchantId}`),
        api.get<MessageLog[]>(`/admin/messaging/logs/${m.merchantId}`),
      ]);
      setConfig(cfgRes.data);
      setLogs(logsRes.data);
    } catch {
      setConfig(null);
      setLogs([]);
    }
  };

  const filtered = search
    ? merchants.filter((m) => m.businessName.toLowerCase().includes(search.toLowerCase()) || m.fullName.toLowerCase().includes(search.toLowerCase()))
    : merchants;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Messagerie</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Merchant list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher marchand..." className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500" />
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Chargement...</div>
            ) : filtered.map((m) => (
              <button key={m.merchantId} onClick={() => selectMerchant(m)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedMerchant?.merchantId === m.merchantId ? 'bg-primary-50 border-l-2 border-primary-600' : ''}`}>
                <p className="text-sm font-medium text-gray-800">{m.businessName}</p>
                <p className="text-xs text-gray-500">{m.fullName} · {m.phone}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Config + Logs */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedMerchant ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
              <p>Sélectionnez un marchand pour voir sa configuration messagerie</p>
            </div>
          ) : (
            <>
              {/* Config card */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">{selectedMerchant.businessName}</h3>
                  <button onClick={() => setShowConfig(true)} className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
                    <Settings size={14} /> Configurer
                  </button>
                </div>
                {config ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Provider</p>
                      <p className="text-sm font-medium">{config.provider === 'NONE' ? '—' : config.provider.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Statut</p>
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${config.enabled ? 'text-success-600' : 'text-gray-400'}`}>
                        {config.enabled ? <><CheckCircle size={14} /> Actif</> : <><XCircle size={14} /> Inactif</>}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Expéditeur</p>
                      <p className="text-sm font-medium">{config.sender || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pays</p>
                      <p className="text-sm font-medium">{config.countryCode || '—'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Aucune configuration</p>
                )}
              </div>

              {/* Logs */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Send size={16} /> Historique des messages ({logs.length})
                </h3>
                {logs.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">Aucun message envoyé</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {logs.map((log) => (
                      <div key={log.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.status === 'SENT' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'}`}>
                              {log.status}
                            </span>
                            <span className="text-xs text-gray-500">{log.provider.replace('_', ' ')}</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-400">{log.messageType}</span>
                          </div>
                          <span className="text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-800">{log.recipientName ?? log.recipientPhone}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{log.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Config modal */}
      {showConfig && selectedMerchant && config && (
        <ConfigModal
          merchantId={selectedMerchant.merchantId}
          config={config}
          onClose={() => setShowConfig(false)}
          onSaved={(c) => { setConfig(c); setShowConfig(false); }}
        />
      )}
    </div>
  );
}

function ConfigModal({ merchantId, config, onClose, onSaved }: {
  merchantId: number;
  config: MessagingConfig;
  onClose: () => void;
  onSaved: (c: MessagingConfig) => void;
}) {
  const [provider, setProvider] = useState(config.provider);
  const [enabled, setEnabled] = useState(config.enabled);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [sender, setSender] = useState(config.sender);
  const [phoneId, setPhoneId] = useState('');
  const [countryCode, setCountryCode] = useState(config.countryCode);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put<MessagingConfig>(`/admin/messaging/config/${merchantId}`, {
        provider, enabled, apiKey: apiKey || undefined, apiSecret: apiSecret || undefined,
        sender, phoneId: phoneId || undefined, countryCode,
      });
      onSaved(res.data);
    } catch { alert('Erreur de sauvegarde'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Configuration messagerie</h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
          <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full rounded-lg border-gray-300 text-sm">
            <option value="NONE">Aucun</option>
            <option value="ORANGE_SMS">Orange SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="enabled" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="rounded border-gray-300 text-primary-600" />
          <label htmlFor="enabled" className="text-sm font-medium text-gray-700">Activer l'envoi de messages</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
          <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="w-full rounded-lg border-gray-300 text-sm">
            <option value="CI">Côte d'Ivoire</option>
            <option value="ML">Mali</option>
            <option value="SN">Sénégal</option>
            <option value="BF">Burkina Faso</option>
            <option value="GN">Guinée</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom expéditeur</label>
          <input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="TissuGest" className="w-full rounded-lg border-gray-300 text-sm" />
        </div>

        {provider === 'ORANGE_SMS' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID (Orange API)</label>
              <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={config.hasCredentials ? '••••••• (déjà configuré)' : 'Coller le Client ID'} className="w-full rounded-lg border-gray-300 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
              <input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} placeholder={config.hasCredentials ? '••••••• (déjà configuré)' : 'Coller le Client Secret'} className="w-full rounded-lg border-gray-300 text-sm" />
            </div>
          </>
        )}

        {provider === 'WHATSAPP' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Token WhatsApp (Meta Business)</label>
              <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={config.hasCredentials ? '••••••• (déjà configuré)' : 'Coller le token'} className="w-full rounded-lg border-gray-300 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number ID</label>
              <input value={phoneId} onChange={(e) => setPhoneId(e.target.value)} placeholder="Ex: 123456789" className="w-full rounded-lg border-gray-300 text-sm" />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Annuler</button>
          <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
