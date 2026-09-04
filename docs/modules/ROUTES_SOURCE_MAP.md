# Routes & Source Map

Bu dosya ikincil referanstır. Runtime için tek kaynak `src/data/routeRegistry.ts` dosyasıdır.

- `src/App.tsx` route wiring bu registry'den üretilir.
- `src/data/menuler.ts` sidebar menüleri bu registry'den türetilir.
- `src/canvas.manifest.js` ve `src/useScreenInit.js` runtime route/auth akışının parçası değildir.

## Rota Özeti (routeRegistry türevi)

- `/dashboard` → `dashboard` · Dashboard · koruma: `menu`
- `/yeni-islem` → `yeni-islem` · Yeni İşlem · koruma: `menu`
- `/kayitlar` → `kayitlar` · Kayıtlar · koruma: `menu`
- `/kayitlar/:kayitNo` → `kayitlar` · Kayıt Detayı · koruma: `menu`
- `/odeme-makbuz` → `odeme-makbuz` · Ödeme / Makbuz · koruma: `menu`
- `/sigorta-sirketleri` → `sigorta` · Sigorta Şirketi Kartları · koruma: `menu`
- `/tas-ocagi-isletmecileri` → `isletmeciler` · Taş Ocağı İşletmecileri · koruma: `menu`
- `/tas-ocagi-kartlari` → `tas-ocaklari` · Taş Ocağı Kartları · koruma: `menu`
- `/kredi-hareketleri` → `kredi-hareketleri` · Taş Ocağı Kredi Hareketleri · koruma: `menu`
- `/patlatma-takvimi` → `patlatma-takvimi` · Patlatma Takvimi · koruma: `menu`
- `/ajanda` → `ajanda` · Ajanda · koruma: `menu`
- `/raporlar` → `raporlar` · Raporlar · koruma: `menu`
- `/kullanici-yonetimi` → `kullanici-yonetimi` · Kullanıcı Yönetimi · koruma: `menu`
- `/birim-yonetimi` → `birim-yonetimi` · Birim Yönetimi · koruma: `menu`
- `/yetkiler` → `yetkiler` · Kullanıcı / Rol / Birim Yetkileri · koruma: `menu`
- `/mali-yil-arsiv` → `arsiv` · Mali Yıl Arşiv · koruma: `menu`
- `/audit-log` → `audit` · Audit Log · koruma: `menu`
- `/is-kurallari` → `kurallar` · İş Kuralları · koruma: `menu`
