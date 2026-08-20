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
  Wallet } from
'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MenuOgesi {
  id: string;
  etiket: string;
  yol: string;
  ikon: LucideIcon;
  grup: 'İşlemler' | 'Kartlar' | 'Takip' | 'Yönetim';
}

export const menuler: MenuOgesi[] = [
{ id: 'dashboard', etiket: 'Dashboard', yol: '/dashboard', ikon: LayoutDashboard, grup: 'İşlemler' },
{ id: 'yeni-islem', etiket: 'Yeni İşlem', yol: '/yeni-islem', ikon: FilePlus2, grup: 'İşlemler' },
{ id: 'kayitlar', etiket: 'Kayıtlar', yol: '/kayitlar', ikon: FileText, grup: 'İşlemler' },
{ id: 'odeme-makbuz', etiket: 'Ödeme / Makbuz', yol: '/odeme-makbuz', ikon: Receipt, grup: 'İşlemler' },
{ id: 'sigorta', etiket: 'Sigorta Şirketi Kartları', yol: '/sigorta-sirketleri', ikon: Building2, grup: 'Kartlar' },
{ id: 'isletmeciler', etiket: 'Taş Ocağı İşletmecileri', yol: '/tas-ocagi-isletmecileri', ikon: Users, grup: 'Kartlar' },
{ id: 'tas-ocaklari', etiket: 'Taş Ocağı Kartları', yol: '/tas-ocagi-kartlari', ikon: Mountain, grup: 'Kartlar' },
{ id: 'kredi-hareketleri', etiket: 'Taş Ocağı Kredi Hareketleri', yol: '/kredi-hareketleri', ikon: Wallet, grup: 'Kartlar' },
{ id: 'patlatma-takvimi', etiket: 'Patlatma Takvimi', yol: '/patlatma-takvimi', ikon: CalendarClock, grup: 'Takip' },
{ id: 'ajanda', etiket: 'Ajanda', yol: '/ajanda', ikon: CalendarDays, grup: 'Takip' },
{ id: 'raporlar', etiket: 'Raporlar', yol: '/raporlar', ikon: BarChart3, grup: 'Takip' },
{ id: 'kullanici-yonetimi', etiket: 'Kullanıcı Yönetimi', yol: '/kullanici-yonetimi', ikon: UserCog, grup: 'Yönetim' },
{ id: 'birim-yonetimi', etiket: 'Birim Yönetimi', yol: '/birim-yonetimi', ikon: Network, grup: 'Yönetim' },
{ id: 'yetkiler', etiket: 'Kullanıcı / Rol / Birim Yetkileri', yol: '/yetkiler', ikon: ShieldCheck, grup: 'Yönetim' },
{ id: 'arsiv', etiket: 'Mali Yıl Arşiv', yol: '/mali-yil-arsiv', ikon: Archive, grup: 'Yönetim' },
{ id: 'audit', etiket: 'Audit Log', yol: '/audit-log', ikon: ScrollText, grup: 'Yönetim' },
{ id: 'kurallar', etiket: 'İş Kuralları / Teknik Kurallar', yol: '/is-kurallari', ikon: Gavel, grup: 'Yönetim' }];


export const menuGruplari: MenuOgesi['grup'][] = ['İşlemler', 'Kartlar', 'Takip', 'Yönetim'];