import { AjandaKaydi, AuditKaydi, Islem, Kullanici } from '../types';

/**
 * Merkezi yetki mantığı.
 *
 * Menü görünürlüğü ile VERİ görünürlüğü farklı şeylerdir:
 * - Menü görünürlüğü, kullanıcının ekranı açıp açamayacağını belirler.
 * - Veri görünürlüğü, ekranda hangi kayıtların listeleneceğini belirler.
 *
 * Yetki filtresi veriyi SİLMEZ; yalnızca aktif kullanıcının görüşünü daraltır.
 * Merkez Admin ile giriş yapıldığında tüm veri yine görünür.
 */

export function kullaniciMerkezAdminMi(kullanici: Kullanici | null): boolean {
  return kullanici?.rolKodu === 'MERKEZ_ADMIN';
}

export function kullaniciDenetciMi(kullanici: Kullanici | null): boolean {
  if (!kullanici) return false;
  return kullanici.rolKodu === 'DENETCI' || kullanici.sadeceGoruntule;
}

/** Merkez Admin ve Denetçi tüm kayıtları görür (Denetçi yalnız okuyabilir). */
export function kullaniciTumVeriGorebilir(kullanici: Kullanici | null): boolean {
  return kullaniciMerkezAdminMi(kullanici) || kullaniciDenetciMi(kullanici);
}

/** Vakıf Muhasebe / Mali İşler tüm mali kayıtları görür. */
export function kullaniciMaliVeriGorebilir(kullanici: Kullanici | null): boolean {
  if (!kullanici) return false;
  return kullaniciTumVeriGorebilir(kullanici) || kullanici.rolKodu === 'VAKIF_MUHASEBE';
}

/**
 * Mali kayıt = ödeme doğuran kayıt.
 * E bendinde yalnız EKRD kredi yükleme mali kayıttır; EKPL ve EKGR operasyoneldir.
 */
export function maliKayitMi(islem: Islem): boolean {
  return !islem.eIslemTuru || islem.eIslemTuru === 'KREDI_YUKLEME';
}

function birimEslesiyorMu(kullanici: Kullanici, birimId?: string, birimAdi?: string): boolean {
  if (kullanici.birimId && birimId) return kullanici.birimId === birimId;
  if (birimAdi && kullanici.birim) return birimAdi === kullanici.birim;
  // Eski demo kayıtlarında birim eşleşmesi kurulamıyorsa yalnız Admin / Denetçi görebilir.
  return false;
}

/** Rol bazlı ek daraltmalar (örn. Trafik Müdürlüğü F / Adli kayıtları görmez). */
function rolKapsamiUygunMu(kullanici: Kullanici, islem: Islem): boolean {
  if (kullanici.rolKodu === 'PGM_TRAFIK' && islem.bent === 'F' && islem.fAltTur === 'ADLI') {
    return false;
  }
  return true;
}

export function islemGorulebilirMi(kullanici: Kullanici | null, islem: Islem): boolean {
  if (!kullanici) return false;
  if (kullaniciTumVeriGorebilir(kullanici)) return true;
  // Vakıf Muhasebe ödeme/makbuz süreci için tüm mali kayıtları görür.
  if (kullanici.rolKodu === 'VAKIF_MUHASEBE' && maliKayitMi(islem)) return true;
  if (!kullanici.bentler.includes(islem.bent)) return false;
  if (!rolKapsamiUygunMu(kullanici, islem)) return false;
  return birimEslesiyorMu(kullanici, islem.birimId, islem.birim);
}

export function maliKayitGorulebilirMi(kullanici: Kullanici | null, islem: Islem): boolean {
  return maliKayitMi(islem) && islemGorulebilirMi(kullanici, islem);
}

export function raporKaydiGorulebilirMi(kullanici: Kullanici | null, islem: Islem): boolean {
  return islemGorulebilirMi(kullanici, islem);
}

export function ajandaKaydiGorulebilirMi(
kullanici: Kullanici | null,
kayit: AjandaKaydi)
: boolean {
  if (!kullanici) return false;
  if (kullaniciTumVeriGorebilir(kullanici)) return true;
  if (!kullanici.bentler.includes(kayit.bent)) return false;
  return birimEslesiyorMu(kullanici, kayit.birimId, kayit.birim);
}

/** Audit hedefindeki kayıt / makbuz numarası benzeri belirteçleri ayıklar. */
function hedeftekiKayitNumaralari(hedef: string): string[] {
  return hedef.match(/[A-ZÇ]{1,4}-\d{4}-\d{4,6}(?:-\d{3})?/g) ?? [];
}

export function auditKaydiGorulebilirMi(
kullanici: Kullanici | null,
kayit: AuditKaydi,
gorunurNumaralar: Set<string>)
: boolean {
  if (!kullanici) return false;
  if (kullaniciTumVeriGorebilir(kullanici)) return true;
  const numaralar = hedeftekiKayitNumaralari(kayit.hedef);
  if (numaralar.length > 0) {
    return numaralar.some((no) => gorunurNumaralar.has(no));
  }
  // Kayıt numarası içermeyen hareketlerde yalnız kullanıcının kendi işlemleri görünür.
  return kayit.kullanici === kullanici.adSoyad;
}

export function islemDegistirilebilirMi(kullanici: Kullanici | null, islem: Islem): boolean {
  if (!kullanici || kullanici.sadeceGoruntule) return false;
  if (!islemGorulebilirMi(kullanici, islem)) return false;
  return kullaniciMerkezAdminMi(kullanici) || kullanici.bentler.includes(islem.bent);
}

export function makbuzUretilebilirMi(kullanici: Kullanici | null, islem: Islem): boolean {
  if (!kullanici || kullanici.sadeceGoruntule) return false;
  if (!kullanici.makbuzUretebilir) return false;
  if (!maliKayitGorulebilirMi(kullanici, islem)) return false;
  if (islem.makbuzNo) return false;
  return islem.durum !== 'ODEME_BEKLIYOR';
}

export function odemeDogrulanabilirMi(kullanici: Kullanici | null, islem: Islem): boolean {
  if (!kullanici || kullanici.sadeceGoruntule) return false;
  const odemeRolu =
  kullaniciMerkezAdminMi(kullanici) ||
  kullanici.rolKodu === 'VAKIF_MUHASEBE' ||
  kullanici.makbuzUretebilir;
  if (!odemeRolu) return false;
  if (!maliKayitGorulebilirMi(kullanici, islem)) return false;
  return islem.durum === 'ODEME_BEKLIYOR';
}

export function ajandaIslemiYapilabilirMi(
kullanici: Kullanici | null,
kayit: AjandaKaydi)
: boolean {
  if (!kullanici || kullanici.sadeceGoruntule) return false;
  if (!kullanici.ajandaKullanabilir) return false;
  return ajandaKaydiGorulebilirMi(kullanici, kayit);
}

/** Ekran (route) erişimi: menü gizlemek yetmez, sayfa da korunur. */
export function ekranGorulebilirMi(kullanici: Kullanici | null, menuId: string): boolean {
  if (!kullanici) return false;
  return kullaniciMerkezAdminMi(kullanici) || kullanici.menuler.includes(menuId);
}

/** Kullanıcı Yönetimi / Birim Yönetimi erişimi ayrı ayrı kontrol edilir. */
export function yonetimEkraniGorulebilirMi(
kullanici: Kullanici | null,
menuId: 'kullanici-yonetimi' | 'birim-yonetimi')
: boolean {
  return ekranGorulebilirMi(kullanici, menuId);
}