import React, { useState } from 'react';
import { Pencil, Plus, Power, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { KuralNotu } from '../components/common/KuralNotu';
import { YetkisizUyari } from '../components/common/YetkiKapisi';
import { BilgiRozeti } from '../components/common/DurumRozeti';
import { BirimFormu } from '../components/yonetim/BirimFormu';
import { Button } from '../components/ui/Button';
import { birimTuruEtiketi } from '../data/birimler';
import { useApp } from '../contexts/AppContext';
import { Birim } from '../types';

export function BirimYonetimi() {
  const {
    kullanici,
    birimler,
    birimBul,
    birimKullanicilari,
    birimAktiflikDegistir,
    birimYonetimiYetkisi
  } = useApp();
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<Birim | null>(null);

  if (!kullanici) return null;

  // Menüden gizlemek yetmez: adres elle yazılsa bile içerik gösterilmez.
  if (!birimYonetimiYetkisi) {
    return (
      <div className="space-y-6">
        <PageHeader baslik="Birim Yönetimi" />
        <YetkisizUyari aciklama="Birim yönetimi yalnızca Merkez Admin ve birim yönetimi yetkisi verilmiş üst kullanıcılar tarafından kullanılabilir." />
      </div>);

  }

  const ac = (hedef: Birim | null) => {
    setDuzenlenen(hedef);
    setFormAcik(true);
  };

  const aktiflik = (birim: Birim) => {
    const bagli = birimKullanicilari(birim.id).length;
    if (birim.aktif && bagli > 0) {
      toast.warning('Bu birime atanmış kullanıcılar var', {
        description:
        'Birimi pasife almak kullanıcıların yetki durumunu etkileyebilir. Birim listeden kaybolmaz.'
      });
    }
    birimAktiflikDegistir(birim.id, !birim.aktif);
    toast.success(birim.aktif ? 'Birim pasife alındı' : 'Birim aktife alındı', {
      description: `${birim.ad} · Birim silinmez, yalnız pasife alınır.`
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Birim Yönetimi"
        aciklama="Birim kartları, üst birim hiyerarşisi, birim bazlı bent ve makbuz yetkileri."
        eylem={
        <Button onClick={() => ac(null)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Yeni birim ekle
          </Button>
        } />
      

      <KuralNotu baslik="Birim yönetimi kuralları">
        Aktif veya pasif fark etmez, tüm birimler listede görünür. Pasif birim yeni kullanıcı
        atamalarında seçilemez. Birim silme yerine pasife alma tercih edilir; atanmış kullanıcı
        varsa uyarı gösterilir.
      </KuralNotu>

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {birimler.map((birim) => {
          const bagliKullanicilar = birimKullanicilari(birim.id);
          const ust = birimBul(birim.ustBirimId);
          return (
            <li key={birim.id} className="flex flex-col rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-heading text-sm font-semibold text-foreground">{birim.ad}</h2>
                  <p className="font-mono text-xs text-muted-foreground">{birim.kod}</p>
                </div>
                <BilgiRozeti
                  metin={birim.aktif ? 'Aktif' : 'Pasif'}
                  ton={birim.aktif ? 'olumlu' : 'hata'} />
                
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <dt className="text-muted-foreground">Tür</dt>
                <dd className="text-right text-foreground">{birimTuruEtiketi(birim.tur)}</dd>
                <dt className="text-muted-foreground">Üst birim</dt>
                <dd className="text-right text-foreground">{ust?.ad ?? 'Kök birim'}</dd>
                <dt className="text-muted-foreground">Yetkili bentler</dt>
                <dd className="text-right font-mono text-foreground">
                  {birim.bentler.length ? birim.bentler.join(', ') : '—'}
                </dd>
                <dt className="text-muted-foreground">Atanmış kullanıcı</dt>
                <dd className="text-right text-foreground">{bagliKullanicilar.length}</dd>
              </dl>

              <div className="mt-3 flex flex-wrap gap-1">
                {birim.makbuzUretebilir && <BilgiRozeti metin="Makbuz üretir" ton="olumlu" />}
                {birim.raporGorebilir && <BilgiRozeti metin="Rapor" />}
                {birim.ajandaKullanabilir && <BilgiRozeti metin="Ajanda" />}
              </div>

              {birim.aciklama &&
              <p className="mt-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  {birim.aciklama}
                </p>
              }

              <div className="mt-3 rounded-md border border-border p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  Bağlı kullanıcılar
                </p>
                {bagliKullanicilar.length ?
                <ul className="mt-1.5 space-y-1 text-xs">
                    {bagliKullanicilar.map((k) =>
                  <li key={k.id} className="flex items-center justify-between gap-2">
                        <span className="truncate text-foreground">{k.adSoyad}</span>
                        <span className="font-mono text-muted-foreground">
                          {k.kullaniciAdi}
                          {!k.aktif && ' · pasif'}
                        </span>
                      </li>
                  )}
                  </ul> :

                <p className="mt-1 text-xs text-muted-foreground">
                    Bu birime atanmış kullanıcı yok.
                  </p>
                }
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-4">
                <Button size="sm" variant="outline" onClick={() => ac(birim)}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Düzenle
                </Button>
                <Button size="sm" variant="ghost" onClick={() => aktiflik(birim)}>
                  <Power className="h-4 w-4" aria-hidden="true" />
                  {birim.aktif ? 'Pasife al' : 'Aktife al'}
                </Button>
              </div>
            </li>);

        })}
      </ul>

      <BirimFormu acik={formAcik} kapat={() => setFormAcik(false)} mevcut={duzenlenen} />
    </div>);

}