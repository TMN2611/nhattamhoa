import crypto from 'crypto';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function validateAdminRequest(req: Request): { valid: boolean; role?: string; userId?: string } {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return { valid: false };

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    if (parsed.id && parsed.role) {
      return { valid: true, role: parsed.role, userId: parsed.id };
    }
  } catch {}

  return { valid: false };
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('admin_session') === 'true';
}

export function getAdminToken(): string {
  return typeof window !== 'undefined' ? (localStorage.getItem('admin_token') || '') : '';
}

export function getAdminRole(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('admin_role') || '';
}

export function getAdminDisplayName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('admin_display_name') || '';
}

export function setAdminSession(loggedIn: boolean, data?: { token: string; role: string; displayName: string }) {
  if (typeof window === 'undefined') return;
  if (loggedIn && data) {
    localStorage.setItem('admin_session', 'true');
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('admin_role', data.role);
    localStorage.setItem('admin_display_name', data.displayName);
  } else {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_display_name');
  }
}
