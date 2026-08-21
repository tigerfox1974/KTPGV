import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Mountain, Pencil, Phone, Plus, User, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { AktiflikRozeti, BilgiRozeti } from '../components/common/DurumRozeti';
import { KuralNotu } from '../components/common/KuralNotu';
import { Button } from '../components/ui/Button';
import { IsletmeciFormu } from '../components/kart/IsletmeciFormu';
import { useApp } from '../contexts/AppContext';
import { Isletmeci } from '../types';
import { formatTL, formatTarih } from '../utils/currency';

export function TasOcagiIsletmecileri() {
  const {
    kullanici,
    krediOzeti,
    krediHareketleri,
    isletmeciler,
    isletmeciKaydet,
    tasOcaklari,
    tasOcagiBul
  } = useApp();
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<Isletmeci | null>(null);
  const navigate = useNavigate();

  // İşletmeci kartlarını Merkez Admin ve Taş Ocağı yetkilisi düzenleyebilir; Denetçi yalnız görür.
  const duzenleyebilir =
  !!kullanici &&
  !kullanici.sadeceGoruntule && (
  kullanici.rolKodu === 'MERKEZ_ADMIN' || kullanici.rolKodu === 'TAS_OCAGI');

  const ac = (isletmeci: Isletmeci | null) => {
    setDuzenlenen(isletmeci);
    setFormAcik(true);
  };

  const durumDegistir = (isletmeci: Isletmeci) => {
    isletmeciKaydet({ ...isletmeci, aktif: !isletmeci.aktif });
    toast.success(`${isletmeci.ad} ${isletmeci.aktif ? 'pasife alındı' : 'aktife alındı'}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Taş Ocağı İşletmecileri"
        aciklama="Patlatma kredisi taş ocağına değil, işletmeci / sahip hesabına bağlı tutulur."
        eylem={
        duzenleyebilir &&
        <Button size="lg" onClick={() => ac(null)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Yeni İşletmeci / Sahip Ekle
            </Button>

        } />
      

      <KuralNotu baslik="Ortak kredi ve kredi düşüm kuralı">
        Aynı işletmeciye bağlı farklı taş ocaklarında yapılan patlatmalar aynı ortak krediden düşer.
        Yüklenen kredi, ödeme doğrulanana veya makbuz üretilene kadar kullanılabilir sayılmaz. Kredi
        düşümü planlama aşamasında değil, patlatma “Yapıldı” olarak işlendiğinde yapılır.
      </KuralNotu>

      <div className="grid gap-4 lg:grid-cols-2">
        {isletmeciler.map((isletmeci) => {
          const ozet = krediOzeti(isletmeci.id);
          const ocaklar = tasOcaklari.filter((t) => t.isletmeciId === isletmeci.id);
          const hareketler = krediHareketleri.
          filter((h) => h.isletmeciId === isletmeci.id).
          slice(0, 5);
          return (
            <article key={isletmeci.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-heading text-base font-semibold text-foreground">
                    {isletmeci.ad}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {isletmeci.tur === 'SAHIS' ? 'Şahıs' : 'Şirket'} · Kimlik / vergi no:{' '}
                    <span className="font-mono">{isletmeci.kimlikNo}</span>
                  </p>
                </div>
                <AktiflikRozeti aktif={isletmeci.aktif} />
              </div>

              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex gap-2 text-muted-foreground">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <dd className="text-foreground">{isletmeci.telefon}</dd>
                </div>
                <div className="flex gap-2 text-muted-foreground">
                  <User className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <dd className="text-foreground">Yetkili: {isletmeci.yetkiliKisi}</dd>
                </div>
                <div className="flex gap-2 text-muted-foreground sm:col-span-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <dd className="text-foreground">{isletmeci.adres || '—'}</dd>
                </div>
                <div className="flex gap-2 text-muted-foreground sm:col-span-2">
                  <Mountain className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <dd className="text-foreground">Bağlı taş ocağı sayısı: {ocaklar.length}</dd>
                </div>
              </dl>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-3 text-center sm:grid-cols-5">
                <div>
                  <p className="font-heading text-lg font-semibold">{ozet.yuklenen}</p>
                  <p className="text-xs text-muted-foreground">Yüklenen kredi</p>
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold">{ozet.kullanilabilir}</p>
                  <p className="text-xs text-muted-foreground">
                    Kullanılabilir
                    {ozet.dogrulamaBekleyen > 0 && ` (${ozet.dogrulamaBekleyen} bekliyor)`}
                  </p>
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold text-amber-700">
                    {ozet.planlanan}
                  </p>
                  <p className="text-xs text-muted-foreground">Sonuç bekleyen planlı</p>
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold">{ozet.kullanilan}</p>
                  <p className="text-xs text-muted-foreground">Kullanılan kredi</p>
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold text-primary">{ozet.kalan}</p>
                  <p className="text-xs text-muted-foreground">Kalan kredi</p>
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold text-amber-700">{formatTL(ozet.mahsuplasmaBakiyesi)}</p>
                  <p className="text-xs text-muted-foreground">Mahsuplaşma bakiyesi</p>
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold text-rose-700">{formatTL(ozet.iadeBekleyenTutar)}</p>
                  <p className="text-xs text-muted-foreground">İade bekleyen tutar</p>
                </div>
              </div>

              {ozet.planlanan > ozet.kalan &&
              <p
                role="alert"
                className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                
                  Kredi yetersiz: sonuç bekleyen planlı patlatmalar ({ozet.planlanan}) kalan
                  krediden ({ozet.kalan}) fazla. Patlatmalar “Yapıldı” olarak işlenmeden önce kredi
                  yükleme / ödeme doğrulama / makbuz süreci tamamlanmalıdır.
                </p>
              }

              {duzenleyebilir &&
              <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => navigate('/yeni-islem')}>
                    <Wallet className="h-4 w-4" aria-hidden="true" />
                    Kredi Yükle
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/patlatma-takvimi')}>
                    Patlatma Takvimi
                  </Button>
                </div>
              }

              <div className="mt-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">Bağlı taş ocakları</p>
                  <Link
                    to="/tas-ocagi-kartlari"
                    className="text-xs font-medium text-primary hover:underline">
                    
                    Taş ocağı kartları
                  </Link>
                </div>
                {ocaklar.length ?
                <ul className="mt-2 flex flex-wrap gap-1.5">
                    {ocaklar.map((ocak) =>
                  <li key={ocak.id}>
                        <BilgiRozeti
                      metin={`${ocak.ad} · ${ocak.bolge}`}
                      ton={ocak.aktif ? 'notr' : 'uyari'} />
                    
                      </li>
                  )}
                  </ul> :

                <p className="mt-2 text-xs text-muted-foreground">
                    Bu işletmeciye bağlı taş ocağı yok. Taş Ocağı Kartları ekranından ocak
                    ekleyebilirsiniz.
                  </p>
                }
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Kredi hareketleri</p>
                  <Link
                    to="/kredi-hareketleri"
                    className="text-xs font-medium text-primary hover:underline">
                    
                    Tümü
                  </Link>
                </div>
                {hareketler.length ?
                <ul className="mt-2 space-y-1.5 text-xs">
                    {hareketler.map((h) =>
                  <li key={h.id} className="flex flex-wrap items-center gap-2">
                        <span
                      className={`font-mono font-semibold ${
                      h.tip === 'YUKLEME' ?
                      'text-emerald-700' :
                      h.tip === 'PLAN' ?
                      'text-amber-700' :
                      'text-rose-700'}`
                      }>
                      
                          {h.tip === 'YUKLEME' ? '+' : h.tip === 'PLAN' ? '~' : '-'}
                          {h.adet} kredi
                        </span>
                        {h.tip === 'PLAN' &&
                    <span className="text-amber-700">rapor bekliyor</span>
                    }
                        <span className="font-mono text-muted-foreground">{h.kayitNo}</span>
                        {h.tasOcagiId &&
                    <span className="text-muted-foreground">
                            {tasOcagiBul(h.tasOcagiId)?.ad}
                          </span>
                    }
                        <span className="text-muted-foreground">{formatTarih(h.tarih)}</span>
                      </li>
                  )}
                  </ul> :

                <p className="mt-2 text-xs text-muted-foreground">
                    Henüz kredi hareketi yok. Kredi yükleme Yeni İşlem → E bendi üzerinden yapılır.
                  </p>
                }
              </div>

              {duzenleyebilir &&
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button size="sm" variant="outline" onClick={() => ac(isletmeci)}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Düzenle
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => durumDegistir(isletmeci)}>
                    {isletmeci.aktif ? 'Pasife al' : 'Aktife al'}
                  </Button>
                </div>
              }
            </article>);

        })}
      </div>

      <IsletmeciFormu acik={formAcik} kapat={() => setFormAcik(false)} mevcut={duzenlenen} />
    </div>);

}