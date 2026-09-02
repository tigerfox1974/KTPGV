import { strict as assert } from 'node:assert';
import { Islem } from '../src/types';
import {
  islemDekontlariniOku,
  islemKrediYuklemeOzetiniHesapla,
  krediYuklemeKaydiniCozumle,
  krediYuklemeDekontMukerrerliginiBul,
  krediYuklemeDagiliminiHesapla } from
'../src/utils/krediYukleme';

type Beklenti = {
  ad: string;
  girdi: Parameters<typeof krediYuklemeDagiliminiHesapla>[0];
  beklenen: {
    hedefTutar: number;
    krediyeAyrilanToplam: number;
    kullanilabilirKrediAdedi: number;
    bekleyenBakiye: number;
    kalanHedef: number;
    genelBagisToplami: number;
    dekontDagilimlari: Array<{krediyeAyrilanTutar: number;genelBagisTutari: number;}>;
  };
};

const testler: Beklenti[] = [
{
  ad: 'T1 Tam ödeme',
  girdi: {
    talepEdilenKrediAdedi: 3,
    birimKrediBedeli: 7089.3,
    dekontlar: [{ dekontNo: 'D-001', odenenTutar: 21267.9 }]
  },
  beklenen: {
    hedefTutar: 21267.9,
    krediyeAyrilanToplam: 21267.9,
    kullanilabilirKrediAdedi: 3,
    bekleyenBakiye: 0,
    kalanHedef: 0,
    genelBagisToplami: 0,
    dekontDagilimlari: [{ krediyeAyrilanTutar: 21267.9, genelBagisTutari: 0 }]
  }
},
{
  ad: 'T2 Bir krediden az ödeme',
  girdi: {
    talepEdilenKrediAdedi: 2,
    birimKrediBedeli: 7089.3,
    dekontlar: [{ dekontNo: 'D-002', odenenTutar: 5000 }]
  },
  beklenen: {
    hedefTutar: 14178.6,
    krediyeAyrilanToplam: 5000,
    kullanilabilirKrediAdedi: 0,
    bekleyenBakiye: 5000,
    kalanHedef: 9178.6,
    genelBagisToplami: 0,
    dekontDagilimlari: [{ krediyeAyrilanTutar: 5000, genelBagisTutari: 0 }]
  }
},
{
  ad: 'T3 Birkaç tam kredi ve bakiye',
  girdi: {
    talepEdilenKrediAdedi: 5,
    birimKrediBedeli: 7089.3,
    dekontlar: [{ dekontNo: 'D-003', odenenTutar: 15500 }]
  },
  beklenen: {
    hedefTutar: 35446.5,
    krediyeAyrilanToplam: 15500,
    kullanilabilirKrediAdedi: 2,
    bekleyenBakiye: 1321.4,
    kalanHedef: 19946.5,
    genelBagisToplami: 0,
    dekontDagilimlari: [{ krediyeAyrilanTutar: 15500, genelBagisTutari: 0 }]
  }
},
{
  ad: 'T4 Çoklu dekontla tamamlama',
  girdi: {
    talepEdilenKrediAdedi: 5,
    birimKrediBedeli: 7089.3,
    dekontlar: [
    { dekontNo: 'D-004-A', odenenTutar: 15500 },
    { dekontNo: 'D-004-B', odenenTutar: 19946.5 }]
  },
  beklenen: {
    hedefTutar: 35446.5,
    krediyeAyrilanToplam: 35446.5,
    kullanilabilirKrediAdedi: 5,
    bekleyenBakiye: 0,
    kalanHedef: 0,
    genelBagisToplami: 0,
    dekontDagilimlari: [
    { krediyeAyrilanTutar: 15500, genelBagisTutari: 0 },
    { krediyeAyrilanTutar: 19946.5, genelBagisTutari: 0 }]
  }
},
{
  ad: 'T5 Son dekontta fazla ödeme',
  girdi: {
    talepEdilenKrediAdedi: 5,
    birimKrediBedeli: 7089.3,
    dekontlar: [
    { dekontNo: 'D-005-A', odenenTutar: 15500 },
    { dekontNo: 'D-005-B', odenenTutar: 20000 }]
  },
  beklenen: {
    hedefTutar: 35446.5,
    krediyeAyrilanToplam: 35446.5,
    kullanilabilirKrediAdedi: 5,
    bekleyenBakiye: 0,
    kalanHedef: 0,
    genelBagisToplami: 53.5,
    dekontDagilimlari: [
    { krediyeAyrilanTutar: 15500, genelBagisTutari: 0 },
    { krediyeAyrilanTutar: 19946.5, genelBagisTutari: 53.5 }]
  }
},
{
  ad: 'T6 İlk dekontta fazla ödeme',
  girdi: {
    talepEdilenKrediAdedi: 3,
    birimKrediBedeli: 7089.3,
    dekontlar: [{ dekontNo: 'D-006', odenenTutar: 22000 }]
  },
  beklenen: {
    hedefTutar: 21267.9,
    krediyeAyrilanToplam: 21267.9,
    kullanilabilirKrediAdedi: 3,
    bekleyenBakiye: 0,
    kalanHedef: 0,
    genelBagisToplami: 732.1,
    dekontDagilimlari: [{ krediyeAyrilanTutar: 21267.9, genelBagisTutari: 732.1 }]
  }
},
{
  ad: 'T7 Talep üst sınırı cap',
  girdi: {
    talepEdilenKrediAdedi: 2,
    birimKrediBedeli: 100,
    dekontlar: [
    { dekontNo: 'D-007-A', odenenTutar: 250 },
    { dekontNo: 'D-007-B', odenenTutar: 100 }]
  },
  beklenen: {
    hedefTutar: 200,
    krediyeAyrilanToplam: 200,
    kullanilabilirKrediAdedi: 2,
    bekleyenBakiye: 0,
    kalanHedef: 0,
    genelBagisToplami: 150,
    dekontDagilimlari: [
    { krediyeAyrilanTutar: 200, genelBagisTutari: 50 },
    { krediyeAyrilanTutar: 0, genelBagisTutari: 100 }]
  }
},
{
  ad: 'T8 Kuruş hassasiyeti',
  girdi: {
    talepEdilenKrediAdedi: 1,
    birimKrediBedeli: 0.3,
    dekontlar: [
    { dekontNo: 'D-008-A', odenenTutar: 0.1 },
    { dekontNo: 'D-008-B', odenenTutar: 0.2 }]
  },
  beklenen: {
    hedefTutar: 0.3,
    krediyeAyrilanToplam: 0.3,
    kullanilabilirKrediAdedi: 1,
    bekleyenBakiye: 0,
    kalanHedef: 0,
    genelBagisToplami: 0,
    dekontDagilimlari: [
    { krediyeAyrilanTutar: 0.1, genelBagisTutari: 0 },
    { krediyeAyrilanTutar: 0.2, genelBagisTutari: 0 }]
  }
}];

