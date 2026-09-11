export type GradeLevel = 'Lớp 7' | 'Lớp 8' | 'Lớp 9' | 'Lớp 10' | 'Lớp 11' | 'Lớp 12' | 'Luyện thi';

export interface Topic {
  id: string;
  title: string;
  author: string;
  period: string;
  genre: string;
  grade: GradeLevel;
  learningGoal: string;
  targetSkills: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type SourceType = 'text' | 'image' | 'url';

export interface SourceItem {
  id: string;
  topicId: string;
  type: SourceType;
  title: string;
  content: string;
  meta?: {
    imageDesc?: string;
    urlDomain?: string;
    originalUrl?: string;
    wordCount?: number;
    fileSize?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AIPreview {
  topicId: string;
  coreConcepts: string[];
  keywords: string[];
  scopeAndGenre: string;
  notesAndGaps: string[];
  generatedAt: string;
}

export type KeyPointCategory =
  | 'Khái niệm & Bối cảnh'
  | 'Luận điểm Nội dung'
  | 'Nghệ thuật & Biện pháp'
  | 'Phân biệt & Mở rộng'
  | 'Lưu ý & Lỗi thường gặp';

export interface KeyPoint {
  id: string;
  category: KeyPointCategory;
  title: string;
  description: string;
  quote?: string;
  isUserModified?: boolean;
}

export type QuestionType = 'true_false' | 'multiple_choice' | 'fill_in_blank' | 'short_answer';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Cơ bản' | 'Thông hiểu' | 'Vận dụng';
  contextClue?: string;
  isUserModified?: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  mastered: boolean;
  isUserModified?: boolean;
}

export interface QASeed {
  id: string;
  question: string;
  answer: string;
  criticalThinkingTip: string;
}

export interface TopicSummary {
  shortSummary: string;
  historicalContext: string;
  coreValues: string;
  plotStructure: string[];
}

export interface EthicsChecklist {
  isHumanVerified: boolean;
  verifiedNotes?: string;
  verifiedDate?: string;
  aiGeneratedNotice: string;
  checklistItems: {
    factualAccuracy: boolean;
    educationalIntent: boolean;
    unescoResponsibleUse: boolean;
    avoidPlagiarism: boolean;
  };
}

export interface StudyPack {
  id: string;
  topicId: string;
  summary: TopicSummary;
  keyPoints: KeyPoint[];
  questions: Question[];
  flashcards: Flashcard[];
  qaSeeds: QASeed[];
  ethicsChecklist: EthicsChecklist;
  updatedAt: string;
}

export interface UserQuizAttempt {
  topicId: string;
  answers: Record<string, string>;
  score: number;
  total: number;
  completedAt: string;
}

export type AppStage = 'buoi1' | 'buoi2' | 'buoi3' | 'buoi4' | 'chatbot' | 'docs';
export type DocsTab = 'architecture' | 'srs' | 'database';
export type Buoi3SubTab = 'summary' | 'keypoints' | 'practice' | 'flashcards' | 'qaseed' | 'ethics';

export interface TopicSnapshot {
  id: string;
  topicId: string;
  shortName: string;
  savedAt: string;
  topic: Topic;
  sources: SourceItem[];
  analysisPreview?: AIPreview;
  studyPack?: StudyPack;
  metadata: {
    sourcesCount: number;
    keyPointsCount: number;
    questionsCount: number;
    flashcardsCount: number;
    appVersion: string;
  };
}
