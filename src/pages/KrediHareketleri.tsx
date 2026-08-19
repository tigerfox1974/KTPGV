import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { KuralNotu } from '../components/common/KuralNotu';
import { OzetKart } from '../components/common/OzetKart';
import { Wallet, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'../components/ui/Select';
import { isletmeciler, tasOcagiBul } from '../data/tasOcagi';
import { useApp } from '../contexts/AppContext';
import { formatTarih } from '../utils/currency';

export function KrediHareketleri() {
  const { krediHareketleri, krediOzeti } = useApp();
  const [isletmeciId, setIsletmeciId] = useState(isletmeciler[0].id);

  const ozet = krediOzeti(isletmeciId);
  const hareketler = krediHareketleri.filter((h) => h.isletmeciId === isletmeciId);

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Taş Ocağı Kredi Hareketleri"
        aciklama="Kredi yükleme mali işlemdir, patlatma kullanımı operasyonel işlemdir. Her ikisi de aynı hesapta izlenir."
        eylem={
        <Select value={isletmeciId} onValueChange={setIsletmeciId}>
            <SelectTrigger className="w-64" aria-label="İşletmeci seçimi">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {isletmeciler.map((i) =>
            <SelectItem key={i.id} value={i.id}>
                  {i.ad}
                </SelectItem>
            )}
            </SelectContent>
          </Select>
        } />
      

      <div className="grid gap-4 sm:grid-cols-3">
        <OzetKart etiket="Toplam yüklenen kredi" deger={`${ozet.yuklenen}`} ikon={TrendingUp} />
        <OzetKart etiket="Toplam kullanılan kredi" deger={`${ozet.kullanilan}`} ikon={TrendingDown} />
        <OzetKart etiket="Kalan kredi" deger={`${ozet.kalan}`} ikon={Wallet} />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Hareket</th>
                <th scope="col" className="px-4 py-3 font-medium">Kayıt no</th>
                <th scope="col" className="px-4 py-3 font-medium">Taş ocağı</th>
                <th scope="col" className="px-4 py-3 font-medium">Dekont</th>
                <th scope="col" className="px-4 py-3 font-medium">Makbuz</th>
                <th scope="col" className="px-4 py-3 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {hareketler.map((h) =>
              <tr key={h.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <span
                    className={`font-mono font-semibold ${
                    h.tip === 'YUKLEME' ? 'text-emerald-700' : 'text-rose-700'}`
                    }>
                    
                      {h.tip === 'YUKLEME' ? '+' : '-'}
                      {h.adet} kredi
                    </span>
                    <p className="text-xs text-muted-foreground">{h.aciklama}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{h.kayitNo}</td>
                  <td className="px-4 py-3">
                    {h.tasOcagiId ? tasOcagiBul(h.tasOcagiId)?.ad : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{h.dekontNo ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{h.makbuzNo ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatTarih(h.tarih)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <KuralNotu baslik="Makbuz mantığı">
        Makbuz kredi yükleme kaydına kesilir. Patlatma kullanımında yeniden ödeme alınmaz ve makbuz
        aranmaz. 7 patlatmalık ödeme → tek dekont, tek makbuz, 7 kredi.
      </KuralNotu>
    </div>);

}