# KTPGV — Database Guide

Bu dosya veri modeline ilişkin kalıcı yönlendirmeyi tutar. Mevcut repo henüz ağırlıklı olarak frontend/prototip yapısında olsa da hedef üretim veri katmanı için kurallar burada izlenir.

## Hedef veri altyapısı
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

## Temel veri prensipleri
- Kayıt no ve makbuz no benzersiz olmalıdır.
- Eşzamanlı çok kullanıcılı işlemlerde benzersizlik yalnızca frontend kontrolüne bırakılmamalıdır.
- Rol/birim/bent yetkileri veri modelinde açık şekilde temsil edilmelidir.
- Bent–birim eşleşmesi yapılandırılabilir olmalıdır.
- Dekont dosyaları ile dekont metadata bilgileri ayrı ama ilişkili tutulmalıdır.
- Makbuz kayıtları ödeme kanıtı olan dekontlardan kavramsal olarak ayrılmalıdır.
- Sigorta şirketleri kalıcı kart/master veri olarak tutulmalı ve Trafik işlemleri bu kayda bağlanmalıdır.
- Taş ocağı/işletmeci kartları kalıcı master veri olarak tutulmalıdır.
- Taş ocağı kredi hareketleri yalnızca mevcut bakiye sayısı olarak değil, mümkünse hareket geçmişiyle izlenebilir olmalıdır.

## İzlenebilirlik
Kritik finansal ve yetki değişiklikleri audit izine uygun tasarlanmalıdır:
- kim yaptı
- ne zaman yaptı
- hangi kayıt değişti
- önceki değer
- yeni değer

## Dosya saklama
- PDF/JPG/PNG dekontları Storage üzerinde saklanabilir.
- Dosya kaydı işlem/dekont kaydıyla ilişkilendirilir.
- Mali yıl bazlı arşivleme/dışa aktarma ihtiyacı göz önünde tutulur.

## Veri değişikliği kuralı
AI ajanı tablo/alan tasarlarken:
1. Önce mevcut type/state/model kullanımını araştırır.
2. Aynı kavramın başka isimle zaten bulunup bulunmadığını kontrol eder.
3. Veri silme veya kolon kaldırma yerine geriye uyumlu geçişi tercih eder.
4. İş kuralı değişmeden veri modelini sadeleştirmek adına anlam kaybı yaratmaz.
