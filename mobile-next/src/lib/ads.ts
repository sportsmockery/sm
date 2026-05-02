/**
 * AdMob wrapper. No-op on web build (returns null/false). Lazy-imports the
 * Capacitor plugin only on native to keep the static export clean.
 *
 * Per Directive 3: callers should already be rendering a fixed-dim placeholder;
 * these methods only fire after `isNative()` is true.
 */

import { isNative } from './utils';
import { ADMOB_IDS } from './config';

let initialized = false;

export async function initAdMob(): Promise<boolean> {
  if (!isNative() || initialized) return initialized;
  try {
    const mod: any = await import('@capacitor-community/admob');
    const AdMob = mod.AdMob ?? mod.default ?? mod;
    await AdMob.initialize({
      testingDevices: [],
      initializeForTesting: process.env.NODE_ENV !== 'production',
    });
    initialized = true;
  } catch (e) {
    console.warn('[AdMob] init failed', e);
  }
  return initialized;
}

export async function showBanner(adId?: string): Promise<void> {
  if (!(await initAdMob())) return;
  try {
    const mod: any = await import('@capacitor-community/admob');
    const AdMob = mod.AdMob ?? mod.default ?? mod;
    const platform =
      typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
        ? 'android'
        : 'ios';
    const fallback = platform === 'ios' ? ADMOB_IDS.iosBanner : ADMOB_IDS.androidBanner;
    await AdMob.showBanner({
      adId: adId || fallback,
      adSize: mod.BannerAdSize?.ADAPTIVE_BANNER ?? 'ADAPTIVE_BANNER',
      position: mod.BannerAdPosition?.BOTTOM_CENTER ?? 'BOTTOM_CENTER',
      margin: 60,
    });
  } catch (e) {
    console.warn('[AdMob] showBanner failed', e);
  }
}

export async function hideBanner(): Promise<void> {
  if (!isNative()) return;
  try {
    const { AdMob } = await import('@capacitor-community/admob');
    await AdMob.hideBanner();
  } catch { /* noop */ }
}
