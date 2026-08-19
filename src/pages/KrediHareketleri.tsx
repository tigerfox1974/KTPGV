import React, { useState } from 'react';
import { Clock, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { KuralNotu } from '../components/common/KuralNotu';
import { OzetKart } from '../components/common/OzetKart';
import { BilgiRozeti } from '../components/common/DurumRozeti';
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

const DOGRULANMIS = ['ODEME_DOGRULANDI', 'ISLEM_BASLATILABILIR', 'TAMAMLANDI'];

export function KrediHareketleri() {
  const { krediHareketleri, krediOzeti, islemler } = useApp();
  const [isletmeciId, setIsletmeciId] = useState(isletmeciler[0].id);

  const ozet = krediOzeti(isletmeciId);

  const artan = krediHareketleri.
  filter((h) => h.isletmeciId === isletmeciId).
  slice().
  sort((a, b) => a.tarih.localeCompare(b.tarih));

  let bakiye = 0;
  const satirlar = artan.map((h) => {
    const onceki = bakiye;
    bakiye += h.tip === 'YUKLEME' ? h.adet : -h.adet;
    const kayit = islemler.find((i) => i.kayitNo === h.kayitNo);
    const dogrulandi = !kayit || !!kayit.makbuzNo || DOGRULANMIS.includes(kayit.durum);
    return { ...h, onceki, sonraki: bakiye, makbuzNo: kayit?.makbuzNo ?? h.makbuzNo, dogrulandi };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Taş Ocağı Kredi Hareketleri"
        aciklama="Kredi yükleme mali işlemdir, patlatma kullanımı operasyonel işlemdir. Kredi işletmeci hesabında ortak tutulur."
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
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OzetKart
          etiket="Ödeme alınan kredi"
          deger={`${ozet.yuklenen}`}
          altMetin="Toplam yüklenen"
          ikon={TrendingUp} />
        
        <OzetKart
          etiket="Doğrulama bekleyen"
          deger={`${ozet.dogrulamaBekleyen}`}
          altMetin="Kullanılabilir krediye eklenmez"
          ikon={Clock} />
        
        <OzetKart
          etiket="Kullanılmış kredi"
          deger={`${ozet.kullanilan}`}
          altMetin="Patlatma kullanımları"
          ikon={TrendingDown} />
        
        <OzetKart
          etiket="Kalan kullanılabilir"
          deger={`${ozet.kalan}`}
          altMetin={`Kullanılabilir kredi: ${ozet.kullanilabilir}`}
          ikon={Wallet} />
        
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Hareket tipi</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Kredi</th>
                <th scope="col" className="px-4 py-3 font-medium">Kayıt no</th>
                <th scope="col" className="px-4 py-3 font-medium">Taş ocağı</th>
                <th scope="col" className="px-4 py-3 font-medium">Dekont no</th>
                <th scope="col" className="px-4 py-3 font-medium">Makbuz no</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Önceki</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Sonraki</th>
                <th scope="col" className="px-4 py-3 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {satirlar.
              slice().
              reverse().
              map((h) =>
              <tr key={h.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {h.tip === 'YUKLEME' ? 'Kredi yükleme' : 'Patlatma kullanımı'}
                      </p>
                      <p className="text-xs text-muted-foreground">{h.aciklama}</p>
                      {h.tip === 'YUKLEME' &&
                  <span className="mt-1 inline-block">
                          <BilgiRozeti
                      metin={h.dogrulandi ? 'Kullanılabilir' : 'Doğrulama bekliyor'}
                      ton={h.dogrulandi ? 'olumlu' : 'uyari'} />
                    
                        </span>
                  }
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                    className={`font-mono font-semibold ${
                    h.tip === 'YUKLEME' ? 'text-emerald-700' : 'text-rose-700'}`
                    }>
                    
                        {h.tip === 'YUKLEME' ? '+' : '-'}
                        {h.adet}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{h.kayitNo}</td>
                    <td className="px-4 py-3">{h.tasOcagiId ? tasOcagiBul(h.tasOcagiId)?.ad : '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{h.dekontNo ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{h.makbuzNo ?? '—'}</td>
                    <td className="px-4 py-3 text-right">{h.onceki}</td>
                    <td className="px-4 py-3 text-right font-medium">{h.sonraki}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatTarih(h.tarih)}</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <KuralNotu baslik="Makbuz ve kullanılabilirlik">
        Makbuz kredi yükleme kaydına kesilir; patlatma kullanımında yeniden ödeme ve makbuz aranmaz.
        Yüklenen kredi, ödeme doğrulanana veya makbuz üretilene kadar kullanılamaz.
      </KuralNotu>
    </div>);

}