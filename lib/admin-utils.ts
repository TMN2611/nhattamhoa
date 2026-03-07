export const ADMIN_CREDENTIALS = {
  username: 'adm1',
  password: '123',
};

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('admin_session') === 'true';
}

export function setAdminSession(loggedIn: boolean) {
  if (typeof window === 'undefined') return;
  if (loggedIn) {
    localStorage.setItem('admin_session', 'true');
  } else {
    localStorage.removeItem('admin_session');
  }
}