function kontrolEt(test: Beklenti) {
  const sonuc = krediYuklemeDagiliminiHesapla(test.girdi);

  assert.equal(sonuc.hedefTutar, test.beklenen.hedefTutar, 'hedefTutar');
  assert.equal(sonuc.krediyeAyrilanToplam, test.beklenen.krediyeAyrilanToplam, 'krediyeAyrilanToplam');
  assert.equal(sonuc.kullanilabilirKrediAdedi, test.beklenen.kullanilabilirKrediAdedi, 'kullanilabilirKrediAdedi');
  assert.equal(sonuc.bekleyenBakiye, test.beklenen.bekleyenBakiye, 'bekleyenBakiye');
  assert.equal(sonuc.kalanHedef, test.beklenen.kalanHedef, 'kalanHedef');
  assert.equal(sonuc.genelBagisToplami, test.beklenen.genelBagisToplami, 'genelBagisToplami');
  assert.equal(sonuc.dekontDagilimlari.length, test.beklenen.dekontDagilimlari.length, 'dekontDagilim sayısı');

  sonuc.dekontDagilimlari.forEach((dagilim, index) => {
    assert.equal(
      dagilim.krediyeAyrilanTutar,
      test.beklenen.dekontDagilimlari[index].krediyeAyrilanTutar,
      `dekont[${index}] krediyeAyrilanTutar`
    );
    assert.equal(
      dagilim.genelBagisTutari,
      test.beklenen.dekontDagilimlari[index].genelBagisTutari,
      `dekont[${index}] genelBagisTutari`
    );
  });
}

let basarisiz = 0;

for (const test of testler) {
  try {
    kontrolEt(test);
    console.log(`PASS ${test.ad}`);
  } catch (error) {
    basarisiz += 1;
    console.error(`FAIL ${test.ad}: ${(error as Error).message}`);
  }
}

