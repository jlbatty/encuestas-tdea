import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';
import { Survey } from '../models/survey.model';

const db = () => admin.firestore();
const COL = 'encuestas';
const router = Router();

// GET /api/encuestas/activa — encuesta activa (público)
router.get('/activa', async (_req: Request, res: Response) => {
  try {
    const snap = await db()
      .collection(COL)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (snap.empty) {
      res.status(404).json({ error: 'No hay encuestas activas' });
      return;
    }

    const doc = snap.docs[0];
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/encuestas — listar todas (admin)
router.get('/', verifyToken, async (_req: AuthRequest, res: Response) => {
  try {
    const snap = await db().collection(COL).orderBy('createdAt', 'desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/encuestas/:id — detalle (admin)
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await db().collection(COL).doc(req.params.id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Encuesta no encontrada' });
      return;
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/encuestas — crear (admin)
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, questions } = req.body as Survey;
    if (!title || !questions?.length) {
      res.status(400).json({ error: 'Título y preguntas son requeridos' });
      return;
    }
    const data = {
      title,
      description: description ?? '',
      questions,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const ref = await db().collection(COL).add(data);
    res.status(201).json({ id: ref.id, ...data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/encuestas/:id — actualizar (admin)
router.patch('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const allowed = ['title', 'description', 'active', 'questions'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await db().collection(COL).doc(req.params.id).update(updates);
    res.json({ updated: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/encuestas/:id — eliminar (admin)
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    await db().collection(COL).doc(req.params.id).delete();
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
