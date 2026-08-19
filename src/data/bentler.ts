import { Bent } from '../types';

export const bentler: Bent[] = [
{
  kod: 'A',
  baslik: 'Faaliyet geliri / yardım / bağış',
  aciklama: 'Sabit oran yoktur, tutar manuel girilir.',
  formul: 'Manuel tutar',
  hesaplamaTuru: 'MANUEL',
  ajandayaDuser: false
},
{
  kod: 'B',
  baslik: 'Hurda ve hizmet dışı mal satışı',
  aciklama:
  'Bu gelir, ilgili yasal amaç kapsamında Kurum hesabına aktarılır. Sabit oran yoktur.',
  formul: 'Manuel tutar',
  hesaplamaTuru: 'MANUEL',
  ajandayaDuser: false
},
{
  kod: 'C',
  baslik: 'İtfaiye denetim / kontrol / rapor',
  aciklama: 'BAÜ x %2 = işlem başı tutar. İşlem adedi ile çarpılarak toplam bulunur.',
  formul: 'Brüt Asgari Ücret x %2 x İşlem Adedi',
  hesaplamaTuru: 'ADET',
  ajandayaDuser: true
},
{
  kod: 'Ç',
  baslik: 'Yangın Risk Raporu',
  aciklama: 'BAÜ x %10 = rapor başı tutar.',
  formul: 'Brüt Asgari Ücret x %10 x Rapor Adedi',
  hesaplamaTuru: 'ADET',
  ajandayaDuser: true
},
{
  kod: 'D',
  baslik: 'Yol kapama ve güvenlik tedbiri',
  aciklama:
  'Polis sayısı tam sayı, görev süresi tam saat olmalıdır. Buçuklu değer kabul edilmez.',
  formul: 'Polis Sayısı x Görev Süresi x Brüt Asgari Ücret x %0,5',
  hesaplamaTuru: 'GOREV',
  ajandayaDuser: true
},
{
  kod: 'E',
  baslik: 'Taş ocağı patlatma işlemi',
  aciklama:
  'Patlatma kredisi modeli uygulanır. Ödeme kredi olarak yüklenir, her patlatmada krediden düşülür.',
  formul: '1 Patlatma Kredisi = Brüt Asgari Ücret x %10',
  hesaplamaTuru: 'KREDI',
  ajandayaDuser: true
},
{
  kod: 'F',
  baslik: 'Adli / trafik polis raporu',
  aciklama: 'BAÜ x %1 = rapor başı tutar. Alt tür seçimi zorunludur.',
  formul: 'Brüt Asgari Ücret x %1 x Rapor Adedi',
  hesaplamaTuru: 'ADET',
  ajandayaDuser: true
}];


export function bentBul(kod: string): Bent | undefined {
  return bentler.find((b) => b.kod === kod);
}

export function bentEtiketi(kod: string): string {
  const bent = bentBul(kod);
  return bent ? `${bent.kod} - ${bent.baslik}` : kod;
}