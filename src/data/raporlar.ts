export interface RaporTanimi {
  id: string;
  ad: string;
  aciklama: string;
  kapsam: string;
}

export const raporTanimlari: RaporTanimi[] = [
{ id: 'gelir', ad: 'Gelir raporu', aciklama: 'Mali yıl içindeki tüm bent gelirlerinin toplamı.', kapsam: 'Tüm bentler' },
{ id: 'bent', ad: 'Bent bazlı rapor', aciklama: 'Her bent için kayıt adedi ve tahsil edilen tutar.', kapsam: 'A – F' },
{ id: 'birim', ad: 'Birim bazlı rapor', aciklama: 'Kaydı oluşturan birim bazında dağılım.', kapsam: 'Tüm birimler' },
{ id: 'odeme', ad: 'Ödeme / dekont raporu', aciklama: 'Dekont no, banka, ödeme yapan ve dosya yükleme yöntemi kırılımı.', kapsam: 'Mali işlemler' },
{ id: 'makbuz', ad: 'Makbuz raporu', aciklama: 'Üretilen makbuzlar, üreten kullanıcı ve bağlı kayıtlar.', kapsam: 'BM serisi' },
{ id: 'sigorta', ad: 'Sigorta şirketi bazlı trafik raporu', aciklama: 'Şirket bazında trafik raporu adedi ve tutarı.', kapsam: 'F / Trafik' },
{ id: 'ttrf', ad: 'Toplu TTRF başvuru raporu', aciklama: 'Ana TTRF kayıtları ve bağlı alt başvuru adetleri.', kapsam: 'TTRF serisi' },
{ id: 'kredi', ad: 'Taş ocağı işletmeci kredi raporu', aciklama: 'İşletmeci bazında yüklenen kredi ve ödeme tutarları.', kapsam: 'E / EKRD' },
{ id: 'kullanim', ad: 'Taş ocağı kullanım raporu', aciklama: 'Planlı patlatmalar (EKPL) ve gerçekleşme raporu işlenmiş kullanımlar (EKGR).', kapsam: 'E / EKPL + EKGR' },
{ id: 'kalan-kredi', ad: 'Kalan kredi raporu', aciklama: 'İşletmeci hesaplarındaki kalan patlatma kredisi.', kapsam: 'E bendi' },
{ id: 'ajanda', ad: 'Ajanda raporu', aciklama: 'Operasyonel görevlerin durum dağılımı.', kapsam: 'C, Ç, D, E kullanım, F' },
{ id: 'audit', ad: 'Audit log raporu', aciklama: 'Kullanıcı hareketlerinin denetim izi.', kapsam: 'Tüm sistem' },
{ id: 'arsiv', ad: 'Mali yıl arşiv raporu', aciklama: 'Arşivlenen mali yıllar, manifest ve bütünlük durumu.', kapsam: 'Mali yıllar' }];