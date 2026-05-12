import jwt from 'jsonwebtoken';

export function signToken(payload: { userId: string; username: string }): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; username: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { userId: string; username: string };
  } catch {
    return null;
  }
}
