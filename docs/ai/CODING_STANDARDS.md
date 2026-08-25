# KTPGV Coding Standards

- Çalışan yapıyı koru; kullanıcı istemedikçe geniş refactor yapma.
- Tek görevde mümkün olan en küçük dosya setini değiştir.
- Var olan bileşen, yardımcı fonksiyon, tip ve veri yapısını yeniden kullan.
- Aynı işlev için paralel mekanizma oluşturma.
- TypeScript tiplerini gevşetme; yeni kodda `any` kullanımından kaçın.
- Para gösteriminde `TL` kullan; `₺` kullanma.
- Rol/yetki kontrollerini yalnızca UI görünürlüğünde bırakma.
- Değişiklik öncesi ilgili route/page/component/type akışını incele.
- Değişiklik sonrası build/lint ve varsa ilgili regresyon kontrolünü çalıştır.
- Yeni karar varsa Decision Log; kalıcı kural değişirse Memory/Business Rules güncelle.
