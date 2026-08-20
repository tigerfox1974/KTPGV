import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { AktiflikSecimi } from '../kart/AktiflikSecimi';
import { CokluSecim, YetkiAnahtari } from './CokluSecim';
import { bentler } from '../../data/bentler';
import { menuler } from '../../data/menuler';
import { roller } from '../../data/kullanicilar';
import { useApp } from '../../contexts/AppContext';
import { BentKodu, Kullanici, RolKodu } from '../../types';

interface KullaniciFormuProps {
  acik: boolean;
  kapat: () => void;
  mevcut: Kullanici | null;
}

function bosKullanici(): Kullanici {
  return {
    id: `u-${Date.now()}`,
    kullaniciAdi: '',
    sifre: '',
    adSoyad: '',
    rol: 'İlçe / Karakol Kullanıcısı',
    rolKodu: 'KARAKOL',
    birim: '',
    birimId: '',
    bentler: [],
    menuler: ['dashboard', 'kayitlar', 'kurallar'],
    makbuzUretebilir: false,
    sadeceGoruntule: false,
    raporGorebilir: false,
    ajandaKullanabilir: false,
    bauGuncelleyebilir: false,
    aktif: true,
    notlar: ''
  };
}

export function KullaniciFormu({ acik, kapat, mevcut }: KullaniciFormuProps) {
  const { birimler, kullaniciKaydet } = useApp();
  const [form, setForm] = useState<Kullanici>(bosKullanici());

  useEffect(() => {
    if (acik) setForm(mevcut ? { ...mevcut } : bosKullanici());
  }, [acik, mevcut]);

  const guncelle = <K extends keyof Kullanici,>(alan: K, deger: Kullanici[K]) =>
  setForm((eski) => ({ ...eski, [alan]: deger }));

  const birimSec = (birimId: string) => {
    const birim = birimler.find((b) => b.id === birimId);
    setForm((eski) => ({ ...eski, birimId, birim: birim?.ad ?? '' }));
  };

  const rolSec = (kod: string) => {
    const rol = roller.find((r) => r.kod === kod);
    setForm((eski) => ({ ...eski, rolKodu: kod as RolKodu, rol: rol?.ad ?? eski.rol }));
  };

  const kaydet = () => {
    const sonuc = kullaniciKaydet(form);
    if (!sonuc.basarili) {
      toast.error('Kullanıcı kaydedilemedi', { description: sonuc.mesaj });
      return;
    }
    toast.success(mevcut ? 'Kullanıcı güncellendi' : 'Kullanıcı oluşturuldu', {
      description: `${form.kullaniciAdi} · ${form.rol}`
    });
    kapat();
  };

  const aktifBirimler = birimler.filter((b) => b.aktif || b.id === form.birimId);

  return (
    <Dialog open={acik} onOpenChange={(a) => !a && kapat()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{mevcut ? 'Kullanıcıyı düzenle' : 'Yeni kullanıcı ekle'}</DialogTitle>
          <DialogDescription>
            Giriş kullanıcı adı ve şifre ile yapılır. Kullanıcı silinmez, pasife alınır.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ky-kullanici-adi">Kullanıcı adı</Label>
              <Input
                id="ky-kullanici-adi"
                value={form.kullaniciAdi}
                onChange={(e) => guncelle('kullaniciAdi', e.target.value)}
                placeholder="Örn. karakol2"
                className="mt-1.5" />
              
              <p className="mt-1 text-xs text-muted-foreground">
                E-posta ile giriş yoktur. Aynı kullanıcı adı iki kez kullanılamaz.
              </p>
            </div>
            <div>
              <Label htmlFor="ky-sifre">Şifre</Label>
              <Input
                id="ky-sifre"
                value={form.sifre}
                onChange={(e) => guncelle('sifre', e.target.value)}
                placeholder="Örn. 1234"
                className="mt-1.5" />
              
            </div>
            <div>
              <Label htmlFor="ky-ad-soyad">Ad soyad</Label>
              <Input
                id="ky-ad-soyad"
                value={form.adSoyad}
                onChange={(e) => guncelle('adSoyad', e.target.value)}
                className="mt-1.5" />
              
            </div>
            <div>
              <Label htmlFor="ky-rol">Rol</Label>
              <Select value={form.rolKodu} onValueChange={rolSec}>
                <SelectTrigger id="ky-rol" className="mt-1.5">
                  <SelectValue placeholder="Lütfen rol seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {roller.map((r) =>
                  <SelectItem key={r.kod} value={r.kod}>
                      {r.ad}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ky-birim">Birim</Label>
              <Select value={form.birimId || undefined} onValueChange={birimSec}>
                <SelectTrigger id="ky-birim" className="mt-1.5">
                  <SelectValue placeholder="Lütfen birim seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {aktifBirimler.map((b) =>
                  <SelectItem key={b.id} value={b.id}>
                      {b.ad} ({b.kod}){!b.aktif && ' · Pasif'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Pasif birimler yeni atamalarda listelenmez.
              </p>
            </div>
            <AktiflikSecimi
              id="ky-durum"
              aktif={form.aktif}
              degistir={(a) => guncelle('aktif', a)}
              aciklama="Pasif kullanıcı giriş yapamaz, listede pasif etiketiyle görünür." />
            
          </div>

          <CokluSecim
            baslik="Yetkili bentler"
            aciklama="Kullanıcı yalnız seçili bentlerde işlem yapabilir."
            sutun={3}
            secenekler={bentler.map((b) => ({ deger: b.kod, etiket: `${b.kod} - ${b.baslik}` }))}
            secili={form.bentler}
            degistir={(s) => guncelle('bentler', s as BentKodu[])} />
          

          <CokluSecim
            baslik="Menü erişimleri"
            aciklama="Yalnız seçili menüler sol menüde görünür."
            sutun={2}
            secenekler={menuler.map((m) => ({ deger: m.id, etiket: m.etiket }))}
            secili={form.menuler}
            degistir={(s) => guncelle('menuler', s)} />
          

          <div>
            <p className="text-sm font-medium text-foreground">İşlem yetkileri</p>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              <YetkiAnahtari
                id="ky-makbuz"
                etiket="Makbuz üretebilir"
                aciklama="Makbuz numarası sistem tarafından üretilir."
                deger={form.makbuzUretebilir}
                degistir={(d) => guncelle('makbuzUretebilir', d)} />
              
              <YetkiAnahtari
                id="ky-rapor"
                etiket="Rapor görebilir"
                deger={form.raporGorebilir}
                degistir={(d) => guncelle('raporGorebilir', d)} />
              
              <YetkiAnahtari
                id="ky-ajanda"
                etiket="Ajanda kullanabilir"
                aciklama="Patlatma gerçekleşme raporu işleme dahil."
                deger={form.ajandaKullanabilir}
                degistir={(d) => guncelle('ajandaKullanabilir', d)} />
              
              <YetkiAnahtari
                id="ky-bau"
                etiket="BAÜ güncelleyebilir"
                aciklama="Brüt asgari ücret sistem ayarı."
                deger={form.bauGuncelleyebilir}
                degistir={(d) => guncelle('bauGuncelleyebilir', d)} />
              
              <YetkiAnahtari
                id="ky-goruntule"
                etiket="Sadece görüntüleme"
                aciklama="Kayıt oluşturma ve düzenleme kapalı olur."
                deger={form.sadeceGoruntule}
                degistir={(d) => guncelle('sadeceGoruntule', d)} />
              
            </div>
          </div>

          <div>
            <Label htmlFor="ky-notlar">Notlar</Label>
            <Textarea
              id="ky-notlar"
              rows={2}
              value={form.notlar ?? ''}
              onChange={(e) => guncelle('notlar', e.target.value)}
              className="mt-1.5" />
            
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={kapat}>
            Vazgeç
          </Button>
          <Button onClick={kaydet}>{mevcut ? 'Değişiklikleri kaydet' : 'Kullanıcıyı oluştur'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}