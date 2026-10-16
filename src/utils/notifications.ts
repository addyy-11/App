import { AppSettings } from '../types';
import { soundManager } from './audio';

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

export function isQuietHours(settings: AppSettings): boolean {
  if (!settings.quietHoursStart || !settings.quietHoursEnd) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = settings.quietHoursStart.split(':').map(Number);
  const [endH, endM] = settings.quietHoursEnd.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    // Normal same-day range (e.g. 13:00 to 14:00)
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Overnight range (e.g. 22:00 to 08:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

export function sendDesktopNotification(
  title: string,
  options: {
    body: string;
    tag?: string;
    category?: 'assignment' | 'exam' | 'hydration' | 'break' | 'focus';
    settings: AppSettings;
  }
): boolean {
  const { body, tag, category, settings } = options;

  // Check quiet hours
  if (isQuietHours(settings)) {
    return false;
  }

  // Play sound if enabled
  if (settings.soundEnabled) {
    if (category === 'hydration') {
      soundManager.playHydrationLogged(settings.soundVolume);
    } else if (category === 'focus') {
      soundManager.playTimerComplete(settings.soundVolume);
    } else {
      soundManager.playReminderChime(settings.soundVolume);
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted' && settings.notificationsEnabled) {
    try {
      new Notification(title, {
        body,
        tag: tag || 'eduhealth-notification',
        icon: '/favicon.ico',
        silent: !settings.soundEnabled,
      });
      return true;
    } catch (err) {
      console.warn('Desktop notification failed:', err);
      return false;
    }
  }

  return false;
}
