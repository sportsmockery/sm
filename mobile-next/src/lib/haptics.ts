import { isNative } from './utils';

export type Impact = 'light' | 'medium' | 'heavy';

export async function haptic(style: Impact = 'light') {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    const map: Record<Impact, any> = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: map[style] });
  } catch {
    /* noop */
  }
}

export async function selection() {
  if (!isNative()) return;
  try {
    const { Haptics } = await import('@capacitor/haptics');
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
  } catch { /* noop */ }
}

export async function notify(type: 'success' | 'warning' | 'error' = 'success') {
  if (!isNative()) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    const map = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    };
    await Haptics.notification({ type: map[type] });
  } catch { /* noop */ }
}
