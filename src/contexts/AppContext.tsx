import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  AjandaDurumu,
  AjandaKaydi,
  AuditKaydi,
  BagisMakbuzu,
  BentKodu,
  BilgiKaynagi,
  Birim,
  Dekont,
  DekontDosyasi,
  PatlatmaSonucu,
  Islem,
  Isletmeci,
  KrediHareketi,
  Kullanici,
  MaliYilArsivi,
  SigortaSirketi,
  TasOcagi } from
'../types';
import { kullanicilar as baslangicKullanicilari } from '../data/kullanicilar';
import { baslangicBirimleri } from '../data/birimler';
import { baslangicIslemleri } from '../data/islemler';
import { baslangicAjandasi } from '../data/ajanda';
import { baslangicAuditKayitlari } from '../data/auditLog';
import { sigortaSirketleri as baslangicSigortalari } from '../data/sigortaSirketleri';
import {
  isletmeciler as baslangicIsletmecileri,
  tasOcaklari as baslangicOcaklari,
  krediHareketleri as baslangicKredileri } from
'../data/tasOcagi';
import { maliYilArsivleri } from '../data/arsiv';
import { sonrakiKayitNo, sonrakiMakbuzNo } from '../utils/numaralandirma';
import { patlatmaBedeli, VARSAYILAN_BAU } from '../utils/hesaplama';
import { formatTL, formatTarihSaat } from '../utils/currency';
import {
  ajandaIslemiYapilabilirMi,
  ajandaKaydiGorulebilirMi,
  auditKaydiGorulebilirMi,
  ekranGorulebilirMi,
  islemDegistirilebilirMi,
  islemGorulebilirMi,
  kullaniciDenetciMi,
  kullaniciMaliVeriGorebilir,
  kullaniciMerkezAdminMi,
  kullaniciTumVeriGorebilir,
  makbuzUretilebilirMi,
  maliKayitGorulebilirMi,
  maliKayitMi,
  odemeDogrulanabilirMi,
  yonetimEkraniGorulebilirMi } from
'../utils/yetki';
import { krediYuklemeDekontMukerrerliginiBul, krediYuklemeKaydiniCozumle, krediYuklemeDekontKimligi, islemBagisMakbuzlariniOku, islemDekontlariniOku } from '../utils/krediYukleme';

export interface KrediOzeti {
  /** Ödemesi alınan toplam kredi */
  yuklenen: number;
  /** Ödeme doğrulanmış / makbuzu kesilmiş, kullanıma hazır kredi */
  kullanilabilir: number;
  /** Gerçekleşme raporu işlenmiş, fiilen düşülmüş kredi */
  kullanilan: number;
  /** Planlanmış ancak gerçekleşme raporu beklenen kredi (henüz düşülmedi) */
  planlanan: number;
  /** Kullanılabilir - kullanılan */
  kalan: number;
  /** Ödeme doğrulaması veya makbuz bekleyen, henüz kullanılamayan kredi */
  dogrulamaBekleyen: number;
}

export interface GerceklesmeGirdisi {
  isletmeciId: string;
  tasOcagiId: string;
  planKayitNo?: string;
  ajandaId?: string;
  tarih: string;
  saat: string;
  adet: number;
  /** Varsa belge / bildirim no — zorunlu değildir. */
  raporNo?: string;
  bildiren?: string;
  bilgiKaynagi: BilgiKaynagi;
  aciklama: string;
  raporDosyasi?: DekontDosyasi | null;
}

/** Patlatma planlama (EKPL) — kredi bu aşamada DÜŞMEZ. */
export interface PlanGirdisi {
  isletmeciId: string;
  tasOcagiId: string;
  tarih: string;
  saat: string;
  adet: number;
  bilgiKaynagi: BilgiKaynagi;
  belgeNo?: string;
  aciklama?: string;
  dosya?: DekontDosyasi | null;
}

export interface PlanSonucu {
  basarili: boolean;
  kayitNo?: string;
  mesaj?: string;
  krediYetersiz?: boolean;
}

/** Yapılmadı / Ertelendi / İptal — kredi düşülmez. */
export interface SonucGirdisi {
  ajandaId: string;
  sonuc: Exclude<PatlatmaSonucu, 'YAPILDI'>;
  bilgiKaynagi: BilgiKaynagi;
  neden?: string;
  aciklama?: string;
  belgeNo?: string;
  yeniTarih?: string;
  yeniSaat?: string;
}

export interface GerceklesmeSonucu {
  basarili: boolean;
  kayitNo?: string;
  mesaj?: string;
  oncekiKredi?: number;
  kalanKredi?: number;
}

export interface GirisSonucu {
  basarili: boolean;
  mesaj?: string;
}

export interface IslemSonucu {
  basarili: boolean;
  mesaj: string;
}

export interface OdemeDogrulamaSonucu extends IslemSonucu {
  dogrulananDekontId?: string;
  kullanilabilirKrediAdedi?: number;
  olusanKrediAdedi?: number;
}

export interface MakbuzUretimSonucu extends IslemSonucu {
  makbuzNumaralari?: string[];
}

export type KrediYuklemeDekontKaydiGirdisi = Pick<
Dekont,
'dekontNo' |
'bankaReferansNo' |
'banka' |
'tarih' |
'odenenTutar' |
'odemeYapan' |
'dosya' |
'ocrDurumu' |
'ocrOkunanAlanlar' |
'ocrGuvenBilgileri' |
'ocrIlkDegerleri' |
'ocrDogrulananDegerleri'
>;

