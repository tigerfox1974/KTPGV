import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, FileText, Receipt, Wallet } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { OzetKart } from '../components/common/OzetKart';
import { IslemDurumRozeti, AjandaDurumRozeti } from '../components/common/DurumRozeti';
import { KuralNotu } from '../components/common/KuralNotu';
import { useApp } from '../contexts/AppContext';
import { formatTL, formatTarih } from '../utils/currency';
import { bentler } from '../data/bentler';

export function Dashboard() {
  const { kullanici, islemler, ajanda, krediOzeti, bau, isletmeciler } = useApp();
  if (!kullanici) return null;

  const toplamGelir = islemler.reduce((t, i) => t + i.tutar, 0);
  const makbuzsuz = islemler.filter((i) => !i.makbuzNo);
  const sonIslemler = islemler.slice(0, 5);
  const yaklasanGorevler = ajanda.
  filter((a) => a.durum === 'Planlandı' || a.durum === 'İşlem Başlatılabilir').
  slice(0, 5);
  const kalanKrediToplami = isletmeciler.reduce((t, i) => t + krediOzeti(i.id).kalan, 0);
  const bekleyenKrediToplami = isletmeciler.reduce(
    (t, i) => t + krediOzeti(i.id).dogrulamaBekleyen,
    0
  );

  const bentDagilimi = bentler.map((b) => {
    const kayitlar = islemler.filter((i) => i.bent === b.kod);
    return {
      kod: b.kod,
      baslik: b.baslik,
      adet: kayitlar.length,
      tutar: kayitlar.reduce((t, i) => t + i.tutar, 0),
      yetkili: kullanici.bentler.includes(b.kod)
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        baslik={`Hoş geldiniz, ${kullanici.adSoyad}`}
        aciklama={`${kullanici.rol} · ${kullanici.birim} · BAÜ: ${formatTL(bau)}`} />
      

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OzetKart etiket="Toplam kayıt" deger={`${islemler.length}`} altMetin="Mali yıl 2026" ikon={FileText} />
        <OzetKart etiket="Tahsil edilen" deger={formatTL(toplamGelir)} altMetin="Dekontlu işlemler" ikon={Wallet} />
        <OzetKart
          etiket="Makbuz bekleyen"
          deger={`${makbuzsuz.length}`}
          altMetin="Ödeme / Makbuz ekranında"
          ikon={Receipt} />
        
        <OzetKart
          etiket="Kullanılabilir patlatma kredisi"
          deger={`${kalanKrediToplami} kredi`}
          altMetin={`${bekleyenKrediToplami} kredi doğrulama bekliyor`}
          ikon={CalendarDays} />
        
      </div>

      {kullanici.sadeceGoruntule &&
      <KuralNotu baslik="Denetçi yetkisi" ton="uyari">
          Bu kullanıcı yalnızca görüntüleme ve rapor yetkisine sahiptir. Kayıt oluşturma, dekont
          yükleme ve makbuz üretme işlemleri yapılamaz.
        </KuralNotu>
      }

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-heading text-base font-semibold">Son işlem kayıtları</h2>
            <Link to="/kayitlar" className="text-sm font-medium text-primary hover:underline">
              Tümünü gör
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {sonIslemler.map((islem) =>
            <li key={islem.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-muted-foreground">{islem.kayitNo}</p>
                  <p className="truncate text-sm font-medium text-foreground">{islem.baslik}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {islem.talepEden} · {formatTarih(islem.olusturmaTarihi)}
                  </p>
                </div>
                <span className="text-sm font-medium">{formatTL(islem.tutar)}</span>
                <IslemDurumRozeti durum={islem.durum} />
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-heading text-base font-semibold">Ajanda</h2>
            <Link to="/ajanda" className="text-sm font-medium text-primary hover:underline">
              Ajandaya git
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {yaklasanGorevler.map((gorev) =>
            <li key={gorev.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-xs text-muted-foreground">{gorev.kayitNo}</p>
                  <AjandaDurumRozeti durum={gorev.durum} />
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">{gorev.baslik}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatTarih(gorev.tarih)} · {gorev.saat}
                </p>
              </li>
            )}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-heading text-base font-semibold">Bent bazlı durum ve yetkiniz</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Yetkili olduğunuz bentlerde yeni işlem oluşturabilirsiniz.
          </p>
        </div>
        <ul className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
          {bentDagilimi.map((b) =>
          <li key={b.kod} className="bg-card p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading text-lg font-semibold">{b.kod}</span>
                <span
                className={`rounded-full border px-2 py-0.5 text-xs ${
                b.yetkili ?
                'border-emerald-200 bg-emerald-50 text-emerald-700' :
                'border-border bg-muted text-muted-foreground'}`
                }>
                
                  {b.yetkili ? 'Yetkili' : 'Yetki yok'}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground">{b.baslik}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {b.adet} kayıt · {formatTL(b.tutar)}
              </p>
            </li>
          )}
        </ul>
      </section>
    </div>);

}