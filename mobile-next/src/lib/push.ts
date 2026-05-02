/**
 * OneSignal Capacitor wrapper. No-op on web build.
 */

import { isNative } from './utils';
import { ONESIGNAL_APP_ID } from './config';

let initialized = false;

export async function initPush(): Promise<void> {
  if (!isNative() || initialized || !ONESIGNAL_APP_ID) return;
  try {
    // OneSignal Capacitor package: install onesignal-cordova-plugin (works
    // with Capacitor 7) and update this import path. Lazy/try wrapped so a
    // missing dep no-ops cleanly.
    const mod: any = await import(/* @vite-ignore */ /* webpackIgnore: true */ 'onesignal-cordova-plugin' as any).catch(() => null);
    if (!mod) return;
    const OneSignal = mod.OneSignal ?? mod.default ?? mod;
    OneSignal.initialize(ONESIGNAL_APP_ID);
    OneSignal.Notifications?.requestPermission?.(true);
    initialized = true;
  } catch (e) {
    console.warn('[Push] init failed', e);
  }
}

export async function loginPushUser(externalId: string): Promise<void> {
  if (!isNative()) return;
  try {
    // OneSignal Capacitor package: install onesignal-cordova-plugin (works
    // with Capacitor 7) and update this import path. Lazy/try wrapped so a
    // missing dep no-ops cleanly.
    const mod: any = await import(/* @vite-ignore */ /* webpackIgnore: true */ 'onesignal-cordova-plugin' as any).catch(() => null);
    if (!mod) return;
    const OneSignal = mod.OneSignal ?? mod.default ?? mod;
    OneSignal.login?.(externalId);
  } catch { /* noop */ }
}

export async function setPushTags(tags: Record<string, string>): Promise<void> {
  if (!isNative()) return;
  try {
    // OneSignal Capacitor package: install onesignal-cordova-plugin (works
    // with Capacitor 7) and update this import path. Lazy/try wrapped so a
    // missing dep no-ops cleanly.
    const mod: any = await import(/* @vite-ignore */ /* webpackIgnore: true */ 'onesignal-cordova-plugin' as any).catch(() => null);
    if (!mod) return;
    const OneSignal = mod.OneSignal ?? mod.default ?? mod;
    OneSignal.User?.addTags?.(tags);
  } catch { /* noop */ }
}

export async function clearPushTags(keys: string[]): Promise<void> {
  if (!isNative()) return;
  try {
    // OneSignal Capacitor package: install onesignal-cordova-plugin (works
    // with Capacitor 7) and update this import path. Lazy/try wrapped so a
    // missing dep no-ops cleanly.
    const mod: any = await import(/* @vite-ignore */ /* webpackIgnore: true */ 'onesignal-cordova-plugin' as any).catch(() => null);
    if (!mod) return;
    const OneSignal = mod.OneSignal ?? mod.default ?? mod;
    OneSignal.User?.removeTags?.(keys);
  } catch { /* noop */ }
}
