import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { KuralNotu } from '../components/common/KuralNotu';
import { BosDurum } from '../components/common/BosDurum';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'../components/ui/Select';
import { BentAlanlari, IslemFormu } from '../components/islem/BentAlanlari';
import { BOS_DEKONT, DekontBolumu, DekontFormu } from '../components/islem/DekontBolumu';
import { HesaplamaKutusu } from '../components/islem/HesaplamaKutusu';
import { bentler } from '../data/bentler';
import { sigortaBul } from '../data/sigortaSirketleri';
import { isletmeciBul, tasOcagiBul } from '../data/tasOcagi';
import { useApp } from '../contexts/AppContext';
import { BentKodu, DekontDosyasi, Islem, TrafikAltBasvuru } from '../types';
import { hesapla, patlatmaBedeli, raporBedeli } from '../utils/hesaplama';
import { altBasvuruNo, sonrakiKayitNo } from '../utils/numaralandirma';
import { formatTL } from '../utils/currency';

const BOS_FORM: IslemFormu = {
  bent: '',
  fAltTur: '',
  eIslemTuru: '',
  baslik: '',
  talepEden: '',
  etkinlikAdi: '',
  operasyonTarihi: '',
  operasyonSaati: '',
  yer: '',
  manuelTutar: '',
  adet: '',
  polisSayisi: '',
  gorevSuresi: '',
  krediAdedi: '',
  sigortaSirketiId: '',
  isletmeciId: '',
  tasOcagiId: '',
  notlar: ''
};

const BOS_ALT: TrafikAltBasvuru = {
  no: '',
  plaka: '',
  hasarDosyaNo: '',
  kazaTarihi: '',
  raporKonusu: '',
  raporTutari: 0
};

