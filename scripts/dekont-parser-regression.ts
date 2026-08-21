import { parseDekontFields } from '../src/utils/dekontOcr';

type Beklenti = {
  ad: string;
  metin: string;
  banka?: string;
  dekontNo?: string;
  bankaReferansNo?: string;
  tarih?: string;
  tutar?: number;
  odemeYapan?: string;
  belgeNoYok?: boolean;
};

const ortak = (metin: string): Beklenti => ({ ad: '', metin });

const testler: Beklenti[] = [
  {
    ...ortak(`TÜRKİYE İŞ BANKASI\nReferans Numarası: 09.08.2026/447/8888/8888\ne-Dekont Belge No: A022026988373764\nDekont Tarihi: 09.08.2026\nGönderici Hesap: TARMAC ASFALT-BETON-İNŞAAT LTD.\nAktarılan Tutar: 21.267,90 TRY\nHavale Ücreti+Vergi: 39,99 TRY\nToplam Tutar: 21.307,89 TRY\nBSMV: 1,16 TRY`),
    ad: 'T1 İş Bankası', banka: 'Türkiye İş Bankası', dekontNo: 'A022026988373764', bankaReferansNo: '09.08.2026/447/8888/8888', tarih: '2026-08-09', tutar: 21267.9, odemeYapan: 'TARMAC ASFALT-BETON-İNŞAAT LTD.'
  },
  {
    ...ortak(`HALKBANK\nİşlem Tarihi: 18.08.2026\nBelge No: HB20260818001\nGönderen: AŞAN NAKLİYAT LTD.\nSorgu No: 123456789\nİşlem Tutarı: 7.089,00 TL\nFAST Ücreti: 30,00 TL\nBSMV: 0,90 TL\nToplam: 7.119,90 TL`),
    ad: 'T2 Halkbank', banka: 'Türkiye Halk Bankası', dekontNo: 'HB20260818001', bankaReferansNo: '123456789', tarih: '2026-08-18', tutar: 7089, odemeYapan: 'AŞAN NAKLİYAT LTD.'
  },
  {
    ...ortak(`YAPI KREDİ\nİşlem Ref: 254314585896\nBelge Numarası: SYH2026210866503\nİşlem Tarihi: 18.08.2026\nGiden FAST Tutarı: 7.089,30 TL\nVergi: 0,40 TL\nKomisyon: 7,97 TL\nToplam Tahsilat Tutarı: 7.097,67 TL\nGönderen Adı: MEHMET ATA BAŞAR\nSorgu No: 88331`),
    ad: 'T3 Yapı Kredi', banka: 'Yapı ve Kredi Bankası', dekontNo: 'SYH2026210866503', bankaReferansNo: '254314585896', tarih: '2026-08-18', tutar: 7089.3, odemeYapan: 'MEHMET ATA BAŞAR'
  },
  {
    ...ortak(`CapitalBank\nFiş No: 17912307\nHesap Adı: BOZKAYA LİMİTED\nİşlem Tarihi: 04.08.2026\nBorç: 7.089,00 TL\nHMK Tutarı: 9,27 TL\nToplam Net Tutar: 7.098,27 TL`),
    ad: 'T4 CapitalBank', banka: 'CapitalBank', dekontNo: '17912307', tarih: '2026-08-04', tutar: 7089, odemeYapan: 'BOZKAYA LİMİTED'
  },
  {
    ...ortak(`NovaBank\nFiş No: NV7788\nHesap Adı: NOVA TİCARET\nİşlem Tarihi: 04.08.2026\nBorç: 7.089,30 TL\nMasraf: 37,08 TL\nToplam Net Tutar: 7.126,38 TL`),
    ad: 'T5 NovaBank', banka: 'NovaBank', dekontNo: 'NV7788', tarih: '2026-08-04', tutar: 7089.3, odemeYapan: 'NOVA TİCARET'
  },
  {
    ...ortak(`TEB\nİşlem No: TEB-7788\nTarih-Saat: 18.08.2026 14:30\nGönderen hesap sahibi: AYŞE YILMAZ\nTransfer Tutarı: 7.089,30 TL\nAlacaklı: KTPGV\nÜcret: 12,00 TL`),
    ad: 'T6 TEB', banka: 'Türk Ekonomi Bankası', bankaReferansNo: 'TEB-7788', tarih: '2026-08-18', tutar: 7089.3, odemeYapan: 'AYŞE YILMAZ'
  },
  {
    ...ortak(`Mobil bankacılık bildirimi\nGönderen: MEHMET ATA BAŞAR\nTarih-Saat: 18.08.2026 14:30\nTutar: 7.089,30 TL\nAçıklama: Kredi yükleme`),
    ad: 'T7 Mobil bildirim', banka: undefined, dekontNo: undefined, bankaReferansNo: undefined, tarih: '2026-08-18', tutar: 7089.3, odemeYapan: 'MEHMET ATA BAŞAR', belgeNoYok: true
  }
];

function kontrol(test: Beklenti): string[] {
  const sonuc = parseDekontFields(test.metin);
  const hatalar: string[] = [];
  if (test.banka !== undefined && sonuc.banka !== test.banka) hatalar.push(`banka=${sonuc.banka}`);
  if (test.dekontNo !== undefined && sonuc.dekontNo !== test.dekontNo) hatalar.push(`dekontNo=${sonuc.dekontNo}`);
  if (test.bankaReferansNo !== undefined && sonuc.bankaReferansNo !== test.bankaReferansNo) hatalar.push(`referans=${sonuc.bankaReferansNo}`);
  if (test.belgeNoYok && sonuc.dekontNo) hatalar.push(`uydurma belgeNo=${sonuc.dekontNo}`);
  if (test.tarih !== undefined && sonuc.tarih !== test.tarih) hatalar.push(`tarih=${sonuc.tarih}`);
  if (test.tutar !== undefined && sonuc.odenenTutar !== test.tutar) hatalar.push(`tutar=${sonuc.odenenTutar}`);
  if (test.odemeYapan !== undefined && sonuc.odemeYapan !== test.odemeYapan) hatalar.push(`odemeYapan=${sonuc.odemeYapan}`);
  return hatalar;
}

let basarisiz = 0;
for (const test of testler) {
  const hatalar = kontrol(test);
  if (hatalar.length) {
    basarisiz += 1;
    console.error(`FAIL ${test.ad}: ${hatalar.join(', ')}`);
  } else {
    console.log(`PASS ${test.ad}`);
  }
}

if (basarisiz) process.exit(1);
