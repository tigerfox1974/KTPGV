export const manifest = {
  screens: {
    scr_4f5ete: { name: "Giriş", route: "/", position: { "x": 160, "y": 220 } },
    scr_2565xj: { name: "Dashboard", route: "/dashboard", state: { "kullaniciAdi": "admin" }, position: { "x": 160, "y": 2200 } },
    scr_bnek5o: { name: "Yeni İşlem", route: "/yeni-islem", state: { "kullaniciAdi": "admin" }, position: { "x": 160, "y": 4180 } },
    scr_0nnri0: { name: "Kayıtlar", route: "/kayitlar", state: { "kullaniciAdi": "admin" }, position: { "x": 1560, "y": 4180 } },
    scr_q7qe5q: { name: "Ödeme / Makbuz", route: "/odeme-makbuz", state: { "kullaniciAdi": "admin" }, position: { "x": 2960, "y": 4180 } },
    scr_1m1yed: { name: "Sigorta Şirketi Kartları", route: "/sigorta-sirketleri", state: { "kullaniciAdi": "admin" }, position: { "x": 160, "y": 6160 } },
    scr_8k5ozi: { name: "Taş Ocağı İşletmecileri", route: "/tas-ocagi-isletmecileri", state: { "kullaniciAdi": "admin" }, position: { "x": 160, "y": 8140 } },
    scr_fdthls: { name: "Taş Ocağı Kartları", route: "/tas-ocagi-kartlari", state: { "kullaniciAdi": "admin" }, position: { "x": 1560, "y": 8140 } },
    scr_zup27r: { name: "Taş Ocağı Kredi Hareketleri", route: "/kredi-hareketleri", state: { "kullaniciAdi": "admin" }, position: { "x": 2960, "y": 8140 } },
    scr_y4ofau: { name: "Ajanda", route: "/ajanda", state: { "kullaniciAdi": "admin" }, position: { "x": 160, "y": 10120 } },
    scr_2gfcq4: { name: "Raporlar", route: "/raporlar", state: { "kullaniciAdi": "admin" }, position: { "x": 1560, "y": 10120 } },
    scr_ojtkve: { name: "Kullanıcı / Rol / Birim Yetkileri", route: "/yetkiler", state: { "kullaniciAdi": "admin" }, position: { "x": 160, "y": 12100 } },
    scr_7bbpu4: { name: "Mali Yıl Arşiv", route: "/mali-yil-arsiv", state: { "kullaniciAdi": "admin" }, position: { "x": 1560, "y": 12100 } },
    scr_4qp1ym: { name: "Audit Log", route: "/audit-log", state: { "kullaniciAdi": "admin" }, position: { "x": 2960, "y": 12100 } },
    scr_3nw83n: { name: "İş Kuralları", route: "/is-kurallari", state: { "kullaniciAdi": "admin" }, position: { "x": 4360, "y": 12100 } },
    scr_rkha0d: { name: "Denetçi Görünümü", route: "/dashboard", state: { "kullaniciAdi": "denetci" }, position: { "x": 160, "y": 14080 } },
    scr_wikhhg: { name: "Taş Ocağı Yetkilisi — Yeni İşlem", route: "/yeni-islem", state: { "kullaniciAdi": "tasocagi" }, position: { "x": 1560, "y": 14080 } },
    scr_5fxae2: { name: "Trafik Müdürlüğü — Yeni İşlem", route: "/yeni-islem", state: { "kullaniciAdi": "trafik" }, position: { "x": 2960, "y": 14080 } }
  },
  sections: {
    sec_eyuuy9: { name: "Authentication", x: 0, y: 0, width: 1520, height: 1180 },
    sec_s8kscd: { name: "Main Dashboard", x: 0, y: 1980, width: 1520, height: 1180 },
    sec_tq5fyh: { name: "Core Operations", x: 0, y: 3960, width: 4320, height: 1180 },
    sec_m5a0ab: { name: "Insurance Company Management", x: 0, y: 5940, width: 1520, height: 1180 },
    sec_v3b2vl: { name: "Stone Quarry Management", x: 0, y: 7920, width: 4320, height: 1180 },
    sec_9qcv6v: { name: "Reporting & Schedule", x: 0, y: 9900, width: 2920, height: 1180 },
    sec_gpv7gi: { name: "Administration", x: 0, y: 11880, width: 5720, height: 1180 },
    sec_edya5o: { name: "Role-Specific Views", x: 0, y: 13860, width: 4320, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_eyuuy9", children: [
    { kind: "screen", id: "scr_4f5ete" }]
  },
  { kind: "section", id: "sec_s8kscd", children: [
    { kind: "screen", id: "scr_2565xj" }]
  },
  { kind: "section", id: "sec_tq5fyh", children: [
    { kind: "screen", id: "scr_bnek5o" },
    { kind: "screen", id: "scr_0nnri0" },
    { kind: "screen", id: "scr_q7qe5q" }]
  },
  { kind: "section", id: "sec_m5a0ab", children: [
    { kind: "screen", id: "scr_1m1yed" }]
  },
  { kind: "section", id: "sec_v3b2vl", children: [
    { kind: "screen", id: "scr_8k5ozi" },
    { kind: "screen", id: "scr_fdthls" },
    { kind: "screen", id: "scr_zup27r" }]
  },
  { kind: "section", id: "sec_9qcv6v", children: [
    { kind: "screen", id: "scr_y4ofau" },
    { kind: "screen", id: "scr_2gfcq4" }]
  },
  { kind: "section", id: "sec_gpv7gi", children: [
    { kind: "screen", id: "scr_ojtkve" },
    { kind: "screen", id: "scr_7bbpu4" },
    { kind: "screen", id: "scr_4qp1ym" },
    { kind: "screen", id: "scr_3nw83n" }]
  },
  { kind: "section", id: "sec_edya5o", children: [
    { kind: "screen", id: "scr_rkha0d" },
    { kind: "screen", id: "scr_wikhhg" },
    { kind: "screen", id: "scr_5fxae2" }]
  }]

};