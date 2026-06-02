import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  adminId?: string;
  adminEmail?: string;
}

function getSecret(): string {
  return process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production';
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado: token requerido' });
    return;
  }

  const token = header.split('Bearer ')[1];
  try {
    const payload = jwt.verify(token, getSecret()) as jwt.JwtPayload;
    req.adminId = payload['uid'] as string;
    req.adminEmail = payload['email'] as string;
    next();
  } catch {
    res.status(401).json({ error: 'No autorizado: token inválido o expirado' });
  }
}

export function signToken(uid: string, email: string, nombre: string): string {
  return jwt.sign(
    { uid, email, nombre },
    getSecret(),
    { expiresIn: '8h' }
  );
}
