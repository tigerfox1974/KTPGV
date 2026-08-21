import { useState } from 'react';
import { CalendarClock, Clock, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
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
import { useApp } from '../contexts/AppContext';
import { formatTarih } from '../utils/currency';

const DOGRULANMIS = ['ODEME_DOGRULANDI', 'ISLEM_BASLATILABILIR', 'TAMAMLANDI'];

export function KrediHareketleri() {
  const { krediHareketleri, krediOzeti, islemler, isletmeciler, tasOcagiBul } = useApp();
  const [isletmeciId, setIsletmeciId] = useState(isletmeciler[0]?.id ?? '');

  const ozet = krediOzeti(isletmeciId);

  const artan = krediHareketleri.
  filter((h) => h.isletmeciId === isletmeciId).
  slice().
  sort((a, b) => a.tarih.localeCompare(b.tarih));

  let bakiye = 0;
  const satirlar = artan.map((h) => {
    const onceki = bakiye;
    const kayit = islemler.find((i) => i.kayitNo === h.kayitNo);
    const dogrulandi = !kayit || !!kayit.makbuzNo || DOGRULANMIS.includes(kayit.durum);
    // Plan hareketleri ve doğrulanmamış yüklemeler kullanılabilir bakiyeyi değiştirmez.
    if (h.tip === 'YUKLEME' && dogrulandi) bakiye += h.adet;
    if (h.tip === 'KULLANIM') bakiye -= h.adet;
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
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
          etiket="Sonuç bekleyen planlı"
          deger={`${ozet.planlanan}`}
          altMetin="Kredi henüz düşülmedi"
          ikon={CalendarClock} />
        
        <OzetKart
          etiket="Kullanılan kredi"
          deger={`${ozet.kullanilan}`}
          altMetin="Patlatma yapıldı olarak işlenmiş"
          ikon={TrendingDown} />
        
        <OzetKart
          etiket="Kalan kullanılabilir"
          deger={`${ozet.kalan}`}
          altMetin="Doğrulanmış yükleme - kullanılan kredi"
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
                        {h.tip === 'YUKLEME' ?
                    'Kredi yükleme' :
                    h.tip === 'PLAN' ?
                    'Planlandı / sonuç bekliyor' :
                    'Kullanım — patlatma yapıldı'}
                      </p>
                      <p className="text-xs text-muted-foreground">{h.aciklama}</p>
                      <span className="mt-1 inline-flex flex-wrap gap-1.5">
                        {h.tip === 'YUKLEME' &&
                    <>
                    <BilgiRozeti
                      metin={h.dogrulandi ? 'Kullanılabilir' : 'Doğrulama bekliyor'}
                      ton={h.dogrulandi ? 'olumlu' : 'uyari'} />
                          {!h.dogrulandi &&
                      <BilgiRozeti metin={`${h.adet} kredi doğrulanana kadar kullanılabilir değildir`} ton="uyari" />
                      }
                        </>

                    }
                        {h.tip === 'PLAN' &&
                    <BilgiRozeti metin="Kredi düşülmedi" ton="uyari" />
                    }
                        {h.tip === 'KULLANIM' && h.raporNo &&
                    <BilgiRozeti metin={`Belge ${h.raporNo}`} ton="olumlu" />
                    }
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                    className={`font-mono font-semibold ${
                    h.tip === 'YUKLEME' ?
                    'text-emerald-700' :
                    h.tip === 'PLAN' ?
                    'text-amber-700' :
                    'text-rose-700'}`
                    }>
                    
                        {h.tip === 'YUKLEME' ? '+' : h.tip === 'PLAN' ? '~' : '-'}
                        {h.adet}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {h.kayitNo}
                      {h.planKayitNo &&
                  <span className="block text-muted-foreground">Plan: {h.planKayitNo}</span>
                  }
                    </td>
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

      <KuralNotu baslik="Makbuz, kullanılabilirlik ve kredi düşümü">
        Makbuz kredi yükleme kaydına kesilir; planlama ve sonuç kayıtlarında yeniden ödeme ve makbuz
        aranmaz. Yüklenen kredi, ödeme doğrulanana veya makbuz üretilene kadar kullanılamaz. Kredi
        düşümü yalnızca patlatma “Yapıldı” olarak işlendiğinde yapılır; planlı patlatmalar “sonuç
        bekliyor” olarak izlenir.
      </KuralNotu>
    </div>);

}