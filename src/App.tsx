import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from './components/ui/Sonner';
import { useScreenInit } from './useScreenInit.js';
import { kullanicilar } from './data/kullanicilar';
import { AppProvider, useApp } from './contexts/AppContext';
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

function Yonlendirici() {
  const { kullanici } = useApp();

  if (!kullanici) return <Giris />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/dashboard"
          element={
          <YetkiKapisi menu="dashboard" baslik="Dashboard">
              <Dashboard />
            </YetkiKapisi>
          } />
        
        <Route
          path="/yeni-islem"
          element={
          <YetkiKapisi menu="yeni-islem" baslik="Yeni İşlem">
              <YeniIslem />
            </YetkiKapisi>
          } />
        
        <Route
          path="/kayitlar"
          element={
          <YetkiKapisi menu="kayitlar" baslik="Kayıtlar">
              <Kayitlar />
            </YetkiKapisi>
          } />
        
        <Route
          path="/kayitlar/:kayitNo"
          element={
          <YetkiKapisi menu="kayitlar" baslik="Kayıt Detayı">
              <KayitDetay />
            </YetkiKapisi>
          } />
        
        <Route
          path="/odeme-makbuz"
          element={
          <YetkiKapisi menu="odeme-makbuz" baslik="Ödeme / Makbuz">
              <OdemeMakbuz />
            </YetkiKapisi>
          } />
        
        <Route
          path="/sigorta-sirketleri"
          element={
          <YetkiKapisi menu="sigorta" baslik="Sigorta Şirketi Kartları">
              <SigortaSirketleri />
            </YetkiKapisi>
          } />
        
        <Route
          path="/tas-ocagi-isletmecileri"
          element={
          <YetkiKapisi menu="isletmeciler" baslik="Taş Ocağı İşletmecileri">
              <TasOcagiIsletmecileri />
            </YetkiKapisi>
          } />
        
        <Route
          path="/tas-ocagi-kartlari"
          element={
          <YetkiKapisi menu="tas-ocaklari" baslik="Taş Ocağı Kartları">
              <TasOcagiKartlari />
            </YetkiKapisi>
          } />
        
        <Route
          path="/kredi-hareketleri"
          element={
          <YetkiKapisi menu="kredi-hareketleri" baslik="Taş Ocağı Kredi Hareketleri">
              <KrediHareketleri />
            </YetkiKapisi>
          } />
        
        <Route
          path="/patlatma-takvimi"
          element={
          <YetkiKapisi menu="patlatma-takvimi" baslik="Patlatma Takvimi">
              <PatlatmaTakvimi />
            </YetkiKapisi>
          } />
        
        <Route
          path="/ajanda"
          element={
          <YetkiKapisi menu="ajanda" baslik="Ajanda">
              <Ajanda />
            </YetkiKapisi>
          } />
        
        <Route
          path="/raporlar"
          element={
          <YetkiKapisi menu="raporlar" baslik="Raporlar">
              <Raporlar />
            </YetkiKapisi>
          } />
        
        <Route path="/kullanici-yonetimi" element={<KullaniciYonetimi />} />
        <Route path="/birim-yonetimi" element={<BirimYonetimi />} />
        <Route
          path="/yetkiler"
          element={
          <YetkiKapisi menu="yetkiler" baslik="Kullanıcı / Rol / Birim Yetkileri">
              <Yetkiler />
            </YetkiKapisi>
          } />
        
        <Route
          path="/mali-yil-arsiv"
          element={
          <YetkiKapisi menu="arsiv" baslik="Mali Yıl Arşiv">
              <MaliYilArsiv />
            </YetkiKapisi>
          } />
        
        <Route
          path="/audit-log"
          element={
          <YetkiKapisi menu="audit" baslik="Audit Log">
              <AuditLog />
            </YetkiKapisi>
          } />
        
        <Route
          path="/is-kurallari"
          element={
          <YetkiKapisi menu="kurallar" baslik="İş Kuralları">
              <IsKurallari />
            </YetkiKapisi>
          } />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>);

}

export function App() {
  const screenInit = useScreenInit();
  const baslangicKullanicisi =
  kullanicilar.find((k) => k.kullaniciAdi === screenInit?.kullaniciAdi) ?? null;

  return (
    <AppProvider baslangicKullanicisi={baslangicKullanicisi}>
      <BrowserRouter>
        <Yonlendirici />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AppProvider>);

}