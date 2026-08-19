import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { AktiflikRozeti } from '../components/common/DurumRozeti';
import { isletmeciBul, tasOcaklari } from '../data/tasOcagi';
import { useApp } from '../contexts/AppContext';
import { formatTarih } from '../utils/currency';

export function TasOcagiKartlari() {
  const { krediHareketleri } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Taş Ocağı Kartları"
        aciklama="Her taş ocağı bir işletmeciye bağlıdır. Aynı işletmecinin birden fazla taş ocağı olabilir." />
      

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tasOcaklari.map((ocak) => {
          const isletmeci = isletmeciBul(ocak.isletmeciId);
          const kullanimlar = krediHareketleri.filter(
            (h) => h.tasOcagiId === ocak.id && h.tip === 'KULLANIM'
          );
          return (
            <article key={ocak.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-base font-semibold text-foreground">{ocak.ad}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Bağlı işletmeci: {isletmeci?.ad}
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
                <dd className="text-foreground">{ocak.adres}</dd>
                <dt className="text-muted-foreground">Sorumlu kişi</dt>
                <dd className="text-foreground">{ocak.sorumluKisi}</dd>
                <dt className="text-muted-foreground">Telefon</dt>
                <dd className="text-foreground">{ocak.telefon}</dd>
              </dl>

              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Bu ocaktaki patlatma kullanımları</p>
                {kullanimlar.length ?
                <ul className="mt-1.5 space-y-1 text-xs">
                    {kullanimlar.map((k) =>
                  <li key={k.id} className="flex items-center justify-between gap-2">
                        <span className="font-mono text-foreground">{k.kayitNo}</span>
                        <span className="text-muted-foreground">
                          -{k.adet} kredi · {formatTarih(k.tarih)}
                        </span>
                      </li>
                  )}
                  </ul> :

                <p className="mt-1 text-xs text-foreground">Henüz patlatma kaydı yok.</p>
                }
              </div>

              {ocak.notlar &&
              <p className="mt-3 text-xs text-muted-foreground">{ocak.notlar}</p>
              }
            </article>);

        })}
      </div>
    </div>);

}