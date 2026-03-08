export const ADMIN_CREDENTIALS = {
  username: 'adm1',
  password: '123',
};

export const ADMIN_TOKEN = Buffer.from(`${ADMIN_CREDENTIALS.username}:${ADMIN_CREDENTIALS.password}`).toString('base64');

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
}

export function validateAdminRequest(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  return token === ADMIN_TOKEN;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('admin_session') === 'true';
}

export function getAdminToken(): string {
  return typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || '') : '';
}

export function setAdminSession(loggedIn: boolean) {
  if (typeof window === 'undefined') return;
  if (loggedIn) {
    localStorage.setItem('admin_session', 'true');
    localStorage.setItem('admin_token', ADMIN_TOKEN);
  } else {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_token');
  }
}
