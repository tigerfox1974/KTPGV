# KTPGV — Architecture Guide

## Mevcut teknik temel
Repo şu anda Vite + React + TypeScript tabanlıdır.

Başlıca yapı:
- React 18
- React Router
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- PDF.js
- Tesseract.js

## Mimari yaklaşım
- Sayfa bileşenleri `src/pages/` altında tutulur.
- Yeniden kullanılabilir UI ve işlev bileşenleri `src/components/` altında tutulur.
- Ortak uygulama state/context yapıları `src/contexts/` altında bulunur.
- Sabit/örnek veri kaynakları `src/data/` altında bulunabilir.
- Yardımcı fonksiyonlar ve parser/utility işlevleri mevcut proje yapısındaki ilgili utility alanlarında tutulur.

## Geliştirme kuralı
Yeni özellik eklerken önce mevcut mimaride benzer bir örnek bulun. Yeni klasör/desen ancak mevcut yapı gerçekten karşılamıyorsa oluşturulur.

## Veri katmanı yönü
Hedef üretim mimarisi merkezi çok kullanıcılı yapı ve Supabase entegrasyonudur. Ancak mevcut frontend demo/prototip akışı çalışan haldeyse backend geçişi ayrı ve kontrollü görevler halinde yapılmalıdır.

## Kritik sınırlar
- UI, iş kuralı ve veri katmanını gereksiz yere birbirine sıkı bağlama.
- Yetki kuralları yalnızca menü/görünürlük kontrolü olarak tasarlanmamalıdır.
- Benzersiz numaralandırma gibi eşzamanlılık gerektiren kurallar gelecekte backend/veritabanı seviyesinde garanti edilmelidir.
- Dosya/dekont işleme tarayıcı tarafında yapılırken hata ve boyut kontrolleri korunmalıdır.

## AI için mimari okuma yöntemi
Bir değişiklikte:
1. İlgili page'i bul.
2. Kullandığı component'leri izle.
3. Context/type/data bağımlılıklarını bul.
4. Aynı veri tipini kullanan diğer modülleri ara.
5. Etki alanını belirledikten sonra değişiklik yap.
