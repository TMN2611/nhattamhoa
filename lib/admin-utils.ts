import crypto from 'crypto';

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET environment variable is not set');
  return secret;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function createAdminToken(payload: { id: string; username: string; role: string }): string {
  const data = JSON.stringify(payload);
  const encoded = Buffer.from(data).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function validateAdminRequest(req: Request): { valid: boolean; role?: string; userId?: string } {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return { valid: false };

  const token = authHeader.replace('Bearer ', '');
  try {
    const dotIdx = token.lastIndexOf('.');
    if (dotIdx === -1) return { valid: false };

    const encoded = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const expectedSig = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return { valid: false };
    }

    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
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
