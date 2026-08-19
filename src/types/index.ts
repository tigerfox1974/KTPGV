export type BentKodu = 'A' | 'B' | 'C' | 'Ç' | 'D' | 'E' | 'F';

export type FAltTur = 'ADLI' | 'TRAFIK';

export type EIslemTuru = 'KREDI_YUKLEME' | 'KREDI_KULLANIM';

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
  bentler: BentKodu[];
  menuler: string[];
  makbuzUretebilir: boolean;
  sadeceGoruntule: boolean;
  raporGorebilir: boolean;
  ajandaKullanabilir: boolean;
  bauGuncelleyebilir: boolean;
}

export type DekontYontemi = 'PERSONEL' | 'QR_LINK';

export interface DekontDosyasi {
  ad: string;
  tur: 'PDF' | 'JPG' | 'PNG';
  boyutKb: number;
  yontem: DekontYontemi;
  yuklemeZamani: string;
  sikistirildi?: boolean;
}

export interface Dekont {
  dekontNo: string;
  banka: string;
  tarih: string;
  odenenTutar: number;
  odemeYapan: string;
  dosya: DekontDosyasi | null;
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

export interface Islem {
  id: string;
  kayitNo: string;
  bent: BentKodu;
  fAltTur?: FAltTur;
  eIslemTuru?: EIslemTuru;
  baslik: string;
  talepEden: string;
  birim: string;
  olusturan: string;
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
  isletmeciId?: string;
  tasOcagiId?: string;
  krediAdedi?: number;
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

export interface KrediHareketi {
  id: string;
  isletmeciId: string;
  tip: 'YUKLEME' | 'KULLANIM';
  adet: number;
  kayitNo: string;
  tasOcagiId?: string;
  dekontNo?: string;
  makbuzNo?: string;
  tarih: string;
  aciklama: string;
}

export type AjandaDurumu =
'Planlandı' |
'İşlem Başlatılabilir' |
'Görev Tamamlandı' |
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
  /** Operasyon tarihi — dekont tarihi asla ajanda tarihi olarak kullanılmaz. */
  tarih: string;
  saat: string;
  yer: string;
  durum: AjandaDurumu;
  odemeDurumu: string;
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