import {
  Archive,
  BarChart3,
  Building2,
  CalendarClock,
  CalendarDays,
  FilePlus2,
  FileText,
  Gavel,
  LayoutDashboard,
  Mountain,
  Network,
  Receipt,
  ScrollText,
  ShieldCheck,
  UserCog,
  Users,
  Wallet
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const menuGrupSirasi = ['İşlemler', 'Kartlar', 'Takip', 'Yönetim'] as const;
export type MenuGrubu = (typeof menuGrupSirasi)[number];
export type KorumaGereksinimi = 'menu';

export type RotaSayfaKimligi =
  | 'DASHBOARD'
  | 'YENI_ISLEM'
  | 'KAYITLAR'
  | 'KAYIT_DETAY'
  | 'ODEME_MAKBUZ'
  | 'SIGORTA_SIRKETLERI'
  | 'TAS_OCAGI_ISLETMECILERI'
  | 'TAS_OCAGI_KARTLARI'
  | 'KREDI_HAREKETLERI'
  | 'PATLATMA_TAKVIMI'
  | 'AJANDA'
  | 'RAPORLAR'
  | 'KULLANICI_YONETIMI'
  | 'BIRIM_YONETIMI'
  | 'YETKILER'
  | 'MALI_YIL_ARSIV'
  | 'AUDIT_LOG'
  | 'IS_KURALLARI';

interface SidebarTanimi {
  grup: MenuGrubu;
  ikon: LucideIcon;
}

interface RotaTanim {
  rotaId: string;
  sayfa: RotaSayfaKimligi;
  yol: string;
  menuId: string;
  etiket: string;
  koruma: KorumaGereksinimi;
  sidebar?: SidebarTanimi;
}

export const rotaKayitlari = [
  {
    rotaId: 'dashboard',
    sayfa: 'DASHBOARD',
    yol: '/dashboard',
    menuId: 'dashboard',
    etiket: 'Dashboard',
    koruma: 'menu',
    sidebar: { grup: 'İşlemler', ikon: LayoutDashboard }
  },
  {
    rotaId: 'yeni-islem',
    sayfa: 'YENI_ISLEM',
    yol: '/yeni-islem',
    menuId: 'yeni-islem',
    etiket: 'Yeni İşlem',
    koruma: 'menu',
    sidebar: { grup: 'İşlemler', ikon: FilePlus2 }
  },
  {
    rotaId: 'kayitlar',
    sayfa: 'KAYITLAR',
    yol: '/kayitlar',
    menuId: 'kayitlar',
    etiket: 'Kayıtlar',
    koruma: 'menu',
    sidebar: { grup: 'İşlemler', ikon: FileText }
  },
  {
    rotaId: 'kayit-detay',
    sayfa: 'KAYIT_DETAY',
    yol: '/kayitlar/:kayitNo',
    menuId: 'kayitlar',
    etiket: 'Kayıt Detayı',
    koruma: 'menu'
  },
  {
    rotaId: 'odeme-makbuz',
    sayfa: 'ODEME_MAKBUZ',
    yol: '/odeme-makbuz',
    menuId: 'odeme-makbuz',
    etiket: 'Ödeme / Makbuz',
    koruma: 'menu',
    sidebar: { grup: 'İşlemler', ikon: Receipt }
  },
  {
    rotaId: 'sigorta-sirketleri',
    sayfa: 'SIGORTA_SIRKETLERI',
    yol: '/sigorta-sirketleri',
    menuId: 'sigorta',
    etiket: 'Sigorta Şirketi Kartları',
    koruma: 'menu',
    sidebar: { grup: 'Kartlar', ikon: Building2 }
  },
  {
    rotaId: 'tas-ocagi-isletmecileri',
    sayfa: 'TAS_OCAGI_ISLETMECILERI',
    yol: '/tas-ocagi-isletmecileri',
    menuId: 'isletmeciler',
    etiket: 'Taş Ocağı İşletmecileri',
    koruma: 'menu',
    sidebar: { grup: 'Kartlar', ikon: Users }
  },
  {
    rotaId: 'tas-ocagi-kartlari',
    sayfa: 'TAS_OCAGI_KARTLARI',
    yol: '/tas-ocagi-kartlari',
    menuId: 'tas-ocaklari',
    etiket: 'Taş Ocağı Kartları',
    koruma: 'menu',
    sidebar: { grup: 'Kartlar', ikon: Mountain }
  },
  {
    rotaId: 'kredi-hareketleri',
    sayfa: 'KREDI_HAREKETLERI',
    yol: '/kredi-hareketleri',
    menuId: 'kredi-hareketleri',
    etiket: 'Taş Ocağı Kredi Hareketleri',
    koruma: 'menu',
    sidebar: { grup: 'Kartlar', ikon: Wallet }
  },
  {
    rotaId: 'patlatma-takvimi',
    sayfa: 'PATLATMA_TAKVIMI',
    yol: '/patlatma-takvimi',
    menuId: 'patlatma-takvimi',
    etiket: 'Patlatma Takvimi',
    koruma: 'menu',
    sidebar: { grup: 'Takip', ikon: CalendarClock }
  },
  {
    rotaId: 'ajanda',
    sayfa: 'AJANDA',
    yol: '/ajanda',
    menuId: 'ajanda',
    etiket: 'Ajanda',
    koruma: 'menu',
    sidebar: { grup: 'Takip', ikon: CalendarDays }
  },
  {
    rotaId: 'raporlar',
    sayfa: 'RAPORLAR',
    yol: '/raporlar',
    menuId: 'raporlar',
    etiket: 'Raporlar',
    koruma: 'menu',
    sidebar: { grup: 'Takip', ikon: BarChart3 }
  },
  {
    rotaId: 'kullanici-yonetimi',
    sayfa: 'KULLANICI_YONETIMI',
    yol: '/kullanici-yonetimi',
    menuId: 'kullanici-yonetimi',
    etiket: 'Kullanıcı Yönetimi',
    koruma: 'menu',
    sidebar: { grup: 'Yönetim', ikon: UserCog }
  },
  {
    rotaId: 'birim-yonetimi',
    sayfa: 'BIRIM_YONETIMI',
    yol: '/birim-yonetimi',
    menuId: 'birim-yonetimi',
    etiket: 'Birim Yönetimi',
    koruma: 'menu',
    sidebar: { grup: 'Yönetim', ikon: Network }
  },
  {
    rotaId: 'yetkiler',
    sayfa: 'YETKILER',
    yol: '/yetkiler',
    menuId: 'yetkiler',
    etiket: 'Kullanıcı / Rol / Birim Yetkileri',
    koruma: 'menu',
    sidebar: { grup: 'Yönetim', ikon: ShieldCheck }
  },
  {
    rotaId: 'mali-yil-arsiv',
    sayfa: 'MALI_YIL_ARSIV',
    yol: '/mali-yil-arsiv',
    menuId: 'arsiv',
    etiket: 'Mali Yıl Arşiv',
    koruma: 'menu',
    sidebar: { grup: 'Yönetim', ikon: Archive }
  },
  {
    rotaId: 'audit-log',
    sayfa: 'AUDIT_LOG',
    yol: '/audit-log',
    menuId: 'audit',
    etiket: 'Audit Log',
    koruma: 'menu',
    sidebar: { grup: 'Yönetim', ikon: ScrollText }
  },
  {
    rotaId: 'is-kurallari',
    sayfa: 'IS_KURALLARI',
    yol: '/is-kurallari',
    menuId: 'kurallar',
    etiket: 'İş Kuralları',
    koruma: 'menu',
    sidebar: { grup: 'Yönetim', ikon: Gavel }
  }
] as const satisfies readonly RotaTanim[];

export type RotaKaydi = (typeof rotaKayitlari)[number];
export type MenuId = RotaKaydi['menuId'];
