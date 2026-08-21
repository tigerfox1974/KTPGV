export type BentKodu = 'A' | 'B' | 'C' | 'Ç' | 'D' | 'E' | 'F';

export type FAltTur = 'ADLI' | 'TRAFIK';

/**
 * E bendi işlem türleri:
 * - KREDI_YUKLEME: ödeme alınır, dekont/makbuz süreci işler (EKRD serisi).
 * - KREDI_PLANLAMA: patlatma planlanır, kredi HENÜZ düşmez (EKPL serisi).
 * - KREDI_GERCEKLESME: patlatmanın yapıldığına dair rapor işlenir, kredi düşer (EKGR serisi).
 */
export type EIslemTuru = 'KREDI_YUKLEME' | 'KREDI_PLANLAMA' | 'KREDI_GERCEKLESME';

/**
 * Patlatma bilgisi yazılı raporla gelmek zorunda değildir; sözlü, telefonla veya
 * görevli personel bildirimiyle de gelebilir. Bilgi kaynağı bu nedenle kayıt altına alınır.
 */
export type BilgiKaynagi = 'SOZLU' | 'TELEFON' | 'YAZILI' | 'PERSONEL' | 'DIGER';

/** Patlatma kartının kullanıcıya gösterilen sade sonucu. */
export type PatlatmaSonucu = 'YAPILDI' | 'YAPILMADI' | 'ERTELENDI' | 'IPTAL';

export interface Bent {
  kod: BentKodu;
  baslik: string;
  aciklama: string;
  formul: string;
  hesaplamaTuru: 'MANUEL' | 'ADET' | 'GOREV' | 'KREDI';
  ajandayaDuser: boolean;
}

export type RolKodu =
'MERKEZ_ADMIN' |
'VAKIF_MUHASEBE' |
'PGM_TRAFIK' |
'ITFAIYE' |
'KARAKOL' |
'TAS_OCAGI' |
'DENETCI';

export interface Kullanici {
  id: string;
  kullaniciAdi: string;
  sifre: string;
  adSoyad: string;
  rol: string;
  rolKodu: RolKodu;
  birim: string;
  /** Bağlı olduğu birim kartı. */
  birimId?: string;
  bentler: BentKodu[];
  menuler: string[];
  makbuzUretebilir: boolean;
  sadeceGoruntule: boolean;
  raporGorebilir: boolean;
  ajandaKullanabilir: boolean;
  bauGuncelleyebilir: boolean;
  /** Pasif kullanıcı giriş yapamaz; listeden kaybolmaz. */
  aktif: boolean;
  notlar?: string;
}

export type BirimTuru =
'MERKEZ' |
'MUDURLUK' |
'SUBE' |
'KARAKOL' |
'MALI_ISLER' |
'DENETIM' |
'DIGER';

export interface Birim {
  id: string;
  ad: string;
  kod: string;
  tur: BirimTuru;
  /** Bağlı olduğu üst birim. */
  ustBirimId?: string;
  bentler: BentKodu[];
  makbuzUretebilir: boolean;
  raporGorebilir: boolean;
  ajandaKullanabilir: boolean;
  aktif: boolean;
  aciklama: string;
}

export type DekontYontemi = 'PERSONEL' | 'QR_LINK';

export interface DekontDosyasi {
  ad: string;
  tur: 'PDF' | 'JPG' | 'PNG';
  boyutKb: number;
  yontem: DekontYontemi;
  yuklemeZamani: string;
  sikistirildi?: boolean;
  previewUrl?: string;
  mimeType?: string;
  dekontHash?: string;
}

export interface Dekont {
  dekontNo: string;
  banka: string;
  tarih: string;
  odenenTutar: number;
  odemeYapan: string;
  dosya: DekontDosyasi | null;
  ocrDurumu?: 'BEKLIYOR' | 'OKUNUYOR' | 'BASARILI' | 'KISMI' | 'BASARISIZ';
  ocrOkunanAlanlar?: string[];
  ocrGuvenBilgileri?: Partial<Record<'dekontNo' | 'banka' | 'tarih' | 'odenenTutar' | 'odemeYapan', number>>;
}

export type IslemDurumu =
'ODEME_BEKLIYOR' |
'MAKBUZ_BEKLIYOR' |
'ODEME_DOGRULANDI' |
'ISLEM_BASLATILABILIR' |
'TAMAMLANDI' |
'IPTAL';

export interface TrafikAltBasvuru {
  no: string;
  plaka: string;
  hasarDosyaNo: string;
  kazaTarihi: string;
  raporKonusu: string;
  raporTutari: number;
}

export interface AdliRapor {
  no: string;
  basvuran: string;
  dosyaNo: string;
  raporKonusu: string;
  olayTarihi: string;
  aciklama: string;
  raporTutari: number;
}