try {
  const fazlaOdemeKaydi: Pick<
  Islem,
  'dekont' | 'dekontlar' | 'krediAdedi' | 'durum' | 'makbuzNo' | 'bagisMakbuzlari'
  > = {
    krediAdedi: 3,
    makbuzNo: null,
    durum: 'MAKBUZ_BEKLIYOR',
    dekont: {
      id: 'T9-001',
      dekontNo: 'T9-001',
      banka: 'Kıbrıs Vakıflar Bankası',
      tarih: '2026-08-29',
      odenenTutar: 22000,
      odemeYapan: 'Demo Şirketi',
      dosya: null,
      dogrulamaDurumu: 'DOGRULANDI',
      dogrulamaZamani: '2026-08-29T09:15:00Z'
    }
  };
  const fazlaOdemeAnalizi = krediYuklemeKaydiniCozumle({
    islem: {
      ...fazlaOdemeKaydi,
      dekontlar: [fazlaOdemeKaydi.dekont]
    },
    birimKrediBedeli: 7089.3
  });
  assert.equal(fazlaOdemeAnalizi.makbuzEksikleri.length, 2, 'fazla ödemede iki makbuz beklenir');
  assert.equal(fazlaOdemeAnalizi.makbuzEksikleri[0].tur, 'TAS_OCAGI_PATLATMASI', 'ilk makbuz patlatma bağışı');
  assert.equal(fazlaOdemeAnalizi.makbuzEksikleri[0].tutar, 21267.9, 'patlatma bağışı tutarı');
  assert.equal(fazlaOdemeAnalizi.makbuzEksikleri[1].tur, 'GENEL_VAKIF_BAGISI', 'ikinci makbuz genel bağış');
  assert.equal(fazlaOdemeAnalizi.makbuzEksikleri[1].tutar, 732.1, 'genel bağış tutarı');
  console.log('PASS T9 Fazla ödemede iki makbuz dağılımı');
} catch (error) {
  basarisiz += 1;
  console.error(`FAIL T9 Fazla ödemede iki makbuz dağılımı: ${(error as Error).message}`);
}

try {
  const dogrulanmamisKayit: Pick<
  Islem,
  'dekont' | 'dekontlar' | 'krediAdedi' | 'durum' | 'makbuzNo' | 'bagisMakbuzlari'
  > = {
    krediAdedi: 3,
    makbuzNo: null,
    durum: 'ODEME_BEKLIYOR',
    dekont: {
      id: 'T10-001',
      dekontNo: 'T10-001',
      banka: 'Kıbrıs Vakıflar Bankası',
      tarih: '2026-08-29',
      odenenTutar: 22000,
      odemeYapan: 'Demo Şirketi',
      dosya: null,
      dogrulamaDurumu: 'BEKLIYOR'
    },
    dekontlar: [
    {
      id: 'T10-001',
      dekontNo: 'T10-001',
      banka: 'Kıbrıs Vakıflar Bankası',
      tarih: '2026-08-29',
      odenenTutar: 22000,
      odemeYapan: 'Demo Şirketi',
      dosya: null,
      dogrulamaDurumu: 'BEKLIYOR'
    }]
  };
  const dogrulanmamisAnaliz = krediYuklemeKaydiniCozumle({
    islem: dogrulanmamisKayit,
    birimKrediBedeli: 7089.3
  });
  assert.equal(dogrulanmamisAnaliz.krediTalebiOdemeOzeti.dogrulanmisOdemeToplami, 0, 'doğrulanmamış dekont ödeme sayılmaz');
  assert.equal(dogrulanmamisAnaliz.dogrulanmisOzeti.kullanilabilirKrediAdedi, 0, 'doğrulanmamış dekont kredi üretmez');
  assert.equal(dogrulanmamisAnaliz.yeniYuklemeAdedi, 0, 'doğrulanmamış dekont yükleme hareketi üretmez');
  console.log('PASS T10 Doğrulanmamış dekont kredi üretmez');
} catch (error) {
  basarisiz += 1;
  console.error(`FAIL T10 Doğrulanmamış dekont kredi üretmez: ${(error as Error).message}`);
}

