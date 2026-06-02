import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import express = require('express');
import cors = require('cors');

import authRouter from './routes/auth.routes';
import encuestasRouter from './routes/surveys.routes';
import respuestasRouter from './routes/responses.routes';
import estadisticasRouter from './routes/stats.routes';
import adminsRouter from './routes/admin.routes';

admin.initializeApp();

const JWT_SECRET = defineSecret('JWT_SECRET');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/encuestas', encuestasRouter);
app.use('/respuestas', respuestasRouter);
app.use('/estadisticas', estadisticasRouter);
app.use('/admins', adminsRouter);

app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

export const api = functions
  .region('us-central1')
  .runWith({ secrets: [JWT_SECRET] })
  .https.onRequest(app);
