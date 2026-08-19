import React, { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { AktiflikRozeti } from '../components/common/DurumRozeti';
import { KuralNotu } from '../components/common/KuralNotu';
import { BosDurum } from '../components/common/BosDurum';
import { Button } from '../components/ui/Button';
import { TasOcagiFormu } from '../components/kart/TasOcagiFormu';
import { useApp } from '../contexts/AppContext';
import { TasOcagi } from '../types';
import { formatTarih } from '../utils/currency';

export function TasOcagiKartlari() {
  const {
    kullanici,
    krediHareketleri,
    krediOzeti,
    tasOcaklari,
    isletmeciBul,
    isletmeciler,
    tasOcagiKaydet
  } = useApp();
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<TasOcagi | null>(null);

  const duzenleyebilir = !!kullanici && !kullanici.sadeceGoruntule;
  const isletmeciVar = isletmeciler.length > 0;

  const ac = (ocak: TasOcagi | null) => {
    setDuzenlenen(ocak);
    setFormAcik(true);
  };

  const durumDegistir = (ocak: TasOcagi) => {
    tasOcagiKaydet({ ...ocak, aktif: !ocak.aktif });
    toast.success(`${ocak.ad} ${ocak.aktif ? 'pasife alındı' : 'aktife alındı'}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Taş Ocağı Kartları"
        aciklama="Her taş ocağı bir işletmeciye bağlıdır. Aynı işletmecinin birden fazla taş ocağı olabilir."
        eylem={
        duzenleyebilir &&
        <Button size="lg" onClick={() => ac(null)} disabled={!isletmeciVar}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Yeni Taş Ocağı Ekle
            </Button>

        } />
      

      <KuralNotu baslik="İlişkilendirme kuralı">
        Taş ocağı kartı mutlaka bir işletmeciye bağlanır. Patlatma yapıldığında kredi taş ocağından
        değil, işletmecinin ortak kredisinden düşer. Bağlı işletmeci düzenleme ile değiştirilebilir.
      </KuralNotu>

      {tasOcaklari.length === 0 ?
      <BosDurum
        baslik="Kayıtlı taş ocağı yok"
        aciklama="Önce bir işletmeci / sahip kartı oluşturun, ardından taş ocağı kartını bu işletmeciye bağlayın." /> :


      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasOcaklari.map((ocak) => {
          const isletmeci = isletmeciBul(ocak.isletmeciId);
          const ocakHareketleri = krediHareketleri.filter((h) => h.tasOcagiId === ocak.id);
          const kullanimlar = ocakHareketleri.filter((h) => h.tip === 'KULLANIM');
          const raporlananPlanlar = kullanimlar.
          map((h) => h.planKayitNo).
          filter((no): no is string => !!no);
          const planlar = ocakHareketleri.filter(
            (h) => h.tip === 'PLAN' && !raporlananPlanlar.includes(h.kayitNo)
          );
          const kullanilanKredi = kullanimlar.reduce((t, h) => t + h.adet, 0);
          return (
            <article
              key={ocak.id}
              className="flex flex-col rounded-xl border border-border bg-card p-5">
              
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-heading text-base font-semibold text-foreground">
                      {ocak.ad}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Bağlı işletmeci: {isletmeci?.ad ?? '—'}
                    </p>
                  </div>
                  <AktiflikRozeti aktif={ocak.aktif} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <dt className="text-muted-foreground">Ruhsat no</dt>
                  <dd className="font-mono text-foreground">{ocak.ruhsatNo}</dd>
                  <dt className="text-muted-foreground">Bölge</dt>
                  <dd className="text-foreground">{ocak.bolge}</dd>
                  <dt className="text-muted-foreground">Adres / konum</dt>
                  <dd className="text-foreground">{ocak.adres || '—'}</dd>
                  <dt className="text-muted-foreground">Sorumlu kişi</dt>
                  <dd className="text-foreground">{ocak.sorumluKisi || '—'}</dd>
                  <dt className="text-muted-foreground">Telefon</dt>
                  <dd className="text-foreground">{ocak.telefon || '—'}</dd>
                </dl>

                <div className="mt-4 space-y-3 rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      Planlanan patlatmalar (rapor bekliyor)
                    </p>
                    {planlar.length ?
                  <ul className="mt-1.5 space-y-1 text-xs">
                        {planlar.map((p) =>
                    <li key={p.id} className="flex items-center justify-between gap-2">
                            <span className="font-mono text-foreground">{p.kayitNo}</span>
                            <span className="text-amber-700">
                              ~{p.adet} kredi · {formatTarih(p.tarih)}
                            </span>
                          </li>
                    )}
                      </ul> :

                  <p className="mt-1 text-xs text-muted-foreground">
                        Rapor bekleyen planlı patlatma yok.
                      </p>
                  }
                  </div>

                  <div>
                    <p className="text-xs font-medium text-foreground">Gerçekleşen patlatmalar</p>
                    {kullanimlar.length ?
                  <ul className="mt-1.5 space-y-1 text-xs">
                        {kullanimlar.map((k) =>
                    <li key={k.id} className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono text-foreground">{k.kayitNo}</span>
                            <span className="text-muted-foreground">
                              -{k.adet} kredi · {formatTarih(k.tarih)}
                              {k.raporNo && ` · Rapor ${k.raporNo}`}
                            </span>
                          </li>
                    )}
                      </ul> :

                  <p className="mt-1 text-xs text-muted-foreground">
                        Gerçekleşme raporu işlenmiş patlatma yok.
                      </p>
                  }
                  </div>

                  <dl className="grid grid-cols-2 gap-2 border-t border-border pt-2 text-xs">
                    <dt className="text-muted-foreground">Bu ocakta kullanılan kredi</dt>
                    <dd className="text-right font-medium text-foreground">
                      {kullanilanKredi} kredi
                    </dd>
                    <dt className="text-muted-foreground">Kalan işletmeci kredisi</dt>
                    <dd className="text-right font-medium text-primary">
                      {isletmeci ? krediOzeti(isletmeci.id).kalan : 0} kredi
                    </dd>
                  </dl>
                </div>

                {ocak.notlar && <p className="mt-3 text-xs text-muted-foreground">{ocak.notlar}</p>}

                {duzenleyebilir &&
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    <Button size="sm" variant="outline" onClick={() => ac(ocak)}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Düzenle
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => durumDegistir(ocak)}>
                      {ocak.aktif ? 'Pasife al' : 'Aktife al'}
                    </Button>
                  </div>
              }
              </article>);

        })}
        </div>
      }

      <TasOcagiFormu acik={formAcik} kapat={() => setFormAcik(false)} mevcut={duzenlenen} />
    </div>);

}