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
