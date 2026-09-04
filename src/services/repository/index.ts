import { MockKtpgvRepository } from './mockRepository';
import type { KtpgvRepository } from './types';

export type {
  GerceklesmeGirdisi,
  GerceklesmeSonucu,
  GirisSonucu,
  IslemSonucu,
  KayitSonucu,
  KimlikDogrulamaSonucu,
  KrediOzeti,
  KrediYuklemeDekontKaydiGirdisi,
  KtpgvRepository,
  MakbuzUretimSonucu,
  OdemeDogrulamaSonucu,
  PlanGirdisi,
  PlanSonucu,
  SonucGirdisi
} from './types';

/**
 * Aktif veri/auth adaptörü. Şu an demo/prototip amaçlı bellek içi uygulama kullanılır.
 * Üretim geçişinde bu satır aynı `KtpgvRepository` sözleşmesini karşılayan bir
 * Supabase uygulaması ile değiştirilir; UI katmanında başka değişiklik gerekmez.
 */
export const repository: KtpgvRepository = new MockKtpgvRepository();
