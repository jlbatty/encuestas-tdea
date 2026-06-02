/**
 * Seed para el emulador local de Firestore.
 * Ejecutar DESPUÉS de iniciar los emuladores:
 *   npx ts-node src/seed-local.ts
 */
process.env['FIRESTORE_EMULATOR_HOST'] = '127.0.0.1:8080';

import * as admin from 'firebase-admin';

admin.initializeApp({ projectId: 'encuestatdea-baeff' });
const db = admin.firestore();

async function seed() {
  console.log('🌱 Iniciando seed en emulador local...\n');

  // ── Admin de prueba ──────────────────────────────────────────────
  await db.collection('admins').doc('admin-local').set({
    nombre: 'Administrador TdeA',
    email: 'admin@tdea.edu.co',
    password: 'admin123',
    activo: true,
  });
  console.log('✅ Admin creado: admin@tdea.edu.co / admin123');

  // ── Encuesta ─────────────────────────────────────────────────────
  await db.collection('encuestas').doc('encuesta-ia-2026').set({
    title: 'Uso de la Inteligencia Artificial y Creatividad en Estudiantes',
    description: 'Esta encuesta es anónima y tiene como objetivo conocer cómo los estudiantes utilizan herramientas de IA en sus actividades académicas y personales, así como explorar su perfil creativo. Tu participación es muy valiosa.',
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    questions: [
      // A. Datos de la institución educativa
      { id: 'q_nombre_inst', section: 'A. Datos de la institución educativa', text: 'Nombre de la institución:', type: 'text', required: true },
      { id: 'q_tipo_inst', section: 'A. Datos de la institución educativa', text: 'Tipo de institución:', type: 'single', required: true, options: [{ id: 'ti_publica', text: 'Pública' }, { id: 'ti_privada', text: 'Privada' }, { id: 'ti_concesion', text: 'Concesión / en convenio' }] },
      { id: 'q_municipio_inst', section: 'A. Datos de la institución educativa', text: 'Municipio:', type: 'text', required: true },
      { id: 'q_departamento', section: 'A. Datos de la institución educativa', text: 'Departamento:', type: 'text', required: true },
      { id: 'q_zona', section: 'A. Datos de la institución educativa', text: 'Zona:', type: 'single', required: true, options: [{ id: 'zona_urbana', text: 'Urbana' }, { id: 'zona_rural', text: 'Rural' }, { id: 'zona_rural_disp', text: 'Rural dispersa' }] },
      { id: 'q_jornada', section: 'A. Datos de la institución educativa', text: 'Jornada escolar:', type: 'single', required: true, options: [{ id: 'jor_manana', text: 'Mañana' }, { id: 'jor_tarde', text: 'Tarde' }, { id: 'jor_completa', text: 'Completa / única' }, { id: 'jor_nocturna', text: 'Nocturna' }] },
      // B. Datos del estudiante
      { id: 'q_tipo_doc', section: 'B. Datos del estudiante', text: 'Tipo de documento de identidad:', type: 'single', required: true, options: [{ id: 'tid_ti', text: 'Tarjeta de Identidad (TI)' }, { id: 'tid_cc', text: 'Cédula de Ciudadanía (CC)' }, { id: 'tid_ce', text: 'Cédula de Extranjería (CE)' }, { id: 'tid_pa', text: 'Pasaporte (PA)' }, { id: 'tid_ppt', text: 'Permiso por Protección Temporal (PPT)' }, { id: 'tid_rc', text: 'Registro Civil (RC)' }] },
      { id: 'q_num_doc', section: 'B. Datos del estudiante', text: 'Número de documento de identidad:', type: 'text', required: true },
      { id: 'q_edad', section: 'B. Datos del estudiante', text: 'Edad (años):', type: 'text', required: true },
      { id: 'q_grado', section: 'B. Datos del estudiante', text: 'Grado:', type: 'text', required: true },
      { id: 'q_codigo', section: 'B. Datos del estudiante', text: 'Código asignado:', type: 'text', required: false },
      { id: 'q_sexo_biologico', section: 'B. Datos del estudiante', text: 'Sexo biológico (para fines de análisis estadístico):', type: 'single', required: true, options: [{ id: 'sb_femenino', text: 'Femenino' }, { id: 'sb_masculino', text: 'Masculino' }, { id: 'sb_intersexual', text: 'Intersexual' }] },
      { id: 'q_identidad_genero', section: 'B. Datos del estudiante', text: 'Identidad de género:', type: 'single', required: true, options: [{ id: 'ig_mujer', text: 'Mujer' }, { id: 'ig_hombre', text: 'Hombre' }, { id: 'ig_nobinario', text: 'No binario' }, { id: 'ig_no_indica', text: 'Prefiero no indicarlo' }] },
      { id: 'q_pais', section: 'B. Datos del estudiante', text: '¿En qué país naciste?', type: 'single', required: true, options: [{ id: 'pais_colombia', text: 'Colombia' }, { id: 'pais_otro', text: 'Otro' }] },
      { id: 'q_ciudad', section: 'B. Datos del estudiante', text: 'Ciudad o municipio donde vives actualmente:', type: 'text', required: true },
      // C. Contexto socioeconómico
      { id: 'q_estrato', section: 'C. Contexto socioeconómico', text: 'Estrato socioeconómico de tu vivienda:', type: 'single', required: true, options: [{ id: 'est_1', text: '1' }, { id: 'est_2', text: '2' }, { id: 'est_3', text: '3' }, { id: 'est_4', text: '4' }, { id: 'est_5', text: '5' }, { id: 'est_6', text: '6' }, { id: 'est_ns', text: 'No sé' }] },
      { id: 'q_con_quien', section: 'C. Contexto socioeconómico', text: '¿Con quiénes vives actualmente? (puedes marcar varias opciones)', type: 'multiple', required: true, options: [{ id: 'cq_padre', text: 'Padre' }, { id: 'cq_madre', text: 'Madre' }, { id: 'cq_padrastro', text: 'Padrastro / Madrastra' }, { id: 'cq_abuelos', text: 'Abuelos' }, { id: 'cq_hermanos', text: 'Hermanos' }, { id: 'cq_solo', text: 'Solo/a' }, { id: 'cq_otro', text: 'Otro' }] },
      { id: 'q_num_personas', section: 'C. Contexto socioeconómico', text: 'Número de personas que viven en tu hogar:', type: 'single', required: true, options: [{ id: 'np_1_2', text: '1–2' }, { id: 'np_3_4', text: '3–4' }, { id: 'np_5_6', text: '5–6' }, { id: 'np_7_mas', text: '7 o más' }] },
      { id: 'q_edu_padre', section: 'C. Contexto socioeconómico', text: '¿Cuál es el nivel educativo más alto de tu padre o acudiente masculino?', type: 'single', required: true, options: [{ id: 'edp_0', text: 'Sin escolaridad' }, { id: 'edp_1', text: 'Primaria' }, { id: 'edp_2', text: 'Bachillerato' }, { id: 'edp_3', text: 'Técnico/Tecnológico' }, { id: 'edp_4', text: 'Universitario' }, { id: 'edp_5', text: 'Posgrado' }, { id: 'edp_ns', text: 'No sé' }] },
      { id: 'q_edu_madre', section: 'C. Contexto socioeconómico', text: '¿Cuál es el nivel educativo más alto de tu madre o acudiente femenina?', type: 'single', required: true, options: [{ id: 'edm_0', text: 'Sin escolaridad' }, { id: 'edm_1', text: 'Primaria' }, { id: 'edm_2', text: 'Bachillerato' }, { id: 'edm_3', text: 'Técnico/Tecnológico' }, { id: 'edm_4', text: 'Universitario' }, { id: 'edm_5', text: 'Posgrado' }, { id: 'edm_ns', text: 'No sé' }] },
      { id: 'q_servicios', section: 'C. Contexto socioeconómico', text: '¿Con cuáles servicios básicos cuenta la vivienda donde resides?', type: 'multiple', required: true, options: [{ id: 'srv_agua', text: 'Agua potable' }, { id: 'srv_energia', text: 'Energía eléctrica' }, { id: 'srv_alcant', text: 'Alcantarillado o pozo séptico' }, { id: 'srv_gas', text: 'Gas domiciliario' }, { id: 'srv_internet', text: 'Servicio de internet' }, { id: 'srv_basuras', text: 'Recolección de basuras' }, { id: 'srv_ninguno', text: 'No cuenta con servicios básicos' }, { id: 'srv_otro', text: 'Otro' }] },
      // D. Contexto académico y digital
      { id: 'q_promedio', section: 'D. Contexto académico y digital', text: '¿Cuál fue tu promedio académico en el último período? (aproximado)', type: 'single', required: true, options: [{ id: 'prom_bajo', text: 'Inferior a 3.0' }, { id: 'prom_30_34', text: 'Entre 3.0 y 3.4' }, { id: 'prom_35_39', text: 'Entre 3.5 y 3.9' }, { id: 'prom_40_44', text: 'Entre 4.0 y 4.4' }, { id: 'prom_45_mas', text: '4.5 o superior' }] },
      { id: 'q_reprobado', section: 'D. Contexto académico y digital', text: '¿Has reprobado algún grado escolar?', type: 'single', required: true, options: [{ id: 'rep_no', text: 'No' }, { id: 'rep_una', text: 'Sí, una vez' }, { id: 'rep_mas', text: 'Sí, más de una vez' }] },
      { id: 'q_trabajo', section: 'D. Contexto académico y digital', text: '¿Actualmente trabajas o realizas alguna actividad remunerada además de estudiar?', type: 'single', required: true, options: [{ id: 'trab_no', text: 'No' }, { id: 'trab_si', text: 'Sí' }] },
      { id: 'q_internet', section: 'D. Contexto académico y digital', text: '¿Tienes acceso a internet en tu casa?', type: 'single', required: true, options: [{ id: 'int_siempre', text: 'Sí, siempre' }, { id: 'int_aveces', text: 'Sí, a veces' }, { id: 'int_no', text: 'No' }] },
      { id: 'q_dispositivo', section: 'D. Contexto académico y digital', text: '¿Desde qué dispositivo accedes más a internet o herramientas digitales?', type: 'single', required: true, options: [{ id: 'disp_celular', text: 'Celular propio' }, { id: 'disp_computador', text: 'Computador o portátil propio' }, { id: 'disp_compartido', text: 'Dispositivo compartido en casa' }, { id: 'disp_colegio', text: 'Dispositivo del colegio' }, { id: 'disp_ninguno', text: 'No tengo acceso' }] },
      { id: 'q_horas_pantalla', section: 'D. Contexto académico y digital', text: '¿Cuántas horas al día, en promedio, usas dispositivos con pantalla (celular, PC, tablet)?', type: 'single', required: true, options: [{ id: 'hp_menos1', text: 'Menos de 1 hora' }, { id: 'hp_1_2', text: '1–2 horas' }, { id: 'hp_3_4', text: '3–4 horas' }, { id: 'hp_5_6', text: '5–6 horas' }, { id: 'hp_mas6', text: 'Más de 6 horas' }] },
      { id: 'q_sustancias', section: 'D. Contexto académico y digital', text: '¿Has consumido alguna sustancia psicoactiva durante el último mes?', type: 'single', required: true, options: [{ id: 'sus_si', text: 'Sí' }, { id: 'sus_no', text: 'No' }] },
      // E. Intereses y perfil creativo
      { id: 'q_actividades_creativas', section: 'E. Intereses y perfil creativo', text: '¿Cuáles son tus principales actividades creativas o de ocio? (puedes marcar varias)', type: 'multiple', required: false, options: [{ id: 'ac_musica', text: 'Música (tocar, cantar, componer)' }, { id: 'ac_artes', text: 'Artes plásticas o visuales' }, { id: 'ac_escritura', text: 'Escritura o poesía' }, { id: 'ac_fotografia', text: 'Fotografía o video' }, { id: 'ac_diseno', text: 'Diseño o moda' }, { id: 'ac_programacion', text: 'Programación o tecnología' }, { id: 'ac_cocina', text: 'Cocina' }, { id: 'ac_danza', text: 'Danza o teatro' }, { id: 'ac_ninguna', text: 'Ninguna de las anteriores' }] },
      { id: 'q_creatividad', section: 'E. Intereses y perfil creativo', text: 'En una escala del 1 al 5, ¿qué tan creativo/a te consideras?', type: 'single', required: true, options: [{ id: 'cre_1', text: '1 – Nada creativo/a' }, { id: 'cre_2', text: '2' }, { id: 'cre_3', text: '3 – Moderadamente' }, { id: 'cre_4', text: '4' }, { id: 'cre_5', text: '5 – Muy creativo/a' }] },
      { id: 'q_familia_creativa', section: 'E. Intereses y perfil creativo', text: '¿Alguien en tu familia trabaja en una actividad creativa o artística?', type: 'single', required: true, options: [{ id: 'fc_si', text: 'Sí' }, { id: 'fc_no', text: 'No' }, { id: 'fc_ns', text: 'No sé' }] },
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
  });
  console.log('✅ Encuesta cargada en la colección "encuestas"');
  console.log('\n🎉 Seed completado. Puedes abrir http://localhost:4000 para ver los datos.\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
