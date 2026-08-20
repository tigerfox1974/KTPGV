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
  const {
    kullanici,
    gorunurMaliKayitlar,
    makbuzUretilebilir,
    odemeDogrulanabilir,
    maliVeriGorebilir,
    makbuzUret,
    odemeDogrula,
    auditEkle
  } = useApp();
  const [makbuzIslem, setMakbuzIslem] = useState<Islem | null>(null);
  const [onizleme, setOnizleme] = useState<DekontDosyasi | null>(null);

  if (!kullanici) return null;

  const uret = (islem: Islem) => {
    if (islem.makbuzNo) {
      toast.error('Bu kayda zaten makbuz üretilmiş', { description: islem.makbuzNo });
      return;
    }
    if (!makbuzUretilebilir(islem)) {
      toast.error('Makbuz üretme yetkiniz yok', {
        description:
        'Makbuz yalnızca Merkez Admin, Vakıf Muhasebe ve yetki verilmiş birimlerce, kendi kapsamındaki mali kayıtlar için üretilir.'
      });
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
    if (!odemeDogrulanabilir(islem)) {
      toast.error('Ödeme doğrulama yetkiniz yok', {
        description: 'Bu kayıt için ödeme doğrulaması Merkez Admin veya Vakıf Muhasebe tarafından yapılır.'
      });
      return;
    }
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

  // Ödeme / Makbuz ekranı yalnız MALİ kayıtları gösterir (E bendinde yalnız EKRD).
  // Ardından kullanıcının rol / birim / bent kapsamı uygulanır.
  const maliKayitlar = gorunurMaliKayitlar;

  const gruplar = [
  {
    id: 'makbuz-bekleyen',
    etiket: 'Makbuz bekleyenler',
    kayitlar: maliKayitlar.filter((i) => !i.makbuzNo && i.durum !== 'ODEME_BEKLIYOR')
  },
  {
    id: 'odeme-bekleyen',
    etiket: 'Ödeme doğrulama bekleyenler',
    kayitlar: maliKayitlar.filter((i) => i.durum === 'ODEME_BEKLIYOR')
  },
  {
    id: 'makbuz-kesilen',
    etiket: 'Makbuz kesilenler',
    kayitlar: maliKayitlar.filter((i) => !!i.makbuzNo)
  },
  {
    id: 'baslatilabilir',
    etiket: 'İşlem başlatılabilir',
    kayitlar: maliKayitlar.filter((i) => i.durum === 'ISLEM_BASLATILABILIR')
  },
  { id: 'tumu', etiket: 'Tüm mali kayıtlar', kayitlar: maliKayitlar }];


  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Ödeme / Makbuz"
        aciklama="Ana mali işlem merkezi. Yalnız ödeme doğuran kayıtlar listelenir; trafikte tek ana TTRF satırı görünür." />
      

      <KuralNotu baslik="Bu ekranda hangi kayıtlar görünür?">
        A, B, C, Ç, D, F / Adli, F / Trafik ana TTRF ve E patlatma kredisi yükleme kayıtları
        listelenir. Patlatma planlama ve patlatma sonucu kayıtları ödeme doğuran kayıtlar olmadığı
        için burada ana satır olarak görünmez; bunlar Patlatma Takvimi, Ajanda, Kredi Hareketleri ve
        taş ocağı kartlarında izlenir.
      </KuralNotu>

      <KuralNotu baslik="Veri kapsamı">
        {maliVeriGorebilir ?
        `${kullanici.rol} tüm mali kayıtları görüntüleyebilir.` :
        `${kullanici.rol} yalnızca kendi birimine (${kullanici.birim}) ve yetkili olduğu bentlere ait mali kayıtları görüntüleyebilir. Diğer birimlerin kayıtları silinmez, yalnızca bu kullanıcıya gösterilmez.`}
      </KuralNotu>

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
            makbuzUretilebilir={makbuzUretilebilir}
            odemeDogrulanabilir={odemeDogrulanabilir}
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