interface AppContextDegeri {
  kullanici: Kullanici | null;
  giris: (kullaniciAdi: string, sifre: string) => GirisSonucu;
  cikis: () => void;
  kullanicilar: Kullanici[];
  kullaniciKaydet: (kullanici: Kullanici) => {basarili: boolean;mesaj?: string;};
  kullaniciAktiflikDegistir: (id: string, aktif: boolean) => void;
  sifreSifirla: (id: string, yeniSifre: string) => void;
  birimler: Birim[];
  birimBul: (id?: string) => Birim | undefined;
  birimKaydet: (birim: Birim) => {basarili: boolean;mesaj?: string;};
  birimAktiflikDegistir: (id: string, aktif: boolean) => void;
  birimKullanicilari: (birimId: string) => Kullanici[];
  yonetimYetkisi: boolean;
  kullaniciYonetimiYetkisi: boolean;
  birimYonetimiYetkisi: boolean;
  /** Menü gizlemek yetmez; route/ekran erişimi de bu fonksiyonla korunur. */
  ekranGorulebilir: (menuId: string) => boolean;
  merkezAdminMi: boolean;
  denetciMi: boolean;
  tumVeriGorebilir: boolean;
  maliVeriGorebilir: boolean;
  /** Aktif kullanıcının görebileceği işlem kayıtları. */
  gorunurIslemler: Islem[];
  /** Aktif kullanıcının görebileceği mali kayıtlar (ödeme doğuran kayıtlar). */
  gorunurMaliKayitlar: Islem[];
  gorunurAjanda: AjandaKaydi[];
  gorunurAuditKayitlari: AuditKaydi[];
  islemGorulebilir: (islem: Islem) => boolean;
  maliKayitGorulebilir: (islem: Islem) => boolean;
  ajandaKaydiGorulebilir: (kayit: AjandaKaydi) => boolean;
  islemDegistirilebilir: (islem: Islem) => boolean;
  makbuzUretilebilir: (islem: Islem) => boolean;
  odemeDogrulanabilir: (islem: Islem) => boolean;
  ajandaIslemiYapilabilir: (kayit: AjandaKaydi) => boolean;
  islemBul: (kayitNo?: string) => Islem | undefined;
  bau: number;
  bauGuncelle: (deger: number) => void;
  islemler: Islem[];
  islemEkle: (islem: Islem) => void;
  makbuzUret: (islemId: string) => MakbuzUretimSonucu;
  odemeDogrula: (islemId: string, dekontId?: string) => OdemeDogrulamaSonucu;
  krediYuklemeDekontEkle: (islemId: string, girdi: KrediYuklemeDekontKaydiGirdisi) => IslemSonucu;
  ajanda: AjandaKaydi[];
  ajandaEkle: (kayit: AjandaKaydi) => void;
  ajandaDurumGuncelle: (id: string, durum: AjandaDurumu) => void;
  auditKayitlari: AuditKaydi[];
  auditEkle: (eylem: string, hedef: string) => void;
  krediHareketleri: KrediHareketi[];
  krediHareketiEkle: (hareket: KrediHareketi) => void;
  krediOzeti: (isletmeciId: string) => KrediOzeti;
  /** Patlatma planlar (EKPL). Kredi bu aşamada düşülmez. */
  patlatmaPlanla: (girdi: PlanGirdisi) => PlanSonucu;
  /** “Yapıldı” sonucunu işler; kredi düşümü SADECE burada yapılır (EKGR). */
  patlatmaGerceklesmeIsle: (girdi: GerceklesmeGirdisi) => GerceklesmeSonucu;
  /** Yapılmadı / Ertelendi / İptal sonucunu işler; kredi düşülmez. */
  patlatmaSonucIsle: (girdi: SonucGirdisi) => {basarili: boolean;mesaj?: string;};
  sigortalar: SigortaSirketi[];
  sigortaBul: (id?: string) => SigortaSirketi | undefined;
  sigortaKaydet: (sirket: SigortaSirketi) => void;
  isletmeciler: Isletmeci[];
  isletmeciBul: (id?: string) => Isletmeci | undefined;
  isletmeciKaydet: (isletmeci: Isletmeci) => void;
  tasOcaklari: TasOcagi[];
  tasOcagiBul: (id?: string) => TasOcagi | undefined;
  tasOcagiKaydet: (ocak: TasOcagi) => void;
  arsivler: MaliYilArsivi[];
  manifestOlustur: (yil: number) => void;
  arsivDogrula: (yil: number) => void;
  menuGorunur: (menuId: string) => boolean;
  bentKullanilabilir: (bent: BentKodu) => boolean;
}

const AppContext = createContext<AppContextDegeri | null>(null);

function simdiEtiketi(): string {
  const d = new Date();
  const iki = (n: number) => n.toString().padStart(2, '0');
  return `${iki(d.getDate())}.${iki(d.getMonth() + 1)}.${d.getFullYear()} · ${iki(
    d.getHours()
  )}:${iki(d.getMinutes())}`;
}

