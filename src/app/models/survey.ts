export type QuestionType = 'single' | 'multiple' | 'text' | 'scale';

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: Option[];
  required: boolean;
  section?: string;
  scale?: { min: number; max: number; minLabel: string; maxLabel: string };
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  active: boolean;
  createdAt: Date;
}
