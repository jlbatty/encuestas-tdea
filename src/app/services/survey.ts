import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Survey } from '../models/survey';
import { Answer } from '../models/survey-response';
import { AuthService } from './auth';

export interface StatsResponse {
  surveyId: string;
  total: number;
  thisMonth: number;
  byDay: { label: string; count: number }[];
  optionCounts: Record<string, Record<string, number>>;
  averageScores: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private base = environment.apiUrl;

  activeSurvey = signal<Survey | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  async loadActiveSurvey(): Promise<Survey | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const survey = await firstValueFrom(
        this.http.get<Survey>(`${this.base}/encuestas/activa`)
      );
      this.activeSurvey.set(survey);
      return survey;
    } catch {
      this.error.set('No se pudo cargar la encuesta.');
      this.activeSurvey.set(null);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  getActiveSurvey(): Survey | null {
    return this.activeSurvey();
  }

  async submitResponse(surveyId: string, answers: Answer[]): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.base}/respuestas`, { surveyId, answers })
    );
  }

  async getStats(surveyId: string): Promise<StatsResponse> {
    return firstValueFrom(
      this.http.get<StatsResponse>(`${this.base}/estadisticas/${surveyId}`, {
        headers: this.authHeaders(),
      })
    );
  }

  async getResponses(surveyId: string): Promise<any[]> {
    const result = await firstValueFrom(
      this.http.get<{ total: number; respuestas: any[] }>(
        `${this.base}/respuestas?surveyId=${surveyId}&limit=2000`,
        { headers: this.authHeaders() }
      )
    );
    return result.respuestas;
  }

  async getAllSurveys(): Promise<Survey[]> {
    return firstValueFrom(
      this.http.get<Survey[]>(`${this.base}/encuestas`, {
        headers: this.authHeaders(),
      })
    );
  }

  private authHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
