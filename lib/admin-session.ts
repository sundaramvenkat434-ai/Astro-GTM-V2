export const SESSION_EXPIRY_KEY = 'admin_session_expires';

export function setDaySession() {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  localStorage.setItem(SESSION_EXPIRY_KEY, String(endOfDay.getTime()));
}
