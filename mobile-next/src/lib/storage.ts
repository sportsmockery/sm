/**
 * SSR-safe storage adapter.
 *
 * On native, uses @capacitor/preferences. On web/build-time, falls back to
 * localStorage (or no-ops during static export). All methods are async to
 * match Capacitor's API.
 */

import { isClient, isNative } from './utils';

type Pref = { get: (o: { key: string }) => Promise<{ value: string | null }>;
              set: (o: { key: string; value: string }) => Promise<void>;
              remove: (o: { key: string }) => Promise<void> };

let _prefs: Pref | null | undefined;
async function prefs(): Promise<Pref | null> {
  if (_prefs !== undefined) return _prefs;
  if (!isNative()) { _prefs = null; return null; }
  try {
    const mod = await import('@capacitor/preferences');
    _prefs = mod.Preferences as Pref;
  } catch {
    _prefs = null;
  }
  return _prefs;
}

export const Storage = {
  async get(key: string): Promise<string | null> {
    if (!isClient()) return null;
    const p = await prefs();
    if (p) {
      const r = await p.get({ key });
      return r.value;
    }
    try { return window.localStorage.getItem(key); } catch { return null; }
  },

  async set(key: string, value: string): Promise<void> {
    if (!isClient()) return;
    const p = await prefs();
    if (p) { await p.set({ key, value }); return; }
    try { window.localStorage.setItem(key, value); } catch { /* quota */ }
  },

  async remove(key: string): Promise<void> {
    if (!isClient()) return;
    const p = await prefs();
    if (p) { await p.remove({ key }); return; }
    try { window.localStorage.removeItem(key); } catch { /* noop */ }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await Storage.get(key);
    if (raw == null) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },

  async setJSON<T>(key: string, value: T): Promise<void> {
    await Storage.set(key, JSON.stringify(value));
  },
};
