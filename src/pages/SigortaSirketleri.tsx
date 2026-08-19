import React from 'react';
import { Mail, MapPin, Phone, User } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AktiflikRozeti } from '../components/common/DurumRozeti';
import { KuralNotu } from '../components/common/KuralNotu';
import { sigortaSirketleri } from '../data/sigortaSirketleri';
import { useApp } from '../contexts/AppContext';
import { formatTL } from '../utils/currency';

export function SigortaSirketleri() {
  const { islemler } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Sigorta Şirketi Kartları"
        aciklama="Trafik raporu başvuruları yalnızca sigorta şirketi kartına bağlı açılır." />
      

      <KuralNotu baslik="Trafik başvuru kuralı">
        Bireysel, avukat, başka kurum veya serbest başvuru türü yoktur. Sigorta şirketi seçilmeden
        trafik raporu kaydı oluşturulamaz.
      </KuralNotu>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sigortaSirketleri.map((sirket) => {
          const kayitlar = islemler.filter((i) => i.sigortaSirketiId === sirket.id);
          const altToplam = kayitlar.reduce((t, i) => t + (i.altBasvurular?.length ?? 0), 0);
          const tutar = kayitlar.reduce((t, i) => t + i.tutar, 0);
          return (
            <article key={sirket.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-base font-semibold text-foreground">{sirket.ad}</h2>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{sirket.vergiNo}</p>
                </div>
                <AktiflikRozeti aktif={sirket.aktif} />
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <dd className="text-foreground">{sirket.adres}</dd>
                </div>
                <div className="flex gap-2 text-muted-foreground">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <dd className="text-foreground">{sirket.telefon}</dd>
                </div>
                <div className="flex gap-2 text-muted-foreground">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <dd className="text-foreground">{sirket.eposta}</dd>
                </div>
                <div className="flex gap-2 text-muted-foreground">
                  <User className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <dd className="text-foreground">
                    {sirket.yetkiliKisi} · {sirket.yetkiliTelefon}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                <div>
                  <p className="font-heading text-lg font-semibold">{kayitlar.length}</p>
                  <p className="text-xs text-muted-foreground">TTRF kaydı</p>
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold">{altToplam}</p>
                  <p className="text-xs text-muted-foreground">Alt başvuru</p>
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold">{formatTL(tutar)}</p>
                  <p className="text-xs text-muted-foreground">Tahsilat</p>
                </div>
              </div>

              {sirket.notlar &&
              <p className="mt-4 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  {sirket.notlar}
                </p>
              }
            </article>);

        })}
      </div>
    </div>);

}