import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SurveyService } from '../../services/survey';
import { Survey as SurveyModel, Question } from '../../models/survey';
import { Answer } from '../../models/survey-response';

@Component({
  selector: 'app-survey',
  imports: [FormsModule],
  templateUrl: './survey.html',
  styleUrl: './survey.scss',
})
export class Survey implements OnInit {
  private surveyService = inject(SurveyService);
  private router = inject(Router);

  survey = signal<SurveyModel | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);

  answers = signal<Record<string, string | string[] | number>>({});
  submitted = signal(false);
  currentStep = signal(0);

  totalSteps = computed(() => this.survey()?.questions.length ?? 0);
  currentQuestion = computed<Question | null>(
    () => this.survey()?.questions[this.currentStep()] ?? null
  );
  progress = computed(() =>
    this.totalSteps() > 0 ? Math.round((this.currentStep() / this.totalSteps()) * 100) : 0
  );

  isNewSection = computed(() => {
    const questions = this.survey()?.questions;
    if (!questions) return false;
    const step = this.currentStep();
    if (step === 0) return true;
    return questions[step]?.section !== questions[step - 1]?.section;
  });

  sectionLines = computed(() =>
    (this.currentQuestion()?.section ?? '').split('\n')
  );

  async ngOnInit() {
    await this.surveyService.loadActiveSurvey();
    this.survey.set(this.surveyService.getActiveSurvey());
    this.loading.set(false);
    if (!this.survey()) {
      this.error.set('No hay encuestas activas en este momento.');
    }
  }

  getAnswer(questionId: string): string | string[] | number {
    return this.answers()[questionId] ?? '';
  }

  setAnswer(questionId: string, value: string | string[] | number) {
    this.answers.update(a => ({ ...a, [questionId]: value }));
  }

  isMultipleSelected(questionId: string, optionId: string): boolean {
    const val = this.answers()[questionId];
    return Array.isArray(val) && val.includes(optionId);
  }

  toggleMultiple(questionId: string, optionId: string) {
    const current = (this.answers()[questionId] as string[]) ?? [];
    const updated = current.includes(optionId)
      ? current.filter(v => v !== optionId)
      : [...current, optionId];
    this.setAnswer(questionId, updated);
  }

  canProceed(): boolean {
    const q = this.currentQuestion();
    if (!q) return false;
    if (!q.required) return true;
    const val = this.answers()[q.id];
    if (val === undefined || val === null || val === '') return false;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  }

  next() {
    if (this.currentStep() < this.totalSteps() - 1) {
      this.currentStep.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prev() {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  isLastQuestion(): boolean {
    return this.currentStep() === this.totalSteps() - 1;
  }

  async submit() {
    const survey = this.survey();
    if (!survey) return;

    this.submitting.set(true);
    const answersArr: Answer[] = Object.entries(this.answers()).map(([questionId, value]) => ({
      questionId,
      value,
    }));

    try {
      await this.surveyService.submitResponse(survey.id, answersArr);
      this.submitted.set(true);
    } catch {
      this.error.set('Error al enviar la respuesta. Inténtalo de nuevo.');
    } finally {
      this.submitting.set(false);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  restartSurvey() {
    this.answers.set({});
    this.currentStep.set(0);
    this.submitted.set(false);
    this.error.set(null);
  }

  getScaleRange(q: Question): number[] {
    if (!q.scale) return [];
    return Array.from({ length: q.scale.max - q.scale.min + 1 }, (_, i) => i + q.scale!.min);
  }

  scaleLabel(val: number): string {
    const labels: Record<number, string> = {
      1: 'Nunca', 2: 'Casi nunca', 3: 'Algunas veces', 4: 'Frecuentemente', 5: 'Siempre',
    };
    return labels[val] ?? `${val}`;
  }
}
