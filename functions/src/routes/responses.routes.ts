import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';
import { SurveyResponse } from '../models/survey.model';

const db = () => admin.firestore();
const COL = 'respuestas';
const COL_ENC = 'encuestas';
const router = Router();

// POST /api/respuestas — enviar respuesta (público, anónimo)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { surveyId, answers } = req.body as SurveyResponse;
    if (!surveyId || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ error: 'surveyId y answers son requeridos' });
      return;
    }

    const encDoc = await db().collection(COL_ENC).doc(surveyId).get();
    if (!encDoc.exists || !encDoc.data()?.['active']) {
      res.status(404).json({ error: 'Encuesta no encontrada o inactiva' });
      return;
    }

    const data = {
      surveyId,
      respondentId: `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      answers,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await db().collection(COL).add(data);
    res.status(201).json({ id: ref.id, message: 'Respuesta enviada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/respuestas?surveyId=xxx — listar (admin)
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { surveyId, limit = '500' } = req.query;
    let query: FirebaseFirestore.Query = db().collection(COL);
    if (surveyId) query = query.where('surveyId', '==', surveyId);
    query = query.orderBy('submittedAt', 'desc').limit(Number(limit));
    const snap = await query.get();
    const respuestas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ total: respuestas.length, respuestas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /api/respuestas/:id — eliminar (admin)
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
