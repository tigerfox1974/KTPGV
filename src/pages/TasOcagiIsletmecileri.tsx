import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, User } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AktiflikRozeti, BilgiRozeti } from '../components/common/DurumRozeti';
import { KuralNotu } from '../components/common/KuralNotu';
import { isletmeciler, tasOcaklari } from '../data/tasOcagi';
import { useApp } from '../contexts/AppContext';
import { formatTarih } from '../utils/currency';

export function TasOcagiIsletmecileri() {
  const { krediOzeti, krediHareketleri } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Taş Ocağı İşletmecileri"
        aciklama="Patlatma kredisi taş ocağına değil, işletmeci / sahip hesabına bağlı tutulur." />
      

      <KuralNotu baslik="Ortak kredi kuralı">
        Aynı işletmeciye bağlı farklı taş ocaklarında yapılan patlatmalar aynı ortak krediden düşer.
      </KuralNotu>

      <div className="grid gap-4 lg:grid-cols-2">
        {isletmeciler.map((isletmeci) => {
          const ozet = krediOzeti(isletmeci.id);
          const ocaklar = tasOcaklari.filter((t) => t.isletmeciId === isletmeci.id);
          const hareketler = krediHareketleri.
          filter((h) => h.isletmeciId === isletmeci.id).
          slice(0, 4);
          return (
            <article key={isletmeci.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-base font-semibold text-foreground">
                    {isletmeci.ad}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {isletmeci.tur === 'SAHIS' ? 'Şahıs' : 'Şirket'} · {isletmeci.kimlikNo}
                  </p>
                </div>
                <AktiflikRozeti aktif={isletmeci.aktif} />
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex gap-2 text-muted-foreground">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <dd className="text-foreground">{isletmeci.telefon}</dd>
                </div>
                <div className="flex gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <dd className="text-foreground">{isletmeci.adres}</dd>
                </div>
                <div className="flex gap-2 text-muted-foreground">
                  <User className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <dd className="text-foreground">{isletmeci.yetkiliKisi}</dd>
                </div>
              </dl>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3 text-center">
                <div>
                  <p className="font-heading text-lg font-semibold">{ozet.yuklenen}</p>
                  <p className="text-xs text-muted-foreground">Yüklenen kredi</p>
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold">{ozet.kullanilan}</p>
                  <p className="text-xs text-muted-foreground">Kullanılan</p>
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold text-primary">{ozet.kalan}</p>
                  <p className="text-xs text-muted-foreground">Kalan kredi</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-foreground">Bağlı taş ocakları</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {ocaklar.map((ocak) =>
                  <li key={ocak.id}>
                      <BilgiRozeti metin={`${ocak.ad} · ${ocak.bolge}`} />
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Son kredi hareketleri</p>
                  <Link
                    to="/kredi-hareketleri"
                    className="text-xs font-medium text-primary hover:underline">
                    
                    Tümü
                  </Link>
                </div>
                <ul className="mt-2 space-y-1.5 text-xs">
                  {hareketler.map((h) =>
                  <li key={h.id} className="flex flex-wrap items-center gap-2">
                      <span
                      className={`font-mono font-semibold ${
                      h.tip === 'YUKLEME' ? 'text-emerald-700' : 'text-rose-700'}`
                      }>
                      
                        {h.tip === 'YUKLEME' ? '+' : '-'}
                        {h.adet} kredi
                      </span>
                      <span className="font-mono text-muted-foreground">{h.kayitNo}</span>
                      <span className="text-muted-foreground">{formatTarih(h.tarih)}</span>
                    </li>
                  )}
                </ul>
              </div>
            </article>);

        })}
      </div>
    </div>);

}