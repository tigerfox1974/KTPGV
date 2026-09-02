import { useEffect, useRef, useState } from 'react';
import { Upload, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { ParaInput } from '../ui/ParaInput';
import { DosyaKarti } from './DosyaKarti';
import { DosyaOnizlemeIcerigi, DosyaOnizlemeModal } from './DosyaOnizlemeModal';
import { QrDekontPaneli } from './QrDekontPaneli';
import { KuralNotu } from '../common/KuralNotu';
import { DekontAlanAdi, DekontAlanAdayi, DekontAlanDegeri, DekontDosyasi, DekontKonumluAlan, DekontNormalizedBbox, Islem } from '../../types';
import { dosyaSec } from '../../utils/dosya';
import { formatTL } from '../../utils/currency';
import { dekontOcrOku, dekontBolgesiniTekrarOku, DekontOcrSonucu, normalizeDekontNo } from '../../utils/dekontOcr';
import { islemDekontlariniOku } from '../../utils/krediYukleme';
import { DekontIncelemeCalismaAlani } from './dekont-inceleme/DekontIncelemeCalismaAlani';
import { alanDogrulandiMi, alaniDogrula, dekontSorunlariniOlustur, kontrolEdilenAlanSayisi, kullaniciDegeriniUygula, ocrAdayiniUygula, ocrAlanlariniBirlestir, siradakiAlaniBul, ZORUNLU_DEKONT_ALANLARI } from './dekont-inceleme/helpers';

export interface DekontFormu {
  dekontNo: string;
  bankaReferansNo: string;
  banka: string;
  tarih: string;
  odenenTutar: number | null;
  odemeYapan: string;
}

export const BOS_DEKONT: DekontFormu = {
  dekontNo: '',
  bankaReferansNo: '',
  banka: '',
  tarih: '',
  odenenTutar: null,
  odemeYapan: ''
};

function KontrolDurumu({
  durum,
  onayla,
  opsiyonel = false
}: {durum?: 'BEKLIYOR' | 'OCR_OKUDU' | 'DOGRULANDI' | 'DUZELTILDI';onayla: () => void;opsiyonel?: boolean;}) {
  const metin = durum === 'DOGRULANDI' ? 'Kullanıcı doğruladı' : durum === 'DUZELTILDI' ? 'Kullanıcı düzeltti' : durum === 'OCR_OKUDU' ? 'OCR okudu · kontrol bekliyor' : opsiyonel ? 'Belgede yoksa boş bırakılabilir' : 'Kontrol gerekli';
  const renk = durum === 'DOGRULANDI' || durum === 'DUZELTILDI' ? 'text-emerald-700' : durum === 'OCR_OKUDU' ? 'text-sky-700' : 'text-amber-700';
  return <div className="mt-1.5 flex items-center justify-between gap-2 text-xs"><span className={renk}>{metin}</span>{!(opsiyonel && !durum) && <Button type="button" variant="ghost" size="sm" className="h-7 px-2" disabled={durum === 'DOGRULANDI' || durum === 'DUZELTILDI'} onClick={onayla}>✓ Doğruladım</Button>}</div>;
}

interface DekontBolumuProps {
  form: DekontFormu;
  guncelle: <K extends keyof DekontFormu>(alan: K, deger: DekontFormu[K]) => void;
  dosya: DekontDosyasi | null;
  dosyaAta: (dosya: DekontDosyasi | null) => void;
  kaynakEtiketi: string;
  beklenenTutar: number;
  tutarKurali?: 'ESIT_OLMALI' | 'POZITIF_OLMALI';
  qrOdenecekTutarGoster?: boolean;
  auditEkle: (eylem: string, hedef: string) => void;
  mevcutIslemler: Islem[];
  ocrBilgisi: (sonuc: Pick<DekontOcrSonucu, 'durum' | 'okunanAlanlar' | 'guven'>) => void;
  gelistirilmisMi: boolean;
  dekontKontrolDurumu: (tamamlandi: boolean) => void;
}

export function DekontBolumu({
  form,
  guncelle,
  dosya,
  dosyaAta,
  kaynakEtiketi,
  beklenenTutar,
  tutarKurali = 'ESIT_OLMALI',
  qrOdenecekTutarGoster = false,
  auditEkle,
  mevcutIslemler,
  ocrBilgisi,
  gelistirilmisMi,
  dekontKontrolDurumu
}: DekontBolumuProps) {
  const [onizleme, setOnizleme] = useState(false);
  const [calismaAlaniAcik, setCalismaAlaniAcik] = useState(false);
  const [ocrAlanModelleri, setOcrAlanModelleri] = useState<Partial<Record<DekontAlanAdi, DekontKonumluAlan>>>({});
  const [seciliAlan, setSeciliAlan] = useState<DekontAlanAdi>('dekontNo');
  const [tekrarOkunuyor, setTekrarOkunuyor] = useState(false);
  const [bolgeSecimModu, setBolgeSecimModu] = useState(false);
  const [seciliBolge, setSeciliBolge] = useState<{ sayfa: number; bbox: DekontNormalizedBbox } | null>(null);
  const [ocrDurumu, setOcrDurumu] = useState<'BEKLIYOR' | 'OKUNUYOR' | 'BASARILI' | 'KISMI' | 'BASARISIZ'>('BEKLIYOR');
  const [alanKontrolleri, setAlanKontrolleri] = useState<Record<string, 'BEKLIYOR' | 'OCR_OKUDU' | 'DOGRULANDI' | 'DUZELTILDI'>>({});
  const sonDuplicateAudit = useRef('');
  const odenen = form.odenenTutar ?? 0;
  const fark = Number((odenen - beklenenTutar).toFixed(2));
  const tutarUyumlu = odenen > 0 && Math.abs(fark) < 0.01;
  const tutarGecerli = odenen > 0 && (tutarKurali === 'POZITIF_OLMALI' || tutarUyumlu);
  const krediYuklemeTutarKurali = tutarKurali === 'POZITIF_OLMALI';
  const tumDekontKayitlari = mevcutIslemler.flatMap((islem) =>
    islemDekontlariniOku(islem).map((dekont) => ({ islem, dekont }))
  );
  const normalizedNo = normalizeDekontNo(form.dekontNo);
  const duplicateKaydi = normalizedNo && form.banka.trim()
    ? tumDekontKayitlari.find(({ dekont }) =>
      normalizeDekontNo(dekont.dekontNo) === normalizedNo &&
      dekont.banka.trim().toLocaleUpperCase('tr-TR') === form.banka.trim().toLocaleUpperCase('tr-TR'))
    : undefined;
  const normalizedReferans = normalizeDekontNo(form.bankaReferansNo);
  const duplicateReferansKaydi = normalizedReferans && form.banka.trim()
    ? tumDekontKayitlari.find(({ dekont }) =>
      normalizeDekontNo(dekont.bankaReferansNo ?? '') === normalizedReferans &&
      dekont.banka.trim().toLocaleUpperCase('tr-TR') === form.banka.trim().toLocaleUpperCase('tr-TR'))
    : undefined;
  const hashDuplicateKaydi = dosya?.dekontHash
    ? tumDekontKayitlari.find(({ dekont }) => dekont.dosya?.dekontHash === dosya.dekontHash)
    : undefined;
  const benzerKaydi = form.tarih && odenen > 0 && form.odemeYapan.trim()
    ? tumDekontKayitlari.find(({ dekont }) =>
      dekont.banka.trim().toLocaleUpperCase('tr-TR') === form.banka.trim().toLocaleUpperCase('tr-TR') &&
      dekont.tarih === form.tarih &&
      Math.abs(dekont.odenenTutar - odenen) < 0.01 &&
      dekont.odemeYapan.trim().toLocaleUpperCase('tr-TR') === form.odemeYapan.trim().toLocaleUpperCase('tr-TR'))
    : undefined;
  const gelecekTarih = !!form.tarih && form.tarih > new Date().toISOString().slice(0, 10);
  const zorunluAlanlar = ['dekontNo', 'banka', 'tarih', 'odenenTutar', 'odemeYapan'] as const;
  const kontrolEdilen = zorunluAlanlar.filter((alan) => alanKontrolleri[alan] === 'DOGRULANDI' || alanKontrolleri[alan] === 'DUZELTILDI').length;
  const referansKontrolGerekli = !!form.bankaReferansNo.trim();
  const kontrolTamamlanabilir = !!dosya && !duplicateKaydi && !duplicateReferansKaydi && !hashDuplicateKaydi && !gelecekTarih &&
    zorunluAlanlar.every((alan) => alan === 'odenenTutar' ? tutarGecerli && (alanKontrolleri[alan] === 'DOGRULANDI' || alanKontrolleri[alan] === 'DUZELTILDI') :
      !!form[alan] && (alanKontrolleri[alan] === 'DOGRULANDI' || alanKontrolleri[alan] === 'DUZELTILDI')) &&
    (!referansKontrolGerekli || alanKontrolleri.bankaReferansNo === 'DOGRULANDI' || alanKontrolleri.bankaReferansNo === 'DUZELTILDI');

  const alanGuncelle = <K extends keyof DekontFormu>(alan: K, deger: DekontFormu[K]) => {
    guncelle(alan, deger);
    setAlanKontrolleri((eski) => ({ ...eski, [alan]: 'DUZELTILDI' }));
    dekontKontrolDurumu(false);
  };

  const alanDogrula = (alan: string) => {
    setAlanKontrolleri((eski) => ({ ...eski, [alan]: 'DOGRULANDI' }));
    dekontKontrolDurumu(false);
  };

  const sorunlar = dekontSorunlariniOlustur({
    alanlar: ocrAlanModelleri,
    gecerliDegerler: {
      dekontNo: form.dekontNo || undefined,
      bankaReferansNo: form.bankaReferansNo || undefined,
      banka: form.banka || undefined,
      tarih: form.tarih || undefined,
      odenenTutar: form.odenenTutar ?? undefined,
      odemeYapan: form.odemeYapan || undefined
    },
    beklenenTutar,
    tutarKurali,
    duplicateKayitNo: duplicateKaydi?.islem.kayitNo,
    duplicateReferansKayitNo: duplicateReferansKaydi?.islem.kayitNo,
    duplicateDosyaKayitNo: hashDuplicateKaydi?.islem.kayitNo,
    benzerKayitNo: benzerKaydi?.islem.kayitNo,
    gelecekTarih
  });
  const sorunSayisi = {
    kritik: sorunlar.filter((s) => s.seviye === 'hata').length,
    uyari: sorunlar.filter((s) => s.seviye === 'uyari').length
  };
  const konumluKontrolEdilen = kontrolEdilenAlanSayisi(ocrAlanModelleri);

  const calismaAlaniDegerDegistir = (alan: DekontAlanAdi, deger: DekontAlanDegeri) => {
    setOcrAlanModelleri((eski) => ({ ...eski, [alan]: kullaniciDegeriniUygula(alan, eski[alan], deger) }));
    guncelle(alan as keyof DekontFormu, deger as never);
    setAlanKontrolleri((eski) => ({ ...eski, [alan]: 'DUZELTILDI' }));
    dekontKontrolDurumu(false);
  };
  const calismaAlaniAdaySec = (alan: DekontAlanAdi, aday: DekontAlanAdayi) => {
    const yeniModel = ocrAdayiniUygula(ocrAlanModelleri[alan], aday, aday.kaynak);
    setOcrAlanModelleri((eski) => ({ ...eski, [alan]: yeniModel }));
    if (yeniModel.guncelDeger !== undefined) {
      guncelle(alan as keyof DekontFormu, yeniModel.guncelDeger as never);
    }
    setAlanKontrolleri((eski) => ({ ...eski, [alan]: 'DUZELTILDI' }));
    dekontKontrolDurumu(false);
  };
  const calismaAlaniDogrula = (alan: DekontAlanAdi) => {
    const model = ocrAlanModelleri[alan];
    const deger = model?.guncelDeger ?? (alan === 'odenenTutar' ? form.odenenTutar ?? undefined : (form[alan as keyof DekontFormu] as string | undefined) || undefined);
    if (deger === undefined) return;
    setOcrAlanModelleri((eski) => {
      const guncel = alaniDogrula(alan, eski[alan], deger);
      return guncel ? { ...eski, [alan]: guncel } : eski;
    });
    setAlanKontrolleri((eski) => ({ ...eski, [alan]: 'DOGRULANDI' }));
    dekontKontrolDurumu(false);
  };
  const calismaAlaniDogrulaVeSonraki = (alan: DekontAlanAdi) => {
    calismaAlaniDogrula(alan);
    setSeciliAlan(siradakiAlaniBul(ocrAlanModelleri, alan));
  };
  const calismaAlaniBelgedenSec = (alan: DekontAlanAdi) => {
    setSeciliAlan(alan);
    setBolgeSecimModu(true);
  };
  const calismaAlaniBolgeSecildi = (alan: DekontAlanAdi, secim: { sayfa: number; bbox: DekontNormalizedBbox }) => {
    setSeciliBolge(secim);
    setBolgeSecimModu(false);
    if (!dosya) return;
    setTekrarOkunuyor(true);
    void dekontBolgesiniTekrarOku({ dosya, alan, bbox: secim.bbox, sayfa: secim.sayfa }).then((sonuc) => {
      setTekrarOkunuyor(false);
      if (!sonuc.adaylar.length) return;
      const aday = sonuc.adaylar[0];
      calismaAlaniAdaySec(alan, aday);
      auditEkle('Belge bölgesinden tekrar okundu', `${dosya.ad} · ${alan}`);
    }).catch(() => setTekrarOkunuyor(false));
  };
  const calismaAlaniBelgedeGoster = (alan: DekontAlanAdi) => {
    setSeciliAlan(alan);
  };
  const calismaAlaniBolgeTekrarOku = (alan: DekontAlanAdi) => {
    const model = ocrAlanModelleri[alan];
    if (!dosya || !model?.bbox) return;
    setTekrarOkunuyor(true);
    void dekontBolgesiniTekrarOku({ dosya, alan, bbox: model.bbox, sayfa: model.sayfa ?? 1 }).then((sonuc) => {
      setTekrarOkunuyor(false);
      if (!sonuc.adaylar.length) return;
      calismaAlaniAdaySec(alan, sonuc.adaylar[0]);
      auditEkle('Alan bölgesi tekrar okundu', `${dosya.ad} · ${alan}`);
    }).catch(() => setTekrarOkunuyor(false));
  };
  const numaralariDegistir = () => {
    const dekont = form.dekontNo;
    guncelle('dekontNo', form.bankaReferansNo);
    guncelle('bankaReferansNo', dekont);
    setOcrAlanModelleri((eski) => {
      const d = eski.dekontNo; const r = eski.bankaReferansNo;
      const yeni = { ...eski };
      if (d) yeni.bankaReferansNo = { ...d, alan: 'bankaReferansNo' as DekontAlanAdi, guncelDeger: dekont, durum: 'DUZELTILDI' as const };
      if (r) yeni.dekontNo = { ...r, alan: 'dekontNo' as DekontAlanAdi, guncelDeger: dekont, durum: 'DUZELTILDI' as const };
      return yeni;
    });
    setAlanKontrolleri((eski) => ({ ...eski, dekontNo: 'DUZELTILDI', bankaReferansNo: 'DUZELTILDI' }));
    dekontKontrolDurumu(false);
    auditEkle('Dekont no ve referans no yer değiştirildi', dosya?.ad ?? '');
  };
  const calismaAlaniKontrolTamamla = () => {
    const yeniKontroller: Record<string, 'DOGRULANDI'> = {};
    ZORUNLU_DEKONT_ALANLARI.forEach((alan) => {
      yeniKontroller[alan] = 'DOGRULANDI';
      const model = ocrAlanModelleri[alan];
      const deger = model?.guncelDeger ?? (alan === 'odenenTutar' ? form.odenenTutar ?? undefined : (form[alan as keyof DekontFormu] as string | undefined) || undefined);
      if (deger !== undefined) {
        setOcrAlanModelleri((eski) => {
          const guncel = alaniDogrula(alan, eski[alan], deger);
          return guncel ? { ...eski, [alan]: guncel } : eski;
        });
      }
    });
    setAlanKontrolleri((eski) => ({ ...eski, ...yeniKontroller }));
    setCalismaAlaniAcik(false);
    dekontKontrolDurumu(true);
  };
  const calismaAlaniKontrolTamamlanabilir = ZORUNLU_DEKONT_ALANLARI.every((alan) =>
    alanDogrulandiMi(ocrAlanModelleri[alan]) ||
    alanKontrolleri[alan] === 'DOGRULANDI' ||
    alanKontrolleri[alan] === 'DUZELTILDI'
  );

  useEffect(() => {
    if (!gelistirilmisMi) return;
    setAlanKontrolleri({});
    dekontKontrolDurumu(false);
    if (!dosya) {
      setOcrDurumu('BEKLIYOR');
      ocrBilgisi({ durum: 'BASARISIZ', okunanAlanlar: [], guven: {} });
      return;
    }
    let iptal = false;
    setOcrDurumu('OKUNUYOR');
    void dekontOcrOku(dosya).then((sonuc) => {
      if (iptal) return;
      setOcrDurumu(sonuc.durum);
      ocrBilgisi(sonuc);
      setOcrAlanModelleri((eski) => ocrAlanlariniBirlestir(eski, sonuc.alanModelleri));
      Object.entries(sonuc.alanlar).forEach(([alan, deger]) => {
        if (deger !== undefined) {
          guncelle(alan as keyof typeof form, deger as never);
          setAlanKontrolleri((eski) => ({ ...eski, [alan]: 'OCR_OKUDU' }));
        }
      });
      dekontKontrolDurumu(false);
      auditEkle(sonuc.durum === 'BASARISIZ' ? 'OCR başarısız oldu' : 'OCR ile dekont bilgileri okundu', dosya.ad);
    }).catch(() => {
      if (iptal) return;
      setOcrDurumu('BASARISIZ');
      setAlanKontrolleri({});
      setOcrAlanModelleri({});
      dekontKontrolDurumu(false);
      ocrBilgisi({ durum: 'BASARISIZ', okunanAlanlar: [], guven: {} });
      auditEkle('OCR başarısız oldu', dosya.ad);
    });
    return () => { iptal = true; };
  // OCR is intentionally triggered only when the uploaded file changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dosya, gelistirilmisMi]);

  useEffect(() => {
    if (!dosya) {
      setAlanKontrolleri({});
      dekontKontrolDurumu(false);
    }
  }, [dosya, dekontKontrolDurumu]);

  useEffect(() => {
    const anahtar = duplicateKaydi ? `no:${duplicateKaydi.islem.id}` : duplicateReferansKaydi ? `ref:${duplicateReferansKaydi.islem.id}` : hashDuplicateKaydi ? `hash:${hashDuplicateKaydi.islem.id}` : benzerKaydi ? `benzer:${benzerKaydi.islem.id}` : '';
    if (!anahtar || anahtar === sonDuplicateAudit.current) return;
    sonDuplicateAudit.current = anahtar;
    if (duplicateKaydi) auditEkle('Mükerrer dekont tespit edildi', `${duplicateKaydi.islem.kayitNo} · ${duplicateKaydi.dekont.dekontNo}`);
    else if (duplicateReferansKaydi) auditEkle('Mükerrer banka referansı tespit edildi', `${duplicateReferansKaydi.islem.kayitNo} · ${duplicateReferansKaydi.dekont.bankaReferansNo}`);
    else if (hashDuplicateKaydi) auditEkle('Mükerrer dijital dekont tespit edildi', hashDuplicateKaydi.islem.kayitNo);
    else if (benzerKaydi) auditEkle('Benzer ödeme uyarısı oluştu', benzerKaydi.islem.kayitNo);
  }, [duplicateKaydi, duplicateReferansKaydi, hashDuplicateKaydi, benzerKaydi, auditEkle]);

  if (!gelistirilmisMi) {
    return (
      <div className="space-y-6">
        <section className="space-y-4" aria-labelledby="dekont-baslik">
          <div>
            <h2 id="dekont-baslik" className="font-heading text-base font-semibold text-foreground">Ödeme / Dekont</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {krediYuklemeTutarKurali ?
              'Tüm alanlar zorunludur. E bendi kredi yüklemede dekont tutarı pozitif olmalıdır; eksik veya fazla ödeme kayıt engeli değildir.' :
              'Tüm alanlar zorunludur. Ödenen tutar hesaplanan tutarla eşleşmeden ve dekont dosyası yüklenmeden işlem kaydedilemez.'}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><Label htmlFor="dekont-no">Dekont no</Label><Input id="dekont-no" value={form.dekontNo} onChange={(e) => guncelle('dekontNo', e.target.value)} placeholder="Örn. 987654321" className="mt-1.5" /></div>
            <div><Label htmlFor="dekont-banka">Banka</Label><Input id="dekont-banka" value={form.banka} onChange={(e) => guncelle('banka', e.target.value)} placeholder="Örn. Kıbrıs Vakıflar Bankası" className="mt-1.5" /></div>
            <div><Label htmlFor="dekont-tarih">Dekont tarihi (mali belge tarihi)</Label><Input id="dekont-tarih" type="date" value={form.tarih} onChange={(e) => guncelle('tarih', e.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="dekont-tutar">Ödenen tutar (TL)</Label><ParaInput id="dekont-tutar" value={form.odenenTutar} onValueChange={(deger) => guncelle('odenenTutar', deger)} placeholder="0,00 TL" className="mt-1.5" /><p className="mt-1 text-xs text-muted-foreground">{krediYuklemeTutarKurali ? `Talep hedefi: ${formatTL(beklenenTutar)}` : `Hesaplanan tutar: ${formatTL(beklenenTutar)}`}</p></div>
            <div><Label htmlFor="dekont-odeyen">Ödeme yapan kişi / kurum</Label><Input id="dekont-odeyen" value={form.odemeYapan} onChange={(e) => guncelle('odemeYapan', e.target.value)} placeholder="Örn. Kıbrıs Sigorta Ltd." className="mt-1.5" /></div>
          </div>
          {krediYuklemeTutarKurali ? <>
              {odenen <= 0 &&
            <div role="alert" className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                  <p className="font-medium">Dekont tutarı sıfırdan büyük olmalıdır.</p>
                  <p>Talep hedefi: {formatTL(beklenenTutar)}</p>
                </div>
            }
              {odenen > 0 &&
            <div className="space-y-1 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                  <p className="font-medium">
                    E bendi kredi yüklemede eksik, eşit veya fazla ödeme kayda engel değildir.
                  </p>
                  <p>Talep hedefi: {formatTL(beklenenTutar)}</p>
                  <p>Dekontta ödenen: {formatTL(odenen)}</p>
                  <p>Fark: {formatTL(Math.abs(fark))} {fark < 0 ? '(eksik)' : fark > 0 ? '(fazla)' : '(eşit)'}</p>
                </div>
            }
            </> :
          <>
              {odenen > 0 && !tutarUyumlu && <div role="alert" className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><p className="font-medium">Dekont tutarı hesaplanan tutarla eşleşmiyor.</p><p>Hesaplanan tutar: {formatTL(beklenenTutar)}</p><p>Dekontta ödenen: {formatTL(odenen)}</p><p>Fark: {formatTL(Math.abs(fark))}</p></div>}
              {tutarUyumlu && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">Ödenen tutar hesaplanan tutarla eşleşiyor: {formatTL(odenen)}</p>}
            </>}
        </section>
        <section className="space-y-3 rounded-xl border border-border p-4" aria-labelledby="dosya-baslik">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="dosya-baslik" className="font-heading text-base font-semibold text-foreground">Dijital Dosya</h2><p className="mt-1 text-xs text-muted-foreground">Dijital dekont dosyası · PDF, JPG veya PNG · En fazla 5 MB</p></div>{!dosya && <Button type="button" variant="outline" size="sm" onClick={() => dosyaSec('PERSONEL', (d) => { dosyaAta(d); auditEkle('Dekont yüklendi', `${d.ad} (Personel ekranı)`); })}><Upload className="h-4 w-4" aria-hidden="true" />Yöntem 1 — Personel dosya yükleme</Button>}</div>
          {dosya ? <DosyaKarti dosya={dosya} goruntule={() => { setOnizleme(true); auditEkle('Dekont dosyası görüntülendi', dosya.ad); }} kaldir={() => { dosyaAta(null); auditEkle('Kayıt öncesi dekont kaldırıldı', dosya.ad); }} /> : <QrDekontPaneli kaynakEtiketi={kaynakEtiketi} odenecekTutar={qrOdenecekTutarGoster ? formatTL(beklenenTutar) : undefined} dosyaAta={(d) => { dosyaAta(d); auditEkle('Dekont yüklendi', `${d.ad} (QR/link)`); }} qrOlusturuldu={() => auditEkle('QR/link oluşturuldu', kaynakEtiketi)} />}
          <KuralNotu ton="uyari">Kayıt öncesinde yanlış dosya “Dosyayı kaldır” ile silinebilir. Kayıt tamamlandıktan sonra serbest silme yoktur; silme işlemi yetki ve audit log gerektirir.</KuralNotu>
          <DosyaOnizlemeModal dosya={dosya} acik={onizleme} kapat={() => setOnizleme(false)} />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4" aria-labelledby="dekont-baslik">
        <div>
          <h2 id="dekont-baslik" className="font-heading text-base font-semibold text-foreground">
            Ödeme / Dekont
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {krediYuklemeTutarKurali ?
            'Tüm alanlar zorunludur. E bendi kredi yüklemede dekont tutarı pozitif olmalıdır; eksik veya fazla ödeme kayıt engeli değildir.' :
            'Tüm alanlar zorunludur. Ödenen tutar hesaplanan tutarla eşleşmeden ve dekont dosyası yüklenmeden işlem kaydedilemez.'}
          </p>
        </div>

        <section className="space-y-3 rounded-xl border border-border p-4" aria-labelledby="dosya-baslik">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="dosya-baslik" className="font-heading text-base font-semibold text-foreground">A — Dijital Dekont</h2>
              <p className="mt-1 text-xs text-muted-foreground">PDF, JPG veya PNG · En fazla 5 MB</p>
            </div>
            {!dosya &&
            <Button type="button" variant="outline" size="sm" onClick={() => dosyaSec('PERSONEL', (d) => {
              dosyaAta(d);
              auditEkle('Dekont dosyası yüklendi', `${d.ad} (Personel ekranı)`);
            })}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Yöntem 1 — Personel dosya yükleme
            </Button>}
          </div>
          {dosya ? <DosyaKarti dosya={dosya} goruntule={() => { setOnizleme(true); auditEkle('Dekont dosyası görüntülendi', dosya.ad); }} kaldir={() => { dosyaAta(null); auditEkle('Kayıt öncesi dekont kaldırıldı', dosya.ad); }} /> :
          <QrDekontPaneli kaynakEtiketi={kaynakEtiketi} odenecekTutar={qrOdenecekTutarGoster ? formatTL(beklenenTutar) : undefined} dosyaAta={(d) => { dosyaAta(d); auditEkle('Dekont dosyası yüklendi', `${d.ad} (QR/link)`); }} qrOlusturuldu={() => auditEkle('QR/link oluşturuldu', kaynakEtiketi)} />}
          {dosya && <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">{ocrDurumu === 'OKUNUYOR' ? 'Dekont okunuyor…' : ocrDurumu === 'BASARILI' ? 'Dekont bilgileri otomatik okundu. Lütfen bilgileri kontrol ediniz.' : ocrDurumu === 'KISMI' ? 'Bazı bilgiler otomatik okunamadı. Eksik veya hatalı alanları kontrol edip tamamlayınız.' : 'Dekont otomatik okunamadı. Bilgileri manuel olarak girebilirsiniz.'}</p>}
          {dosya && (
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setCalismaAlaniAcik(true)}>
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
              Çalışma alanında incele ve düzelt (tam ekran)
            </Button>
          )}
          <DosyaOnizlemeModal dosya={dosya} acik={onizleme} kapat={() => setOnizleme(false)} />
        </section>

        {!dosya && <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Önce dijital dekontu yükleyiniz. Sistem dekont üzerindeki bilgileri otomatik okumaya çalışacaktır.</p>}

        {dosya && <section className="space-y-4 rounded-xl border-2 border-primary/20 bg-card p-4 lg:p-5" aria-labelledby="dekont-kontrol-baslik">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="dekont-kontrol-baslik" className="font-heading text-base font-semibold text-foreground">Dekont Kontrolü</h2>
              <p className="mt-1 text-sm text-muted-foreground">OCR yardımcıdır. Her alanı dekontu açıp kontrol ederek doğrulayınız.</p>
            </div>
            <span className="rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-foreground">{kontrolEdilen} / {zorunluAlanlar.length} alan kontrol edildi</span>
          </div>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <div className="min-w-0 rounded-lg bg-slate-900 p-2">
              <DosyaOnizlemeIcerigi dosya={dosya} />
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="kontrol-dekont-no">Belge / Dekont No</Label>
                <Input id="kontrol-dekont-no" value={form.dekontNo} onChange={(e) => alanGuncelle('dekontNo', e.target.value)} className="mt-1.5" />
                <KontrolDurumu durum={alanKontrolleri.dekontNo} onayla={() => alanDogrula('dekontNo')} />
              </div>
              <div>
                <Label htmlFor="kontrol-referans-no">Banka Referans No</Label>
                <Input id="kontrol-referans-no" value={form.bankaReferansNo} onChange={(e) => alanGuncelle('bankaReferansNo', e.target.value)} className="mt-1.5" />
                <KontrolDurumu durum={alanKontrolleri.bankaReferansNo} onayla={() => alanDogrula('bankaReferansNo')} opsiyonel={!form.bankaReferansNo.trim()} />
              </div>
              <div>
                <Label htmlFor="kontrol-banka">Banka</Label>
                <Input id="kontrol-banka" value={form.banka} onChange={(e) => alanGuncelle('banka', e.target.value)} className="mt-1.5" />
                <KontrolDurumu durum={alanKontrolleri.banka} onayla={() => alanDogrula('banka')} />
              </div>
              <div>
                <Label htmlFor="kontrol-tarih">Dekont Tarihi</Label>
                <Input id="kontrol-tarih" type="date" value={form.tarih} onChange={(e) => alanGuncelle('tarih', e.target.value)} className="mt-1.5" />
                <KontrolDurumu durum={alanKontrolleri.tarih} onayla={() => alanDogrula('tarih')} />
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <Label htmlFor="kontrol-tutar">Ödenen Tutar</Label>
                <ParaInput id="kontrol-tutar" value={form.odenenTutar} onValueChange={(deger) => alanGuncelle('odenenTutar', deger)} className="mt-1.5" aria-invalid={!tutarGecerli} />
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm"><span>{krediYuklemeTutarKurali ? 'Talep hedefi' : 'Hesaplanan'}: <strong>{formatTL(beklenenTutar)}</strong></span><span>Dekont: <strong>{formatTL(odenen)}</strong></span></div>
                <p className={tutarGecerli ? 'mt-1 text-sm text-emerald-700' : 'mt-1 text-sm text-rose-700'}>{krediYuklemeTutarKurali ? tutarGecerli ? `✓ Tutar pozitif. Fark: ${formatTL(Math.abs(fark))} ${fark < 0 ? '(eksik)' : fark > 0 ? '(fazla)' : '(eşit)'}` : '✕ Tutar sıfırdan büyük olmalıdır.' : tutarUyumlu ? '✓ Sistem tutarı eşleşiyor; kullanıcı kontrolü yine zorunludur.' : `✕ Tutar eşleşmiyor. Fark: ${formatTL(Math.abs(fark))}`}</p>
                <KontrolDurumu durum={alanKontrolleri.odenenTutar} onayla={() => alanDogrula('odenenTutar')} />
              </div>
              <div>
                <Label htmlFor="kontrol-odeyen">Ödeme Yapan Kişi / Kurum</Label>
                <Input id="kontrol-odeyen" value={form.odemeYapan} onChange={(e) => alanGuncelle('odemeYapan', e.target.value)} className="mt-1.5" />
                <KontrolDurumu durum={alanKontrolleri.odemeYapan} onayla={() => alanDogrula('odemeYapan')} />
              </div>
              <Button type="button" className="w-full" disabled={!kontrolTamamlanabilir} onClick={() => dekontKontrolDurumu(true)}>Kontrolü Tamamla</Button>
            </div>
          </div>
        </section>}

        {dosya && <>
        <section className="hidden" aria-labelledby="bilgi-baslik">
          <div>
            <h2 id="bilgi-baslik" className="font-heading text-base font-semibold text-foreground">B — Dekont Bilgileri</h2>
            <p className="mt-1 text-xs text-muted-foreground">Sistem dekont üzerindeki bilgileri otomatik okumaya çalışmıştır. Kayıt öncesinde bilgileri kontrol ediniz.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="dekont-no">Belge / Dekont no</Label>
            <Input
              id="dekont-no"
              value={form.dekontNo}
              onChange={(e) => guncelle('dekontNo', e.target.value)}
              placeholder="Örn. 987654321"
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="banka-referans-no">Banka referans no</Label>
            <Input
              id="banka-referans-no"
              value={form.bankaReferansNo}
              onChange={(e) => guncelle('bankaReferansNo', e.target.value)}
              placeholder="Örn. 09.08.2026/447/8888/8888"
              className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="dekont-banka">Banka</Label>
            <Input
              id="dekont-banka"
              value={form.banka}
              onChange={(e) => guncelle('banka', e.target.value)}
              placeholder="Örn. Kıbrıs Vakıflar Bankası"
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="dekont-tarih">Dekont tarihi (mali belge tarihi)</Label>
            <Input
              id="dekont-tarih"
              type="date"
              value={form.tarih}
              onChange={(e) => guncelle('tarih', e.target.value)}
              className="mt-1.5" />
            
          </div>
          <div>
            <Label htmlFor="dekont-tutar">Ödenen tutar (TL)</Label>
            <ParaInput
              id="dekont-tutar"
              value={form.odenenTutar}
              onValueChange={(deger) => guncelle('odenenTutar', deger)}
              placeholder="0,00 TL"
              className="mt-1.5"
              aria-invalid={!tutarGecerli && form.odenenTutar !== null} />
            
            <p className="mt-1 text-xs text-muted-foreground">
              {krediYuklemeTutarKurali ? `Talep hedefi: ${formatTL(beklenenTutar)}` : `Hesaplanan tutar: ${formatTL(beklenenTutar)}`}
            </p>
          </div>
          <div>
            <Label htmlFor="dekont-odeyen">Ödeme yapan kişi / kurum</Label>
            <Input
              id="dekont-odeyen"
              value={form.odemeYapan}
              onChange={(e) => guncelle('odemeYapan', e.target.value)}
              placeholder="Örn. Kıbrıs Sigorta Ltd."
              className="mt-1.5" />
            
          </div>
          </div>

        {krediYuklemeTutarKurali ? <>
            {odenen <= 0 &&
          <div
            role="alert"
            className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              <p className="font-medium">Dekont tutarı sıfırdan büyük olmalıdır.</p>
              <p>Talep hedefi: {formatTL(beklenenTutar)}</p>
            </div>
        }

            {odenen > 0 &&
          <div className="space-y-1 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
              <p className="font-medium">
                Bu kredi talebinde eksik veya fazla ödeme kayıt engeli değildir.
              </p>
              <p>Talep hedefi: {formatTL(beklenenTutar)}</p>
              <p>Ödenen tutar: {formatTL(odenen)}</p>
              <p>
                Fark: {formatTL(Math.abs(fark))}{' '}
                {fark < 0 ? '(eksik)' : fark > 0 ? '(fazla)' : '(eşit)'}
              </p>
            </div>
        }
          </> :
        odenen > 0 && !tutarUyumlu &&
        <div
          role="alert"
          className="space-y-1 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          
            <p className="font-medium">
              {fark < 0 ?
            'Eksik ödeme nedeniyle kayıt oluşturulamaz.' :
            'Fazla ödeme tespit edildi.'}
            </p>
            <p>Hesaplanan tutar: {formatTL(beklenenTutar)}</p>
            <p>Ödenen tutar: {formatTL(odenen)}</p>
            <p>
              Fark: {formatTL(Math.abs(fark))}{' '}
              {fark < 0 ?
            '(eksik)' :
            '(fazla) — Ödenen tutar hesaplanan tutardan fazladır. Mali onay/politika gerektirir.'}
            </p>
          </div>
        }

        {!krediYuklemeTutarKurali && tutarUyumlu &&
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
            Ödenen tutar hesaplanan tutarla eşleşiyor: {formatTL(odenen)}
          </p>
        }
      </section>
      <section className="space-y-2 rounded-xl border border-border p-4" aria-labelledby="dogrulama-baslik">
        <h2 id="dogrulama-baslik" className="font-heading text-base font-semibold text-foreground">C — Dekont Doğrulama</h2>
        <div className="grid gap-1.5 text-sm">
          <p className={duplicateKaydi || duplicateReferansKaydi || hashDuplicateKaydi ? 'text-rose-700' : 'text-emerald-700'}>{duplicateKaydi || duplicateReferansKaydi || hashDuplicateKaydi ? '✕ Dekont daha önce kullanılmış' : '✓ Dekont ve dijital dosya daha önce kullanılmamış'}</p>
          <p className={!form.dekontNo.trim() ? 'text-rose-700' : 'text-emerald-700'}>{form.dekontNo.trim() ? '✓ Belge / dekont numarası mevcut' : '✕ Belge / dekont numarası eksik'}</p>
          <p className={!form.bankaReferansNo.trim() ? 'text-rose-700' : 'text-emerald-700'}>{form.bankaReferansNo.trim() ? '✓ Banka referans numarası mevcut' : '○ Banka referans numarası bulunamadı'}</p>
          <p className={!form.banka.trim() ? 'text-rose-700' : 'text-emerald-700'}>{form.banka.trim() ? '✓ Banka bilgisi mevcut' : '✕ Banka bilgisi eksik'}</p>
          <p className={gelecekTarih ? 'text-rose-700' : form.tarih ? 'text-emerald-700' : 'text-rose-700'}>{gelecekTarih ? '✕ Dekont tarihi gelecekte olamaz' : form.tarih ? '✓ Dekont tarihi geçerli' : '✕ Dekont tarihi eksik'}</p>
          <p className={!form.odemeYapan.trim() ? 'text-rose-700' : 'text-emerald-700'}>{form.odemeYapan.trim() ? '✓ Ödeme yapan bilgisi mevcut' : '✕ Ödeme yapan bilgisi eksik'}</p>
          <p className={!tutarGecerli ? 'text-rose-700' : 'text-emerald-700'}>{krediYuklemeTutarKurali ? tutarGecerli ? `✓ Dekont tutarı pozitif · Talep hedefi: ${formatTL(beklenenTutar)} · Dekontta ödenen: ${formatTL(odenen)} · Fark: ${formatTL(Math.abs(fark))}` : '✕ Dekont tutarı sıfırdan büyük olmalıdır' : tutarUyumlu ? '✓ Dekont tutarı hesaplanan tutarla eşleşiyor' : `✕ Dekont tutarı hesaplanan tutarla eşleşmiyor · Hesaplanan: ${formatTL(beklenenTutar)} · Dekontta ödenen: ${formatTL(odenen)} · Fark: ${formatTL(Math.abs(fark))}`}</p>
          {duplicateKaydi && <p className="text-rose-700">Kullanıldığı kayıt: <Link className="underline" to={`/kayitlar/${duplicateKaydi.islem.kayitNo}`}>{duplicateKaydi.islem.kayitNo}</Link></p>}
          {duplicateReferansKaydi && <p className="text-rose-700">Banka referansı kullanılan kayıt: <Link className="underline" to={`/kayitlar/${duplicateReferansKaydi.islem.kayitNo}`}>{duplicateReferansKaydi.islem.kayitNo}</Link></p>}
          {hashDuplicateKaydi && <p className="text-rose-700">Dijital dosya kullanıldığı kayıt: {hashDuplicateKaydi.islem.kayitNo}</p>}
          {benzerKaydi && !duplicateKaydi && !hashDuplicateKaydi && <p className="text-amber-700">Benzer bir ödeme kaydı bulundu: {benzerKaydi.islem.kayitNo}. Lütfen kontrol ediniz.</p>}
        </div>
      </section>
      <KuralNotu ton="uyari">Kayıt öncesinde yanlış dosya “Dosyayı kaldır” ile silinebilir. OCR başarısız olsa da bilgiler manuel tamamlanabilir.</KuralNotu>
      </>}

      {dosya && (
        <DekontIncelemeCalismaAlani
          acik={calismaAlaniAcik}
          kapat={() => setCalismaAlaniAcik(false)}
          dosya={dosya}
          alanlar={ocrAlanModelleri}
          seciliAlan={seciliAlan}
          beklenenTutar={beklenenTutar}
          tutarKurali={tutarKurali}
          kontrolEdilen={konumluKontrolEdilen}
          toplamZorunluAlan={ZORUNLU_DEKONT_ALANLARI.length}
          sorunSayisi={sorunSayisi}
          sorunlar={sorunlar}
          tekrarOkunuyor={tekrarOkunuyor}
          bolgeSecimModu={bolgeSecimModu}
          seciliBolge={seciliBolge}
          onAlanSec={setSeciliAlan}
          onDegerDegistir={calismaAlaniDegerDegistir}
          onAdaySec={calismaAlaniAdaySec}
          onDogrula={calismaAlaniDogrula}
          onDogrulaVeSonraki={calismaAlaniDogrulaVeSonraki}
          onBelgedenSec={calismaAlaniBelgedenSec}
          onBolgeSecildi={calismaAlaniBolgeSecildi}
          onBelgedeGoster={calismaAlaniBelgedeGoster}
          onBolgeTekrarOku={calismaAlaniBolgeTekrarOku}
          onNumaralariDegistir={numaralariDegistir}
          kontrolTamamlanabilir={calismaAlaniKontrolTamamlanabilir}
          onKontrolTamamla={calismaAlaniKontrolTamamla}
        />
      )}
      </section>
    </div>);

}