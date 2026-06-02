import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';
import { SurveyResponse, Answer } from '../models/survey.model';

const db = () => admin.firestore();
const COL_ENC = 'encuestas';
const COL_RESP = 'respuestas';
const router = Router();

// GET /api/estadisticas/:surveyId — estadísticas completas (admin)
router.get('/:surveyId', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { surveyId } = req.params;

    const [encDoc, respSnap] = await Promise.all([
      db().collection(COL_ENC).doc(surveyId).get(),
      db()
        .collection(COL_RESP)
        .where('surveyId', '==', surveyId)
        .orderBy('submittedAt', 'desc')
        .get(),
    ]);

    if (!encDoc.exists) {
      res.status(404).json({ error: 'Encuesta no encontrada' });
      return;
    }

    const respuestas = respSnap.docs.map(d => d.data() as SurveyResponse);
    const total = respuestas.length;

    // Respuestas por día (últimos 30 días)
    const now = new Date();
    const dayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayMap[d.toISOString().split('T')[0]] = 0;
    }
    respuestas.forEach(r => {
      const ts = (r.submittedAt as FirebaseFirestore.Timestamp).toDate?.() ??
        new Date(r.submittedAt as unknown as string);
      const key = ts.toISOString().split('T')[0];
      if (key in dayMap) dayMap[key]++;
    });
    const byDay = Object.entries(dayMap).map(([label, count]) => ({ label, count }));

    // Respuestas este mes
    const thisMonth = respuestas.filter(r => {
      const ts = (r.submittedAt as FirebaseFirestore.Timestamp).toDate?.() ??
        new Date(r.submittedAt as unknown as string);
      return ts.getMonth() === now.getMonth() && ts.getFullYear() === now.getFullYear();
    }).length;

    // Conteos por opción y promedios de escala
    const optionCounts: Record<string, Record<string, number>> = {};
    const scaleAccum: Record<string, { sum: number; count: number }> = {};

    respuestas.forEach(r => {
      r.answers.forEach((ans: Answer) => {
        const { questionId, value } = ans;
        if (typeof value === 'number') {
          if (!scaleAccum[questionId]) scaleAccum[questionId] = { sum: 0, count: 0 };
          scaleAccum[questionId].sum += value;
          scaleAccum[questionId].count++;
        } else {
          if (!optionCounts[questionId]) optionCounts[questionId] = {};
          const vals = Array.isArray(value) ? value : [value as string];
          vals.forEach(v => {
            optionCounts[questionId][v] = (optionCounts[questionId][v] ?? 0) + 1;
          });
        }
      });
    });

    const averageScores: Record<string, number> = {};
    for (const [qid, { sum, count }] of Object.entries(scaleAccum)) {
      averageScores[qid] = Math.round((sum / count) * 10) / 10;
    }

    res.json({ surveyId, total, thisMonth, byDay, optionCounts, averageScores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