export interface Islem {
  id: string;
  kayitNo: string;
  bent: BentKodu;
  fAltTur?: FAltTur;
  eIslemTuru?: EIslemTuru;
  baslik: string;
  talepEden: string;
  birim: string;
  /** Kaydı oluşturan birimin kart kimliği — veri görünürlüğü bu alandan süzülür. */
  birimId?: string;
  olusturan: string;
  /** Kaydı oluşturan kullanıcının kimliği. */
  olusturanKullaniciId?: string;
  olusturmaTarihi: string;
  /** Operasyon (görev/denetim/rapor/patlatma) tarihi — ajanda bu tarihten beslenir. */
  operasyonTarihi?: string;
  operasyonSaati?: string;
  yer?: string;
  etkinlikAdi?: string;
  polisSayisi?: number;
  gorevSuresi?: number;
  tutar: number;
  hesaplamaAciklamasi: string;
  dekont: Dekont;
  makbuzNo: string | null;
  makbuzUreten?: string;
  durum: IslemDurumu;
  sigortaSirketiId?: string;
  altBasvurular?: TrafikAltBasvuru[];
  adliRaporlar?: AdliRapor[];
  isletmeciId?: string;
  tasOcagiId?: string;
  krediAdedi?: number;
  /** Gerçekleşme kaydının bağlı olduğu plan kaydı (EKPL). */
  planKayitNo?: string;
  /** Varsa belge / bildirim no. */
  raporNo?: string;
  /** Bilgiyi bildiren kişi / birim. */
  bildiren?: string;
  /** Bilginin geliş şekli (sözlü, telefon, yazılı, personel, diğer). */
  bilgiKaynagi?: BilgiKaynagi;
  /** Patlatma sonucu — yalnız E bendi sonuç kayıtlarında dolar. */
  patlatmaSonucu?: PatlatmaSonucu;
  raporDosyasi?: DekontDosyasi | null;
  notlar?: string;
}

export interface SigortaSirketi {
  id: string;
  ad: string;
  vergiNo: string;
  adres: string;
  telefon: string;
  eposta: string;
  yetkiliKisi: string;
  yetkiliTelefon: string;
  aktif: boolean;
  notlar: string;
}

export interface Isletmeci {
  id: string;
  ad: string;
  tur: 'SAHIS' | 'SIRKET';
  kimlikNo: string;
  telefon: string;
  adres: string;
  yetkiliKisi: string;
  aktif: boolean;
}

export interface TasOcagi {
  id: string;
  ad: string;
  isletmeciId: string;
  ruhsatNo: string;
  bolge: string;
  adres: string;
  sorumluKisi: string;
  telefon: string;
  aktif: boolean;
  notlar: string;
}

/**
 * Kredi hareketi tipleri:
 * - YUKLEME: ödeme alınan kredi.
 * - PLAN: planlanan / rapor bekleyen kredi (kredi düşümü YAPILMAZ).
 * - KULLANIM: gerçekleşme raporu işlendi, kredi düşüldü.
 */
export interface KrediHareketi {
  id: string;
  isletmeciId: string;
  tip: 'YUKLEME' | 'PLAN' | 'KULLANIM';
  adet: number;
  kayitNo: string;
  tasOcagiId?: string;
  dekontNo?: string;
  makbuzNo?: string;
  /** Gerçekleşme hareketinin bağlı olduğu plan kaydı. */
  planKayitNo?: string;
  raporNo?: string;
  bildiren?: string;
  tarih: string;
  aciklama: string;
}

/**
 * Sade kullanıcı dili: “Rapor Bekliyor” yerine “Sonuç Bekliyor”, E bendi tamamlanan
 * patlatmalar için “Yapıldı” / “Yapılmadı” kullanılır.
 */
export type AjandaDurumu =
'Planlandı' |
'Sonuç Bekliyor' |
'İşlem Başlatılabilir' |
'Görev Tamamlandı' |
'Yapıldı' |
'Yapılmadı' |
'Ertelendi' |
'İptal Edildi';

export interface AjandaKaydi {
  id: string;
  kayitNo: string;
  bent: BentKodu;
  islemTuru: string;
  baslik: string;
  talepEden: string;
  birim: string;
  /** Kaydı oluşturan birimin kart kimliği. */
  birimId?: string;
  /** Kaydı oluşturan kullanıcının kimliği. */
  olusturanKullaniciId?: string;
  /** Operasyon tarihi — dekont tarihi asla ajanda tarihi olarak kullanılmaz. */
  tarih: string;
  saat: string;
  yer: string;
  durum: AjandaDurumu;
  odemeDurumu: string;
  /** E bendi planlı patlatma kartları için gerçekleşme raporu bağlamı. */
  isletmeciId?: string;
  tasOcagiId?: string;
  planlananAdet?: number;
  /** Varsa belge / bildirim no. */
  raporNo?: string;
  /** Bilginin geliş şekli. */
  bilgiKaynagi?: BilgiKaynagi;
  /** Sonucu işlenen patlatmanın kredi düşüm kaydı (EKGR). */
  gerceklesmeKayitNo?: string;
  /** Yapılmadı / ertelendi / iptal nedeni ve açıklaması. */
  sonucNotu?: string;
}

export interface AuditKaydi {
  id: string;
  zaman: string;
  kullanici: string;
  eylem: string;
  hedef: string;
}

export interface MaliYilArsivi {
  yil: number;
  kayitSayisi: number;
  makbuzSayisi: number;
  toplamTutar: number;
  durum: 'Aktif' | 'Arşive Hazır' | 'Arşivlendi';
  manifestHash: string | null;
  dogrulandi: boolean;
}