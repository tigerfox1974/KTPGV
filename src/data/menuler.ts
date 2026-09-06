import type { LucideIcon } from 'lucide-react';
import { menuGrupSirasi, rotaKayitlari, type MenuGrubu, type RotaKaydi } from './routeRegistry';

export interface MenuOgesi {
  id: string;
  etiket: string;
  yol: string;
  ikon: LucideIcon;
  grup: MenuGrubu;
}

function sidebarRotasiMi(rota: RotaKaydi): rota is RotaKaydi & { sidebar: { grup: MenuGrubu; ikon: LucideIcon } } {
  return 'sidebar' in rota;
}

export const menuler: MenuOgesi[] = rotaKayitlari.filter(sidebarRotasiMi).map((rota) => ({
  id: rota.menuId,
  etiket: rota.etiket,
  yol: rota.yol,
  ikon: rota.sidebar.ikon,
  grup: rota.sidebar.grup
}));

export const menuGruplari: MenuOgesi['grup'][] = [...menuGrupSirasi];