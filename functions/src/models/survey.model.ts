export type QuestionType = 'single' | 'multiple' | 'text' | 'scale';

export interface Option {
  id: string;
  text: string;
}

export interface Scale {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  section?: string;
  required: boolean;
  options?: Option[];
  scale?: Scale;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  active: boolean;
  createdAt: FirebaseFirestore.Timestamp | Date;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number;
}

export interface SurveyResponse {
  id?: string;
  surveyId: string;
  respondentId: string;
  answers: Answer[];
  submittedAt: FirebaseFirestore.Timestamp | Date;
}
