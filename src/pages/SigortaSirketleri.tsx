import React, { useState } from 'react';
import { Mail, MapPin, Pencil, Phone, Plus, User } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { AktiflikRozeti } from '../components/common/DurumRozeti';
import { KuralNotu } from '../components/common/KuralNotu';
import { Button } from '../components/ui/Button';
import { SigortaSirketiFormu } from '../components/kart/SigortaSirketiFormu';
import { useApp } from '../contexts/AppContext';
import { SigortaSirketi } from '../types';
import { formatTL } from '../utils/currency';

export function SigortaSirketleri() {
  const { kullanici, islemler, sigortalar, sigortaKaydet } = useApp();
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<SigortaSirketi | null>(null);

  const duzenleyebilir = !!kullanici && !kullanici.sadeceGoruntule;

  const ac = (sirket: SigortaSirketi | null) => {
    setDuzenlenen(sirket);
    setFormAcik(true);
  };

  const durumDegistir = (sirket: SigortaSirketi) => {
    sigortaKaydet({ ...sirket, aktif: !sirket.aktif });
    toast.success(`${sirket.ad} ${sirket.aktif ? 'pasife alındı' : 'aktife alındı'}`, {
      description: sirket.aktif ?
      'Pasif şirket trafik başvurusunda listelenmez.' :
      'Şirket artık trafik başvurusunda seçilebilir.'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Sigorta Şirketi Kartları"
        aciklama="Trafik raporu başvuruları yalnızca sigorta şirketi kartına bağlı açılır."
        eylem={
        duzenleyebilir &&
        <Button size="lg" onClick={() => ac(null)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Yeni Sigorta Şirketi Ekle
            </Button>

        } />
      

      <KuralNotu baslik="Trafik başvuru kuralı">
        Bireysel, avukat, başka kurum veya serbest başvuru türü yoktur. Sigorta şirketi seçilmeden
        trafik raporu kaydı oluşturulamaz. Yeni İşlem ekranındaki sigorta şirketi listesi bu
        kartlardan beslenir; pasif kartlar listelenmez.
      </KuralNotu>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sigortalar.map((sirket) => {
          const kayitlar = islemler.filter((i) => i.sigortaSirketiId === sirket.id);
          const altToplam = kayitlar.reduce((t, i) => t + (i.altBasvurular?.length ?? 0), 0);
          const tutar = kayitlar.reduce((t, i) => t + i.tutar, 0);
          return (
            <article key={sirket.id} className="flex flex-col rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
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

              {duzenleyebilir &&
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button size="sm" variant="outline" onClick={() => ac(sirket)}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Düzenle
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => durumDegistir(sirket)}>
                    {sirket.aktif ? 'Pasife al' : 'Aktife al'}
                  </Button>
                </div>
              }
            </article>);

        })}
      </div>

      <SigortaSirketiFormu
        acik={formAcik}
        kapat={() => setFormAcik(false)}
        mevcut={duzenlenen} />
      
    </div>);

}