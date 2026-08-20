import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from './components/ui/Sonner';
import { useScreenInit } from './useScreenInit.js';
import { kullanicilar } from './data/kullanicilar';
import { AppProvider, useApp } from './contexts/AppContext';
import { AppLayout } from './components/layout/AppLayout';
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/yeni-islem" element={<YeniIslem />} />
        <Route path="/kayitlar" element={<Kayitlar />} />
        <Route path="/kayitlar/:kayitNo" element={<KayitDetay />} />
        <Route path="/odeme-makbuz" element={<OdemeMakbuz />} />
        <Route path="/sigorta-sirketleri" element={<SigortaSirketleri />} />
        <Route path="/tas-ocagi-isletmecileri" element={<TasOcagiIsletmecileri />} />
        <Route path="/tas-ocagi-kartlari" element={<TasOcagiKartlari />} />
        <Route path="/kredi-hareketleri" element={<KrediHareketleri />} />
        <Route path="/ajanda" element={<Ajanda />} />
        <Route path="/raporlar" element={<Raporlar />} />
        <Route path="/kullanici-yonetimi" element={<KullaniciYonetimi />} />
        <Route path="/birim-yonetimi" element={<BirimYonetimi />} />
        <Route path="/yetkiler" element={<Yetkiler />} />
        <Route path="/mali-yil-arsiv" element={<MaliYilArsiv />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/is-kurallari" element={<IsKurallari />} />
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