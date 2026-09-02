import React, { useState } from 'react';
import { BarChart3, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { KuralNotu } from '../components/common/KuralNotu';
import { Button } from '../components/ui/Button';
import { raporTanimlari } from '../data/raporlar';
import { bentler } from '../data/bentler';
import { useApp } from '../contexts/AppContext';
import { formatTL } from '../utils/currency';
import { krediYuklemeKaydiniCozumle } from '../utils/krediYukleme';
import { patlatmaBedeli } from '../utils/hesaplama';

export function Raporlar() {
  const { gorunurIslemler: islemler, krediOzeti, auditEkle, sigortalar, isletmeciler, bau } = useApp();
  const [seciliRapor, setSeciliRapor] = useState(raporTanimlari[1].id);

  const rapor = raporTanimlari.find((r) => r.id === seciliRapor) ?? raporTanimlari[0];
  const birimKrediBedeli = patlatmaBedeli(bau);
  const tahsilatTutari = (islem: (typeof islemler)[number]) =>
  islem.eIslemTuru === 'KREDI_YUKLEME' ?
  krediYuklemeKaydiniCozumle({
    islem,
    birimKrediBedeli
  }).krediTalebiOdemeOzeti.dogrulanmisOdemeToplami :
  islem.tutar;

  const secildi = (id: string) => {
    setSeciliRapor(id);
    const ad = raporTanimlari.find((r) => r.id === id)?.ad ?? id;
    auditEkle('Rapor görüntülendi', ad);
  };

  const bentSatirlari = bentler.map((b) => {
    const kayitlar = islemler.filter((i) => i.bent === b.kod);
    return {
      etiket: `${b.kod} - ${b.baslik}`,
      adet: kayitlar.length,
      tutar: kayitlar.reduce((toplam, islem) => toplam + tahsilatTutari(islem), 0)
    };
  });

  const sigortaSatirlari = sigortalar.map((s) => {
    const kayitlar = islemler.filter((i) => i.sigortaSirketiId === s.id);
    return {
      etiket: s.ad,
      adet: kayitlar.reduce((t, i) => t + (i.altBasvurular?.length ?? 0), 0),
      tutar: kayitlar.reduce((t, i) => t + i.tutar, 0)
    };
  });

  const gorunurIsletmeciIdleri = new Set(
    islemler.
    filter((islem) => islem.eIslemTuru === 'KREDI_YUKLEME' && !!islem.isletmeciId).
    map((islem) => islem.isletmeciId)
  );
  const gorunurKrediIsletmecileri = isletmeciler.filter((isletmeci) =>
    gorunurIsletmeciIdleri.has(isletmeci.id)
  );
  const krediSatirlari = gorunurKrediIsletmecileri.map((i) => {
    const ozet = krediOzeti(i.id);
    return {
      etiket: i.ad,
      adet: ozet.kalan,
      tutar: islemler.
      filter((k) => k.isletmeciId === i.id && k.eIslemTuru === 'KREDI_YUKLEME').
      reduce((toplam, islem) => toplam + tahsilatTutari(islem), 0)
    };
  });
  const krediBagisSatirlari = gorunurKrediIsletmecileri.map((isletmeci) => {
    const ozet = krediOzeti(isletmeci.id);
    const ekrdKayitlari = islemler.filter(
      (islem) => islem.isletmeciId === isletmeci.id && islem.eIslemTuru === 'KREDI_YUKLEME'
    );
    const tutarlar = ekrdKayitlari.reduce(
      (toplam, kayit) => {
        const analiz = krediYuklemeKaydiniCozumle({
          islem: kayit,
          birimKrediBedeli
        });
        return {
          dogrulanmisOdeme: toplam.dogrulanmisOdeme + analiz.krediTalebiOdemeOzeti.dogrulanmisOdemeToplami,
          patlatmaBagisi: toplam.patlatmaBagisi + analiz.krediTalebiOdemeOzeti.krediyeAyrilanToplam,
          genelVakifBagisi: toplam.genelVakifBagisi + analiz.krediTalebiOdemeOzeti.genelBagisToplami
        };
      },
      { dogrulanmisOdeme: 0, patlatmaBagisi: 0, genelVakifBagisi: 0 }
    );
    return {
      etiket: isletmeci.ad,
      kalanKredi: ozet.kalan,
      dogrulanmisOdeme: tutarlar.dogrulanmisOdeme,
      patlatmaBagisi: tutarlar.patlatmaBagisi,
      genelVakifBagisi: tutarlar.genelVakifBagisi
    };
  });
  const krediRaporuSecili = seciliRapor === 'kredi';

  const satirlar =
  seciliRapor === 'sigorta' || seciliRapor === 'ttrf' ?
  sigortaSatirlari :
  seciliRapor === 'kalan-kredi' || seciliRapor === 'kullanim' ?
  krediSatirlari :
  bentSatirlari;

  const adetBasligi =
  satirlar === sigortaSatirlari ?
  'Alt başvuru adedi' :
  satirlar === krediSatirlari ?
  'Kalan kredi' :
  'Kayıt adedi';

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Raporlar"
        aciklama="Demo kapsamında raporlar mevcut kayıtlar üzerinden özetlenir."
        eylem={
        <Button
          variant="outline"
          onClick={() =>
          toast.success('Rapor dışa aktarma simülasyonu', {
            description:
            seciliRapor === 'kredi' ?
            `${rapor.ad} · Ekrandaki patlatma bağışı / genel Vakıf bağışı ayrımı gerçek sistemde PDF/XLSX çıktısına da taşınır.` :
            `${rapor.ad} · Gerçek sistemde PDF/XLSX çıktısı üretilir.`
          })
          }>
          
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Dışa aktar
          </Button>
        } />
      

      <KuralNotu>
        Bu rapor, aktif kullanıcının rol, birim ve bent yetkisi kapsamındaki kayıtlar üzerinden
        hazırlanmıştır.
      </KuralNotu>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <nav aria-label="Rapor listesi" className="rounded-xl border border-border bg-card p-2">
          <ul className="space-y-0.5">
            {raporTanimlari.map((r) =>
            <li key={r.id}>
                <button
                type="button"
                onClick={() => secildi(r.id)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                r.id === seciliRapor ?
                'bg-primary/10 font-medium text-primary' :
                'text-foreground hover:bg-muted'}`
                }>
                
                  {r.ad}
                  <span className="block text-xs text-muted-foreground">{r.kapsam}</span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        <section className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-heading text-base font-semibold">{rapor.ad}</h2>
              <p className="text-sm text-muted-foreground">{rapor.aciklama}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            {krediRaporuSecili ? (
              <table className="w-full min-w-[820px] text-sm">
                <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">İşletmeci</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Kalan kredi</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Doğrulanmış ödeme</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Patlatma bağışı</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Genel Vakıf bağışı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {krediBagisSatirlari.map((satir) =>
                  <tr key={satir.etiket}>
                      <td className="px-4 py-2.5 text-foreground">{satir.etiket}</td>
                      <td className="px-4 py-2.5 text-right">{satir.kalanKredi}</td>
                      <td className="px-4 py-2.5 text-right font-medium">{formatTL(satir.dogrulanmisOdeme)}</td>
                      <td className="px-4 py-2.5 text-right font-medium">{formatTL(satir.patlatmaBagisi)}</td>
                      <td className="px-4 py-2.5 text-right font-medium">{formatTL(satir.genelVakifBagisi)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t border-border bg-muted/40 text-sm font-medium">
                  <tr>
                    <td className="px-4 py-2.5">Toplam</td>
                    <td className="px-4 py-2.5 text-right">
                      {krediBagisSatirlari.reduce((toplam, satir) => toplam + satir.kalanKredi, 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {formatTL(krediBagisSatirlari.reduce((toplam, satir) => toplam + satir.dogrulanmisOdeme, 0))}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {formatTL(krediBagisSatirlari.reduce((toplam, satir) => toplam + satir.patlatmaBagisi, 0))}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {formatTL(krediBagisSatirlari.reduce((toplam, satir) => toplam + satir.genelVakifBagisi, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">Kırılım</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">{adetBasligi}</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {satirlar.map((satir) =>
                  <tr key={satir.etiket}>
                      <td className="px-4 py-2.5 text-foreground">{satir.etiket}</td>
                      <td className="px-4 py-2.5 text-right">{satir.adet}</td>
                      <td className="px-4 py-2.5 text-right font-medium">{formatTL(satir.tutar)}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t border-border bg-muted/40 text-sm font-medium">
                  <tr>
                    <td className="px-4 py-2.5">Toplam</td>
                    <td className="px-4 py-2.5 text-right">
                      {satirlar.reduce((t, s) => t + s.adet, 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {formatTL(satirlar.reduce((t, s) => t + s.tutar, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>);

}