import type { ComponentType } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from './components/ui/Sonner';
import { AppProvider, useApp } from './contexts/AppContext';
import { rotaKayitlari, type RotaKaydi, type RotaSayfaKimligi } from './data/routeRegistry';
import { AppLayout } from './components/layout/AppLayout';
import { YetkiKapisi } from './components/common/YetkiKapisi';
import { Giris } from './pages/Giris';
import { Dashboard } from './pages/Dashboard';
import { YeniIslem } from './pages/YeniIslem';
import { Kayitlar } from './pages/Kayitlar';
import { KayitDetay } from './pages/KayitDetay';
import { OdemeMakbuz } from './pages/OdemeMakbuz';
import { SigortaSirketleri } from './pages/SigortaSirketleri';
import { TasOcagiIsletmecileri } from './pages/TasOcagiIsletmecileri';
import { TasOcagiKartlari } from './pages/TasOcagiKartlari';
import { KrediHareketleri } from './pages/KrediHareketleri';
import { Ajanda } from './pages/Ajanda';
import { PatlatmaTakvimi } from './pages/PatlatmaTakvimi';
import { Raporlar } from './pages/Raporlar';
import { KullaniciYonetimi } from './pages/KullaniciYonetimi';
import { BirimYonetimi } from './pages/BirimYonetimi';
import { Yetkiler } from './pages/Yetkiler';
import { MaliYilArsiv } from './pages/MaliYilArsiv';
import { AuditLog } from './pages/AuditLog';
import { IsKurallari } from './pages/IsKurallari';

const sayfaBilesenleri: Record<RotaSayfaKimligi, ComponentType> = {
  DASHBOARD: Dashboard,
  YENI_ISLEM: YeniIslem,
  KAYITLAR: Kayitlar,
  KAYIT_DETAY: KayitDetay,
  ODEME_MAKBUZ: OdemeMakbuz,
  SIGORTA_SIRKETLERI: SigortaSirketleri,
  TAS_OCAGI_ISLETMECILERI: TasOcagiIsletmecileri,
  TAS_OCAGI_KARTLARI: TasOcagiKartlari,
  KREDI_HAREKETLERI: KrediHareketleri,
  PATLATMA_TAKVIMI: PatlatmaTakvimi,
  AJANDA: Ajanda,
  RAPORLAR: Raporlar,
  KULLANICI_YONETIMI: KullaniciYonetimi,
  BIRIM_YONETIMI: BirimYonetimi,
  YETKILER: Yetkiler,
  MALI_YIL_ARSIV: MaliYilArsiv,
  AUDIT_LOG: AuditLog,
  IS_KURALLARI: IsKurallari
};

function rotaElementi(rota: RotaKaydi) {
  const Sayfa = sayfaBilesenleri[rota.sayfa];
  const icerik = <Sayfa />;
  if (rota.koruma === 'menu') {
    return (
      <YetkiKapisi menu={rota.menuId} baslik={rota.etiket}>
        {icerik}
      </YetkiKapisi>
    );
  }
  return icerik;
}

function Yonlendirici() {
  const { kullanici } = useApp();

  if (!kullanici) return <Giris />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        {rotaKayitlari.map((rota) => (
          <Route key={rota.rotaId} path={rota.yol} element={rotaElementi(rota)} />
        ))}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>);

}

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Yonlendirici />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AppProvider>);

}