try {
  const kismiDogrulanmisKayit: Pick<
  Islem,
  'dekont' | 'dekontlar' | 'krediAdedi' | 'durum' | 'makbuzNo' | 'bagisMakbuzlari'
  > = {
    krediAdedi: 5,
    makbuzNo: null,
    durum: 'MAKBUZ_BEKLIYOR',
    dekont: {
      id: 'T11-001',
      dekontNo: 'T11-001',
      banka: 'Kıbrıs Vakıflar Bankası',
      tarih: '2026-08-29',
      odenenTutar: 15500,
      odemeYapan: 'Demo Şirketi',
      dosya: null,
      dogrulamaDurumu: 'DOGRULANDI',
      dogrulamaZamani: '2026-08-29T09:30:00Z'
    },
    dekontlar: [
    {
      id: 'T11-001',
      dekontNo: 'T11-001',
      banka: 'Kıbrıs Vakıflar Bankası',
      tarih: '2026-08-29',
      odenenTutar: 15500,
      odemeYapan: 'Demo Şirketi',
      dosya: null,
      dogrulamaDurumu: 'DOGRULANDI',
      dogrulamaZamani: '2026-08-29T09:30:00Z'
    },
    {
      id: 'T11-002',
      dekontNo: 'T11-002',
      banka: 'Kıbrıs Vakıflar Bankası',
      tarih: '2026-08-30',
      odenenTutar: 20000,
      odemeYapan: 'Demo Şirketi',
      dosya: null,
      dogrulamaDurumu: 'BEKLIYOR'
    }]
  };
  const kismiAnaliz = krediYuklemeKaydiniCozumle({
    islem: kismiDogrulanmisKayit,
    birimKrediBedeli: 7089.3
  });
  assert.equal(kismiAnaliz.krediTalebiOdemeOzeti.dogrulanmisOdemeToplami, 15500, 'yalnız doğrulanan ödeme toplama girer');
  assert.equal(kismiAnaliz.dogrulanmisOzeti.kullanilabilirKrediAdedi, 2, 'kısmi doğrulama tam kredi kadar üretir');
  assert.equal(kismiAnaliz.dogrulanmisOzeti.bekleyenBakiye, 1321.4, 'artık bakiye bekler');
  assert.equal(kismiAnaliz.yeniYuklemeAdedi, 2, 'ilk doğrulamada iki kredi hareketi gerekir');
  console.log('PASS T11 Kısmi doğrulanmış ödeme tam kredi kadar üretir');
} catch (error) {
  basarisiz += 1;
  console.error(`FAIL T11 Kısmi doğrulanmış ödeme tam kredi kadar üretir: ${(error as Error).message}`);
}

try {
  const tekrarsizKayit: Pick<
  Islem,
  'dekont' | 'dekontlar' | 'krediAdedi' | 'durum' | 'makbuzNo' | 'bagisMakbuzlari'
  > = {
    krediAdedi: 3,
    makbuzNo: 'BM-2026-000501',
    durum: 'TAMAMLANDI',
    dekont: {
      id: 'T12-001',
      dekontNo: 'T12-001',
      banka: 'Kıbrıs Vakıflar Bankası',
      tarih: '2026-08-29',
      odenenTutar: 22000,
      odemeYapan: 'Demo Şirketi',
      dosya: null,
      dogrulamaDurumu: 'DOGRULANDI',
      dogrulamaZamani: '2026-08-29T09:15:00Z',
      tutarDagilimi: [
      { amac: 'TAS_OCAGI_PATLATMASI', tutar: 21267.9, bagliMakbuzNo: 'BM-2026-000501' },
      { amac: 'GENEL_VAKIF_BAGISI', tutar: 732.1, bagliMakbuzNo: 'BM-2026-000502' }],
      bagisMakbuzlari: [
      {
        makbuzNo: 'BM-2026-000501',
        tur: 'TAS_OCAGI_PATLATMASI',
        tutar: 21267.9,
        bagliDekontId: 'T12-001',
        bagliDekontNo: 'T12-001',
        bagliDekontTarihi: '2026-08-29'
      },
      {
        makbuzNo: 'BM-2026-000502',
        tur: 'GENEL_VAKIF_BAGISI',
        tutar: 732.1,
        bagliDekontId: 'T12-001',
        bagliDekontNo: 'T12-001',
        bagliDekontTarihi: '2026-08-29'
      }]
    },
    dekontlar: [],
    bagisMakbuzlari: [
    {
      makbuzNo: 'BM-2026-000501',
      tur: 'TAS_OCAGI_PATLATMASI',
      tutar: 21267.9,
      bagliDekontId: 'T12-001',
      bagliDekontNo: 'T12-001',
      bagliDekontTarihi: '2026-08-29'
    },
    {
      makbuzNo: 'BM-2026-000502',
      tur: 'GENEL_VAKIF_BAGISI',
      tutar: 732.1,
      bagliDekontId: 'T12-001',
      bagliDekontNo: 'T12-001',
      bagliDekontTarihi: '2026-08-29'
    }]
  };
  const tekrarsizAnaliz = krediYuklemeKaydiniCozumle({
    islem: {
      ...tekrarsizKayit,
      dekontlar: [tekrarsizKayit.dekont]
    },
    birimKrediBedeli: 7089.3,
    mevcutYuklemeAdedi: 3
  });
  assert.equal(tekrarsizAnaliz.yeniYuklemeAdedi, 0, 'tekrar doğrulama ikinci kredi hareketi üretmez');
  assert.equal(tekrarsizAnaliz.makbuzEksikleri.length, 0, 'aynı dağılıma ikinci makbuz üretilmez');
  console.log('PASS T12 Tekrar doğrulama çift hareket ve makbuz oluşturmaz');
} catch (error) {
  basarisiz += 1;
  console.error(`FAIL T12 Tekrar doğrulama çift hareket ve makbuz oluşturmaz: ${(error as Error).message}`);
}

