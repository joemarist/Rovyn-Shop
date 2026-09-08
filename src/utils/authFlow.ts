export interface PendingVerification {
  email: string;
  purpose: 'registration' | 'google_signup' | 'password_reset';
  setupToken?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
}

const KEY = 'rovyn_pending_verification';

export function savePendingVerification(data: PendingVerification) {
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

export function getPendingVerification(): PendingVerification | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingVerification;
  } catch {
    return null;
  }
}

export function clearPendingVerification() {
  sessionStorage.removeItem(KEY);
}

export function savePortalUnlocked() {
  sessionStorage.setItem('rovyn_portal_unlocked', '1');
}

export function isPortalUnlocked(): boolean {
  return sessionStorage.getItem('rovyn_portal_unlocked') === '1';
}

export function clearPortalUnlocked() {
  sessionStorage.removeItem('rovyn_portal_unlocked');
}
