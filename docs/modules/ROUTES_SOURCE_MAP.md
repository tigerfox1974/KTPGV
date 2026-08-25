# Routes & Source Map

`src/App.tsx` içindeki gerçek route haritası:

- `/dashboard` → Dashboard
- `/yeni-islem` → Yeni İşlem
- `/kayitlar`, `/kayitlar/:kayitNo` → Kayıtlar / Detay
- `/odeme-makbuz` → Ödeme / Makbuz
- `/sigorta-sirketleri` → Sigorta Şirketi Kartları
- `/tas-ocagi-isletmecileri` → Taş Ocağı İşletmecileri
- `/tas-ocagi-kartlari` → Taş Ocağı Kartları
- `/kredi-hareketleri` → Taş Ocağı Kredi Hareketleri
- `/patlatma-takvimi` → Patlatma Takvimi
- `/ajanda` → Ajanda
- `/raporlar` → Raporlar
- `/kullanici-yonetimi` → Kullanıcı Yönetimi
- `/birim-yonetimi` → Birim Yönetimi
- `/yetkiler` → Yetkiler
- `/mali-yil-arsiv` → Mali Yıl Arşiv
- `/audit-log` → Audit Log
- `/is-kurallari` → İş Kuralları

Çoğu operasyonel route `YetkiKapisi` ile korunur. Yönetim route'larında sayfa içi/ayrı yetki kontrolü ayrıca doğrulanmalıdır.
