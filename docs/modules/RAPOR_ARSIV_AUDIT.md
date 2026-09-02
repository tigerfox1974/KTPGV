# Raporlama / Mali Yıl Arşivi / Audit

## Gerçek ekranlar
- Raporlar: `src/pages/Raporlar.tsx`, veri: `src/data/raporlar.ts`
- Mali Yıl Arşivi: `src/pages/MaliYilArsiv.tsx`, veri: `src/data/arsiv.ts`
- Audit Log: `src/pages/AuditLog.tsx`, veri: `src/data/auditLog.ts`

## Yetki
Rapor ve audit görünürlüğü aktif kullanıcı kapsamına göre daraltılmalıdır. `src/utils/yetki.ts` görünür kayıt numaralarını kullanarak audit görünürlüğünü de filtreler.

## Üretim hedefi
- mali yıl bazında dekont/işlem/makbuz arşivi,
- güvenli dışa aktarma ve saklama,
- silme/retention işlemlerinde açık yetki ve audit,
- haftalık/aylık/yıllık raporlama.

## Taş ocağı kredi raporu kırılımı
- `src/pages/Raporlar.tsx` içindeki kredi raporu işletmeci bazında kalan krediyi, doğrulanmış ödemeyi, taş ocağı patlatması bağışını ve genel Vakıf bağışını ayrı göstermelidir.
- Dışa aktarma demo/simülasyon olarak kalsa bile ekrandaki veri ayrımı doğru kalmalıdır.
