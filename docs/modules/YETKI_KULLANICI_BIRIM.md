# Kullanıcı / Rol / Birim / Yetki

## Gerçek veri modeli
Roller: `MERKEZ_ADMIN`, `VAKIF_MUHASEBE`, `PGM_TRAFIK`, `ITFAIYE`, `KARAKOL`, `TAS_OCAGI`, `DENETCI`.

Kullanıcı; birim, yetkili bentler, menüler, makbuz üretme, salt görüntüleme, rapor, ajanda ve BAÜ güncelleme yetkilerini taşır.

## Merkezi yetki motoru
`src/utils/yetki.ts`:
- menü erişimi ile veri görünürlüğünü ayrı ele alır,
- Merkez Admin/Denetçi tüm veriyi görebilir,
- Vakıf Muhasebe mali kayıtları görebilir,
- diğer kullanıcıları bent + rol + birim eşleşmesine göre filtreler,
- PGM Trafik rolünün F/Adli görmesini engeller,
- ödeme doğrulama, makbuz üretme ve ajanda işlem yetkilerini ayrı kontrol eder.

## Ekranlar
- `src/pages/KullaniciYonetimi.tsx`
- `src/pages/BirimYonetimi.tsx`
- `src/pages/Yetkiler.tsx`
- `src/components/yonetim/*`

## Kritik not
Route/menü gizlemek tek başına güvenlik değildir. Üretim backendinde aynı yetki modeli sunucu/RLS seviyesinde uygulanmalıdır.
