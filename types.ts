
export enum DisplayContentType {
  WELCOME = 'WELCOME',
  SCRIPTURE = 'SCRIPTURE',
  QUOTE = 'QUOTE',
  LOADING = 'LOADING',
  ERROR = 'ERROR'
}

export enum Theme {
  HOPE = 'HOPE',
  GRACE = 'GRACE',
  JUDGMENT = 'JUDGMENT',
  LOVE = 'LOVE',
  NEUTRAL = 'NEUTRAL',
}

export interface WelcomeContent {
  type: DisplayContentType.WELCOME;
  title: string;
  subtitle: string;
}

export interface ScriptureContent {
  id: string;
  type: DisplayContentType.SCRIPTURE;
  reference: string;
  text: string;
  theme: Theme;
}

export interface QuoteContent {
  id: string;
  type: DisplayContentType.QUOTE;
  text: string;
  author: string;
  theme: Theme;
}

export interface LoadingContent {
  type: DisplayContentType.LOADING;
  message: string;
}

export interface ErrorContent {
  type: DisplayContentType.ERROR;
  message: string;
}

export type DisplayContent = WelcomeContent | ScriptureContent | QuoteContent | LoadingContent | ErrorContent;

export interface GeminiAnalysisResult {
  type: 'SCRIPTURE' | 'QUOTE' | 'NOTHING_FOUND';
  reference?: string;
  quote?: string;
  theme: Theme;
  confidence: number;
}
