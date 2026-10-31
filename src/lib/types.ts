export type CapturedPayload = {
  url: string;
  status: number;
  at: number;
  body: unknown;
};

export type RecentCapture = {
  url: string;
  status: number;
  at: number;
};

/**
 * Result of the WebView's self-check after a page loads. Used by Settings to
 * prove the injected stylesheet actually reached the phone's WebView.
 */
export type WebViewDiagnostic = {
  page: string;
  marked: boolean;
  styled: boolean;
  rootFont: string;
  desktop: boolean;
  href: string;
  at: number;
};

export type ExamSession = {
  id: string;
  title: string;
  startsAt?: string;
  dateText?: string;
  location?: string;
  status?: string;
};

export type ProgressItem = {
  name: string;
  status?: string;
  active?: boolean;
};

export type Summary = {
  applicantId?: string;
  applicantName?: string;
  phase?: string;
  phaseStatus?: string;
  phaseNote?: string;
  sessions: ExamSession[];
  progress: ProgressItem[];
  updatedAt: number;
};

export type Settings = {
  desktopMode: boolean;
  notifications: boolean;
  debug: boolean;
};
