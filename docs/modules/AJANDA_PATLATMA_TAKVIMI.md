# Ajanda ve Patlatma Takvimi

## Gerçek yapı
Genel Ajanda sayfası `src/pages/Ajanda.tsx`, E bendi özel patlatma takvimi `src/pages/PatlatmaTakvimi.tsx` olarak ayrıdır.

`src/data/bentler.ts` C, Ç, D, E ve F bentlerini ajandaya düşecek şekilde tanımlar; A ve B düşmez.

## Yetki
`src/utils/yetki.ts` ajanda kayıtlarını bent + birim kapsamında filtreler. Kullanıcıda `ajandaKullanabilir` yetkisi olmadan ajanda işlemi yapılamaz; salt-okunur kullanıcı işlem yapamaz.

## Amaç
- Planlı işin tarih, bent, birim, yer, personel/süre gibi operasyon bilgilerini görünür kılmak.
- Haftalık/aylık operasyon takibine kaynak olmak.
- E bendinde plan ve gerçekleşme sonucunu birbirinden ayırmak.
