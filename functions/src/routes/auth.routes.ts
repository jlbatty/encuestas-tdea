import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { signToken, verifyToken, AuthRequest } from '../middleware/auth.middleware';

const db = () => admin.firestore();
const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email y contraseña son requeridos' });
    return;
  }

  try {
    const snap = await db()
      .collection('admins')
      .where('email', '==', email.toLowerCase().trim())
      .where('activo', '==', true)
      .limit(1)
      .get();

    if (snap.empty) {
      res.status(401).json({ error: 'Credenciales incorrectas' });
      return;
    }

    const doc = snap.docs[0];
    const data = doc.data();

    if (data['password'] !== password) {
      res.status(401).json({ error: 'Credenciales incorrectas' });
      return;
    }

    const token = signToken(doc.id, data['email'], data['nombre'] ?? '');

    res.json({
      token,
      admin: {
        id: doc.id,
        email: data['email'],
        nombre: data['nombre'] ?? '',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/auth/me — verifica token y devuelve datos del admin
router.get('/me', verifyToken, (req: AuthRequest, res: Response) => {
  res.json({ id: req.adminId, email: req.adminEmail });
});

export default router;