export function AppProvider({
  children,
  baslangicKullanicisi = null



}: {children: React.ReactNode;baslangicKullanicisi?: Kullanici | null;}) {
  const [kullanici, setKullanici] = useState<Kullanici | null>(baslangicKullanicisi);
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>(baslangicKullanicilari);
  const [birimler, setBirimler] = useState<Birim[]>(baslangicBirimleri);
  const [bau, setBau] = useState(VARSAYILAN_BAU);
  const [islemler, setIslemler] = useState<Islem[]>(baslangicIslemleri);
  const [ajanda, setAjanda] = useState<AjandaKaydi[]>(baslangicAjandasi);
  const [auditKayitlari, setAuditKayitlari] = useState<AuditKaydi[]>(baslangicAuditKayitlari);
  const [krediHareketleri, setKrediHareketleri] = useState<KrediHareketi[]>(baslangicKredileri);
  const [arsivler, setArsivler] = useState<MaliYilArsivi[]>(maliYilArsivleri);
  const [sigortalar, setSigortalar] = useState<SigortaSirketi[]>(baslangicSigortalari);
  const [isletmeciler, setIsletmeciler] = useState<Isletmeci[]>(baslangicIsletmecileri);
  const [tasOcaklari, setTasOcaklari] = useState<TasOcagi[]>(baslangicOcaklari);
  const birimKrediBedeli = useMemo(() => patlatmaBedeli(bau), [bau]);

  const yuklemeHareketAdedi = useCallback(
    (hareketler: KrediHareketi[], kayitNo: string) =>
    hareketler.
    filter((hareket) => hareket.tip === 'YUKLEME' && hareket.kayitNo === kayitNo).
    reduce((toplam, hareket) => toplam + hareket.adet, 0),
    []
  );

  const krediYuklemeAnaliziniOlustur = useCallback(
    (islem: Islem, hareketler: KrediHareketi[] = krediHareketleri) =>
    krediYuklemeKaydiniCozumle({
      islem,
      birimKrediBedeli,
      mevcutYuklemeAdedi: yuklemeHareketAdedi(hareketler, islem.kayitNo)
    }),
    [birimKrediBedeli, krediHareketleri, yuklemeHareketAdedi]
  );

  const krediYuklemeKaydiniGuncelle = useCallback(
    (
      islem: Islem,
      hareketler: KrediHareketi[] = krediHareketleri,
      makbuzUreten?: string,
      bagisMakbuzlari?: BagisMakbuzu[]
    ): Islem => {
      const girdi = bagisMakbuzlari ? { ...islem, bagisMakbuzlari } : islem;
      const analiz = krediYuklemeKaydiniCozumle({
        islem: girdi,
        birimKrediBedeli,
        mevcutYuklemeAdedi: yuklemeHareketAdedi(hareketler, islem.kayitNo)
      });
      return {
        ...islem,
        dekont: analiz.guncelDekontlar[0] ?? islem.dekont,
        dekontlar: analiz.guncelDekontlar,
        bagisMakbuzlari: analiz.bagisMakbuzlari.length ? analiz.bagisMakbuzlari : undefined,
        krediTalebiOdemeOzeti: analiz.krediTalebiOdemeOzeti,
        makbuzNo: analiz.makbuzNoAlias,
        makbuzUreten:
        analiz.bagisMakbuzlari.length ?
        makbuzUreten ?? islem.makbuzUreten :
        islem.makbuzUreten,
        durum: analiz.kayitDurumu
      };
    },
    [birimKrediBedeli, krediHareketleri, yuklemeHareketAdedi]
  );

  const auditYaz = useCallback((kullaniciAdi: string, eylem: string, hedef: string) => {
    setAuditKayitlari((eski) => [
    { id: `au-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`, zaman: simdiEtiketi(), kullanici: kullaniciAdi, eylem, hedef },
    ...eski]
    );
  }, []);

  const auditEkle = useCallback(
    (eylem: string, hedef: string) => {
      auditYaz(kullanici?.adSoyad ?? 'Sistem', eylem, hedef);
    },
    [auditYaz, kullanici]
  );

  const giris = useCallback(
    (kullaniciAdi: string, sifre: string): GirisSonucu => {
      const bulunan = kullanicilar.find(
        (k) => k.kullaniciAdi === kullaniciAdi.trim().toLowerCase() && k.sifre === sifre
      );
      if (!bulunan) return { basarili: false, mesaj: 'Kullanıcı adı veya şifre hatalı.' };
      if (!bulunan.aktif) {
        return {
          basarili: false,
          mesaj: 'Bu kullanıcı pasif durumdadır ve giriş yapamaz. Merkez Admin ile iletişime geçin.'
        };
      }
      setKullanici(bulunan);
      auditYaz(bulunan.adSoyad, 'Giriş yapıldı', `${bulunan.kullaniciAdi} · ${bulunan.birim}`);
      return { basarili: true };
    },
    [auditYaz, kullanicilar]
  );

  const cikis = useCallback(() => setKullanici(null), []);

  const kullaniciKaydet = useCallback(
    (hedef: Kullanici) => {
      const ad = hedef.kullaniciAdi.trim().toLowerCase();
      if (!ad) return { basarili: false, mesaj: 'Kullanıcı adı boş olamaz.' };
      if (!hedef.sifre.trim()) return { basarili: false, mesaj: 'Şifre boş olamaz.' };
      if (kullanicilar.some((k) => k.kullaniciAdi === ad && k.id !== hedef.id)) {
        return { basarili: false, mesaj: 'Bu kullanıcı adı zaten kullanılıyor.' };
      }
      const kayit = { ...hedef, kullaniciAdi: ad };
      const yeniMi = !kullanicilar.some((k) => k.id === hedef.id);
      setKullanicilar((eski) =>
      yeniMi ? [kayit, ...eski] : eski.map((k) => k.id === kayit.id ? kayit : k)
      );
      if (kullanici?.id === kayit.id) setKullanici(kayit);
      auditEkle(
        yeniMi ? 'Kullanıcı oluşturuldu' : 'Kullanıcı güncellendi',
        `${kayit.kullaniciAdi} · ${kayit.rol} · ${kayit.birim} · ${kayit.aktif ? 'Aktif' : 'Pasif'}`
      );
      return { basarili: true };
    },
    [kullanicilar, kullanici, auditEkle]
  );

  const kullaniciAktiflikDegistir = useCallback(
    (id: string, aktif: boolean) => {
      const hedef = kullanicilar.find((k) => k.id === id);
      setKullanicilar((eski) => eski.map((k) => k.id === id ? { ...k, aktif } : k));
      auditEkle(
        aktif ? 'Kullanıcı aktife alındı' : 'Kullanıcı pasife alındı',
        `${hedef?.kullaniciAdi ?? id} · ${hedef?.rol ?? ''}`
      );
    },
    [kullanicilar, auditEkle]
  );

  const sifreSifirla = useCallback(
    (id: string, yeniSifre: string) => {
      const hedef = kullanicilar.find((k) => k.id === id);
      setKullanicilar((eski) => eski.map((k) => k.id === id ? { ...k, sifre: yeniSifre } : k));
      auditEkle('Kullanıcı şifresi sıfırlandı', `${hedef?.kullaniciAdi ?? id}`);
    },
    [kullanicilar, auditEkle]
  );

  const birimBul = useCallback((id?: string) => birimler.find((b) => b.id === id), [birimler]);

  const birimKullanicilari = useCallback(
    (birimId: string) => kullanicilar.filter((k) => k.birimId === birimId),
    [kullanicilar]
  );

  const birimKaydet = useCallback(
    (birim: Birim) => {
      if (!birim.ad.trim()) return { basarili: false, mesaj: 'Birim adı boş olamaz.' };
      if (!birim.kod.trim()) return { basarili: false, mesaj: 'Birim kodu boş olamaz.' };
      if (birimler.some((b) => b.kod.toUpperCase() === birim.kod.trim().toUpperCase() && b.id !== birim.id)) {
        return { basarili: false, mesaj: 'Bu birim kodu zaten kullanılıyor.' };
      }
      const kayit = { ...birim, ad: birim.ad.trim(), kod: birim.kod.trim().toUpperCase() };
      const yeniMi = !birimler.some((b) => b.id === birim.id);
      setBirimler((eski) =>
      yeniMi ? [kayit, ...eski] : eski.map((b) => b.id === kayit.id ? kayit : b)
      );
      auditEkle(
        yeniMi ? 'Birim oluşturuldu' : 'Birim güncellendi',
        `${kayit.ad} (${kayit.kod}) · ${kayit.aktif ? 'Aktif' : 'Pasif'}`
      );
      return { basarili: true };
    },
    [birimler, auditEkle]
  );

  const birimAktiflikDegistir = useCallback(
    (id: string, aktif: boolean) => {
      const hedef = birimler.find((b) => b.id === id);
      setBirimler((eski) => eski.map((b) => b.id === id ? { ...b, aktif } : b));
      auditEkle(
        aktif ? 'Birim aktife alındı' : 'Birim pasife alındı',
        `${hedef?.ad ?? id} · Bağlı kullanıcı: ${kullanicilar.filter((k) => k.birimId === id).length}`
      );
    },
    [birimler, kullanicilar, auditEkle]
  );

  const bauGuncelle = useCallback(
    (deger: number) => {
      setBau(deger);
      auditEkle('BAÜ güncellendi', `Brüt asgari ücret: ${formatTL(deger)}`);
    },
    [auditEkle]
  );

  /** Yeni kayıtlar aktif kullanıcının birimi ve kimliği ile damgalanır. */
  const islemEkle = useCallback(
    (islem: Islem) => {
      const damgali: Islem = {
        ...islem,
        birim: islem.birim || kullanici?.birim || '—',
        birimId: islem.birimId ?? kullanici?.birimId,
        olusturan: islem.olusturan || kullanici?.rol || 'Sistem',
        olusturanKullaniciId: islem.olusturanKullaniciId ?? kullanici?.id
      };
      setIslemler((eski) => [damgali, ...eski]);
    },
    [kullanici]
  );

  const islemBul = useCallback(
    (kayitNo?: string) => islemler.find((i) => i.kayitNo === kayitNo || i.id === kayitNo),
    [islemler]
  );

  const makbuzUret = useCallback(
    (islemId: string): MakbuzUretimSonucu => {
      const hedef = islemler.find((i) => i.id === islemId);
      if (!hedef) {
        return { basarili: false, mesaj: 'Makbuz üretilecek kayıt bulunamadı.' };
      }
      if (!makbuzUretilebilirMi(kullanici, hedef)) {
        return { basarili: false, mesaj: 'Bu kayıt için makbuz üretme yetkiniz yok.' };
      }

      if (hedef.eIslemTuru === 'KREDI_YUKLEME') {
        const analiz = krediYuklemeAnaliziniOlustur(hedef);
        if (!analiz.makbuzEksikleri.length) {
          return {
            basarili: false,
            mesaj:
            analiz.bagisMakbuzlari.length > 0 ?
            'Bu kredi talebi için bekleyen bağış makbuzu bulunmuyor.' :
            'Önce en az bir dekont doğrulanmalıdır.'
          };
        }

        const uretilenMakbuzlar: string[] = [];
        let guncelIslemler = islemler.slice();

        for (const eksik of analiz.makbuzEksikleri) {
          const sonDurum = guncelIslemler.find((islem) => islem.id === islemId);
          if (!sonDurum) {
            return { basarili: false, mesaj: 'Kayıt güncellenirken bulunamadı.' };
          }
          const yeniNo = sonrakiMakbuzNo(guncelIslemler);
          const yeniMakbuz: BagisMakbuzu = {
            makbuzNo: yeniNo,
            tur: eksik.tur,
            tutar: eksik.tutar,
            bagliDekontId: eksik.bagliDekontId,
            bagliDekontNo: eksik.bagliDekontNo,
            bagliDekontReferansi: eksik.bagliDekontReferansi,
            bagliDekontTarihi: eksik.bagliDekontTarihi,
            odemeYapan: eksik.odemeYapan,
            olusturmaTarihi: new Date().toISOString().slice(0, 10)
          };
          uretilenMakbuzlar.push(yeniNo);
          const guncelMakbuzlar = [...islemBagisMakbuzlariniOku(sonDurum, birimKrediBedeli), yeniMakbuz];
          const guncelKayit = krediYuklemeKaydiniGuncelle(
            { ...sonDurum, bagisMakbuzlari: guncelMakbuzlar },
            krediHareketleri,
            kullanici?.rol,
            guncelMakbuzlar
          );
          guncelIslemler = guncelIslemler.map((islem) => islem.id === islemId ? guncelKayit : islem);
        }

        setIslemler(guncelIslemler);
        auditEkle(
          'Bağış makbuzları üretildi',
          `${hedef.kayitNo} · ${uretilenMakbuzlar.join(', ')}`
        );
        return {
          basarili: true,
          mesaj: `${uretilenMakbuzlar.length} bağış makbuzu üretildi.`,
          makbuzNumaralari: uretilenMakbuzlar
        };
      }

      if (hedef.makbuzNo) {
        return { basarili: false, mesaj: `Bu kayda zaten makbuz üretilmiş: ${hedef.makbuzNo}` };
      }

      const uretilen = sonrakiMakbuzNo(islemler);
      setIslemler((eski) =>
        eski.map((i) =>
          i.id === islemId ?
          {
            ...i,
            makbuzNo: uretilen,
            makbuzUreten: kullanici?.rol,
            durum: 'ISLEM_BASLATILABILIR' as const
          } :
          i
        )
      );
      return {
        basarili: true,
        mesaj: `Makbuz üretildi: ${uretilen}`,
        makbuzNumaralari: [uretilen]
      };
    },
    [
    islemler,
    kullanici,
    auditEkle,
    krediHareketleri,
    krediYuklemeAnaliziniOlustur,
    krediYuklemeKaydiniGuncelle,
    birimKrediBedeli]
  );

  const odemeDogrula = useCallback(
    (islemId: string, dekontId?: string): OdemeDogrulamaSonucu => {
      const hedef = islemler.find((i) => i.id === islemId);
      if (!hedef) {
        return { basarili: false, mesaj: 'Ödeme doğrulanacak kayıt bulunamadı.' };
      }
      if (!odemeDogrulanabilirMi(kullanici, hedef)) {
        return { basarili: false, mesaj: 'Bu kayıt için ödeme doğrulama yetkiniz yok.' };
      }

      if (hedef.eIslemTuru === 'KREDI_YUKLEME') {
        const tumDekontlar = islemDekontlariniOku(hedef);
        const hedefKaydi = tumDekontlar.
        map((dekont, sira) => ({
          dekont,
          kimlik: krediYuklemeDekontKimligi(dekont, sira)
        })).
        find(
          ({ dekont, kimlik }) =>
          (dekontId ? kimlik === dekontId || dekont.id === dekontId : true) &&
          dekont.dogrulamaDurumu !== 'DOGRULANDI' &&
          dekont.dogrulamaDurumu !== 'REDDEDILDI'
        );

        if (!hedefKaydi) {
          return { basarili: false, mesaj: 'Doğrulanacak uygun dekont bulunamadı.' };
        }

        const dogrulamaZamani = new Date().toISOString();
        const guncelDekontlar = tumDekontlar.map((dekont, sira) =>
          krediYuklemeDekontKimligi(dekont, sira) === hedefKaydi.kimlik ?
          {
            ...dekont,
            dogrulamaDurumu: 'DOGRULANDI' as const,
            dogrulamaZamani
          } :
          dekont
        );
        const geciciKayit = { ...hedef, dekont: guncelDekontlar[0] ?? hedef.dekont, dekontlar: guncelDekontlar };
        const mevcutYuklemeAdedi = yuklemeHareketAdedi(krediHareketleri, hedef.kayitNo);
        const analiz = krediYuklemeKaydiniCozumle({
          islem: geciciKayit,
          birimKrediBedeli,
          mevcutYuklemeAdedi
        });
        const guncelKayit = krediYuklemeKaydiniGuncelle(geciciKayit, krediHareketleri);

        setIslemler((eski) => eski.map((islem) => islem.id === islemId ? guncelKayit : islem));

        if (analiz.yeniYuklemeAdedi > 0) {
          setKrediHareketleri((eski) => [
            {
              id: `kh-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
              isletmeciId: hedef.isletmeciId ?? '',
              tip: 'YUKLEME',
              adet: analiz.yeniYuklemeAdedi,
              kayitNo: hedef.kayitNo,
              dekontId: hedefKaydi.dekont.id ?? hedefKaydi.kimlik,
              dekontNo: hedefKaydi.dekont.dekontNo,
              tarih: hedefKaydi.dekont.tarih,
              aciklama: `${hedefKaydi.dekont.dekontNo} doğrulandı; ${analiz.yeniYuklemeAdedi} kredi kullanılabilir oldu.`
            },
            ...eski]
          );
          auditEkle(
            'Taş ocağı kredi kullanılabilir oldu',
            `${hedef.talepEden} · +${analiz.yeniYuklemeAdedi} kredi · ${hedefKaydi.dekont.dekontNo}`
          );
        }

        auditEkle('Dekont doğrulandı', `${hedef.kayitNo} · ${hedefKaydi.dekont.dekontNo}`);
        return {
          basarili: true,
          mesaj:
          analiz.yeniYuklemeAdedi > 0 ?
          `${hedefKaydi.dekont.dekontNo} doğrulandı ve ${analiz.yeniYuklemeAdedi} kredi kullanılabilir oldu.` :
          `${hedefKaydi.dekont.dekontNo} doğrulandı. Tam krediye yetmeyen bakiye beklemeye alındı.`,
          dogrulananDekontId: hedefKaydi.dekont.id ?? hedefKaydi.kimlik,
          kullanilabilirKrediAdedi: analiz.dogrulanmisOzeti.kullanilabilirKrediAdedi,
          olusanKrediAdedi: analiz.yeniYuklemeAdedi
        };
      }

      setIslemler((eski) =>
        eski.map((i) => i.id === islemId ? { ...i, durum: 'ODEME_DOGRULANDI' as const } : i)
      );
      return { basarili: true, mesaj: `${hedef.kayitNo} ödemesi doğrulandı.` };
    },
    [
    islemler,
    kullanici,
    auditEkle,
    krediHareketleri,
    birimKrediBedeli,
    krediYuklemeKaydiniGuncelle,
    yuklemeHareketAdedi]
  );

  const krediYuklemeDekontEkle = useCallback(
    (islemId: string, girdi: KrediYuklemeDekontKaydiGirdisi): IslemSonucu => {
      const hedef = islemler.find((islem) => islem.id === islemId);
      if (!hedef || hedef.eIslemTuru !== 'KREDI_YUKLEME') {
        return { basarili: false, mesaj: 'Tamamlayıcı dekont eklenecek kredi talebi bulunamadı.' };
      }
      if (!islemDegistirilebilirMi(kullanici, hedef)) {
        return { basarili: false, mesaj: 'Bu kredi talebine dekont ekleme yetkiniz yok.' };
      }
      if (!girdi.dosya) {
        return { basarili: false, mesaj: 'Dekont dosyası olmadan tamamlayıcı kayıt eklenemez.' };
      }
      if (!girdi.dekontNo.trim() || !girdi.banka.trim() || !girdi.tarih || !girdi.odemeYapan.trim()) {
        return { basarili: false, mesaj: 'Dekont no, banka, tarih ve ödeme yapan alanları zorunludur.' };
      }
      if (girdi.odenenTutar <= 0) {
        return { basarili: false, mesaj: 'Dekont tutarı sıfırdan büyük olmalıdır.' };
      }
      if (girdi.tarih > new Date().toISOString().slice(0, 10)) {
        return { basarili: false, mesaj: 'Dekont tarihi gelecekte olamaz.' };
      }

      const mukerrerlik = krediYuklemeDekontMukerrerliginiBul({
        islemler,
        dekontNo: girdi.dekontNo,
        bankaReferansNo: girdi.bankaReferansNo,
        banka: girdi.banka,
        dosyaHash: girdi.dosya?.dekontHash,
        tarih: girdi.tarih,
        odenenTutar: girdi.odenenTutar,
        odemeYapan: girdi.odemeYapan
      });
      if (mukerrerlik.duplicateDekont) {
        return {
          basarili: false,
          mesaj: `Bu dekont no zaten kullanılmış: ${mukerrerlik.duplicateDekont.islem.kayitNo}`
        };
      }
      if (mukerrerlik.duplicateReferans) {
        return {
          basarili: false,
          mesaj: `Bu banka referansı zaten kullanılmış: ${mukerrerlik.duplicateReferans.islem.kayitNo}`
        };
      }
      if (mukerrerlik.duplicateDosya) {
        return {
          basarili: false,
          mesaj: `Bu dijital dekont dosyası zaten kullanılmış: ${mukerrerlik.duplicateDosya.islem.kayitNo}`
        };
      }

      const yeniDekont: Dekont = {
        id: `dk-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        dekontNo: girdi.dekontNo.trim(),
        bankaReferansNo: girdi.bankaReferansNo?.trim() || undefined,
        banka: girdi.banka.trim(),
        tarih: girdi.tarih,
        odenenTutar: girdi.odenenTutar,
        odemeYapan: girdi.odemeYapan.trim(),
        dosya: girdi.dosya,
        dogrulamaDurumu: 'BEKLIYOR',
        ocrDurumu: girdi.ocrDurumu,
        ocrOkunanAlanlar: girdi.ocrOkunanAlanlar,
        ocrGuvenBilgileri: girdi.ocrGuvenBilgileri,
        ocrIlkDegerleri: girdi.ocrIlkDegerleri,
        ocrDogrulananDegerleri: girdi.ocrDogrulananDegerleri
      };
      const guncelDekontlar = [...islemDekontlariniOku(hedef), yeniDekont];
      const guncelKayit = krediYuklemeKaydiniGuncelle({
        ...hedef,
        dekont: guncelDekontlar[0] ?? hedef.dekont,
        dekontlar: guncelDekontlar
      });

      setIslemler((eski) => eski.map((islem) => islem.id === islemId ? guncelKayit : islem));
      auditEkle('Tamamlayıcı dekont eklendi', `${hedef.kayitNo} · ${yeniDekont.dekontNo}`);
      return {
        basarili: true,
        mesaj: `${yeniDekont.dekontNo} dekontu kredi talebine eklendi.`
      };
    },
    [islemler, kullanici, auditEkle, krediYuklemeKaydiniGuncelle]
  );

  const ajandaEkle = useCallback(
    (kayit: AjandaKaydi) => {
      const damgali: AjandaKaydi = {
        ...kayit,
        birim: kayit.birim || kullanici?.birim || '—',
        birimId: kayit.birimId ?? kullanici?.birimId,
        olusturanKullaniciId: kayit.olusturanKullaniciId ?? kullanici?.id
      };
      setAjanda((eski) => [damgali, ...eski]);
      auditEkle('Ajanda kaydı oluşturuldu', `${kayit.kayitNo} · ${formatTarihSaat(kayit.tarih, kayit.saat)}`);
    },
    [auditEkle, kullanici]
  );

  const ajandaDurumGuncelle = useCallback((id: string, durum: AjandaDurumu) => {
    setAjanda((eski) => eski.map((a) => a.id === id ? { ...a, durum } : a));
  }, []);

  const krediHareketiEkle = useCallback((hareket: KrediHareketi) => {
    setKrediHareketleri((eski) => [hareket, ...eski]);
  }, []);

  const krediOzeti = useCallback(
    (isletmeciId: string): KrediOzeti => {
      const hareketler = krediHareketleri.filter((h) => h.isletmeciId === isletmeciId);
      const yuklemeler = hareketler.filter((h) => h.tip === 'YUKLEME');
      const yuklenen = yuklemeler.reduce((t, h) => t + h.adet, 0);
      const krediKayitlari = islemler.filter(
        (islem) => islem.isletmeciId === isletmeciId && islem.eIslemTuru === 'KREDI_YUKLEME'
      );
      const dogrulamaBekleyen = krediKayitlari.reduce((toplam, kayit) => {
        const analiz = krediYuklemeKaydiniCozumle({
          islem: kayit,
          birimKrediBedeli,
          mevcutYuklemeAdedi: yuklemeHareketAdedi(hareketler, kayit.kayitNo)
        });
        return toplam + Math.max((kayit.krediAdedi ?? 0) - analiz.dogrulanmisOzeti.kullanilabilirKrediAdedi, 0);
      }, 0);
      const gerceklesmeler = hareketler.filter((h) => h.tip === 'KULLANIM');
      const kullanilan = gerceklesmeler.reduce((t, h) => t + h.adet, 0);
      const raporlananPlanlar = gerceklesmeler.
      map((h) => h.planKayitNo).
      filter((no): no is string => !!no);
      const planlanan = hareketler.
      filter((h) => h.tip === 'PLAN' && !raporlananPlanlar.includes(h.kayitNo)).
      reduce((t, h) => t + h.adet, 0);
      const kullanilabilir = yuklenen;
      return {
        yuklenen,
        kullanilabilir,
        kullanilan,
        planlanan,
        kalan: Math.max(kullanilabilir - kullanilan, 0),
        dogrulamaBekleyen
      };
    },
    [krediHareketleri, islemler, birimKrediBedeli, yuklemeHareketAdedi]
  );

  /**
   * Patlatma planlama. Kredi DÜŞÜLMEZ; yalnızca “plan / sonuç bekliyor” hareketi oluşur.
   * Kredi yetersizse plan yine kaydedilir, ancak kart “Kredi Yetersiz” uyarısı gösterir.
   */
  const patlatmaPlanla = useCallback(
    (girdi: PlanGirdisi): PlanSonucu => {
      if (girdi.adet <= 0) {
        return { basarili: false, mesaj: 'Patlatma adedi sıfırdan büyük olmalıdır.' };
      }
      const ozet = krediOzeti(girdi.isletmeciId);
      const isletmeciAdi = isletmeciler.find((i) => i.id === girdi.isletmeciId)?.ad ?? '—';
      const ocakAdi = tasOcaklari.find((t) => t.id === girdi.tasOcagiId)?.ad ?? '—';
      const kayitNo = sonrakiKayitNo(islemler, 'E', '', 'KREDI_PLANLAMA');
      const krediYetersiz = girdi.adet > ozet.kalan;

      const kayit: Islem = {
        id: `is-${Date.now()}`,
        kayitNo,
        bent: 'E',
        eIslemTuru: 'KREDI_PLANLAMA',
        baslik: `Patlatma planı — ${ocakAdi}`,
        talepEden: isletmeciAdi,
        birim: kullanici?.birim ?? 'KTPGV Taş Ocağı Birimi',
        birimId: kullanici?.birimId,
        olusturan: kullanici?.rol ?? 'Sistem',
        olusturanKullaniciId: kullanici?.id,
        olusturmaTarihi: new Date().toISOString().slice(0, 10),
        operasyonTarihi: girdi.tarih,
        operasyonSaati: girdi.saat,
        yer: ocakAdi,
        tutar: 0,
        hesaplamaAciklamasi: `Planlanan patlatma: ${girdi.adet}. Kredi planlama aşamasında düşülmez; sonuç “Yapıldı” olarak işlendiğinde düşer.`,
        dekont: {
          dekontNo: 'Ön ödemeli kredi',
          banka: '—',
          tarih: '',
          odenenTutar: 0,
          odemeYapan: isletmeciAdi,
          dosya: null
        },
        makbuzNo: null,
        durum: 'TAMAMLANDI',
        isletmeciId: girdi.isletmeciId,
        tasOcagiId: girdi.tasOcagiId,
        krediAdedi: girdi.adet,
        raporNo: girdi.belgeNo || undefined,
        bilgiKaynagi: girdi.bilgiKaynagi,
        raporDosyasi: girdi.dosya ?? null,
        notlar: girdi.aciklama || undefined
      };

      setIslemler((eski) => [kayit, ...eski]);
      setKrediHareketleri((eski) => [
      {
        id: `kh-${Date.now()}`,
        isletmeciId: girdi.isletmeciId,
        tip: 'PLAN',
        adet: girdi.adet,
        kayitNo,
        tasOcagiId: girdi.tasOcagiId,
        tarih: girdi.tarih,
        aciklama: `${ocakAdi} — planlı patlatma, sonuç bekliyor. Kredi düşülmedi.`
      },
      ...eski]
      );
      setAjanda((eski) => [
      {
        id: `aj-${Date.now()}`,
        kayitNo,
        bent: 'E',
        islemTuru: 'Patlatma planı',
        baslik: `Patlatma — ${ocakAdi}`,
        talepEden: isletmeciAdi,
        birim: kullanici?.birim ?? 'KTPGV Taş Ocağı Birimi',
        birimId: kullanici?.birimId,
        olusturanKullaniciId: kullanici?.id,
        tarih: girdi.tarih,
        saat: girdi.saat,
        yer: ocakAdi,
        durum: 'Sonuç Bekliyor' as const,
        odemeDurumu: krediYetersiz ?
        `Ön ödemeli kredi · Kullanılabilir kredi yetersiz (${ozet.kalan})` :
        `Ön ödemeli kredi · ${girdi.adet} kredi planlandı · Kalan ${ozet.kalan}`,
        isletmeciId: girdi.isletmeciId,
        tasOcagiId: girdi.tasOcagiId,
        planlananAdet: girdi.adet,
        bilgiKaynagi: girdi.bilgiKaynagi,
        raporNo: girdi.belgeNo || undefined
      },
      ...eski]
      );

      auditEkle(
        'Patlatma planlandı',
        `${kayitNo} · ${ocakAdi} · ${girdi.adet} patlatma · ${formatTarihSaat(girdi.tarih, girdi.saat)}`
      );
      if (krediYetersiz) {
        auditEkle(
          'Kredi yetersiz uyarısı',
          `${isletmeciAdi} · plan ${kayitNo} · talep ${girdi.adet} / kullanılabilir ${ozet.kalan}`
        );
      }

      return { basarili: true, kayitNo, krediYetersiz };
    },
    [krediOzeti, islemler, isletmeciler, tasOcaklari, kullanici, auditEkle]
  );

  /** Yapılmadı / Ertelendi / İptal — kredi hareketine kullanım düşümü YAZILMAZ. */
  const patlatmaSonucIsle = useCallback(
    (girdi: SonucGirdisi) => {
      const kayit = ajanda.find((a) => a.id === girdi.ajandaId);
      if (!kayit) return { basarili: false, mesaj: 'Patlatma kaydı bulunamadı.' };

      const durum: AjandaDurumu =
      girdi.sonuc === 'YAPILMADI' ?
      'Yapılmadı' :
      girdi.sonuc === 'ERTELENDI' ?
      'Ertelendi' :
      'İptal Edildi';

      const notParcalari = [girdi.neden, girdi.aciklama].filter(Boolean).join(' · ');

      setAjanda((eski) =>
      eski.map((a) =>
      a.id === girdi.ajandaId ?
      {
        ...a,
        durum,
        tarih: girdi.yeniTarih || a.tarih,
        saat: girdi.yeniSaat || a.saat,
        bilgiKaynagi: girdi.bilgiKaynagi,
        raporNo: girdi.belgeNo || a.raporNo,
        sonucNotu: notParcalari || undefined,
        odemeDurumu:
        girdi.sonuc === 'ERTELENDI' ?
        `Ertelendi · Yeni tarih ${formatTarihSaat(girdi.yeniTarih || a.tarih, girdi.yeniSaat || a.saat)} · Kredi düşülmedi` :

        `${durum} · Kredi düşülmedi`
      } :
      a
      )
      );

      const eylem =
      girdi.sonuc === 'YAPILMADI' ?
      'Patlatma yapılmadı' :
      girdi.sonuc === 'ERTELENDI' ?
      'Patlatma ertelendi' :
      'Patlatma iptal edildi';
      auditEkle(
        eylem,
        `${kayit.kayitNo} · ${kayit.yer}${
        girdi.sonuc === 'ERTELENDI' ?
        ` · Yeni tarih ${formatTarihSaat(girdi.yeniTarih ?? '', girdi.yeniSaat)}` :
        ''}${
        notParcalari ? ` · ${notParcalari}` : ''} · Kredi düşülmedi`
      );

      return { basarili: true };
    },
    [ajanda, auditEkle]
  );

  const patlatmaGerceklesmeIsle = useCallback(
    (girdi: GerceklesmeGirdisi): GerceklesmeSonucu => {
      const ozet = krediOzeti(girdi.isletmeciId);
      if (girdi.adet <= 0) {
        return { basarili: false, mesaj: 'Patlatma adedi sıfırdan büyük olmalıdır.' };
      }
      if (girdi.adet > ozet.kalan) {
        auditEkle(
          'Kredi yetersiz işlem engellendi',
          `${isletmeciler.find((i) => i.id === girdi.isletmeciId)?.ad ?? '—'} · patlatma sonucu ${
          girdi.raporNo || '—'} · talep ${
          girdi.adet} / kullanılabilir ${ozet.kalan}`
        );
        return {
          basarili: false,
          mesaj:
          'Kullanılabilir kredi yetersiz. Bu patlatma yapıldı olarak işlenmeden önce işletmeciye kredi yükleme / ödeme doğrulama / makbuz süreci tamamlanmalıdır.'
        };
      }

      const isletmeciAdi = isletmeciler.find((i) => i.id === girdi.isletmeciId)?.ad ?? '—';
      const ocakAdi = tasOcaklari.find((t) => t.id === girdi.tasOcagiId)?.ad ?? '—';
      const kayitNo = sonrakiKayitNo(islemler, 'E', '', 'KREDI_GERCEKLESME');

      const kayit: Islem = {
        id: `is-${Date.now()}`,
        kayitNo,
        bent: 'E',
        eIslemTuru: 'KREDI_GERCEKLESME',
        baslik: `Patlatma yapıldı — ${ocakAdi}`,
        talepEden: isletmeciAdi,
        birim: kullanici?.birim ?? 'KTPGV Taş Ocağı Birimi',
        birimId: kullanici?.birimId,
        olusturan: kullanici?.rol ?? 'Sistem',
        olusturanKullaniciId: kullanici?.id,
        olusturmaTarihi: new Date().toISOString().slice(0, 10),
        operasyonTarihi: girdi.tarih,
        operasyonSaati: girdi.saat,
        yer: ocakAdi,
        tutar: 0,
        hesaplamaAciklamasi: `Patlatma sonucu “Yapıldı” olarak işlendi. Önceki kullanılabilir kredi: ${ozet.kalan} · Düşülen: ${girdi.adet} · Kalan: ${ozet.kalan - girdi.adet}`,
        dekont: {
          dekontNo: 'Ön ödemeli kredi',
          banka: '—',
          tarih: '',
          odenenTutar: 0,
          odemeYapan: isletmeciAdi,
          dosya: null
        },
        makbuzNo: null,
        durum: 'TAMAMLANDI',
        isletmeciId: girdi.isletmeciId,
        tasOcagiId: girdi.tasOcagiId,
        krediAdedi: girdi.adet,
        planKayitNo: girdi.planKayitNo,
        raporNo: girdi.raporNo || undefined,
        bildiren: girdi.bildiren || undefined,
        bilgiKaynagi: girdi.bilgiKaynagi,
        patlatmaSonucu: 'YAPILDI',
        raporDosyasi: girdi.raporDosyasi ?? null,
        notlar: girdi.aciklama || undefined
      };

      setIslemler((eski) => [kayit, ...eski]);
      setKrediHareketleri((eski) => [
      {
        id: `kh-${Date.now()}`,
        isletmeciId: girdi.isletmeciId,
        tip: 'KULLANIM',
        adet: girdi.adet,
        kayitNo,
        planKayitNo: girdi.planKayitNo,
        tasOcagiId: girdi.tasOcagiId,
        raporNo: girdi.raporNo,
        bildiren: girdi.bildiren,
        tarih: girdi.tarih,
        aciklama: `${ocakAdi} — patlatma yapıldı olarak işlendi, kredi düşüldü.`
      },
      ...eski]
      );

      if (girdi.ajandaId) {
        setAjanda((eski) =>
        eski.map((a) =>
        a.id === girdi.ajandaId ?
        {
          ...a,
          durum: 'Yapıldı' as const,
          raporNo: girdi.raporNo || a.raporNo,
          bilgiKaynagi: girdi.bilgiKaynagi,
          gerceklesmeKayitNo: kayitNo,
          odemeDurumu: `Patlatma yapıldı · ${girdi.adet} kredi düşüldü · Kalan ${
          ozet.kalan - girdi.adet}`

        } :
        a
        )
        );
      }

      auditEkle(
        'Patlatma yapıldı olarak işlendi',
        `${kayitNo} · ${ocakAdi} · Belge ${girdi.raporNo || '—'}`
      );
      auditEkle(
        'Taş ocağı kredi kullanıldı',
        `${isletmeciAdi} · -${girdi.adet} kredi · Kalan ${ozet.kalan - girdi.adet}`
      );

      return {
        basarili: true,
        kayitNo,
        oncekiKredi: ozet.kalan,
        kalanKredi: ozet.kalan - girdi.adet
      };
    },
    [krediOzeti, islemler, isletmeciler, tasOcaklari, kullanici, auditEkle]
  );

  const sigortaBul = useCallback(
    (id?: string) => sigortalar.find((s) => s.id === id),
    [sigortalar]
  );

  const sigortaKaydet = useCallback(
    (sirket: SigortaSirketi) => {
      setSigortalar((eski) => {
        const varMi = eski.some((s) => s.id === sirket.id);
        return varMi ? eski.map((s) => s.id === sirket.id ? sirket : s) : [sirket, ...eski];
      });
      const yeniMi = !sigortalar.some((s) => s.id === sirket.id);
      auditEkle(
        yeniMi ? 'Sigorta şirketi kartı oluşturuldu' : 'Sigorta şirketi kartı güncellendi',
        `${sirket.ad} · ${sirket.aktif ? 'Aktif' : 'Pasif'}`
      );
    },
    [sigortalar, auditEkle]
  );

  const isletmeciBul = useCallback(
    (id?: string) => isletmeciler.find((i) => i.id === id),
    [isletmeciler]
  );

  const isletmeciKaydet = useCallback(
    (isletmeci: Isletmeci) => {
      setIsletmeciler((eski) => {
        const varMi = eski.some((i) => i.id === isletmeci.id);
        return varMi ? eski.map((i) => i.id === isletmeci.id ? isletmeci : i) : [isletmeci, ...eski];
      });
      const yeniMi = !isletmeciler.some((i) => i.id === isletmeci.id);
      auditEkle(
        yeniMi ?
        'Taş ocağı işletmeci kartı oluşturuldu' :
        'Taş ocağı işletmeci kartı güncellendi',
        `${isletmeci.ad} · ${isletmeci.tur === 'SAHIS' ? 'Şahıs' : 'Şirket'}`
      );
    },
    [isletmeciler, auditEkle]
  );

  const tasOcagiBul = useCallback(
    (id?: string) => tasOcaklari.find((t) => t.id === id),
    [tasOcaklari]
  );

  const tasOcagiKaydet = useCallback(
    (ocak: TasOcagi) => {
      setTasOcaklari((eski) => {
        const varMi = eski.some((t) => t.id === ocak.id);
        return varMi ? eski.map((t) => t.id === ocak.id ? ocak : t) : [ocak, ...eski];
      });
      const yeniMi = !tasOcaklari.some((t) => t.id === ocak.id);
      const isletmeciAdi = isletmeciler.find((i) => i.id === ocak.isletmeciId)?.ad ?? '—';
      auditEkle(
        yeniMi ? 'Taş ocağı kartı oluşturuldu' : 'Taş ocağı kartı güncellendi',
        `${ocak.ad} · Bağlı işletmeci: ${isletmeciAdi}`
      );
    },
    [tasOcaklari, isletmeciler, auditEkle]
  );

  const manifestOlustur = useCallback(
    (yil: number) => {
      const hash = `sha256:${Math.random().toString(16).slice(2, 14)}…${Math.random().
      toString(16).
      slice(2, 6)}`;
      setArsivler((eski) => eski.map((a) => a.yil === yil ? { ...a, manifestHash: hash } : a));
      auditEkle('Arşiv manifest simülasyonu oluşturuldu', `Mali Yıl ${yil}`);
    },
    [auditEkle]
  );

  const arsivDogrula = useCallback(
    (yil: number) => {
      setArsivler((eski) =>
      eski.map((a) => a.yil === yil ? { ...a, dogrulandi: true, durum: 'Arşivlendi' as const } : a)
      );
      auditEkle('Arşiv bütünlüğü doğrulandı', `Mali Yıl ${yil}`);
    },
    [auditEkle]
  );

  const menuGorunur = useCallback(
    (menuId: string) => !!kullanici?.menuler.includes(menuId),
    [kullanici]
  );

  const bentKullanilabilir = useCallback(
    (bent: BentKodu) => !!kullanici && !kullanici.sadeceGoruntule && kullanici.bentler.includes(bent),
    [kullanici]
  );

  // --- Merkezi yetki katmanı ---------------------------------------------
  const merkezAdminMi = kullaniciMerkezAdminMi(kullanici);
  const denetciMi = kullaniciDenetciMi(kullanici);
  const tumVeriGorebilir = kullaniciTumVeriGorebilir(kullanici);
  const maliVeriGorebilir = kullaniciMaliVeriGorebilir(kullanici);

  const ekranGorulebilir = useCallback(
    (menuId: string) => ekranGorulebilirMi(kullanici, menuId),
    [kullanici]
  );
  const kullaniciYonetimiYetkisi = yonetimEkraniGorulebilirMi(kullanici, 'kullanici-yonetimi');
  const birimYonetimiYetkisi = yonetimEkraniGorulebilirMi(kullanici, 'birim-yonetimi');
  const yonetimYetkisi = kullaniciYonetimiYetkisi || birimYonetimiYetkisi;

  const islemGorulebilir = useCallback(
    (islem: Islem) => islemGorulebilirMi(kullanici, islem),
    [kullanici]
  );
  const maliKayitGorulebilir = useCallback(
    (islem: Islem) => maliKayitGorulebilirMi(kullanici, islem),
    [kullanici]
  );
  const ajandaKaydiGorulebilir = useCallback(
    (kayit: AjandaKaydi) => ajandaKaydiGorulebilirMi(kullanici, kayit),
    [kullanici]
  );
  const islemDegistirilebilir = useCallback(
    (islem: Islem) => islemDegistirilebilirMi(kullanici, islem),
    [kullanici]
  );
  const makbuzUretilebilir = useCallback(
    (islem: Islem) => makbuzUretilebilirMi(kullanici, islem),
    [kullanici]
  );
  const odemeDogrulanabilir = useCallback(
    (islem: Islem) => odemeDogrulanabilirMi(kullanici, islem),
    [kullanici]
  );
  const ajandaIslemiYapilabilir = useCallback(
    (kayit: AjandaKaydi) => ajandaIslemiYapilabilirMi(kullanici, kayit),
    [kullanici]
  );

  const gorunurIslemler = useMemo(
    () => islemler.filter((i) => islemGorulebilirMi(kullanici, i)),
    [islemler, kullanici]
  );
  const gorunurMaliKayitlar = useMemo(
    () => gorunurIslemler.filter(maliKayitMi),
    [gorunurIslemler]
  );
  const gorunurAjanda = useMemo(
    () => ajanda.filter((a) => ajandaKaydiGorulebilirMi(kullanici, a)),
    [ajanda, kullanici]
  );
  const gorunurAuditKayitlari = useMemo(() => {
    const numaralar = new Set<string>();
    gorunurIslemler.forEach((i) => {
      numaralar.add(i.kayitNo);
      if (i.makbuzNo) numaralar.add(i.makbuzNo);
      islemBagisMakbuzlariniOku(i, birimKrediBedeli).forEach((makbuz) => {
        if (makbuz.makbuzNo) numaralar.add(makbuz.makbuzNo);
      });
      i.altBasvurular?.forEach((alt) => numaralar.add(alt.no));
      i.adliRaporlar?.forEach((r) => numaralar.add(r.no));
    });
    return auditKayitlari.filter((a) => auditKaydiGorulebilirMi(kullanici, a, numaralar));
  }, [auditKayitlari, gorunurIslemler, kullanici, birimKrediBedeli]);

  const deger = useMemo<AppContextDegeri>(
    () => ({
      kullanici,
      giris,
      cikis,
      kullanicilar,
      kullaniciKaydet,
      kullaniciAktiflikDegistir,
      sifreSifirla,
      birimler,
      birimBul,
      birimKaydet,
      birimAktiflikDegistir,
      birimKullanicilari,
      yonetimYetkisi,
      kullaniciYonetimiYetkisi,
      birimYonetimiYetkisi,
      ekranGorulebilir,
      merkezAdminMi,
      denetciMi,
      tumVeriGorebilir,
      maliVeriGorebilir,
      gorunurIslemler,
      gorunurMaliKayitlar,
      gorunurAjanda,
      gorunurAuditKayitlari,
      islemGorulebilir,
      maliKayitGorulebilir,
      ajandaKaydiGorulebilir,
      islemDegistirilebilir,
      makbuzUretilebilir,
      odemeDogrulanabilir,
      ajandaIslemiYapilabilir,
      islemBul,
      bau,
      bauGuncelle,
      islemler,
      islemEkle,
      makbuzUret,
      odemeDogrula,
      krediYuklemeDekontEkle,
      ajanda,
      ajandaEkle,
      ajandaDurumGuncelle,
      auditKayitlari,
      auditEkle,
      krediHareketleri,
      krediHareketiEkle,
      krediOzeti,
      patlatmaPlanla,
      patlatmaGerceklesmeIsle,
      patlatmaSonucIsle,
      sigortalar,
      sigortaBul,
      sigortaKaydet,
      isletmeciler,
      isletmeciBul,
      isletmeciKaydet,
      tasOcaklari,
      tasOcagiBul,
      tasOcagiKaydet,
      arsivler,
      manifestOlustur,
      arsivDogrula,
      menuGorunur,
      bentKullanilabilir
    }),
    [
    kullanici,
    giris,
    cikis,
    kullanicilar,
    kullaniciKaydet,
    kullaniciAktiflikDegistir,
    sifreSifirla,
    birimler,
    birimBul,
    birimKaydet,
    birimAktiflikDegistir,
    birimKullanicilari,
    yonetimYetkisi,
    kullaniciYonetimiYetkisi,
    birimYonetimiYetkisi,
    ekranGorulebilir,
    merkezAdminMi,
    denetciMi,
    tumVeriGorebilir,
    maliVeriGorebilir,
    gorunurIslemler,
    gorunurMaliKayitlar,
    gorunurAjanda,
    gorunurAuditKayitlari,
    islemGorulebilir,
    maliKayitGorulebilir,
    ajandaKaydiGorulebilir,
    islemDegistirilebilir,
    makbuzUretilebilir,
    odemeDogrulanabilir,
    ajandaIslemiYapilabilir,
    islemBul,
    bau,
    bauGuncelle,
    islemler,
    islemEkle,
    makbuzUret,
    odemeDogrula,
    krediYuklemeDekontEkle,
    ajanda,
    ajandaEkle,
    ajandaDurumGuncelle,
    auditKayitlari,
    auditEkle,
    krediHareketleri,
    krediHareketiEkle,
    krediOzeti,
    patlatmaPlanla,
    patlatmaGerceklesmeIsle,
    patlatmaSonucIsle,
    sigortalar,
    sigortaBul,
    sigortaKaydet,
    isletmeciler,
    isletmeciBul,
    isletmeciKaydet,
    tasOcaklari,
    tasOcagiBul,
    tasOcagiKaydet,
    arsivler,
    manifestOlustur,
    arsivDogrula,
    menuGorunur,
    bentKullanilabilir]

  );

  return <AppContext.Provider value={deger}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextDegeri {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp, AppProvider içinde kullanılmalıdır.');
  return ctx;
}