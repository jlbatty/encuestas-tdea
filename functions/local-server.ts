/**
 * Servidor local de desarrollo — no requiere Java ni Firebase emulators.
 * Ejecutar: npx ts-node local-server.ts
 * Corre en: http://localhost:5001/encuestatdea-baeff/us-central1/api
 */
import express = require('express');
import cors = require('cors');
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = 'clave-secreta-local-desarrollo-tdea-2026';
const PORT = 5001;
const BASE_PATH = '/encuestatdea-baeff/us-central1/api';

// ── Base de datos en memoria ─────────────────────────────────────────────────

const admins: Record<string, any> = {
  'admin-local': {
    id: 'admin-local',
    nombre: 'Administrador TdeA',
    email: 'admin@tdea.edu.co',
    password: 'admin123',
    activo: true,
  },
};

const encuestas: Record<string, any> = {
  'encuesta-ia-2026': {
    id: 'encuesta-ia-2026',
    title: 'Cuestionario sobre el uso de herramientas de Inteligencia Artificial en contexto académico',
    description: 'Esta encuesta es anónima y tiene como objetivo conocer cómo los estudiantes utilizan herramientas de IA en sus actividades académicas y personales. Tu participación es muy valiosa.',
    active: true,
    createdAt: new Date().toISOString(),
    questions: [
      { id: 'q_edad', section: 'Información personal', text: 'Edad:', type: 'single', required: true, options: [{ id: 'edad_15', text: '15 años' }, { id: 'edad_16', text: '16 años' }, { id: 'edad_17', text: '17 años' }] },
      { id: 'q_sexo', section: 'Información personal', text: 'Sexo:', type: 'single', required: true, options: [{ id: 'sexo_m', text: 'Masculino' }, { id: 'sexo_f', text: 'Femenino' }, { id: 'sexo_o', text: 'Otro' }, { id: 'sexo_nr', text: 'Prefiero no decirlo' }] },
      { id: 'q_grado', section: 'Información personal', text: 'Grado escolar actual:', type: 'single', required: true, options: [{ id: 'grado_10', text: '10°' }, { id: 'grado_11', text: '11°' }] },
      { id: 'q_edu_padre', section: 'Contexto familiar', text: 'Nivel educativo del padre (mayor nivel alcanzado):', type: 'single', required: true, options: [{ id: 'edp_0', text: 'No sabe leer ni escribir' }, { id: 'edp_1', text: 'Primaria incompleta' }, { id: 'edp_2', text: 'Primaria completa' }, { id: 'edp_3', text: 'Secundaria incompleta' }, { id: 'edp_4', text: 'Secundaria completa' }, { id: 'edp_5', text: 'Técnica o tecnológica' }, { id: 'edp_6', text: 'Universitaria' }, { id: 'edp_7', text: 'Posgrado' }] },
      { id: 'q_edu_madre', section: 'Contexto familiar', text: 'Nivel educativo de la madre (mayor nivel alcanzado):', type: 'single', required: true, options: [{ id: 'edm_0', text: 'No sabe leer ni escribir' }, { id: 'edm_1', text: 'Primaria incompleta' }, { id: 'edm_2', text: 'Primaria completa' }, { id: 'edm_3', text: 'Secundaria incompleta' }, { id: 'edm_4', text: 'Secundaria completa' }, { id: 'edm_5', text: 'Técnica o tecnológica' }, { id: 'edm_6', text: 'Universitaria' }, { id: 'edm_7', text: 'Posgrado' }] },
      { id: 'q_con_quien', section: 'Contexto familiar', text: '¿Con quién vive actualmente? (puede marcar más de una opción)', type: 'multiple', required: true, options: [{ id: 'cq_padre', text: 'Padre' }, { id: 'cq_madre', text: 'Madre' }, { id: 'cq_ambos', text: 'Ambos' }, { id: 'cq_hermanos', text: 'Hermanos' }, { id: 'cq_abuelos', text: 'Abuelos' }, { id: 'cq_otro', text: 'Otro' }] },
      { id: 'q_trabajo', section: 'Contexto familiar', text: '¿Trabajas actualmente de forma remunerada?', type: 'single', required: true, options: [{ id: 'trab_tc', text: 'Sí, a tiempo completo' }, { id: 'trab_mt', text: 'Sí, a medio tiempo' }, { id: 'trab_no', text: 'No trabajo' }] },
      { id: 'q_sustancias', section: 'Contexto familiar', text: '¿Has consumido alguna sustancia psicoactiva durante el último mes?', type: 'single', required: true, options: [{ id: 'sus_si', text: 'Sí' }, { id: 'sus_no', text: 'No' }] },
      { id: 'q_servicios', section: 'Contexto familiar', text: '¿Con cuáles servicios básicos cuenta la vivienda donde resides?', type: 'multiple', required: true, options: [{ id: 'srv_agua', text: 'Agua potable' }, { id: 'srv_energia', text: 'Energía eléctrica' }, { id: 'srv_alcant', text: 'Alcantarillado o pozo séptico' }, { id: 'srv_gas', text: 'Gas domiciliario' }, { id: 'srv_internet', text: 'Servicio de internet' }, { id: 'srv_basuras', text: 'Recolección de basuras' }, { id: 'srv_ninguno', text: 'No cuenta con servicios básicos' }, { id: 'srv_otro', text: 'Otro' }] },
      { id: 'q_usa_ia', section: 'Uso general de herramientas de IA', text: '¿Utilizas herramientas de inteligencia artificial como ChatGPT, Gemini, Copilot, DALL·E u otras?', type: 'single', required: true, options: [{ id: 'ia_si', text: 'Sí' }, { id: 'ia_no', text: 'No' }] },
      { id: 'q_solo_academico', section: 'Uso general de herramientas de IA', text: '¿Las utilizas únicamente para fines académicos?', type: 'single', required: true, options: [{ id: 'aca_si', text: 'Sí' }, { id: 'aca_no', text: 'No' }] },
      { id: 'q_ocio', section: 'Uso general de herramientas de IA', text: '¿También empleas herramientas de IA con fines personales o de ocio?', type: 'single', required: true, options: [{ id: 'ocio_si', text: 'Sí' }, { id: 'ocio_no', text: 'No' }] },
      { id: 'q_frec_escritura', section: 'Frecuencia de uso en actividades académicas\n(1 = Nunca · 2 = Casi nunca · 3 = Algunas veces · 4 = Frecuentemente · 5 = Siempre)', text: 'Producción escrita (redacción de textos, ensayos, resúmenes…)', type: 'scale', required: true, scale: { min: 1, max: 5, minLabel: 'Nunca', maxLabel: 'Siempre' } },
      { id: 'q_frec_lectura', section: 'Frecuencia de uso en actividades académicas\n(1 = Nunca · 2 = Casi nunca · 3 = Algunas veces · 4 = Frecuentemente · 5 = Siempre)', text: 'Lectura o análisis de textos', type: 'scale', required: true, scale: { min: 1, max: 5, minLabel: 'Nunca', maxLabel: 'Siempre' } },
      { id: 'q_frec_imagenes', section: 'Frecuencia de uso en actividades académicas\n(1 = Nunca · 2 = Casi nunca · 3 = Algunas veces · 4 = Frecuentemente · 5 = Siempre)', text: 'Generación o edición de imágenes', type: 'scale', required: true, scale: { min: 1, max: 5, minLabel: 'Nunca', maxLabel: 'Siempre' } },
      { id: 'q_frec_matematicas', section: 'Frecuencia de uso en actividades académicas\n(1 = Nunca · 2 = Casi nunca · 3 = Algunas veces · 4 = Frecuentemente · 5 = Siempre)', text: 'Resolución de problemas lógico-matemáticos', type: 'scale', required: true, scale: { min: 1, max: 5, minLabel: 'Nunca', maxLabel: 'Siempre' } },
      { id: 'q_frec_talleres', section: 'Frecuencia de uso en actividades académicas\n(1 = Nunca · 2 = Casi nunca · 3 = Algunas veces · 4 = Frecuentemente · 5 = Siempre)', text: 'Desarrollo de talleres escolares', type: 'scale', required: true, scale: { min: 1, max: 5, minLabel: 'Nunca', maxLabel: 'Siempre' } },
      { id: 'q_frec_exposiciones', section: 'Frecuencia de uso en actividades académicas\n(1 = Nunca · 2 = Casi nunca · 3 = Algunas veces · 4 = Frecuentemente · 5 = Siempre)', text: 'Diseño de exposiciones o presentaciones', type: 'scale', required: true, scale: { min: 1, max: 5, minLabel: 'Nunca', maxLabel: 'Siempre' } },
      { id: 'q_frec_ideas', section: 'Frecuencia de uso en actividades académicas\n(1 = Nunca · 2 = Casi nunca · 3 = Algunas veces · 4 = Frecuentemente · 5 = Siempre)', text: 'Generación de ideas creativas', type: 'scale', required: true, scale: { min: 1, max: 5, minLabel: 'Nunca', maxLabel: 'Siempre' } },
      { id: 'q_horas_academico', section: 'Tiempo estimado de uso diario', text: '¿Cuántas horas al día usas herramientas de IA con fines académicos?', type: 'single', required: true, options: [{ id: 'ha_0', text: 'Menos de 1 hora' }, { id: 'ha_1', text: 'Entre 1 y menos de 3 horas' }, { id: 'ha_2', text: 'Entre 3 y menos de 4 horas' }, { id: 'ha_3', text: '4 horas o más' }] },
      { id: 'q_horas_personal', section: 'Tiempo estimado de uso diario', text: '¿Cuántas horas al día usas herramientas de IA con fines personales o de ocio?', type: 'single', required: true, options: [{ id: 'hp_0', text: 'Menos de 1 hora' }, { id: 'hp_1', text: 'Entre 1 y menos de 3 horas' }, { id: 'hp_2', text: 'Entre 3 y menos de 4 horas' }, { id: 'hp_3', text: '4 horas o más' }] },
      { id: 'q_copia', section: 'Tipo de uso de IA en actividades escolares', text: 'Copio y pego directamente la información generada por la IA.', type: 'single', required: true, options: [{ id: 'cop_si', text: 'Sí' }, { id: 'cop_no', text: 'No' }] },
      { id: 'q_modifica', section: 'Tipo de uso de IA en actividades escolares', text: 'Modifico o depuro el contenido generado antes de utilizarlo.', type: 'single', required: true, options: [{ id: 'mod_si', text: 'Sí' }, { id: 'mod_no', text: 'No' }] },
      { id: 'q_compara', section: 'Tipo de uso de IA en actividades escolares', text: 'Comparo lo que produce la IA con lo que ya sé sobre el tema.', type: 'single', required: true, options: [{ id: 'cmp_si', text: 'Sí' }, { id: 'cmp_no', text: 'No' }] },
      { id: 'q_reorganiza', section: 'Tipo de uso de IA en actividades escolares', text: 'Reorganizo o transformo la información generada por la IA.', type: 'single', required: true, options: [{ id: 'reo_si', text: 'Sí' }, { id: 'reo_no', text: 'No' }] },
      { id: 'q_preguntas', section: 'Tipo de uso de IA en actividades escolares', text: 'Hago preguntas variadas a la IA para mejorar la comprensión o el resultado.', type: 'single', required: true, options: [{ id: 'prg_si', text: 'Sí' }, { id: 'prg_no', text: 'No' }] },
    ],
  },
};

