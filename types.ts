export enum AppStep {
  INPUT_TOPIC = 1,
  SELECT_PILLAR = 2,
  SELECT_VARIATION = 3,
  VIEW_COURSE = 4,
}

export interface PillarTopic {
  id: string;
  title: string;
  description: string;
}

export interface LessonVariation {
  id: string;
  title: string;
  objective: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChartData {
  label: string;
  value: number;
}

export interface CourseModule {
  id: string;
  title: string;
  contentMarkdown: string; // The educational text
  imageKeyword: string; // For searching a relevant placeholder
  quiz: QuizQuestion[];
  chartData?: {
    title: string;
    data: ChartData[];
  };
}

export interface Course {
  title: string;
  subtitle: string;
  themeColor: 'blue' | 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet';
  modules: CourseModule[];
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface GeminiResponse<T> {
  data: T;
  sources?: GroundingSource[];
}

export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
}