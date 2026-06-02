import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, signal } from '@angular/core';
import { SurveyService, StatsResponse } from '../../../services/survey';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';

Chart.register(...registerables);

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  private svc = inject(SurveyService);

  @ViewChild('lineChart')      lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sexoChart')      sexoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('zonaChart')      edadChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('iaUsageChart')   iaUsageChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('frecChart')      frecChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tipoUsoChart')   tipoUsoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('horasChart')     horasChartRef!: ElementRef<HTMLCanvasElement>;

  statCards  = signal<StatCard[]>([]);
  loading    = signal(true);
  error      = signal<string | null>(null);
  ready      = signal(false);
  surveyTitle = signal('');

  private charts: Chart[] = [];
  private stats!: StatsResponse;

  async ngOnInit() {
    try {
      await this.svc.loadActiveSurvey();
      const survey = this.svc.getActiveSurvey();

      if (!survey) {
        this.error.set('No hay encuesta activa.');
        return;
      }

      this.surveyTitle.set(survey.title);
      this.stats = await this.svc.getStats(survey.id);

      const { total, thisMonth, averageScores, optionCounts } = this.stats;
      const iaPercent = optionCounts['q_usa_ia']
        ? Math.round(((optionCounts['q_usa_ia']['ia_si'] ?? 0) / (total || 1)) * 100)
        : 0;

      this.statCards.set([
        { label: 'Total de respuestas',       value: total,                                    icon: '📋', color: '#0d6efd' },
        { label: 'Respuestas este mes',        value: thisMonth,                                icon: '📅', color: '#198754' },
        { label: 'Usan herramientas de IA',   value: `${iaPercent}%`,                          icon: '🤖', color: '#fd7e14' },
        { label: 'Prom. uso en escritura',    value: `${averageScores['q_frec_escritura'] ?? 0}/5`, icon: '✍️', color: '#6f42c1' },
      ]);

      // Mostrar contenido y luego construir gráficas (next tick)
      this.ready.set(true);
      setTimeout(() => this.buildCharts(), 0);

    } catch (err) {
      console.error(err);
      this.error.set('Error al cargar las estadísticas. Verifica que el servidor local esté corriendo.');
    } finally {
      this.loading.set(false);
    }
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
  }

  exporting = signal(false);

  async exportExcel() {
    const survey = this.svc.getActiveSurvey();
    if (!survey) return;

    this.exporting.set(true);
    try {
      const respuestas = await this.svc.getResponses(survey.id);

      // Mapa: questionId → texto de la pregunta
      const qLabel: Record<string, string> = {};
      // Mapa: questionId → optionId → texto de la opción
      const optLabel: Record<string, Record<string, string>> = {};
      survey.questions.forEach(q => {
        qLabel[q.id] = q.text;
        if (q.options) {
          optLabel[q.id] = {};
          q.options.forEach(o => { optLabel[q.id][o.id] = o.text; });
        }
      });

      // Cabeceras: N°, Fecha, luego cada pregunta
      const headers = ['N°', 'Fecha', ...survey.questions.map(q => q.text)];

      // Etiquetas de escala
      const scaleLabels: Record<number, string> = { 1: 'Nunca', 2: 'Casi nunca', 3: 'Algunas veces', 4: 'Frecuentemente', 5: 'Siempre' };

      // Filas: una por respondente
      const rows = respuestas.map((r: any, i: number) => {
        // Firestore Admin SDK serializa Timestamp como { seconds, nanoseconds }
        const ts = r.submittedAt;
        let fecha = 'Sin fecha';
        if (ts?.toDate)                     fecha = ts.toDate().toLocaleDateString('es-CO');
        else if (ts?.seconds)               fecha = new Date(ts.seconds * 1000).toLocaleDateString('es-CO');
        else if (ts?._seconds)              fecha = new Date(ts._seconds * 1000).toLocaleDateString('es-CO');
        else if (typeof ts === 'string')    fecha = new Date(ts).toLocaleDateString('es-CO');

        const ansMap: Record<string, any> = {};
        (r.answers ?? []).forEach((a: any) => { ansMap[a.questionId] = a.value; });

        const cells = survey.questions.map(q => {
          const val = ansMap[q.id];
          if (val === undefined || val === null || val === '') return '';

          // Escala: número → "Texto (N)"
          if (q.type === 'scale' && typeof val === 'number')
            return `${scaleLabels[val] ?? val} (${val})`;

          // Múltiple selección: array → textos separados por coma
          if (Array.isArray(val))
            return val.map((v: string) => optLabel[q.id]?.[v] ?? v).join(', ');

          // Selección única: mapear ID → texto
          return optLabel[q.id]?.[val] ?? val;
        });

        return [i + 1, fecha, ...cells];
      });

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      // Ancho de columnas
      ws['!cols'] = headers.map((h, i) => ({ wch: i < 2 ? 8 : Math.min(40, Math.max(15, h.length)) }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Respuestas');
      XLSX.writeFile(wb, `encuesta-ia-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      this.exporting.set(false);
    }
  }

  private buildCharts() {
    const { byDay, optionCounts, averageScores } = this.stats;
    this.buildLine(byDay);
    this.buildSexo(optionCounts['q_sexo_biologico'] ?? {});
    this.buildEdad(optionCounts['q_zona'] ?? {});
    this.buildIaUsage(optionCounts['q_usa_ia'] ?? {});
    this.buildFrec(averageScores);
    this.buildTipoUso(optionCounts);
    this.buildHoras(optionCounts['q_horas_academico'] ?? {}, optionCounts['q_horas_personal'] ?? {});
  }

  private mk(ref: ElementRef<HTMLCanvasElement>, config: any): Chart {
    const c = new Chart(ref.nativeElement, config);
    this.charts.push(c);
    return c;
  }

  private buildLine(byDay: { label: string; count: number }[]) {
    const last14 = byDay.slice(-14);
    this.mk(this.lineChartRef, {
      type: 'line',
      data: {
        labels: last14.map(d => { const [,m,day] = d.label.split('-'); return `${day}/${m}`; }),
        datasets: [{
          label: 'Respuestas',
          data: last14.map(d => d.count),
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,0.08)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#0d6efd',
          pointRadius: 4,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  }

  private buildSexo(c: Record<string, number>) {
    this.mk(this.sexoChartRef, {
      type: 'doughnut',
      data: {
        labels: ['Femenino', 'Masculino', 'Intersexual'],
        datasets: [{
          data: [c['sb_femenino'] ?? 0, c['sb_masculino'] ?? 0, c['sb_intersexual'] ?? 0],
          backgroundColor: ['#e91e8c', '#0d6efd', '#fd7e14'],
          borderWidth: 2,
        }],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });
  }

  private buildEdad(c: Record<string, number>) {
    this.mk(this.edadChartRef, {
      type: 'bar',
      data: {
        labels: ['Urbana', 'Rural', 'Rural dispersa'],
        datasets: [{
          label: 'Estudiantes',
          data: [c['zona_urbana'] ?? 0, c['zona_rural'] ?? 0, c['zona_rural_disp'] ?? 0],
          backgroundColor: ['#0dcaf0', '#0d6efd', '#6f42c1'],
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  }

  private buildIaUsage(c: Record<string, number>) {
    this.mk(this.iaUsageChartRef, {
      type: 'doughnut',
      data: {
        labels: ['Sí usan IA', 'No usan IA'],
        datasets: [{
          data: [c['ia_si'] ?? 0, c['ia_no'] ?? 0],
          backgroundColor: ['#198754', '#dc3545'],
          borderWidth: 2,
        }],
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });
  }

  private buildFrec(scores: Record<string, number>) {
    const activities = [
      { label: 'Escritura',       id: 'q_frec_escritura' },
      { label: 'Lectura',         id: 'q_frec_lectura' },
      { label: 'Imágenes',        id: 'q_frec_imagenes' },
      { label: 'Matemáticas',     id: 'q_frec_matematicas' },
      { label: 'Talleres',        id: 'q_frec_talleres' },
      { label: 'Exposiciones',    id: 'q_frec_exposiciones' },
      { label: 'Ideas creativas', id: 'q_frec_ideas' },
    ];
    this.mk(this.frecChartRef, {
      type: 'bar',
      data: {
        labels: activities.map(a => a.label),
        datasets: [{
          label: 'Promedio (1–5)',
          data: activities.map(a => scores[a.id] ?? 0),
          backgroundColor: '#0d6efd',
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } },
      },
    });
  }

  private buildTipoUso(optionCounts: Record<string, Record<string, number>>) {
    const items = [
      { label: 'Copia y pega directamente',   si: 'cop_si', qid: 'q_copia' },
      { label: 'Modifica antes de usar',       si: 'mod_si', qid: 'q_modifica' },
      { label: 'Compara con su propio saber',  si: 'cmp_si', qid: 'q_compara' },
      { label: 'Reorganiza la información',    si: 'reo_si', qid: 'q_reorganiza' },
      { label: 'Hace múltiples preguntas',     si: 'prg_si', qid: 'q_preguntas' },
    ];
    this.mk(this.tipoUsoChartRef, {
      type: 'bar',
      data: {
        labels: items.map(i => i.label),
        datasets: [{
          label: 'Cantidad que responde "Sí"',
          data: items.map(i => (optionCounts[i.qid] ?? {})[i.si] ?? 0),
          backgroundColor: ['#198754', '#20c997', '#0d6efd', '#6f42c1', '#fd7e14'],
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        indexAxis: 'y' as const,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  }

  private buildHoras(aca: Record<string, number>, per: Record<string, number>) {
    const labels = ['< 1 hora', '1–3 horas', '3–4 horas', '4+ horas'];
    this.mk(this.horasChartRef, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Académico',
            data: ['ha_0','ha_1','ha_2','ha_3'].map(id => aca[id] ?? 0),
            backgroundColor: '#0d6efd',
            borderRadius: 4,
          },
          {
            label: 'Personal/ocio',
            data: ['hp_0','hp_1','hp_2','hp_3'].map(id => per[id] ?? 0),
            backgroundColor: '#fd7e14',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  }
}
