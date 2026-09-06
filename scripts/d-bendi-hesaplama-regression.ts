import { strict as assert } from 'node:assert';
import { VARSAYILAN_BAU, hesapla } from '../src/utils/hesaplama';

/**
 * D bendi çoklu görev dilimi hesaplama regresyonu.
 * Çalıştırma: npm run test:d-bendi
 */

const BAU = VARSAYILAN_BAU;
const saatlik = BAU * 0.005;

let gecen = 0;

function test(ad: string, kontrol: () => void): void {
  kontrol();
  gecen += 1;
  console.log(`PASS ${ad}`);
}

// T1 Tek dilim — dilimler üzerinden hesap
test('T1 Tek dilim (3 polis x 4 saat)', () => {
  const sonuc = hesapla({
    bent: 'D',
    bau: BAU,
    gorevDilimleri: [{ id: 'd1', polisSayisi: 3, gorevSuresi: 4 }]
  });
  assert.equal(sonuc.gecerli, true);
  assert.equal(sonuc.tutar, 12 * saatlik);
  assert.ok(sonuc.satirlar.includes('Dilim 1: 3 polis x 4 saat = 12 polis-saat'));
  assert.ok(sonuc.satirlar.includes('Toplam polis-saat: 12'));
});

// T2 Çoklu dilim toplamı — 3x4 + 5x2 + 12x5 = 82 polis-saat
test('T2 Çoklu dilim toplamı (82 polis-saat)', () => {
  const sonuc = hesapla({
    bent: 'D',
    bau: BAU,
    gorevDilimleri: [
      { id: 'd1', polisSayisi: 3, gorevSuresi: 4 },
      { id: 'd2', polisSayisi: 5, gorevSuresi: 2 },
      { id: 'd3', polisSayisi: 12, gorevSuresi: 5 }
    ]
  });
  assert.equal(sonuc.gecerli, true);
  assert.equal(Math.round(sonuc.tutar * 100), Math.round(82 * saatlik * 100));
  assert.ok(sonuc.satirlar.includes('Dilim 1: 3 polis x 4 saat = 12 polis-saat'));
  assert.ok(sonuc.satirlar.includes('Dilim 2: 5 polis x 2 saat = 10 polis-saat'));
  assert.ok(sonuc.satirlar.includes('Dilim 3: 12 polis x 5 saat = 60 polis-saat'));
  assert.ok(sonuc.satirlar.includes('Toplam polis-saat: 82'));
});

// T3 Eski tek polisSayisi/gorevSuresi alanı geriye dönük çalışır (demo kaydıyla aynı tutar)
test('T3 Legacy tek dilim (6 polis x 2 saat = 4253,58 TL)', () => {
  const sonuc = hesapla({ bent: 'D', bau: BAU, polisSayisi: 6, gorevSuresi: 2 });
  assert.equal(sonuc.gecerli, true);
  assert.equal(Math.round(sonuc.tutar * 100), 425358);
  assert.ok(sonuc.satirlar.includes('Dilim 1: 6 polis x 2 saat = 12 polis-saat'));
});

// T4 Dilimler verildiyse legacy alanlar yok sayılır
test('T4 Dilimler önceliklidir', () => {
  const sonuc = hesapla({
    bent: 'D',
    bau: BAU,
    polisSayisi: 6,
    gorevSuresi: 2,
    gorevDilimleri: [{ id: 'd1', polisSayisi: 3, gorevSuresi: 4 }]
  });
  assert.equal(sonuc.gecerli, true);
  assert.equal(sonuc.tutar, 12 * saatlik);
});

// T5 Polis sayısı sınırları: 999 geçerli, 1000 ve ondalık geçersiz
test('T5 Polis sayısı 1-999 sınırı', () => {
  const ustSinir = hesapla({
    bent: 'D',
    bau: BAU,
    gorevDilimleri: [{ id: 'd1', polisSayisi: 999, gorevSuresi: 99 }]
  });
  assert.equal(ustSinir.gecerli, true);
  const asan = hesapla({
    bent: 'D',
    bau: BAU,
    gorevDilimleri: [{ id: 'd1', polisSayisi: 1000, gorevSuresi: 1 }]
  });
  assert.equal(asan.gecerli, false);
  assert.ok(asan.hatalar.some((h) => h.includes('Dilim 1')));
  const ondalik = hesapla({
    bent: 'D',
    bau: BAU,
    gorevDilimleri: [{ id: 'd1', polisSayisi: 4.5, gorevSuresi: 1 }]
  });
  assert.equal(ondalik.gecerli, false);
});

// T6 Görev süresi sınırları: 99 geçerli, 100 ve buçuklu saat geçersiz
test('T6 Görev süresi 1-99 sınırı', () => {
  const ustSinir = hesapla({
    bent: 'D',
    bau: BAU,
    gorevDilimleri: [{ id: 'd1', polisSayisi: 1, gorevSuresi: 99 }]
  });
  assert.equal(ustSinir.gecerli, true);
  const asan = hesapla({
    bent: 'D',
    bau: BAU,
    gorevDilimleri: [{ id: 'd1', polisSayisi: 1, gorevSuresi: 100 }]
  });
  assert.equal(asan.gecerli, false);
  const buctuklu = hesapla({
    bent: 'D',
    bau: BAU,
    gorevDilimleri: [{ id: 'd1', polisSayisi: 2, gorevSuresi: 1.5 }]
  });
  assert.equal(buctuklu.gecerli, false);
});

// T7 Dilim yoksa / sıfır değerli dilim varsa hesap geçersiz
test('T7 Boş veya sıfır dilim geçersiz', () => {
  const bos = hesapla({ bent: 'D', bau: BAU });
  assert.equal(bos.gecerli, false);
  const sifir = hesapla({
    bent: 'D',
    bau: BAU,
    gorevDilimleri: [{ id: 'd1', polisSayisi: 0, gorevSuresi: 0 }]
  });
  assert.equal(sifir.gecerli, false);
  assert.ok(sifir.hatalar.length > 0);
});

// T8 Bir dilim geçersizken diğer geçerli dilim toplanmaz (kayıt engellenir)
test('T8 Geçersiz dilim toplamı bozar', () => {
  const sonuc = hesapla({
    bent: 'D',
    bau: BAU,
    gorevDilimleri: [
      { id: 'd1', polisSayisi: 3, gorevSuresi: 4 },
      { id: 'd2', polisSayisi: 0, gorevSuresi: 2 }
    ]
  });
  assert.equal(sonuc.gecerli, false);
  assert.ok(sonuc.hatalar.some((h) => h.includes('Dilim 2')));
});

// T9 Diğer bentler etkilenmez — C bendi eski davranışını korur
test('T9 C bendi davranışı korunur', () => {
  const c = hesapla({ bent: 'C', bau: BAU, adet: 2 });
  assert.equal(c.gecerli, true);
  assert.equal(c.tutar, BAU * 0.02 * 2);
});

console.log(`${gecen} senaryo başarılı.`);