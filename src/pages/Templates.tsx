import { useEffect, useState, type FormEvent } from 'react';
import api from '../api';
import { merchantApi } from '../api';
import type { Merchant } from '../types';
import { Eye, Save, Search, Palette, Store, FileText, Upload, Trash2 } from 'lucide-react';

const SAMPLE_LINES
  <tr><td>1</td><td>Bazin Riche Allemand</td><td>5</td><td>8 000</td><td>40 000</td></tr>
  <tr><td>2</td><td>Wax Hollandais</td><td>3</td><td>5 000</td><td>15 000</td></tr>
`;

export default function Templates() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [footerText, setFooterText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewType, setPreviewType] = useState<'RECEIPT' | 'INVOICE' | 'QUOTE'>('RECEIPT');

  useEffect(() => {
    merchantApi.list().then((r) => setMerchants(r.data)).finally(() => setLoading(false));
  }, []);

  const selectMerchant = (m: Merchant) => {
    setSelected(m);
    setShopName(m.businessName);
    setShopAddress(m.address ?? '');
    setShopPhone(m.phone);
    setFooterText('');
    setLogoUrl('');
    setPrimaryColor('#2563eb');
    setShowPreview(false);

    // Load shop branding config
    api.get(`/admin/shops/config/${m.merchantId}`).then((r) => {
      const data = r.data as any;
      if (data.name) setShopName(data.name);
      if (data.address) setShopAddress(data.address);
      if (data.phone) setShopPhone(data.phone);
      if (data.logoUrl) setLogoUrl(data.logoUrl);
      if (data.receiptFooter) setFooterText(data.receiptFooter);
    }).catch(() => {});
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/admin/shops/config/${selected.merchantId}`, {
        name: shopName,
        address: shopAddress,
        phone: shopPhone || '',
        logoUrl: logoUrl || '',
        receiptFooter: footerText || '',
      });
      alert('Configuration sauvegardée !');
    } catch {
      alert('Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const generatePreview = () => {
    // Use absolute URL for logo in iframe (iframe can't resolve relative paths)
    const fullLogoUrl = logoUrl
      ? (logoUrl.startsWith('http') ? logoUrl : `${window.location.origin}/api${logoUrl}`)
      : '';
    const logoHtml = fullLogoUrl
      ? `<img src="${fullLogoUrl}" style="max-height:60px;max-width:200px;margin-bottom:10px" />`
      : '';

    if (previewType === 'RECEIPT') {
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{font-family:Arial,sans-serif;font-size:12px;margin:0;padding:20px;color:#333;max-width:400px;margin:auto}
.header{text-align:center;border-bottom:2px solid ${primaryColor};padding-bottom:15px;margin-bottom:20px}
.header h1{color:${primaryColor};margin:0;font-size:20px}
.header p{margin:3px 0;color:#666;font-size:11px}
.info-row{display:flex;justify-content:space-between;margin-bottom:15px;font-size:11px}
table{width:100%;border-collapse:collapse;margin:15px 0}
th{background:#f1f5f9;padding:8px;text-align:left;font-size:11px;border-bottom:2px solid #e2e8f0}
td{padding:8px;border-bottom:1px solid #f1f5f9;font-size:11px}
.total-section{text-align:right;margin-top:15px}
.total-section .grand-total{font-size:16px;font-weight:bold;color:${primaryColor}}
.footer{text-align:center;margin-top:30px;padding-top:15px;border-top:1px solid #e2e8f0;font-size:10px;color:#999}
</style></head><body>
<div class="header">${logoHtml}<h1>${shopName}</h1><p>${shopAddress}</p><p>Tél: ${shopPhone}</p></div>
<div class="info-row"><div><strong>REÇU N°</strong> REC-2026-0001</div><div style="text-align:right">Mamadou Diallo</div></div>
<table><thead><tr><th>Article</th><th>Qté</th><th>P.U.</th><th>Total</th></tr></thead><tbody>${SAMPLE_LINES}</tbody></table>
<div class="total-section"><p>Sous-total: 55 000 FCFA</p><p>Remise: 5 000 FCFA</p><p class="grand-total">TOTAL: 50 000 FCFA</p><p>Payé: 50 000 FCFA</p></div>
<div class="footer">${footerText || 'Merci de votre confiance !'}</div></body></html>`;
    }

    // Invoice / Quote
    const title = previewType === 'INVOICE' ? 'FACTURE' : 'DEVIS';
    const prefix = previewType === 'INVOICE' ? 'FAC' : 'DEV';
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>
body{font-family:Arial,sans-serif;font-size:12px;margin:0;padding:30px;color:#333}
.header{display:flex;justify-content:space-between;border-bottom:3px solid ${primaryColor};padding-bottom:20px;margin-bottom:25px}
.header .company h1{color:${primaryColor};margin:0;font-size:22px}
.header .doc-info{text-align:right}
.header .doc-info h2{color:${primaryColor};margin:0;font-size:28px}
.parties{display:flex;justify-content:space-between;margin-bottom:25px}
.parties>div{flex:1;padding:15px;background:#f8fafc;border-radius:8px;margin:0 5px}
.parties h3{margin:0 0 8px;font-size:12px;color:#64748b}
table{width:100%;border-collapse:collapse;margin:20px 0}
th{background:${primaryColor};color:white;padding:10px;text-align:left;font-size:11px}
td{padding:10px;border-bottom:1px solid #e2e8f0;font-size:11px}
tr:nth-child(even){background:#f8fafc}
.total-box{float:right;width:250px;margin-top:20px}
.total-box div{display:flex;justify-content:space-between;padding:5px 0;font-size:12px}
.total-box .grand{font-size:16px;font-weight:bold;color:${primaryColor};border-top:2px solid ${primaryColor};padding-top:10px}
.footer{clear:both;text-align:center;margin-top:60px;padding-top:15px;border-top:1px solid #e2e8f0;font-size:10px;color:#999}
</style></head><body>
<div class="header">
  <div class="company">${logoHtml}<h1>${shopName}</h1><p>${shopAddress}</p><p>Tél: ${shopPhone}</p></div>
  <div class="doc-info"><h2>${title}</h2><p><strong>N°</strong> ${prefix}-2026-0001</p><p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p></div>
</div>
<div class="parties">
  <div><h3>ÉMETTEUR</h3><strong>${shopName}</strong><br/>${shopAddress}</div>
  <div><h3>CLIENT</h3><strong>Mamadou Diallo</strong><br/>70 987 65 43</div>
</div>
<table><thead><tr><th>#</th><th>Description</th><th>Qté</th><th>P.U. (FCFA)</th><th>Total (FCFA)</th></tr></thead><tbody>${SAMPLE_LINES}</tbody></table>
<div class="total-box">
  <div><span>Sous-total</span><span>55 000 FCFA</span></div>
  <div><span>Remise</span><span>5 000 FCFA</span></div>
  <div class="grand"><span>TOTAL</span><span>50 000 FCFA</span></div>
</div>
<div class="footer">${footerText || ''}</div></body></html>`;
  };

  const filtered = search
    ? merchants.filter((m) => m.businessName.toLowerCase().includes(search.toLowerCase()))
    : merchants;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Personnalisation documents</h2>
        <p className="text-sm text-gray-500 mt-1">Configurez l'apparence des reçus, factures et devis par marchand</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Merchant list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border-gray-300" />
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-4 text-center text-gray-400">Chargement...</div>
            ) : filtered.map((m) => (
              <button key={m.merchantId} onClick={() => selectMerchant(m)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${selected?.merchantId === m.merchantId ? 'bg-primary-50 border-l-2 border-primary-600' : ''}`}>
                <p className="text-sm font-medium text-gray-800">{m.businessName}</p>
                <p className="text-xs text-gray-500">{m.fullName}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Config form + Preview */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
              <Store size={40} className="mx-auto mb-3 opacity-50" />
              <p>Sélectionnez un marchand pour personnaliser ses documents</p>
            </div>
          ) : (
            <>
              {/* Form */}
              <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Palette size={16} /> Personnalisation — {selected.businessName}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom boutique</label>
                    <input value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} placeholder="Ex: Marché Sandaga, Dakar" className="w-full rounded-lg border-gray-300 text-sm" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Couleur principale</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" />
                      <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1 rounded-lg border-gray-300 text-sm font-mono" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                    {logoUrl ? (
                      <div className="flex items-center gap-3">
                        <img src={logoUrl.startsWith('/') ? `/api${logoUrl}` : logoUrl} alt="Logo" className="h-12 rounded border border-gray-200" />
                        <button type="button" onClick={() => setLogoUrl('')} className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-600"><Trash2 size={16} /></button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50 cursor-pointer transition-colors">
                        <Upload size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-600">Choisir une image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          try {
                            const res = await api.post('/uploads', formData);
                            setLogoUrl(res.data.url);
                          } catch { alert('Erreur upload'); }
                        }} />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message pied de page</label>
                  <textarea value={footerText} onChange={(e) => setFooterText(e.target.value)} rows={2} placeholder="Ex: Merci de votre confiance ! Garantie 7 jours." className="w-full rounded-lg border-gray-300 text-sm" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    {(['RECEIPT', 'INVOICE', 'QUOTE'] as const).map((t) => (
                      <button key={t} type="button" onClick={() => { setPreviewType(t); setShowPreview(true); }}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border ${previewType === t && showPreview ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <Eye size={12} /> {t === 'RECEIPT' ? 'Reçu' : t === 'INVOICE' ? 'Facture' : 'Devis'}
                      </button>
                    ))}
                  </div>
                  <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                    <Save size={14} /> {saving ? '...' : 'Enregistrer'}
                  </button>
                </div>
              </form>

              {/* Preview */}
              {showPreview && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                    <FileText size={14} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Aperçu — {previewType === 'RECEIPT' ? 'Reçu' : previewType === 'INVOICE' ? 'Facture' : 'Devis'}</span>
                  </div>
                  <iframe
                    srcDoc={generatePreview()}
                    className="w-full"
                    style={{ height: '600px', border: 'none' }}
                    title="Preview"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
