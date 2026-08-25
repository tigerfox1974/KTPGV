# Sigorta Şirketi Kartları

## Gerçek yapı
Sigorta şirketi bağımsız kart modelidir. `SigortaSirketi` tipi ad, vergi no, adres, telefon, e-posta, yetkili kişi/telefon, aktiflik ve notları tutar.

## Ekranlar
- Route: `/sigorta-sirketleri`
- Sayfa: `src/pages/SigortaSirketleri.tsx`
- Form: `src/components/kart/SigortaSirketiFormu.tsx`
- Demo/veri kaynağı: `src/data/sigortaSirketleri.ts`

## F / Trafik ilişkisi
Trafik raporu işleminde `sigortaSirketiId` ile kart bağlantısı kurulur. Trafik başvurusu yalnız sigorta şirketi üzerinden yürütülmesi gereken iş kuralını korur.

## Geliştirme kuralı
Sigorta şirketi adı serbest metinle çoğaltılmamalı; mevcut kart kimliği üzerinden ilişki kurulması tercih edilmelidir.