export function YeniIslem() {
  const {
    kullanici,
    bau,
    islemler,
    islemEkle,
    ajandaEkle,
    auditEkle,
    krediOzeti,
    krediHareketiEkle
  } = useApp();

  const [form, setForm] = useState<IslemFormu>(BOS_FORM);
  const [dekont, setDekont] = useState<DekontFormu>(BOS_DEKONT);
  const [dosya, setDosya] = useState<DekontDosyasi | null>(null);
  const [altSatirlar, setAltSatirlar] = useState<TrafikAltBasvuru[]>([]);
  const [sonKayit, setSonKayit] = useState<Islem | null>(null);

  const kullanilabilirBentler = useMemo(
    () => bentler.filter((b) => kullanici?.bentler.includes(b.kod)),
    [kullanici]
  );

  const guncelle = <K extends keyof IslemFormu,>(alan: K, deger: IslemFormu[K]) =>
  setForm((eski) => ({ ...eski, [alan]: deger }));

  const dekontGuncelle = (alan: keyof DekontFormu, deger: string) =>
  setDekont((eski) => ({ ...eski, [alan]: deger }));

  const trafik = form.bent === 'F' && form.fAltTur === 'TRAFIK';
  const krediYukleme = form.bent === 'E' && form.eIslemTuru === 'KREDI_YUKLEME';
  const krediKullanim = form.bent === 'E' && form.eIslemTuru === 'KREDI_KULLANIM';
  const ozet = form.isletmeciId ? krediOzeti(form.isletmeciId) : null;

  useEffect(() => {
    if (!trafik) {
      setAltSatirlar([]);
      return;
    }
    const adet = Number(form.adet) || 0;
    setAltSatirlar((eski) => Array.from({ length: adet }, (_, i) => eski[i] ?? { ...BOS_ALT }));
  }, [trafik, form.adet]);

  const sonuc = useMemo(
    () =>
    hesapla({
      bent: form.bent,
      fAltTur: form.fAltTur,
      bau,
      manuelTutar: form.manuelTutar ? Number(form.manuelTutar) : 0,
      adet: form.adet ? Number(form.adet) : 0,
      polisSayisi: form.polisSayisi ? Number(form.polisSayisi) : 0,
      gorevSuresi: form.gorevSuresi ? Number(form.gorevSuresi) : 0,
      krediAdedi: form.krediAdedi ? Number(form.krediAdedi) : 0
    }),
    [form, bau]
  );

  const kayitNoOnizleme = form.bent ?
  sonrakiKayitNo(islemler, form.bent as BentKodu, form.fAltTur, form.eIslemTuru) :
  '';

  const gosterilenAltlar = altSatirlar.map((satir, i) => ({
    ...satir,
    no: altBasvuruNo(kayitNoOnizleme, i + 1),
    raporTutari: raporBedeli(bau)
  }));

  const altGuncelle = (sira: number, alan: keyof TrafikAltBasvuru, deger: string) =>
  setAltSatirlar((eski) =>
  eski.map((satir, i) => i === sira ? { ...satir, [alan]: deger } : satir)
  );

  const odenen = Number(dekont.odenenTutar);
  const tutarUyumlu = odenen > 0 && Math.abs(odenen - sonuc.tutar) < 0.01;

  const dekontTamam =
  !!dosya &&
  dekont.dekontNo.trim() !== '' &&
  dekont.banka.trim() !== '' &&
  dekont.tarih !== '' &&
  dekont.odemeYapan.trim() !== '' &&
  tutarUyumlu;

  const temelTamam = form.baslik.trim() !== '' && form.talepEden.trim() !== '';

  const bentTamam = (() => {
    if (!form.bent) return false;
    if (form.bent === 'C' || form.bent === 'Ç') {
      return (
        sonuc.gecerli && !!form.operasyonTarihi && !!form.operasyonSaati && form.yer.trim() !== '');

    }
    if (form.bent === 'D') {
      return sonuc.gecerli && !!form.operasyonTarihi && form.yer.trim() !== '';
    }
    if (form.bent === 'F') {
      if (!form.fAltTur || !form.operasyonTarihi || !sonuc.gecerli) return false;
      if (!trafik) return true;
      if (!form.sigortaSirketiId) return false;
      return (
        altSatirlar.length > 0 &&
        altSatirlar.every((s) => s.plaka.trim() !== '' && s.kazaTarihi !== ''));

    }
    if (form.bent === 'E') {
      if (!form.eIslemTuru || !form.isletmeciId) return false;
      if (krediKullanim) {
        return (
          !!form.tasOcagiId &&
          !!form.operasyonTarihi &&
          !!form.operasyonSaati &&
          Number(form.krediAdedi) > 0);

      }
      return sonuc.gecerli;
    }
    return sonuc.gecerli;
  })();

  const kaydedilebilir =
  !!kullanici &&
  !kullanici.sadeceGoruntule &&
  temelTamam &&
  bentTamam && (
  krediKullanim || dekontTamam);

  const sifirla = () => {
    setForm(BOS_FORM);
    setDekont(BOS_DEKONT);
    setDosya(null);
    setAltSatirlar([]);
  };

  const kaydet = () => {
    if (!kullanici || !kaydedilebilir) return;
    const bent = form.bent as BentKodu;

    if (krediKullanim) {
      const kullanilacak = Number(form.krediAdedi);
      const mevcut = ozet?.kalan ?? 0;
      if (kullanilacak > mevcut) {
        auditEkle(
          'Kredi yetersiz işlem engellendi',
          `${isletmeciBul(form.isletmeciId)?.ad} · talep ${kullanilacak} / kullanılabilir ${mevcut}`
        );
        toast.error('Kullanılabilir kredi yetersiz', {
          description:
          'Önce kredi yükleme / ödeme doğrulama / makbuz süreci tamamlanmalıdır.'
        });
        return;
      }
    }

    const kayitNo = sonrakiKayitNo(islemler, bent, form.fAltTur, form.eIslemTuru);

    const altBasvurular: TrafikAltBasvuru[] | undefined = trafik ?
    altSatirlar.map((satir, i) => ({
      ...satir,
      no: altBasvuruNo(kayitNo, i + 1),
      raporKonusu: satir.raporKonusu.trim() || 'Trafik kaza raporu',
      raporTutari: raporBedeli(bau)
    })) :
    undefined;

    const yeni: Islem = {
      id: `is-${Date.now()}`,
      kayitNo,
      bent,
      fAltTur: form.fAltTur || undefined,
      eIslemTuru: form.eIslemTuru || undefined,
      baslik: form.baslik.trim(),
      talepEden: form.talepEden.trim(),
      birim: kullanici.birim,
      olusturan: kullanici.rol,
      olusturmaTarihi: new Date().toISOString().slice(0, 10),
      operasyonTarihi: form.operasyonTarihi || undefined,
      operasyonSaati: form.operasyonSaati || undefined,
      yer: form.yer.trim() || undefined,
      etkinlikAdi: form.etkinlikAdi.trim() || undefined,
      polisSayisi: bent === 'D' ? Number(form.polisSayisi) : undefined,
      gorevSuresi: bent === 'D' ? Number(form.gorevSuresi) : undefined,
      tutar: krediKullanim ? 0 : sonuc.tutar,
      hesaplamaAciklamasi: krediKullanim ?
      `Kredi kullanımı — yeniden ödeme alınmaz. Ön ödemeli krediden ${form.krediAdedi} kredi düşüldü.` :
      sonuc.satirlar.join(' · '),
      dekont: krediKullanim ?
      {
        dekontNo: 'Ön ödemeli kredi',
        banka: '—',
        tarih: '',
        odenenTutar: 0,
        odemeYapan: isletmeciBul(form.isletmeciId)?.ad ?? '—',
        dosya: null
      } :
      {
        dekontNo: dekont.dekontNo.trim(),
        banka: dekont.banka.trim(),
        tarih: dekont.tarih,
        odenenTutar: odenen,
        odemeYapan: dekont.odemeYapan.trim(),
        dosya
      },
      makbuzNo: null,
      durum: krediKullanim ?
      'ISLEM_BASLATILABILIR' :
      krediYukleme ?
      'ODEME_BEKLIYOR' :
      'MAKBUZ_BEKLIYOR',
      sigortaSirketiId: trafik ? form.sigortaSirketiId : undefined,
      altBasvurular,
      isletmeciId: bent === 'E' ? form.isletmeciId : undefined,
      tasOcagiId: krediKullanim ? form.tasOcagiId : undefined,
      krediAdedi: bent === 'E' ? Number(form.krediAdedi) : undefined,
      notlar: form.notlar.trim() || undefined
    };

    islemEkle(yeni);
    auditEkle('Kayıt oluşturuldu', kayitNo);
    if (trafik) {
      auditEkle('Trafik ana TTRF oluşturuldu', kayitNo);
      altBasvurular?.forEach((alt) =>
      auditEkle('Trafik alt başvuru oluşturuldu', `${alt.no} · ${alt.plaka}`)
      );
    }

    if (krediYukleme) {
      krediHareketiEkle({
        id: `kh-${Date.now()}`,
        isletmeciId: form.isletmeciId,
        tip: 'YUKLEME',
        adet: Number(form.krediAdedi),
        kayitNo,
        dekontNo: dekont.dekontNo.trim(),
        tarih: dekont.tarih,
        aciklama: `${form.krediAdedi} patlatmalık ön ödeme alındı (doğrulama bekliyor).`
      });
      auditEkle(
        'Taş ocağı kredi yüklendi',
        `${isletmeciBul(form.isletmeciId)?.ad} · +${form.krediAdedi} kredi (doğrulama bekliyor)`
      );
    }

    if (krediKullanim) {
      krediHareketiEkle({
        id: `kh-${Date.now()}`,
        isletmeciId: form.isletmeciId,
        tip: 'KULLANIM',
        adet: Number(form.krediAdedi),
        kayitNo,
        tasOcagiId: form.tasOcagiId,
        tarih: form.operasyonTarihi,
        aciklama: `${tasOcagiBul(form.tasOcagiId)?.ad} — planlı patlatma.`
      });
      auditEkle(
        'Taş ocağı kredi kullanıldı',
        `${kayitNo} · -${form.krediAdedi} kredi · ${tasOcagiBul(form.tasOcagiId)?.ad}`
      );
    }

    const ajandayaDuser =
    bent === 'C' || bent === 'Ç' || bent === 'D' || bent === 'F' || krediKullanim;
    if (ajandayaDuser) {
      ajandaEkle({
        id: `aj-${Date.now()}`,
        kayitNo,
        bent,
        islemTuru: krediKullanim ?
        'Patlatma kullanımı' :
        bent === 'F' ?
        `${form.fAltTur === 'TRAFIK' ? 'Trafik' : 'Adli'} polis raporu${
        trafik ? ` (${altSatirlar.length} alt başvuru)` : ''}` :

        bentler.find((b) => b.kod === bent)?.baslik ?? '',
        baslik: form.etkinlikAdi.trim() || yeni.baslik,
        talepEden: krediKullanim ?
        isletmeciBul(form.isletmeciId)?.ad ?? yeni.talepEden :
        yeni.talepEden,
        birim: kullanici.birim,
        tarih: form.operasyonTarihi,
        saat: form.operasyonSaati || '09:00',
        yer: krediKullanim ? tasOcagiBul(form.tasOcagiId)?.ad ?? '—' : form.yer.trim() || '—',
        durum: 'Planlandı',
        odemeDurumu: krediKullanim ?
        `Ön ödemeli kredi · ${form.krediAdedi} kredi düşüldü · Kalan ${
        (ozet?.kalan ?? 0) - Number(form.krediAdedi)}` :

        `Ödeme alındı · Makbuz bekliyor · ${formatTL(yeni.tutar)}`
      });
    }

    setSonKayit(yeni);
    toast.success('İşlem kaydı oluşturuldu', {
      description: `Kayıt no: ${kayitNo} · Numara sistem tarafından üretildi.`
    });
    sifirla();
  };

  if (!kullanici) return null;

  if (!kullanilabilirBentler.length) {
    return (
      <div className="space-y-6">
        <PageHeader baslik="Yeni İşlem" aciklama={`${kullanici.rol} · ${kullanici.birim}`} />
        <BosDurum
          baslik="Bu kullanıcı için işlem yapılabilir bent bulunmuyor"
          aciklama="Rol ve birim yetkiniz yalnızca görüntüleme ve rapor kapsamındadır. Yetkili bent tanımı Kullanıcı / Rol / Birim Yetkileri ekranından yapılır." />
        
      </div>);

  }

  const secilenBent = bentler.find((b) => b.kod === form.bent);
  const kaynakEtiketi = form.bent ?
  `${form.bent} bendi · ${form.talepEden || 'Başvuru sahibi'}` :
  'Yeni işlem';

  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Yeni İşlem"
        aciklama={`Kayıt numarası sistem tarafından üretilir. BAÜ: ${formatTL(
          bau
        )} · Dekont dosyası olmadan ödeme gerektiren kayıt oluşturulamaz.`} />
      

      {sonKayit &&
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          <span>
            <strong className="font-mono">{sonKayit.kayitNo}</strong> kaydı oluşturuldu. Makbuz
            süreci Ödeme / Makbuz ekranından yürütülür.
          </span>
        </div>
      }

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-5 rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-base font-semibold">İşlem Bilgisi</h2>

            <div className="sm:max-w-sm">
              <Label htmlFor="bent">Bent</Label>
              <Select
                value={form.bent || undefined}
                onValueChange={(v) => {
                  setForm({ ...BOS_FORM, bent: v as BentKodu });
                  setDosya(null);
                  setDekont(BOS_DEKONT);
                  setAltSatirlar([]);
                }}>
                
                <SelectTrigger id="bent" className="mt-1.5">
                  <SelectValue placeholder="Lütfen bent seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {kullanilabilirBentler.map((b) =>
                  <SelectItem key={b.kod} value={b.kod}>
                      {b.kod} - {b.baslik}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {secilenBent &&
              <p className="mt-1.5 text-xs text-muted-foreground">{secilenBent.aciklama}</p>
              }
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="baslik">İşlem konusu</Label>
                <Input
                  id="baslik"
                  value={form.baslik}
                  onChange={(e) => guncelle('baslik', e.target.value)}
                  placeholder="Örn. İtfaiye denetim ve kontrol raporu"
                  className="mt-1.5" />
                
              </div>
              <div>
                <Label htmlFor="talep-eden">Talep eden kişi / kurum</Label>
                <Input
                  id="talep-eden"
                  value={form.talepEden}
                  onChange={(e) => guncelle('talepEden', e.target.value)}
                  placeholder="Örn. Palm Beach Otel"
                  className="mt-1.5" />
                
              </div>
            </div>

            <BentAlanlari
              form={form}
              guncelle={guncelle}
              krediOzeti={ozet}
              patlatmaBedeliTutar={patlatmaBedeli(bau)}
              raporBedeliTutar={raporBedeli(bau)}
              altBasvurular={gosterilenAltlar}
              altGuncelle={altGuncelle} />
            

            <div>
              <Label htmlFor="notlar">Açıklama / görev notu</Label>
              <Textarea
                id="notlar"
                value={form.notlar}
                onChange={(e) => guncelle('notlar', e.target.value)}
                rows={3}
                className="mt-1.5" />
              
            </div>
          </section>

          {krediKullanim ?
          <section className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-heading text-base font-semibold">Ödeme / Dekont</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Patlatma kullanımında ödeme yeniden alınmaz. Ödeme ve dekont, işletmecinin kredi
                yükleme kaydında (EKRD serisi) bulunur.
              </p>
              <div className="mt-4">
                <KuralNotu
                baslik="Kullanılabilir kredi kontrolü"
                ton={
                ozet && Number(form.krediAdedi) > ozet.kalan ? 'uyari' : 'bilgi'
                }>
                
                  {ozet ?
                `Kullanılabilir kalan kredi: ${ozet.kalan} · Doğrulama bekleyen: ${
                ozet.dogrulamaBekleyen} · Kullanılacak: ${
                form.krediAdedi || 0}. ${
                Number(form.krediAdedi) > ozet.kalan ?
                'Kullanılabilir kredi yetersiz. Önce kredi yükleme / ödeme doğrulama / makbuz süreci tamamlanmalıdır.' :
                'Kayıt oluşturulduğunda kredi işletmeci hesabından düşer.'}` :

                'Kredi kontrolü için işletmeci seçilmelidir.'}
                </KuralNotu>
              </div>
            </section> :

          <section className="rounded-xl border border-border bg-card p-5">
              <DekontBolumu
              form={dekont}
              guncelle={dekontGuncelle}
              dosya={dosya}
              dosyaAta={setDosya}
              kaynakEtiketi={kaynakEtiketi}
              beklenenTutar={sonuc.tutar}
              auditEkle={auditEkle} />
            
            </section>
          }
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <HesaplamaKutusu sonuc={sonuc} />

          {trafik && form.sigortaSirketiId &&
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
              <p className="font-medium text-foreground">Trafik başvuru kaynağı</p>
              <p className="mt-1 text-muted-foreground">{sigortaBul(form.sigortaSirketiId)?.ad}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Ana kayıt TTRF serisinde açılır, {altSatirlar.length} alt başvuru ana kayda
                bağlanır. Ödeme, dekont ve makbuz yalnızca ana kayda işlenir.
              </p>
            </div>
          }

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">Kayıt numarası</p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {kayitNoOnizleme || '—'}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Numara merkezi sistem tarafından üretilir; kullanıcı tarafından yazılamaz. Eşzamanlı
              işlemlerde transaction, sequence ve unique constraint ile çakışma önlenir.
            </p>
          </div>

          <Button className="w-full" size="lg" disabled={!kaydedilebilir} onClick={kaydet}>
            <Save className="h-4 w-4" aria-hidden="true" />
            İşlemi kaydet
          </Button>
          {!kaydedilebilir &&
          <p className="text-xs text-muted-foreground">
              {krediKullanim ?
            'Kayıt için işletmeci, taş ocağı, patlatma tarihi/saati ve kullanılacak kredi girilmelidir.' :
            'Kayıt için işlem bilgileri, operasyon tarihi, hesaplama, dekont alanları, dijital dekont dosyası ve hesaplanan tutarla eşleşen ödeme tamamlanmalıdır.'}
            </p>
          }
          <Button variant="ghost" className="w-full" onClick={sifirla}>
            Formu sıfırla
          </Button>
        </aside>
      </div>
    </div>);

}