import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';

const db = () => admin.firestore();
const COL = 'admins';
const router = Router();

// GET /api/admins — listar administradores
router.get('/', verifyToken, async (_req: AuthRequest, res: Response) => {
  try {
    const snap = await db().collection(COL).where('activo', '==', true).get();
    const admins = snap.docs.map(d => {
      const data = d.data();
      return { id: d.id, email: data['email'], nombre: data['nombre'], activo: data['activo'] };
    });
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/admins/:id — activar/desactivar admin
router.patch('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { activo } = req.body as { activo: boolean };
    await db().collection(COL).doc(req.params.id).update({ activo });
    res.json({ updated: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