try {
  const duplicateKontrolu = krediYuklemeDekontMukerrerliginiBul({
    islemler: [
    {
      id: 'is-dup-1',
      kayitNo: 'EKRD-2026-000201',
      dekont: {
        dekontNo: 'DUP-1001',
        bankaReferansNo: 'REF-1001',
        banka: 'Kooperatif Merkez Bankası',
        tarih: '2026-08-29',
        odenenTutar: 5000,
        odemeYapan: 'Şirket A',
        dosya: { ad: 'dup-1.pdf', tur: 'PDF', boyutKb: 100, yontem: 'PERSONEL', yuklemeZamani: '29.08.2026 09:00', dekontHash: 'hash-dup-1' }
      },
      dekontlar: [
      {
        dekontNo: 'DUP-1001',
        bankaReferansNo: 'REF-1001',
        banka: 'Kooperatif Merkez Bankası',
        tarih: '2026-08-29',
        odenenTutar: 5000,
        odemeYapan: 'Şirket A',
        dosya: { ad: 'dup-1.pdf', tur: 'PDF', boyutKb: 100, yontem: 'PERSONEL', yuklemeZamani: '29.08.2026 09:00', dekontHash: 'hash-dup-1' }
      }]
    }],
    dekontNo: 'dup 1001',
    bankaReferansNo: 'ref 1001',
    banka: 'Kooperatif Merkez Bankası',
    dosyaHash: 'hash-dup-1',
    tarih: '2026-08-29',
    odenenTutar: 5000,
    odemeYapan: 'Şirket A'
  });
  assert.ok(duplicateKontrolu.duplicateDekont, 'aynı dekont numarası yeniden kullanılamaz');
  assert.ok(duplicateKontrolu.duplicateReferans, 'aynı referans yeniden kullanılamaz');
  assert.ok(duplicateKontrolu.duplicateDosya, 'aynı dijital dosya yeniden kullanılamaz');
  console.log('PASS T13 Aynı dekont yeniden kullanılamaz');
} catch (error) {
  basarisiz += 1;
  console.error(`FAIL T13 Aynı dekont yeniden kullanılamaz: ${(error as Error).message}`);
}

try {
  const eskiKayit: Pick<Islem, 'dekont' | 'dekontlar' | 'krediAdedi' | 'durum' | 'makbuzNo'> = {
    krediAdedi: 3,
    makbuzNo: 'BM-2026-000601',
    durum: 'TAMAMLANDI',
    dekont: {
      dekontNo: 'LEG-001',
      banka: 'Kıbrıs Vakıflar Bankası',
      tarih: '2026-08-29',
      odenenTutar: 22000,
      odemeYapan: 'Eski Demo Şirketi',
      dosya: null
    }
  };

  const dekontlar = islemDekontlariniOku(eskiKayit);
  assert.equal(dekontlar.length, 1, 'legacy dekont fallback');

  const ozet = islemKrediYuklemeOzetiniHesapla(eskiKayit, 7089.3);
  assert.equal(ozet.kullanilabilirKrediAdedi, 3, 'legacy hesap kullanilabilirKrediAdedi');
  assert.equal(ozet.genelBagisToplami, 732.1, 'legacy hesap genelBagisToplami');
  console.log('PASS T14 Legacy tek dekont fallback');
} catch (error) {
  basarisiz += 1;
  console.error(`FAIL T14 Legacy tek dekont fallback: ${(error as Error).message}`);
}

if (basarisiz) process.exit(1);
