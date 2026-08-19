import { SigortaSirketi } from '../types';

export const sigortaSirketleri: SigortaSirketi[] = [
{
  id: 'sg-1',
  ad: 'Kıbrıs Sigorta Ltd.',
  vergiNo: 'KKTC-1120045',
  adres: 'Şehit Ecvet Yusuf Cad. No:12, Lefkoşa',
  telefon: '0392 227 11 20',
  eposta: 'trafik@kibrissigorta.com',
  yetkiliKisi: 'Deniz Arslan',
  yetkiliTelefon: '0533 841 22 10',
  aktif: true,
  notlar: 'Toplu TTRF başvurularını haftalık gönderir.'
},
{
  id: 'sg-2',
  ad: 'Anadolu Akdeniz Sigorta',
  vergiNo: 'KKTC-2298110',
  adres: 'Bedreddin Demirel Cad. No:5, Girne',
  telefon: '0392 815 40 90',
  eposta: 'hasar@anadoluakdeniz.com',
  yetkiliKisi: 'Merve Tuncer',
  yetkiliTelefon: '0542 330 71 45',
  aktif: true,
  notlar: 'Dekont yüklemesini QR/link ile yapmayı tercih eder.'
},
{
  id: 'sg-3',
  ad: 'Mağusa Güven Sigorta',
  vergiNo: 'KKTC-3341902',
  adres: 'Salamis Yolu No:44, Gazimağusa',
  telefon: '0392 366 22 18',
  eposta: 'info@magusaguven.com',
  yetkiliKisi: 'Hasan Özdemir',
  yetkiliTelefon: '0533 712 09 88',
  aktif: false,
  notlar: 'Sözleşme yenileme sürecinde, pasif durumda.'
}];


export function sigortaBul(id?: string): SigortaSirketi | undefined {
  return sigortaSirketleri.find((s) => s.id === id);
}