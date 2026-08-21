import { useState } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useApp } from '../contexts/AppContext';

export function Giris() {
  const { giris, kullanicilar } = useApp();
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState<string | null>(null);

  const gonder = (e: React.FormEvent) => {
    e.preventDefault();
    const sonuc = giris(kullaniciAdi, sifre);
    if (!sonuc.basarili) {
      setHata(sonuc.mesaj ?? 'Kullanıcı adı veya şifre hatalı.');
      return;
    }
    setHata(null);
  };

  const demoSec = (ad: string, kullaniciSifresi: string) => {
    setKullaniciAdi(ad);
    setSifre(kullaniciSifresi);
    setHata(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 lg:flex-row">
      <div className="flex flex-col justify-between bg-sidebar px-6 py-10 text-sidebar-foreground sm:px-12 lg:w-[46%]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold">KTPGV</p>
            <p className="text-xs text-sidebar-foreground/70">Kıbrıs Türk Polis Güçlendirme Vakfı</p>
          </div>
        </div>

        <div className="max-w-md py-10">
          <h1 className="font-heading text-3xl font-semibold leading-tight">
            Ön Ödeme, Dekont, Makbuz ve İşlem Yönetim Sistemi
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/80">
            Ödeme/dekont süreci tamamlanmadan işlem kaydı oluşturulmaz. Dekont dosyası olmadan
            işlem asla kayda alınmaz. Ödeme, makbuz ve işlem süreçleri rol, birim ve bent
            yetkisine göre yönetilir.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-sidebar-foreground/80">
            {[
            'Yasa 57/2026 Madde 6 gelir bentleri (A – F)',
            'TTRF ana kayıt ve alt başvuru yapısı',
            'Taş ocağı patlatma kredisi modeli',
            'Merkezi benzersiz kayıt ve makbuz numarası'].
            map((madde) =>
            <li key={madde} className="flex gap-2">
                <span aria-hidden="true">•</span>
                {madde}
              </li>
            )}
          </ul>
        </div>

        <p className="text-xs text-sidebar-foreground/60">
          Bu ekran tıklanabilir demo/prototiptir. Gerçek veritabanı bağlantısı bulunmaz.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-heading text-xl font-semibold text-foreground">Sisteme Giriş</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Kullanıcıya göre menüler, yetkili bentler ve makbuz yetkileri değişir.
            </p>

            <form onSubmit={gonder} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="kullanici-adi">Kullanıcı adı</Label>
                <Input
                  id="kullanici-adi"
                  value={kullaniciAdi}
                  onChange={(e) => setKullaniciAdi(e.target.value)}
                  autoComplete="username"
                  className="mt-1.5" />
                
              </div>
              <div>
                <Label htmlFor="sifre">Şifre</Label>
                <Input
                  id="sifre"
                  type="password"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  autoComplete="current-password"
                  className="mt-1.5" />
                
              </div>
              {hata &&
              <p role="alert" className="text-sm text-rose-700">
                  {hata}
                </p>
              }
              <Button type="submit" size="lg" className="w-full">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Giriş yap
              </Button>
            </form>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-foreground">Demo kullanıcıları</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Seçmek için tıklayın. Pasif kullanıcılar giriş yapamaz.
            </p>
            <ul className="mt-3 space-y-1.5">
              {kullanicilar.map((k) =>
              <li key={k.id}>
                  <button
                  type="button"
                  onClick={() => demoSec(k.kullaniciAdi, k.sifre)}
                  className="flex w-full items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5">
                  
                    <span className="font-mono text-xs text-muted-foreground">
                      {k.kullaniciAdi} / {k.sifre}
                    </span>
                    <span className="truncate font-medium text-foreground">
                      {k.rol}
                      {!k.aktif && <span className="ml-1 text-xs text-rose-700">· Pasif</span>}
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>);

}