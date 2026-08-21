import { useState } from 'react';
import { KeyRound, Pencil, Plus, Power, Search } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { KuralNotu } from '../components/common/KuralNotu';
import { BosDurum } from '../components/common/BosDurum';
import { YetkisizUyari } from '../components/common/YetkiKapisi';
import { BilgiRozeti } from '../components/common/DurumRozeti';
import { KullaniciFormu } from '../components/yonetim/KullaniciFormu';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { menuler } from '../data/menuler';
import { useApp } from '../contexts/AppContext';
import { Kullanici } from '../types';

export function KullaniciYonetimi() {
  const {
    kullanici,
    kullanicilar,
    kullaniciAktiflikDegistir,
    sifreSifirla,
    birimBul,
    kullaniciYonetimiYetkisi
  } = useApp();
  const [arama, setArama] = useState('');
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<Kullanici | null>(null);

  if (!kullanici) return null;

  // Menüden gizlemek yetmez: adres elle yazılsa bile içerik gösterilmez.
  if (!kullaniciYonetimiYetkisi) {
    return (
      <div className="space-y-6">
        <PageHeader baslik="Kullanıcı Yönetimi" />
        <YetkisizUyari aciklama="Kullanıcı yönetimi yalnızca Merkez Admin ve kullanıcı yönetimi yetkisi verilmiş üst kullanıcılar tarafından kullanılabilir." />
      </div>);

  }

  const filtreli = kullanicilar.filter((k) =>
  `${k.kullaniciAdi} ${k.adSoyad} ${k.rol} ${k.birim}`.
  toLowerCase().
  includes(arama.toLowerCase())
  );

  const ac = (hedef: Kullanici | null) => {
    setDuzenlenen(hedef);
    setFormAcik(true);
  };

  const aktiflik = (hedef: Kullanici) => {
    kullaniciAktiflikDegistir(hedef.id, !hedef.aktif);
    toast.success(hedef.aktif ? 'Kullanıcı pasife alındı' : 'Kullanıcı aktife alındı', {
      description: `${hedef.kullaniciAdi} · Kullanıcı silinmez, yalnız pasife alınır.`
    });
  };

  const sifre = (hedef: Kullanici) => {
    sifreSifirla(hedef.id, '1234');
    toast.success('Şifre sıfırlandı', {
      description: `${hedef.kullaniciAdi} kullanıcısının şifresi 1234 olarak belirlendi.`
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Kullanıcı Yönetimi"
        aciklama="Kullanıcı oluşturma, rol ve birim atama, bent ve menü yetkileri. Giriş kullanıcı adı ve şifre iledir."
        eylem={
        <Button onClick={() => ac(null)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Yeni kullanıcı ekle
          </Button>
        } />
      

      <KuralNotu baslik="Kullanıcı yönetimi kuralları">
        Kullanıcı adı ve şifre boş olamaz, aynı kullanıcı adıyla ikinci kullanıcı oluşturulamaz.
        Pasif kullanıcı giriş yapamaz ancak listeden kaybolmaz. Silme yerine pasife alma
        kullanılır. Tüm değişiklikler audit log’a yazılır.
      </KuralNotu>

      <div className="relative sm:max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true" />
        
        <Input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Kullanıcı adı, ad soyad, rol veya birim"
          className="pl-9"
          aria-label="Kullanıcılarda ara" />
        
      </div>

      {filtreli.length === 0 ?
      <BosDurum baslik="Kullanıcı bulunamadı" /> :

      <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Kullanıcı</th>
                  <th scope="col" className="px-4 py-3 font-medium">Rol / Birim</th>
                  <th scope="col" className="px-4 py-3 font-medium">Bentler</th>
                  <th scope="col" className="px-4 py-3 font-medium">Yetkiler</th>
                  <th scope="col" className="px-4 py-3 font-medium">Durum</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtreli.map((k) =>
              <tr key={k.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{k.adSoyad}</p>
                      <p className="font-mono text-xs text-muted-foreground">{k.kullaniciAdi}</p>
                      {k.notlar &&
                  <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">{k.notlar}</p>
                  }
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{k.rol}</p>
                      <p className="text-xs text-muted-foreground">
                        {birimBul(k.birimId)?.ad ?? k.birim}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {k.bentler.length ? k.bentler.join(', ') : '—'}
                      <p className="mt-0.5 font-sans text-[11px] text-muted-foreground">
                        {k.menuler.length} menü
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {k.makbuzUretebilir && <BilgiRozeti metin="Makbuz" ton="olumlu" />}
                        {k.raporGorebilir && <BilgiRozeti metin="Rapor" />}
                        {k.ajandaKullanabilir && <BilgiRozeti metin="Ajanda" />}
                        {k.bauGuncelleyebilir && <BilgiRozeti metin="BAÜ" />}
                        {k.sadeceGoruntule && <BilgiRozeti metin="Sadece görüntüleme" ton="uyari" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <BilgiRozeti
                    metin={k.aktif ? 'Aktif' : 'Pasif'}
                    ton={k.aktif ? 'olumlu' : 'hata'} />
                  
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => ac(k)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          Düzenle
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => sifre(k)}>
                          <KeyRound className="h-4 w-4" aria-hidden="true" />
                          Şifre sıfırla
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => aktiflik(k)}>
                          <Power className="h-4 w-4" aria-hidden="true" />
                          {k.aktif ? 'Pasife al' : 'Aktife al'}
                        </Button>
                      </div>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      }

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading text-base font-semibold">Menü erişim özeti</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Kullanıcının göreceği sol menü, atanan menü erişimlerinden oluşur.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {filtreli.map((k) =>
          <li key={k.id} className="border-b border-border pb-2 last:border-0">
              <p className="font-medium text-foreground">
                {k.adSoyad} {!k.aktif && <span className="text-xs text-rose-700">· Pasif</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {k.menuler.
              map((id) => menuler.find((m) => m.id === id)?.etiket).
              filter(Boolean).
              join(' · ')}
              </p>
            </li>
          )}
        </ul>
      </section>

      <KullaniciFormu acik={formAcik} kapat={() => setFormAcik(false)} mevcut={duzenlenen} />
    </div>);

}