const respuestas: Record<string, any> = {};

// ── Seed responses para desarrollo local ─────────────────────────────────────
(function seedResponses() {
  const d = (n: number) => { const dt = new Date(); dt.setDate(dt.getDate() - n); return dt.toISOString(); };
  const fqs = ['q_frec_escritura','q_frec_lectura','q_frec_imagenes','q_frec_matematicas','q_frec_talleres','q_frec_exposiciones','q_frec_ideas'];

  // [daysAgo, edad, sexo, grado, eduP, eduM, usaIa, frecs[7], horasAca, horasPer, copia, modifica, compara, reorganiza, preguntas]
  const profiles: Array<[number,string,string,string,string,string,string,number[],string,string,string,string,string,string,string]> = [
    [1, 'edad_16','sexo_f','grado_11','edp_4','edm_5','ia_si',[4,3,2,4,5,3,4],'ha_1','hp_1','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [1, 'edad_17','sexo_m','grado_11','edp_6','edm_6','ia_si',[5,4,3,5,4,4,5],'ha_2','hp_2','cop_si','mod_si','cmp_si','reo_si','prg_si'],
    [2, 'edad_15','sexo_m','grado_10','edp_3','edm_4','ia_si',[3,4,1,5,3,2,3],'ha_2','hp_0','cop_si','mod_si','cmp_no','reo_no','prg_si'],
    [2, 'edad_16','sexo_f','grado_10','edp_2','edm_3','ia_no',[1,1,1,1,1,1,1],'ha_0','hp_0','cop_no','mod_no','cmp_no','reo_no','prg_no'],
    [3, 'edad_17','sexo_f','grado_11','edp_5','edm_6','ia_si',[4,5,3,3,4,5,4],'ha_1','hp_1','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [4, 'edad_15','sexo_m','grado_10','edp_4','edm_4','ia_no',[2,1,1,2,1,1,2],'ha_0','hp_0','cop_no','mod_no','cmp_si','reo_no','prg_no'],
    [5, 'edad_16','sexo_o','grado_11','edp_5','edm_5','ia_si',[3,3,4,3,5,3,4],'ha_1','hp_1','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [6, 'edad_17','sexo_m','grado_11','edp_6','edm_7','ia_si',[5,4,4,4,5,4,5],'ha_2','hp_2','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [7, 'edad_16','sexo_f','grado_10','edp_4','edm_5','ia_si',[4,3,3,4,4,3,4],'ha_1','hp_1','cop_si','mod_si','cmp_si','reo_no','prg_si'],
    [8, 'edad_15','sexo_f','grado_10','edp_2','edm_2','ia_no',[1,2,1,1,2,1,1],'ha_0','hp_0','cop_no','mod_no','cmp_no','reo_no','prg_no'],
    [9, 'edad_16','sexo_m','grado_11','edp_5','edm_5','ia_si',[4,4,2,5,4,3,4],'ha_1','hp_1','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [10,'edad_17','sexo_f','grado_11','edp_6','edm_6','ia_si',[5,5,4,4,5,5,5],'ha_3','hp_2','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [11,'edad_16','sexo_m','grado_10','edp_3','edm_4','ia_si',[3,3,2,4,3,2,3],'ha_1','hp_0','cop_si','mod_si','cmp_no','reo_no','prg_no'],
    [12,'edad_15','sexo_f','grado_10','edp_4','edm_4','ia_no',[1,1,1,1,1,1,1],'ha_0','hp_0','cop_no','mod_no','cmp_no','reo_no','prg_no'],
    [13,'edad_16','sexo_m','grado_11','edp_5','edm_5','ia_si',[4,3,3,5,4,4,4],'ha_2','hp_1','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [14,'edad_17','sexo_f','grado_11','edp_7','edm_7','ia_si',[5,4,5,4,5,5,5],'ha_2','hp_2','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [15,'edad_16','sexo_m','grado_11','edp_4','edm_4','ia_si',[3,4,2,4,4,3,3],'ha_1','hp_1','cop_si','mod_si','cmp_si','reo_no','prg_no'],
    [16,'edad_15','sexo_f','grado_10','edp_3','edm_3','ia_no',[2,1,1,2,1,1,2],'ha_0','hp_0','cop_no','mod_no','cmp_si','reo_no','prg_no'],
    [17,'edad_16','sexo_m','grado_10','edp_4','edm_5','ia_si',[4,3,2,4,3,3,4],'ha_1','hp_1','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [18,'edad_17','sexo_f','grado_11','edp_5','edm_6','ia_si',[5,4,3,5,5,4,5],'ha_2','hp_2','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [19,'edad_16','sexo_nr','grado_10','edp_4','edm_4','ia_si',[3,3,3,3,3,3,3],'ha_1','hp_1','cop_si','mod_no','cmp_no','reo_no','prg_si'],
    [20,'edad_15','sexo_m','grado_10','edp_2','edm_3','ia_no',[1,1,1,1,1,1,1],'ha_0','hp_0','cop_no','mod_no','cmp_no','reo_no','prg_no'],
    [21,'edad_16','sexo_f','grado_11','edp_5','edm_5','ia_si',[4,4,3,4,4,4,4],'ha_1','hp_1','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [22,'edad_17','sexo_m','grado_11','edp_6','edm_6','ia_si',[5,5,4,5,5,5,5],'ha_3','hp_3','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [23,'edad_16','sexo_f','grado_11','edp_4','edm_5','ia_si',[4,3,2,4,4,3,4],'ha_1','hp_1','cop_si','mod_si','cmp_si','reo_no','prg_si'],
    [24,'edad_15','sexo_m','grado_10','edp_3','edm_3','ia_no',[2,2,1,2,2,1,2],'ha_0','hp_0','cop_no','mod_no','cmp_si','reo_no','prg_no'],
    [25,'edad_17','sexo_f','grado_11','edp_6','edm_6','ia_si',[5,4,4,4,5,4,5],'ha_2','hp_2','cop_no','mod_si','cmp_si','reo_si','prg_si'],
    [26,'edad_16','sexo_m','grado_10','edp_4','edm_4','ia_si',[3,3,2,4,3,3,3],'ha_1','hp_1','cop_si','mod_si','cmp_no','reo_si','prg_si'],
    [27,'edad_15','sexo_f','grado_10','edp_2','edm_4','ia_no',[1,1,1,1,1,1,1],'ha_0','hp_0','cop_no','mod_no','cmp_no','reo_no','prg_no'],
    [28,'edad_16','sexo_m','grado_11','edp_5','edm_5','ia_si',[4,4,3,5,4,3,4],'ha_1','hp_1','cop_no','mod_si','cmp_si','reo_si','prg_si'],
  ];

  const conQuienOpts = [['cq_ambos'],['cq_madre','cq_hermanos'],['cq_padre','cq_hermanos'],['cq_madre'],['cq_abuelos','cq_madre']];

  profiles.forEach(([n, edad, sexo, grado, eduP, eduM, usaIa, frecs, horasAca, horasPer, copia, modifica, compara, reorganiza, preguntas], i) => {
    const id = `seed-${i}`;
    const answers: any[] = [
      { questionId: 'q_edad',          value: edad },
      { questionId: 'q_sexo',          value: sexo },
      { questionId: 'q_grado',         value: grado },
      { questionId: 'q_edu_padre',     value: eduP },
      { questionId: 'q_edu_madre',     value: eduM },
      { questionId: 'q_con_quien',     value: conQuienOpts[i % conQuienOpts.length] },
      { questionId: 'q_trabajo',       value: i % 6 === 0 ? 'trab_mt' : 'trab_no' },
      { questionId: 'q_sustancias',    value: i % 8 === 0 ? 'sus_si' : 'sus_no' },
      { questionId: 'q_servicios',     value: ['srv_agua','srv_energia','srv_internet','srv_basuras'] },
      { questionId: 'q_usa_ia',        value: usaIa },
      { questionId: 'q_solo_academico',value: usaIa === 'ia_si' && i % 2 === 0 ? 'aca_si' : 'aca_no' },
      { questionId: 'q_ocio',          value: usaIa === 'ia_si' && i % 3 !== 0 ? 'ocio_si' : 'ocio_no' },
      ...fqs.map((qid, j) => ({ questionId: qid, value: frecs[j] })),
      { questionId: 'q_horas_academico', value: horasAca },
      { questionId: 'q_horas_personal',  value: horasPer },
      { questionId: 'q_copia',          value: copia },
      { questionId: 'q_modifica',       value: modifica },
      { questionId: 'q_compara',        value: compara },
      { questionId: 'q_reorganiza',     value: reorganiza },
      { questionId: 'q_preguntas',      value: preguntas },
    ];
    respuestas[id] = { id, surveyId: 'encuesta-ia-2026', respondentId: `anon-seed-${i}`, answers, submittedAt: d(n) };
  });
})();

// ── Helpers ──────────────────────────────────────────────────────────────────

function verifyToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado: token requerido' });
    return;
  }
  try {
    const payload = jwt.verify(header.split('Bearer ')[1], JWT_SECRET) as any;
    (req as any).adminId = payload.uid;
    (req as any).adminEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: 'No autorizado: token inválido o expirado' });
  }
}

function calcStats(surveyId: string) {
  const todas = Object.values(respuestas).filter(r => r.surveyId === surveyId);
  const now = new Date();

  const dayMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayMap[d.toISOString().split('T')[0]] = 0;
  }
  todas.forEach(r => {
    const key = new Date(r.submittedAt).toISOString().split('T')[0];
    if (key in dayMap) dayMap[key]++;
  });

  const thisMonth = todas.filter(r => {
    const d = new Date(r.submittedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const optionCounts: Record<string, Record<string, number>> = {};
  const scaleAccum: Record<string, { sum: number; count: number }> = {};

  todas.forEach(r => {
    r.answers.forEach((ans: any) => {
      const { questionId, value } = ans;
      if (typeof value === 'number') {
        if (!scaleAccum[questionId]) scaleAccum[questionId] = { sum: 0, count: 0 };
        scaleAccum[questionId].sum += value;
        scaleAccum[questionId].count++;
      } else {
        if (!optionCounts[questionId]) optionCounts[questionId] = {};
        const vals = Array.isArray(value) ? value : [value];
        vals.forEach((v: string) => { optionCounts[questionId][v] = (optionCounts[questionId][v] ?? 0) + 1; });
      }
    });
  });

  const averageScores: Record<string, number> = {};
  for (const [qid, { sum, count }] of Object.entries(scaleAccum)) {
    averageScores[qid] = Math.round((sum / count) * 10) / 10;
  }

  return {
    surveyId,
    total: todas.length,
    thisMonth,
    byDay: Object.entries(dayMap).map(([label, count]) => ({ label, count })),
    optionCounts,
    averageScores,
  };
}

// ── Express app ───────────────────────────────────────────────────────────────

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const router = express.Router();

// Health
router.get('/health', (_req, res) => res.json({ status: 'ok — servidor local', timestamp: new Date().toISOString() }));

// Auth
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const admin = Object.values(admins).find(
    a => a.email === email?.toLowerCase().trim() && a.password === password && a.activo
  );
  if (!admin) { res.status(401).json({ error: 'Credenciales incorrectas' }); return; }
  const token = jwt.sign({ uid: admin.id, email: admin.email, nombre: admin.nombre }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, admin: { id: admin.id, email: admin.email, nombre: admin.nombre } });
});

router.get('/auth/me', verifyToken, (req, res) => {
  res.json({ id: (req as any).adminId, email: (req as any).adminEmail });
});

// Encuestas
router.get('/encuestas/activa', (_req, res) => {
  const activa = Object.values(encuestas).find(e => e.active);
  if (!activa) { res.status(404).json({ error: 'No hay encuestas activas' }); return; }
  res.json(activa);
});

router.get('/encuestas', verifyToken, (_req, res) => {
  res.json(Object.values(encuestas));
});

router.get('/encuestas/:id', verifyToken, (req, res) => {
  const enc = encuestas[req.params.id];
  if (!enc) { res.status(404).json({ error: 'Encuesta no encontrada' }); return; }
  res.json(enc);
});

// Respuestas
router.post('/respuestas', (req, res) => {
  const { surveyId, answers } = req.body;
  if (!surveyId || !answers?.length) { res.status(400).json({ error: 'Datos incompletos' }); return; }
  if (!encuestas[surveyId]?.active) { res.status(404).json({ error: 'Encuesta no encontrada' }); return; }
  const id = `r-${Date.now()}`;
  respuestas[id] = { id, surveyId, respondentId: `anon-${Date.now()}`, answers, submittedAt: new Date().toISOString() };
  res.status(201).json({ id, message: 'Respuesta enviada correctamente' });
});

router.get('/respuestas', verifyToken, (req, res) => {
  const { surveyId } = req.query;
  const todas = Object.values(respuestas).filter(r => !surveyId || r.surveyId === surveyId);
  res.json({ total: todas.length, respuestas: todas });
});

// Estadísticas
router.get('/estadisticas/:surveyId', verifyToken, (req, res) => {
  if (!encuestas[req.params.surveyId]) { res.status(404).json({ error: 'Encuesta no encontrada' }); return; }
  res.json(calcStats(req.params.surveyId));
});

// Admins
router.get('/admins', verifyToken, (_req, res) => {
  res.json(Object.values(admins).map(({ password: _p, ...a }) => a));
});

app.use(BASE_PATH, router);

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor local corriendo en http://localhost:${PORT}${BASE_PATH}`);
  console.log(`   Encuesta activa: ✅ encuesta-ia-2026`);
  console.log(`   Admin de prueba: admin@tdea.edu.co / admin123\n`);
});
