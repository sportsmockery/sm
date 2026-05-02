/**
 * Secure storage adapter for Supabase auth tokens.
 *
 * On native: capacitor-secure-storage-plugin (encrypted Keychain/Keystore).
 * On web/build: localStorage fallback (development only — never ship a web
 * build without HTTPS + scoped origin).
 */

import { isClient, isNative } from './utils';

type Secure = { get: (o: { key: string }) => Promise<{ value: string }>;
                set: (o: { key: string; value: string }) => Promise<{ value: boolean }>;
                remove: (o: { key: string }) => Promise<{ value: boolean }> };

let _secure: Secure | null | undefined;
async function secure(): Promise<Secure | null> {
  if (_secure !== undefined) return _secure;
  if (!isNative()) { _secure = null; return null; }
  try {
    const mod: any = await import('capacitor-secure-storage-plugin');
    _secure = (mod.SecureStoragePlugin ?? mod.default ?? mod) as Secure;
  } catch {
    _secure = null;
  }
  return _secure;
}

export const SecureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (!isClient()) return null;
    const s = await secure();
    if (s) {
      try { const r = await s.get({ key }); return r.value ?? null; }
      catch { return null; }
    }
    try { return window.localStorage.getItem(key); } catch { return null; }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (!isClient()) return;
    const s = await secure();
    if (s) { try { await s.set({ key, value }); } catch { /* noop */ } return; }
    try { window.localStorage.setItem(key, value); } catch { /* noop */ }
  },

  async removeItem(key: string): Promise<void> {
    if (!isClient()) return;
    const s = await secure();
    if (s) { try { await s.remove({ key }); } catch { /* noop */ } return; }
    try { window.localStorage.removeItem(key); } catch { /* noop */ }
  },
};
