import React, { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { KuralNotu } from '../components/common/KuralNotu';
import { MakbuzModal } from '../components/islem/MakbuzModal';
import { DosyaOnizlemeModal } from '../components/islem/DosyaOnizlemeModal';
import { OdemeTablosu } from '../components/islem/OdemeTablosu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useApp } from '../contexts/AppContext';
import { DekontDosyasi, Islem } from '../types';

export function OdemeMakbuz() {
  const { kullanici, islemler, makbuzUret, odemeDogrula, auditEkle } = useApp();
  const [makbuzIslem, setMakbuzIslem] = useState<Islem | null>(null);
  const [onizleme, setOnizleme] = useState<DekontDosyasi | null>(null);

  if (!kullanici) return null;

  const uret = (islem: Islem) => {
    if (!kullanici.makbuzUretebilir) {
      toast.error('Makbuz üretme yetkiniz yok', {
        description:
        'Makbuz yalnızca Merkez Admin, Vakıf Muhasebe ve yetki verilmiş birimlerce üretilir.'
      });
      return;
    }
    if (islem.makbuzNo) {
      toast.error('Bu kayda zaten makbuz üretilmiş', { description: islem.makbuzNo });
      return;
    }
    const no = makbuzUret(islem.id);
    if (no) {
      auditEkle('Makbuz üretildi', `${no} / ${islem.kayitNo}`);
      toast.success('Makbuz üretildi', {
        description: `Makbuz no: ${no} (sistem tarafından benzersiz üretildi)`
      });
    }
  };

  const dogrula = (islem: Islem) => {
    odemeDogrula(islem.id);
    auditEkle('Ödeme doğrulandı', islem.kayitNo);
    toast.success('Ödeme doğrulandı', {
      description:
      islem.eIslemTuru === 'KREDI_YUKLEME' ?
      `${islem.kayitNo} · ${islem.krediAdedi} kredi kullanılabilir hale geldi.` :
      islem.kayitNo
    });
  };

  const goruntule = (islem: Islem) => {
    setMakbuzIslem(islem);
    auditEkle('Makbuz görüntülendi', islem.makbuzNo ?? islem.kayitNo);
  };

  const dosyaGoruntule = (dosya: DekontDosyasi) => {
    setOnizleme(dosya);
    auditEkle('Dekont dosyası görüntülendi', dosya.ad);
  };

  const gruplar = [
  {
    id: 'makbuz-bekleyen',
    etiket: 'Makbuz bekleyenler',
    kayitlar: islemler.filter(
      (i) => !i.makbuzNo && i.durum !== 'ODEME_BEKLIYOR' && i.eIslemTuru !== 'KREDI_KULLANIM'
    )
  },
  {
    id: 'odeme-bekleyen',
    etiket: 'Ödeme doğrulama bekleyenler',
    kayitlar: islemler.filter((i) => i.durum === 'ODEME_BEKLIYOR')
  },
  {
    id: 'makbuz-kesilen',
    etiket: 'Makbuz kesilenler',
    kayitlar: islemler.filter((i) => !!i.makbuzNo)
  },
  {
    id: 'baslatilabilir',
    etiket: 'İşlem başlatılabilir',
    kayitlar: islemler.filter((i) => i.durum === 'ISLEM_BASLATILABILIR')
  },
  { id: 'tumu', etiket: 'Tümü', kayitlar: islemler }];


  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Ödeme / Makbuz"
        aciklama="Ana mali işlem merkezi. Trafik kayıtlarında tek ana TTRF satırı görünür, alt başvurular açılır detayda listelenir." />
      

      <KuralNotu baslik="Makbuz yetkisi">
        {kullanici.makbuzUretebilir ?
        `${kullanici.rol} makbuz üretme yetkisine sahiptir. Makbuz numarası sistem tarafından benzersiz üretilir, elle yazılamaz ve aynı kayda ikinci makbuz üretilemez.` :
        `${kullanici.rol} makbuz üretemez; makbuz üret butonu pasiftir. Bu ekranda yalnızca ödeme ve makbuz durumu izlenebilir.`}
      </KuralNotu>

      <Tabs defaultValue="makbuz-bekleyen" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start">
          {gruplar.map((grup) =>
          <TabsTrigger key={grup.id} value={grup.id}>
              {grup.etiket}
              <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                {grup.kayitlar.length}
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        {gruplar.map((grup) =>
        <TabsContent key={grup.id} value={grup.id}>
            <OdemeTablosu
            islemler={grup.kayitlar}
            makbuzUretebilir={kullanici.makbuzUretebilir}
            sadeceGoruntule={kullanici.sadeceGoruntule}
            dosyaGoruntule={dosyaGoruntule}
            makbuzGoruntule={goruntule}
            makbuzUret={uret}
            odemeDogrula={dogrula} />
          
          </TabsContent>
        )}
      </Tabs>

      <MakbuzModal islem={makbuzIslem} acik={!!makbuzIslem} kapat={() => setMakbuzIslem(null)} />
      <DosyaOnizlemeModal dosya={onizleme} acik={!!onizleme} kapat={() => setOnizleme(null)} />
    </div>);

}