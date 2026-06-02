export interface Answer {
  questionId: string;
  value: string | string[] | number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId: string;
  answers: Answer[];
  submittedAt: Date;
}
