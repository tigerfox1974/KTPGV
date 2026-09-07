import {
  AdliRapor,
  AjandaDurumu,
  AjandaKaydi,
  AuditKaydi,
  BentKodu,
  DekontAlanAdi,
  Birim,
  Dekont,
  DekontDosyasi,
  EIslemTuru,
  FAltTur,
  GorevDilimi,
  Isletmeci,
  Islem,
  KrediHareketi,
  Kullanici,
  MaliYilArsivi,
  PatlatmaSonucu,
  BilgiKaynagi,
  SigortaSirketi,
  TrafikAltBasvuru,
  TasOcagi
} from '../../types';

/**
 * KTPGV veri/auth adaptör sözleşmesi.
 *
 * UI (AppContext) bu arayüz üzerinden çalışır; kimlik doğrulama, yetki denetimi,
 * kayıt/audit yazımı ve numaralandırma üretimi burada, istemci dizilerinin dışında yapılır.
 * `MockKtpgvRepository` bu sözleşmenin demo/prototip uygulamasıdır. Üretim aşamasında
 * aynı arayüzü karşılayan bir Supabase tabanlı uygulama devreye alınabilir.
 */

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

export interface KimlikDogrulamaSonucu extends GirisSonucu {
  kullanici?: Kullanici;
}

export interface IslemSonucu {
  basarili: boolean;
  mesaj: string;
}

export interface YeniIslemGirdisi {
  bent: BentKodu;
  fAltTur?: FAltTur;
  eIslemTuru?: EIslemTuru;
  baslik: string;
  talepEden: string;
  operasyonTarihi?: string;
  operasyonSaati?: string;
  yer?: string;
  etkinlikAdi?: string;
  polisSayisi?: number;
  gorevSuresi?: number;
  /** D bendi çoklu görev dilimleri — verilmezse eski polisSayisi/gorevSuresi alanları kullanılır. */
  gorevDilimleri?: GorevDilimi[];
  tutar: number;
  hesaplamaSatirlari: string[];
  dekontNo: string;
  bankaReferansNo?: string;
  banka: string;
  dekontTarihi: string;
  odenenTutar: number;
  odemeYapan: string;
  dekontDosyasi: DekontDosyasi | null;
  ocrDurumu?: 'BEKLIYOR' | 'OKUNUYOR' | 'BASARILI' | 'KISMI' | 'BASARISIZ';
  ocrOkunanAlanlar?: DekontAlanAdi[];
  ocrGuvenBilgileri?: Partial<Record<DekontAlanAdi, number>>;
  sigortaSirketiId?: string;
  trafikAltBasvurular?: TrafikAltBasvuru[];
  adliRaporlar?: AdliRapor[];
  isletmeciId?: string;
  krediAdedi?: number;
  notlar?: string;
}

export interface YeniIslemSonucu extends IslemSonucu {
  kayitNo?: string;
  kayit?: Islem;
}

export interface KayitSonucu {
  basarili: boolean;
  mesaj?: string;
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

export interface KtpgvRepository {
  // --- Kimlik doğrulama --------------------------------------------------
  girisYap(kullaniciAdi: string, sifre: string): KimlikDogrulamaSonucu;

  // --- Kullanıcılar --------------------------------------------------------
  kullanicilariGetir(): Kullanici[];
  kullaniciKaydet(aktifKullanici: Kullanici | null, hedef: Kullanici): KayitSonucu;
  kullaniciAktiflikDegistir(aktifKullanici: Kullanici | null, id: string, aktif: boolean): void;
  sifreSifirla(aktifKullanici: Kullanici | null, id: string, yeniSifre: string): void;

  // --- Birimler ------------------------------------------------------------
  birimleriGetir(): Birim[];
  birimKaydet(aktifKullanici: Kullanici | null, birim: Birim): KayitSonucu;
  birimAktiflikDegistir(aktifKullanici: Kullanici | null, id: string, aktif: boolean): void;

  // --- BAÜ -------------------------------------------------------------------
  bauGetir(): number;
  bauGuncelle(aktifKullanici: Kullanici | null, deger: number): void;

  // --- İşlemler --------------------------------------------------------------
  islemleriGetir(): Islem[];
  islemEkle(aktifKullanici: Kullanici | null, islem: Islem): void;
  islemOlustur(aktifKullanici: Kullanici | null, girdi: YeniIslemGirdisi): YeniIslemSonucu;
  makbuzUret(aktifKullanici: Kullanici | null, islemId: string): MakbuzUretimSonucu;
  odemeDogrula(aktifKullanici: Kullanici | null, islemId: string, dekontId?: string): OdemeDogrulamaSonucu;
  krediYuklemeDekontEkle(
    aktifKullanici: Kullanici | null,
    islemId: string,
    girdi: KrediYuklemeDekontKaydiGirdisi
  ): IslemSonucu;

  // --- Ajanda ------------------------------------------------------------------
  ajandaGetir(): AjandaKaydi[];
  ajandaEkle(aktifKullanici: Kullanici | null, kayit: AjandaKaydi): void;
  ajandaDurumGuncelle(aktifKullanici: Kullanici | null, id: string, durum: AjandaDurumu): void;

  // --- Audit ---------------------------------------------------------------------
  auditGetir(): AuditKaydi[];
  auditYaz(aktifKullanici: Kullanici | null, eylem: string, hedef: string): void;

  // --- Taş ocağı kredi hareketleri -----------------------------------------------
  krediHareketleriGetir(): KrediHareketi[];
  krediHareketiEkle(aktifKullanici: Kullanici | null, hareket: KrediHareketi): void;
  krediOzetiHesapla(isletmeciId: string): KrediOzeti;
  patlatmaPlanla(aktifKullanici: Kullanici | null, girdi: PlanGirdisi): PlanSonucu;
  patlatmaGerceklesmeIsle(aktifKullanici: Kullanici | null, girdi: GerceklesmeGirdisi): GerceklesmeSonucu;
  patlatmaSonucIsle(aktifKullanici: Kullanici | null, girdi: SonucGirdisi): IslemSonucu | KayitSonucu;

  // --- Sigorta / işletmeci / taş ocağı master verileri -----------------------------
  sigortalariGetir(): SigortaSirketi[];
  sigortaKaydet(aktifKullanici: Kullanici | null, sirket: SigortaSirketi): void;
  isletmecileriGetir(): Isletmeci[];
  isletmeciKaydet(aktifKullanici: Kullanici | null, isletmeci: Isletmeci): void;
  tasOcaklariniGetir(): TasOcagi[];
  tasOcagiKaydet(aktifKullanici: Kullanici | null, ocak: TasOcagi): void;

  // --- Mali yıl arşivi ------------------------------------------------------------
  arsivleriGetir(): MaliYilArsivi[];
  manifestOlustur(aktifKullanici: Kullanici | null, yil: number): void;
  arsivDogrula(aktifKullanici: Kullanici | null, yil: number): void;
}

export type { BentKodu };
