import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '../components/common/PageHeader';
import { KuralNotu } from '../components/common/KuralNotu';
import { MakbuzModal } from '../components/islem/MakbuzModal';
import { DosyaOnizlemeModal } from '../components/islem/DosyaOnizlemeModal';
import { OdemeTablosu } from '../components/islem/OdemeTablosu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useApp } from '../contexts/AppContext';
import { DekontDosyasi, Islem } from '../types';
import { krediYuklemeKaydiniCozumle } from '../utils/krediYukleme';
import { patlatmaBedeli } from '../utils/hesaplama';

export function OdemeMakbuz() {
  const {
    kullanici,
    bau,
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
    if (!makbuzUretilebilir(islem)) {
      toast.error('Makbuz üretme yetkiniz yok', {
        description:
        'Makbuz yalnızca Merkez Admin, Vakıf Muhasebe ve yetki verilmiş birimlerce, kendi kapsamındaki mali kayıtlar için üretilir.'
      });
      return;
    }
    const sonuc = makbuzUret(islem.id);
    if (!sonuc.basarili) {
      toast.error('Eksik makbuz tamamlanamadı', { description: sonuc.mesaj });
      return;
    }
    const numaralar = sonuc.makbuzNumaralari?.join(', ');
    auditEkle('Makbuz üretildi', `${numaralar ?? islem.kayitNo} / ${islem.kayitNo}`);
    toast.success('Eksik makbuz tamamlandı', {
      description: numaralar ? `${sonuc.mesaj} · ${numaralar}` : sonuc.mesaj
    });
  };

  const dogrula = (islem: Islem, dekontId?: string) => {
    if (!odemeDogrulanabilir(islem)) {
      toast.error('Ödeme doğrulama yetkiniz yok', {
        description: 'Bu kayıt için ödeme doğrulaması Merkez Admin veya Vakıf Muhasebe tarafından yapılır.'
      });
      return;
    }
    const sonuc = odemeDogrula(islem.id, dekontId);
    if (!sonuc.basarili) {
      toast.error('Ödeme doğrulanamadı', { description: sonuc.mesaj });
      return;
    }
    auditEkle('Ödeme doğrulandı', islem.kayitNo);
    toast.success('Ödeme doğrulandı', {
      description: sonuc.mesaj
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
  const krediAnalizleri = new Map(
    maliKayitlar.
    filter((islem) => islem.eIslemTuru === 'KREDI_YUKLEME').
    map((islem) => [
      islem.id,
      krediYuklemeKaydiniCozumle({
        islem,
        birimKrediBedeli: patlatmaBedeli(bau)
      })] as const)
  );
  const krediAnalizi = (islem: Islem) => krediAnalizleri.get(islem.id);

  const gruplar = [
  {
    id: 'makbuz-bekleyen',
    etiket: 'Eksik makbuz kayıtları',
    kayitlar: maliKayitlar.filter((i) =>
      i.eIslemTuru === 'KREDI_YUKLEME' ?
      (krediAnalizi(i)?.makbuzEksikleri.length ?? 0) > 0 :
      !i.makbuzNo && i.durum !== 'ODEME_BEKLIYOR')
  },
  {
    id: 'odeme-bekleyen',
    etiket: 'Ödeme doğrulama bekleyenler',
    kayitlar: maliKayitlar.filter((i) =>
      i.eIslemTuru === 'KREDI_YUKLEME' ?
      (krediAnalizi(i)?.bekleyenDekontSayisi ?? 0) > 0 :
      i.durum === 'ODEME_BEKLIYOR')
  },
  {
    id: 'makbuz-kesilen',
    etiket: 'Makbuz kesilenler',
    kayitlar: maliKayitlar.filter((i) =>
      i.eIslemTuru === 'KREDI_YUKLEME' ?
      (krediAnalizi(i)?.bagisMakbuzlari.length ?? 0) > 0 :
      !!i.makbuzNo)
  },
  {
    id: 'baslatilabilir',
    etiket: 'İşlem başlatılabilir',
    kayitlar: maliKayitlar.filter((i) =>
      i.eIslemTuru === 'KREDI_YUKLEME' ?
      (krediAnalizi(i)?.dogrulanmisOzeti.kullanilabilirKrediAdedi ?? 0) > 0 :
      i.durum === 'ISLEM_BASLATILABILIR')
  },
  { id: 'tumu', etiket: 'Tüm mali kayıtlar', kayitlar: maliKayitlar }];


  return (
    <div className="space-y-6">
      <PageHeader
        baslik="Ödeme / Makbuz"
        aciklama="Ana mali işlem merkezi." />
      

      <KuralNotu baslik="Bu ekranda hangi kayıtlar görünür?">
        Bu ekranda yalnız ödeme doğuran kayıtlar listelenir. E bendi için sadece kredi yükleme
        kayıtları görünür; patlatma planlama ve patlatma sonucu kayıtları Patlatma Takvimi, Ajanda,
        Kredi Hareketleri ve taş ocağı kartlarında izlenir.
      </KuralNotu>

      <KuralNotu baslik="Veri kapsamı">
        {maliVeriGorebilir ?
        `${kullanici.rol} tüm mali kayıtları görüntüleyebilir.` :
        `${kullanici.rol} yalnızca kendi birimine (${kullanici.birim}) ve yetkili olduğu bentlere ait mali kayıtları görüntüleyebilir. Diğer birimlerin kayıtları silinmez, yalnızca bu kullanıcıya gösterilmez.`}
      </KuralNotu>

      <KuralNotu baslik="Makbuz yetkisi">
        {kullanici.makbuzUretebilir ?
        `${kullanici.rol} ödeme kaydı sırasında otomatik üretilen makbuzları görüntüleyebilir ve tekrar yazdırabilir. Makbuz numarası sistem tarafından benzersiz üretilir, elle yazılamaz ve aynı dağılıma ikinci kez üretim yapılamaz.` :
        `${kullanici.rol} makbuz üretemez; bu ekranda yalnızca ödeme ve makbuz durumu izlenebilir.`}
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