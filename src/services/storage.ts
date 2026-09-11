import {
  Topic,
  SourceItem,
  AIPreview,
  StudyPack,
  KeyPoint,
  Question,
  Flashcard,
  QASeed,
  UserQuizAttempt,
  TopicSnapshot,
} from '../types';
import {
  DEFAULT_TOPICS,
  DEFAULT_SOURCES,
  DEFAULT_PREVIEWS,
  DEFAULT_STUDYPACKS,
} from '../data/defaultTopics';

const STORAGE_KEYS = {
  TOPICS: 'vanviet_topics_v2',
  SOURCES: 'vanviet_sources_v2',
  PREVIEWS: 'vanviet_previews_v2',
  STUDYPACKS: 'vanviet_studypacks_v2',
  ACTIVE_TOPIC_ID: 'vanviet_active_topic_id_v2',
  QUIZ_ATTEMPTS: 'vanviet_quiz_attempts_v2',
  SNAPSHOTS: 'vanviet_snapshots_v2',
  LOCAL_GEMINI_KEY: 'vanviet_local_gemini_api_key_v1',
};

class StorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  // --- Initializer ---
  public initialize(): void {
    if (!this.isBrowser()) return;

    // Check if initial storage needs population or migration
    const topicsData = localStorage.getItem(STORAGE_KEYS.TOPICS);
    let needReset = !topicsData;

    if (topicsData) {
      try {
        const parsed: Topic[] = JSON.parse(topicsData);
        if (parsed.some(t => t.title.includes('Đồng chí') || t.grade === ('Lớp 9' as any))) {
          needReset = true;
        }
      } catch {
        needReset = true;
      }
    }

    if (needReset) {
      this.saveTopics(DEFAULT_TOPICS);
      this.saveSources(DEFAULT_SOURCES);
      this.savePreviews(DEFAULT_PREVIEWS);
      this.saveStudyPacks(DEFAULT_STUDYPACKS);
      this.setActiveTopicId(DEFAULT_TOPICS[0].id);
    }
  }

  // --- Active Topic ---
  public getActiveTopicId(): string {
    if (!this.isBrowser()) return DEFAULT_TOPICS[0].id;
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TOPIC_ID) || DEFAULT_TOPICS[0].id;
  }

  public setActiveTopicId(id: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TOPIC_ID, id);
  }

  // --- Topics CRUD ---
  public getTopics(): Topic[] {
    if (!this.isBrowser()) return DEFAULT_TOPICS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOPICS);
      if (!data) return DEFAULT_TOPICS;
      const parsed: Topic[] = JSON.parse(data);
      const uniqueMap = new Map<string, Topic>();

      for (const t of parsed) {
        if (!t || !t.id) continue;
        if (!uniqueMap.has(t.id)) {
          let title = t.title;
          let author = t.author;
          let grade = t.grade;
          if (title.includes('Đồng chí')) {
            title = 'Thu Đứng (Thu Điếu - Câu cá mùa thu)';
            author = 'Nguyễn Khuyến';
          }
          if (grade === ('Lớp 9' as any) || !grade) {
            grade = 'Lớp 10';
          }
          uniqueMap.set(t.id, {
            ...t,
            title,
            author,
            grade,
          });
        }
      }
      return Array.from(uniqueMap.values());
    } catch {
      return DEFAULT_TOPICS;
    }
  }

  public saveTopics(topics: Topic[]): void {
    if (!this.isBrowser()) return;
    const uniqueMap = new Map<string, Topic>();
    for (const t of topics) {
      if (t && t.id && !uniqueMap.has(t.id)) {
        uniqueMap.set(t.id, t);
      }
    }
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(Array.from(uniqueMap.values())));
  }

  public getTopicById(id: string): Topic | undefined {
    const topics = this.getTopics();
    return topics.find((t) => t.id === id);
  }

  public addTopic(topic: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>): Topic {
    const topics = this.getTopics();
    const newTopic: Topic = {
      ...topic,
      id: `topic_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    topics.unshift(newTopic);
    this.saveTopics(topics);
    this.setActiveTopicId(newTopic.id);
    return newTopic;
  }

  public updateTopic(id: string, updates: Partial<Topic>): Topic | null {
    const topics = this.getTopics();
    const index = topics.findIndex((t) => t.id === id);
    if (index === -1) return null;

    topics[index] = {
      ...topics[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveTopics(topics);
    return topics[index];
  }

  public deleteTopic(id: string): boolean {
    let topics = this.getTopics();
    if (topics.length <= 1) return false; // Prevent deleting the last topic

    topics = topics.filter((t) => t.id !== id);
    this.saveTopics(topics);

    // Clean up related data
    let sources = this.getSources().filter((s) => s.topicId !== id);
    this.saveSources(sources);

    const previews = this.getPreviews();
    delete previews[id];
    this.savePreviews(previews);

    const studyPacks = this.getStudyPacks();
    delete studyPacks[id];
    this.saveStudyPacks(studyPacks);

    if (this.getActiveTopicId() === id) {
      this.setActiveTopicId(topics[0].id);
    }
    return true;
  }

  // --- Sources CRUD ---
  public getSources(): SourceItem[] {
    if (!this.isBrowser()) return DEFAULT_SOURCES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOURCES);
      return data ? JSON.parse(data) : DEFAULT_SOURCES;
    } catch {
      return DEFAULT_SOURCES;
    }
  }

  public saveSources(sources: SourceItem[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
  }

  public getSourcesByTopicId(topicId: string): SourceItem[] {
    return this.getSources().filter((s) => s.topicId === topicId);
  }

  public addSource(source: Omit<SourceItem, 'id' | 'createdAt' | 'updatedAt'>): SourceItem {
    const sources = this.getSources();
    const newSource: SourceItem = {
      ...source,
      id: `src_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sources.unshift(newSource);
    this.saveSources(sources);
    return newSource;
  }

  public updateSource(id: string, updates: Partial<SourceItem>): SourceItem | null {
    const sources = this.getSources();
    const index = sources.findIndex((s) => s.id === id);
    if (index === -1) return null;

    sources[index] = {
      ...sources[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveSources(sources);
    return sources[index];
  }

  public deleteSource(id: string): boolean {
    const sources = this.getSources();
    const filtered = sources.filter((s) => s.id !== id);
    if (filtered.length === sources.length) return false;
    this.saveSources(filtered);
    return true;
  }

  // --- AI Previews ---
  public getPreviews(): Record<string, AIPreview> {
    if (!this.isBrowser()) return DEFAULT_PREVIEWS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREVIEWS);
      return data ? JSON.parse(data) : DEFAULT_PREVIEWS;
    } catch {
      return DEFAULT_PREVIEWS;
    }
  }

  public savePreviews(previews: Record<string, AIPreview>): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.PREVIEWS, JSON.stringify(previews));
  }

  public getPreviewByTopicId(topicId: string): AIPreview | undefined {
    const previews = this.getPreviews();
    return previews[topicId];
  }

  public setPreviewForTopic(topicId: string, preview: Omit<AIPreview, 'topicId' | 'generatedAt'>): AIPreview {
    const previews = this.getPreviews();
    const newPreview: AIPreview = {
      ...preview,
      topicId,
      generatedAt: new Date().toISOString(),
    };
    previews[topicId] = newPreview;
    this.savePreviews(previews);
    return newPreview;
  }

  // --- Study Packs CRUD & Human Edits ---
  public getStudyPacks(): Record<string, StudyPack> {
    if (!this.isBrowser()) return DEFAULT_STUDYPACKS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDYPACKS);
      return data ? JSON.parse(data) : DEFAULT_STUDYPACKS;
    } catch {
      return DEFAULT_STUDYPACKS;
    }
  }

  public saveStudyPacks(packs: Record<string, StudyPack>): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.STUDYPACKS, JSON.stringify(packs));
  }

  public getStudyPackByTopicId(topicId: string): StudyPack | undefined {
    const packs = this.getStudyPacks();
    return packs[topicId];
  }

  public setStudyPackForTopic(topicId: string, pack: Partial<StudyPack>): StudyPack {
    const packs = this.getStudyPacks();
    const existing = packs[topicId];

    const updatedPack: StudyPack = {
      id: existing?.id || `sp_${Date.now()}`,
      topicId,
      summary: pack.summary || existing?.summary || {
        shortSummary: '',
        historicalContext: '',
        coreValues: '',
        plotStructure: [],
      },
      keyPoints: pack.keyPoints || existing?.keyPoints || [],
      questions: pack.questions || existing?.questions || [],
      flashcards: pack.flashcards || existing?.flashcards || [],
      qaSeeds: pack.qaSeeds || existing?.qaSeeds || [],
      ethicsChecklist: pack.ethicsChecklist || existing?.ethicsChecklist || {
        isHumanVerified: false,
        aiGeneratedNotice: 'Học liệu do AI hỗ trợ tạo lập. Vui lòng đối chiếu với tác phẩm gốc.',
        checklistItems: {
          factualAccuracy: true,
          educationalIntent: true,
          unescoResponsibleUse: true,
          avoidPlagiarism: true,
        },
      },
      updatedAt: new Date().toISOString(),
    };

    packs[topicId] = updatedPack;
    this.saveStudyPacks(packs);
    return updatedPack;
  }

  // Individual StudyPack sub-entity updates (Human-in-the-loop)
  public updateKeyPoint(topicId: string, keyPointId: string, updates: Partial<KeyPoint>): boolean {
    const pack = this.getStudyPackByTopicId(topicId);
    if (!pack) return false;

    const index = pack.keyPoints.findIndex((k) => k.id === keyPointId);
    if (index === -1) return false;

    pack.keyPoints[index] = {
      ...pack.keyPoints[index],
      ...updates,
      isUserModified: true,
    };
    pack.updatedAt = new Date().toISOString();
    this.setStudyPackForTopic(topicId, pack);
    return true;
  }

  public addKeyPoint(topicId: string, keyPoint: Omit<KeyPoint, 'id'>): KeyPoint | null {
    const pack = this.getStudyPackByTopicId(topicId);
    if (!pack) return null;

    const newKp: KeyPoint = {
      ...keyPoint,
      id: `kp_${Date.now()}`,
      isUserModified: true,
    };
    pack.keyPoints.push(newKp);
    pack.updatedAt = new Date().toISOString();
    this.setStudyPackForTopic(topicId, pack);
    return newKp;
  }

  public deleteKeyPoint(topicId: string, keyPointId: string): boolean {
    const pack = this.getStudyPackByTopicId(topicId);
    if (!pack) return false;

    pack.keyPoints = pack.keyPoints.filter((k) => k.id !== keyPointId);
    pack.updatedAt = new Date().toISOString();
    this.setStudyPackForTopic(topicId, pack);
    return true;
  }

  public toggleFlashcardMastered(topicId: string, flashcardId: string): boolean {
    const pack = this.getStudyPackByTopicId(topicId);
    if (!pack) return false;

    const fc = pack.flashcards.find((f) => f.id === flashcardId);
    if (!fc) return false;

    fc.mastered = !fc.mastered;
    this.setStudyPackForTopic(topicId, pack);
    return true;
  }

  public addFlashcard(topicId: string, flashcard: Omit<Flashcard, 'id'>): Flashcard | null {
    const pack = this.getStudyPackByTopicId(topicId);
    if (!pack) return null;

    const newCard: Flashcard = {
      ...flashcard,
      id: `fc_${Date.now()}`,
      isUserModified: true,
    };
    pack.flashcards.push(newCard);
    pack.updatedAt = new Date().toISOString();
    this.setStudyPackForTopic(topicId, pack);
    return newCard;
  }

  public updateFlashcard(topicId: string, flashcardId: string, updates: Partial<Flashcard>): boolean {
    const pack = this.getStudyPackByTopicId(topicId);
    if (!pack) return false;

    const index = pack.flashcards.findIndex((f) => f.id === flashcardId);
    if (index === -1) return false;

    pack.flashcards[index] = {
      ...pack.flashcards[index],
      ...updates,
      isUserModified: true,
    };
    pack.updatedAt = new Date().toISOString();
    this.setStudyPackForTopic(topicId, pack);
    return true;
  }

  public deleteFlashcard(topicId: string, flashcardId: string): boolean {
    const pack = this.getStudyPackByTopicId(topicId);
    if (!pack) return false;

    pack.flashcards = pack.flashcards.filter((f) => f.id !== flashcardId);
    pack.updatedAt = new Date().toISOString();
    this.setStudyPackForTopic(topicId, pack);
    return true;
  }

  public addQuestion(topicId: string, question: Omit<Question, 'id'>): Question | null {
    const pack = this.getStudyPackByTopicId(topicId);
    if (!pack) return null;

    const newQ: Question = {
      ...question,
      id: `q_${Date.now()}`,
      isUserModified: true,
    };
    pack.questions.push(newQ);
    pack.updatedAt = new Date().toISOString();
    this.setStudyPackForTopic(topicId, pack);
    return newQ;
  }

  public updateQuestion(topicId: string, questionId: string, updates: Partial<Question>): boolean {
    const pack = this.getStudyPackByTopicId(topicId);
    if (!pack) return false;

    const index = pack.questions.findIndex((q) => q.id === questionId);
    if (index === -1) return false;

    pack.questions[index] = {
      ...pack.questions[index],
      ...updates,
      isUserModified: true,
    };
    pack.updatedAt = new Date().toISOString();
    this.setStudyPackForTopic(topicId, pack);
    return true;
  }

  public deleteQuestion(topicId: string, questionId: string): boolean {
    const pack = this.getStudyPackByTopicId(topicId);
    if (!pack) return false;

    pack.questions = pack.questions.filter((q) => q.id !== questionId);
    pack.updatedAt = new Date().toISOString();
    this.setStudyPackForTopic(topicId, pack);
    return true;
  }

  // --- Quiz Attempts ---
  public getQuizAttempts(): Record<string, UserQuizAttempt[]> {
    if (!this.isBrowser()) return {};
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public saveQuizAttempt(attempt: UserQuizAttempt): void {
    if (!this.isBrowser()) return;
    const attempts = this.getQuizAttempts();
    if (!attempts[attempt.topicId]) {
      attempts[attempt.topicId] = [];
    }
    attempts[attempt.topicId].unshift(attempt);
    localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(attempts));
  }

  // --- Snapshots (Save / Restore Working Copy) ---
  public getSnapshots(): TopicSnapshot[] {
    if (!this.isBrowser()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveSnapshots(snapshots: TopicSnapshot[]): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(snapshots));
  }

  public createSnapshot(
    topic: Topic,
    sources: SourceItem[],
    analysisPreview?: AIPreview,
    studyPack?: StudyPack,
    customShortName?: string
  ): TopicSnapshot {
    const snapshots = this.getSnapshots();
    const snapshotId = `snap_${Date.now()}`;
    const now = new Date().toISOString();

    const dateStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const shortName = customShortName?.trim() || `${topic.title} [Bản lưu ${dateStr} ${timeStr}]`;

    const newSnapshot: TopicSnapshot = {
      id: snapshotId,
      topicId: topic.id,
      shortName,
      savedAt: now,
      topic: { ...topic, updatedAt: now },
      sources: JSON.parse(JSON.stringify(sources)),
      analysisPreview: analysisPreview ? JSON.parse(JSON.stringify(analysisPreview)) : undefined,
      studyPack: studyPack ? JSON.parse(JSON.stringify(studyPack)) : undefined,
      metadata: {
        sourcesCount: sources.length,
        keyPointsCount: studyPack?.keyPoints?.length || 0,
        questionsCount: studyPack?.questions?.length || 0,
        flashcardsCount: studyPack?.flashcards?.length || 0,
        appVersion: '1.0.0',
      },
    };

    snapshots.unshift(newSnapshot);
    this.saveSnapshots(snapshots);
    return newSnapshot;
  }

  public createStudyPackVersion(
    topic: Topic,
    sources: SourceItem[],
    analysisPreview?: AIPreview,
    studyPack?: StudyPack,
    customLabel?: string
  ): TopicSnapshot {
    const topicSnapshots = this.getVersionsForTopic(topic.id);
    const versionNum = topicSnapshots.length + 1;
    const dateStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const versionTitle = customLabel?.trim() || `v${versionNum}.0 - AI Re-generate (${dateStr} ${timeStr})`;

    return this.createSnapshot(topic, sources, analysisPreview, studyPack, versionTitle);
  }

  public getVersionsForTopic(topicId: string): TopicSnapshot[] {
    const snapshots = this.getSnapshots();
    return snapshots.filter((s) => s.topicId === topicId);
  }

  public restoreSnapshot(snapshotId: string): {
    topic: Topic;
    sources: SourceItem[];
    analysisPreview?: AIPreview;
    studyPack?: StudyPack;
  } | null {
    const snapshots = this.getSnapshots();
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap) return null;

    // 1. Ensure Topic is present in Topics list
    const topics = this.getTopics();
    const tIdx = topics.findIndex((t) => t.id === snap.topic.id);
    if (tIdx >= 0) {
      topics[tIdx] = snap.topic;
    } else {
      topics.unshift(snap.topic);
    }
    this.saveTopics(topics);

    // 2. Replace Sources for this topic
    const allSources = this.getSources().filter((s) => s.topicId !== snap.topic.id);
    const restoredSources = (snap.sources || []).map((s) => ({ ...s, topicId: snap.topic.id }));
    this.saveSources([...restoredSources, ...allSources]);

    // 3. Restore Analysis Preview
    if (snap.analysisPreview) {
      this.setPreviewForTopic(snap.topic.id, snap.analysisPreview);
    }

    // 4. Restore Study Pack
    if (snap.studyPack) {
      this.setStudyPackForTopic(snap.topic.id, snap.studyPack);
    }

    // 5. Set Active Topic
    this.setActiveTopicId(snap.topic.id);

    return {
      topic: snap.topic,
      sources: restoredSources,
      analysisPreview: snap.analysisPreview,
      studyPack: snap.studyPack,
    };
  }

  public renameSnapshot(snapshotId: string, newShortName: string): boolean {
    const snapshots = this.getSnapshots();
    const snap = snapshots.find((s) => s.id === snapshotId);
    if (!snap) return false;

    snap.shortName = newShortName.trim();
    this.saveSnapshots(snapshots);
    return true;
  }

  public deleteSnapshot(snapshotId: string): boolean {
    const snapshots = this.getSnapshots();
    const filtered = snapshots.filter((s) => s.id !== snapshotId);
    if (filtered.length === snapshots.length) return false;
    this.saveSnapshots(filtered);
    return true;
  }

  // --- Diagnostics & Database Operations ---
  public getDatabaseStats() {
    if (!this.isBrowser()) {
      return { totalBytes: 0, topicsCount: 0, sourcesCount: 0, previewsCount: 0, studyPacksCount: 0 };
    }
    let totalBytes = 0;
    for (const key of Object.values(STORAGE_KEYS)) {
      const item = localStorage.getItem(key);
      if (item) totalBytes += item.length * 2; // rough UTF-16 bytes
    }

    const topics = this.getTopics();
    const sources = this.getSources();
    const previews = this.getPreviews();
    const packs = this.getStudyPacks();

    return {
      totalBytes,
      formattedSize: (totalBytes / 1024).toFixed(2) + ' KB',
      topicsCount: topics.length,
      sourcesCount: sources.length,
      previewsCount: Object.keys(previews).length,
      studyPacksCount: Object.keys(packs).length,
    };
  }

  public exportAllData(): string {
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      topics: this.getTopics(),
      sources: this.getSources(),
      previews: this.getPreviews(),
      studyPacks: this.getStudyPacks(),
      quizAttempts: this.getQuizAttempts(),
    };
    return JSON.stringify(payload, null, 2);
  }

  public importAllData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.topics) this.saveTopics(parsed.topics);
      if (parsed.sources) this.saveSources(parsed.sources);
      if (parsed.previews) this.savePreviews(parsed.previews);
      if (parsed.studyPacks) this.saveStudyPacks(parsed.studyPacks);
      if (parsed.quizAttempts) {
        localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(parsed.quizAttempts));
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  public resetToDefaults(): void {
    if (!this.isBrowser()) return;
    this.saveTopics(DEFAULT_TOPICS);
    this.saveSources(DEFAULT_SOURCES);
    this.savePreviews(DEFAULT_PREVIEWS);
    this.saveStudyPacks(DEFAULT_STUDYPACKS);
    this.setActiveTopicId(DEFAULT_TOPICS[0].id);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
  }

  // --- Local Gemini API Key (Round 5 - Local Only) ---
  public getLocalApiKey(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(STORAGE_KEYS.LOCAL_GEMINI_KEY);
  }

  public saveLocalApiKey(key: string): void {
    if (!this.isBrowser()) return;
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEYS.LOCAL_GEMINI_KEY, trimmed);
    } else {
      this.removeLocalApiKey();
    }
  }

  public removeLocalApiKey(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(STORAGE_KEYS.LOCAL_GEMINI_KEY);
  }

  public hasLocalApiKey(): boolean {
    const key = this.getLocalApiKey();
    return Boolean(key && key.trim().length > 0);
  }

  public getMaskedLocalApiKey(): string {
    const key = this.getLocalApiKey();
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
  }
}

export const storage = new StorageService();
