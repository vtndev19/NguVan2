import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  ListOrdered,
  HelpCircle,
  Layers,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Check,
  RotateCcw,
  Send,
  Award,
  ChevronRight,
  BookCheck,
  Eye,
  AlertCircle,
  HardDrive,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Topic,
  SourceItem,
  AIPreview,
  StudyPack,
  Buoi3SubTab,
  KeyPoint,
  KeyPointCategory,
  Question,
  Flashcard,
} from '../types';
import { storage } from '../services/storage';
import { QuizMode } from './QuizMode';
import { FlashcardMode } from './FlashcardMode';
import { requestStudyPack, requestAIChat } from '../services/api';

interface Buoi3StageProps {
  topic: Topic;
  sources: SourceItem[];
  preview: AIPreview | undefined;
  studyPack: StudyPack | undefined;
  onStudyPackUpdated: (pack: StudyPack) => void;
  onOpenSnapshotModal?: () => void;
}

export function Buoi3Stage({
  topic,
  sources,
  preview,
  studyPack,
  onStudyPackUpdated,
  onOpenSnapshotModal,
}: Buoi3StageProps) {
  const [activeSubTab, setActiveSubTab] = useState<Buoi3SubTab>('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [regenerateSuccessToast, setRegenerateSuccessToast] = useState<string | null>(null);

  // Sub-tab 3: Practice Quiz Mode States
  const [quizMode, setQuizMode] = useState<'practice' | 'manage'>('practice');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  // Sub-tab 4: Flashcard State
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardFilter, setCardFilter] = useState<'all' | 'unmastered' | 'mastered'>('all');

  // Sub-tab 5: Chat State
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'ai'; text: string; time: string }>
  >([
    {
      sender: 'ai',
      text: `Xin chào em! Thầy/cô là Trợ lý Ngữ Văn 10 AI. Em có thắc mắc gì về bối cảnh, nhân vật, chi tiết nghệ thuật hay cách lập dàn ý bài "${topic.title}" không? Hãy hỏi để cùng thảo luận nhé!`,
      time: 'Vừa xong',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Modals for Editing KeyPoints & Flashcards & Questions
  const [editingKeyPoint, setEditingKeyPoint] = useState<KeyPoint | null>(null);
  const [showAddKpModal, setShowAddKpModal] = useState(false);
  const [kpCategory, setKpCategory] = useState<KeyPointCategory>('Luận điểm Nội dung');
  const [kpTitle, setKpTitle] = useState('');
  const [kpDesc, setKpDesc] = useState('');
  const [kpQuote, setKpQuote] = useState('');

  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);
  const [showAddFcModal, setShowAddFcModal] = useState(false);
  const [fcFront, setFcFront] = useState('');
  const [fcBack, setFcBack] = useState('');
  const [fcCategory, setFcCategory] = useState('Khái niệm');

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Generate or Regenerate Study Pack -> PROMPT 03: Create new version & preserve original sources
  const handleGenerateStudyPack = async () => {
    setIsGenerating(true);
    setRegenerateSuccessToast(null);
    try {
      const res = await requestStudyPack(topic, sources, preview);
      if (res.success && res.studyPack) {
        // Save new Study Pack to local storage
        const savedPack = storage.setStudyPackForTopic(topic.id, res.studyPack);

        // Automatically create a new snapshot VERSION to preserve history!
        const newSnap = storage.createStudyPackVersion(
          topic,
          sources,
          preview,
          savedPack
        );

        onStudyPackUpdated(savedPack);
        setSubmitted(false);
        setUserAnswers({});
        setScore(null);

        setRegenerateSuccessToast(
          `✨ Đã re-generate toàn bộ Study Pack và tạo mới Version: "${newSnap.shortName}"! Nguồn học liệu gốc (${sources.length} tư liệu) được giữ nguyên.`
        );

        setTimeout(() => {
          setRegenerateSuccessToast(null);
        }, 6000);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Quiz submission & scoring
  const handleAnswerChange = (questionId: string, value: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitQuiz = () => {
    if (!studyPack?.questions) return;
    let correctCount = 0;
    const questions = studyPack.questions;

    questions.forEach((q) => {
      const ans = userAnswers[q.id]?.trim().toLowerCase() || '';
      const correct = q.correctAnswer.trim().toLowerCase();

      if (q.type === 'true_false' || q.type === 'multiple_choice' || q.type === 'fill_in_blank') {
        if (ans.includes(correct) || correct.includes(ans) || ans === correct) {
          correctCount++;
        }
      } else {
        // Short answer: give point if user wrote something thoughtful (>10 chars)
        if (ans.length >= 10) correctCount++;
      }
    });

    setScore({ correct: correctCount, total: questions.length });
    setSubmitted(true);

    storage.saveQuizAttempt({
      topicId: topic.id,
      answers: userAnswers,
      score: correctCount,
      total: questions.length,
      completedAt: new Date().toISOString(),
    });

    if (correctCount >= Math.ceil(questions.length * 0.7)) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  // Flashcards navigation
  const currentFlashcards =
    studyPack?.flashcards.filter((f) => {
      if (cardFilter === 'mastered') return f.mastered;
      if (cardFilter === 'unmastered') return !f.mastered;
      return true;
    }) || [];

  const handleNextCard = () => {
    setIsCardFlipped(false);
    setActiveCardIndex((prev) => (prev + 1) % (currentFlashcards.length || 1));
  };

  const handlePrevCard = () => {
    setIsCardFlipped(false);
    setActiveCardIndex((prev) =>
      prev === 0 ? (currentFlashcards.length || 1) - 1 : prev - 1
    );
  };

  const handleToggleMastered = (cardId: string) => {
    storage.toggleFlashcardMastered(topic.id, cardId);
    const updated = storage.getStudyPackByTopicId(topic.id);
    if (updated) onStudyPackUpdated(updated);
  };

  // Chat message send
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMsg, time: 'Vừa xong' },
    ]);
    setIsChatLoading(true);

    try {
      const aiReply = await requestAIChat(
        `${topic.title} (${topic.author})`,
        userMsg,
        studyPack?.summary.shortSummary
      );
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: aiReply, time: 'Vừa xong' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // KeyPoint CRUD handlers
  const handleSaveKeyPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kpTitle.trim()) return;

    if (editingKeyPoint) {
      storage.updateKeyPoint(topic.id, editingKeyPoint.id, {
        category: kpCategory,
        title: kpTitle.trim(),
        description: kpDesc.trim(),
        quote: kpQuote.trim() || undefined,
      });
    } else {
      storage.addKeyPoint(topic.id, {
        category: kpCategory,
        title: kpTitle.trim(),
        description: kpDesc.trim(),
        quote: kpQuote.trim() || undefined,
      });
    }

    const updated = storage.getStudyPackByTopicId(topic.id);
    if (updated) onStudyPackUpdated(updated);
    setShowAddKpModal(false);
    setEditingKeyPoint(null);
  };

  const handleDeleteKeyPoint = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa luận điểm này?')) {
      storage.deleteKeyPoint(topic.id, id);
      const updated = storage.getStudyPackByTopicId(topic.id);
      if (updated) onStudyPackUpdated(updated);
    }
  };

  if (!studyPack) {
    return (
      <div className="bg-white rounded-2xl border border-blue-100 p-12 text-center shadow-sm">
        <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-blue-950 mb-2">
          Chưa Khởi Tạo Study Pack Cho Chủ Đề Này
        </h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
          Nhấn nút bên dưới để AI tổng hợp học liệu từ các nguồn đã nhập thành bộ tài nguyên ôn tập toàn diện (Tóm tắt, Luận điểm, Câu hỏi đa dạng, Flashcard & Q&A).
        </p>
        <button
          onClick={handleGenerateStudyPack}
          disabled={isGenerating}
          className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm inline-flex items-center space-x-2 shadow-md shadow-blue-500/20 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Đang khởi tạo Study Pack...' : 'Khởi tạo Study Pack Bằng AI'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert for Re-generate Version creation */}
      {regenerateSuccessToast && (
        <div className="bg-emerald-900/90 text-emerald-100 border border-emerald-600 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{regenerateSuccessToast}</span>
          </div>
          {onOpenSnapshotModal && (
            <button
              onClick={onOpenSnapshotModal}
              className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-colors ml-3 flex-shrink-0"
            >
              Xem danh sách Versions
            </button>
          )}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border border-blue-900 rounded-2xl p-6 text-slate-100 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/30">
                Buổi 3: AI Content Generation (Study Pack)
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                {studyPack.ethicsChecklist.isHumanVerified ? '✓ Đã Thẩm Định Học Thật' : 'AI Hỗ Trợ Tổng Hợp'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Bộ Học Liệu Ôn Tập Cá Nhân: {topic.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Bao gồm: Bản tóm tắt, 5 nhóm luận điểm cốt lõi, câu hỏi luyện tập 4 dạng, thẻ ghi nhớ 3D và hạt giống Q&A.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenSnapshotModal && (
              <button
                onClick={onOpenSnapshotModal}
                className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors border border-emerald-500/50"
                title="Xem danh sách versions và đối sánh"
              >
                <HardDrive className="w-3.5 h-3.5 text-emerald-200" />
                <span>📜 Quản Lý Versions</span>
              </button>
            )}

            <button
              onClick={handleGenerateStudyPack}
              disabled={isGenerating}
              className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-2 shadow-md shadow-blue-500/20 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Đang Re-generate...' : '✨ Re-generate Version Mới (Gemini)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Sub-Tabs Bar */}
      <div className="flex overflow-x-auto bg-white p-1.5 rounded-2xl border border-blue-100 shadow-xs space-x-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('summary')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            activeSubTab === 'summary'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>1. Tóm Tắt & Bối Cảnh</span>
        </button>

        <button
          onClick={() => setActiveSubTab('keypoints')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            activeSubTab === 'keypoints'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>2. Luận Điểm ({studyPack.keyPoints.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('practice')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            activeSubTab === 'practice'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>3. Câu Hỏi 4 Dạng ({studyPack.questions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('flashcards')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            activeSubTab === 'flashcards'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>4. Flashcard 3D ({studyPack.flashcards.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('qaseed')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            activeSubTab === 'qaseed'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>5. Hạt Giống Q&A & AI Mentor</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ethics')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
            activeSubTab === 'ethics'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>6. Đạo Đức & Thẩm Định</span>
        </button>
      </div>

      {/* Sub-Tab 1: SUMMARY & CONTEXT */}
      {activeSubTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Short Summary */}
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
              <h3 className="text-base font-bold text-blue-950 mb-3 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-700" />
                <span>Bản Tóm Tắt Tác Phẩm Cốt Lõi</span>
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-200 whitespace-pre-wrap">
                {studyPack.summary.shortSummary}
              </p>
            </div>

            {/* Plot Structure & Emotional Arc */}
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
              <h3 className="text-base font-bold text-blue-950 mb-3">
                Bố Cục Cốt Truyện & Mạch Cảm Xúc
              </h3>
              <div className="space-y-2.5">
                {studyPack.summary.plotStructure.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 p-3 rounded-xl bg-sky-50/60 border border-sky-200/60 text-xs text-slate-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Historical Context & Core Values */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-blue-950 mb-2 uppercase tracking-wider text-xs">
                Hoàn Cảnh Sáng Tác & Bối Cảnh
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {studyPack.summary.historicalContext}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-blue-950 mb-2 uppercase tracking-wider text-xs">
                Giá Trị Cốt Lõi (Hiện Thực & Nhân Đạo)
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {studyPack.summary.coreValues}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: KEY POINTS (Hệ Thống Luận Điểm) */}
      {activeSubTab === 'keypoints' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-blue-100">
              <div>
                <h3 className="text-base font-bold text-blue-950">
                  Hệ Thống Luận Điểm Cốt Lõi (Human-in-the-loop)
                </h3>
                <p className="text-xs text-slate-500">
                  Phân loại theo 5 nhóm sư phạm: Khái niệm, Luận điểm, Nghệ thuật, Phân biệt, Lỗi cần tránh. Học sinh có thể trực tiếp sửa chữa, xóa, bổ sung.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingKeyPoint(null);
                  setKpCategory('Luận điểm Nội dung');
                  setKpTitle('');
                  setKpDesc('');
                  setKpQuote('');
                  setShowAddKpModal(true);
                }}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm luận điểm mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studyPack.keyPoints.map((kp) => (
                <div
                  key={kp.id}
                  className="p-4 rounded-xl border border-slate-200 bg-sky-50/20 hover:bg-sky-50/50 hover:border-blue-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        {kp.category}
                      </span>
                      {kp.isUserModified && (
                        <span className="text-[10px] text-blue-700 font-medium">Đã tinh chỉnh</span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-blue-950">{kp.title}</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{kp.description}</p>

                    {kp.quote && (
                      <blockquote className="p-2.5 rounded-lg bg-sky-50 border-l-2 border-blue-600 text-xs text-slate-800 italic font-sans">
                        "{kp.quote}"
                      </blockquote>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 mt-3 border-t border-slate-200/80">
                    <button
                      onClick={() => {
                        setEditingKeyPoint(kp);
                        setKpCategory(kp.category);
                        setKpTitle(kp.title);
                        setKpDesc(kp.description);
                        setKpQuote(kp.quote || '');
                        setShowAddKpModal(true);
                      }}
                      className="text-slate-600 hover:text-blue-900 text-xs font-medium flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDeleteKeyPoint(kp.id)}
                      className="text-rose-600 hover:text-rose-800 text-xs font-medium flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: MULTI-FORMAT PRACTICE QUESTIONS */}
      {activeSubTab === 'practice' && (
        <QuizMode topic={topic} questions={studyPack.questions} />
      )}

      {/* Sub-Tab 4: INTERACTIVE 3D FLASHCARDS */}
      {activeSubTab === 'flashcards' && (
        <FlashcardMode topic={topic} flashcards={studyPack.flashcards} />
      )}

      {/* Sub-Tab 5: QA SEEDS & LITERARY AI MENTOR */}
      {activeSubTab === 'qaseed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: QA Seeds (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
              <h3 className="text-base font-bold text-blue-950 mb-2">
                Hạt Giống Gợi Mở (Q&A Seed)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Các câu hỏi đào sâu tư duy phản biện được chuẩn bị cho học sinh tự chất vấn và cảm thụ tác phẩm.
              </p>

              <div className="space-y-3">
                {studyPack.qaSeeds.map((qa, idx) => (
                  <div
                    key={qa.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-sky-50/20 text-xs space-y-2"
                  >
                    <p className="font-bold text-blue-950 flex items-start space-x-1.5">
                      <span className="text-blue-700 font-mono">Q{idx + 1}:</span>
                      <span>{qa.question}</span>
                    </p>
                    <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                      {qa.answer}
                    </p>
                    <p className="text-[11px] text-blue-900 italic font-sans">
                      💡 <strong>Gợi mở:</strong> {qa.criticalThinkingTip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Literary AI Mentor Chat (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm flex flex-col h-[520px]">
              <div className="pb-3 mb-3 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    AI
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-950">
                      Trợ Lý Văn Việt AI (Cố Vấn Sư Phạm)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Định hướng dàn ý, phân tích chi tiết nghệ thuật (Không chép văn mẫu)
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat messages stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white font-medium shadow-xs'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex items-center space-x-2 text-xs text-slate-400 py-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Thầy/cô AI đang phân tích và soạn câu trả lời...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendChat} className="pt-3 mt-2 border-t border-slate-150">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Hỏi về chi tiết nghệ thuật, cảm hứng sáng tác, ý nghĩa biểu tượng..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isChatLoading}
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 6: UNESCO ETHICS & HUMAN VERIFICATION */}
      {activeSubTab === 'ethics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
            <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-blue-100">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-blue-950">
                  Bảng Thẩm Định & Đạo Đức Học Đường (Human Verification)
                </h3>
                <p className="text-xs text-slate-500">
                  Rà soát Study Pack theo 6 tiêu chí Buổi 3 để đảm bảo học sinh "học được thật", không học vẹt.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">6 Tiêu chí đánh giá chất lượng Buổi 3:</h4>
                <ul className="space-y-1.5 text-slate-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>1. Đúng phạm vi môn Ngữ văn và chuẩn tác phẩm phổ thông.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>2. Bản tóm tắt súc tích, mạch lạc, dễ tiếp thu.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>3. Câu hỏi 4 dạng bám sát kiến thức cốt lõi, không hỏi bẫy phi lý.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>4. Thẻ Flashcard có mặt trước/mặt sau rõ ràng để ôn luyện nhanh.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>5. Không chỉ lặp lại từ khóa bề nổi mà đào sâu giá trị nhân văn.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>6. Loại bỏ các chi tiết hư cấu sai lệch với văn bản gốc.</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200 space-y-3">
                <h4 className="font-bold text-blue-950">Xác nhận của học sinh / giáo viên:</h4>
                <p className="text-slate-700 leading-relaxed">
                  Tôi cam kết đã đọc lại văn bản gốc, kiểm tra các câu hỏi và luận điểm do AI gợi ý và chịu trách nhiệm giải trình cho kiến thức của mình.
                </p>

                <button
                  onClick={() => {
                    const current = studyPack.ethicsChecklist.isHumanVerified;
                    const updatedPack = {
                      ...studyPack,
                      ethicsChecklist: {
                        ...studyPack.ethicsChecklist,
                        isHumanVerified: !current,
                        verifiedDate: !current ? new Date().toISOString().slice(0, 10) : undefined,
                      },
                    };
                    storage.setStudyPackForTopic(topic.id, updatedPack);
                    onStudyPackUpdated(updatedPack);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors ${
                    studyPack.ethicsChecklist.isHumanVerified
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {studyPack.ethicsChecklist.isHumanVerified
                      ? '✓ Đã xác thực bài học thật'
                      : 'Đánh dấu: Tôi đã thẩm định nội dung này'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa Luận Điểm */}
      {showAddKpModal && (
        <div
          onClick={() => setShowAddKpModal(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-blue-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100"
          >
            <h3 className="text-lg font-bold text-sky-300 mb-4 flex items-center space-x-2">
              <Edit3 className="w-5 h-5" />
              <span>{editingKeyPoint ? 'Chỉnh Sửa Luận Điểm' : 'Thêm Luận Điểm Mới'}</span>
            </h3>

            <form onSubmit={handleSaveKeyPoint} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Phân loại</label>
                <select
                  value={kpCategory}
                  onChange={(e) => setKpCategory(e.target.value as KeyPointCategory)}
                  className="w-full bg-slate-950 border border-blue-900 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Khái niệm & Bối cảnh">Khái niệm & Bối cảnh</option>
                  <option value="Luận điểm Nội dung">Luận điểm Nội dung</option>
                  <option value="Nghệ thuật & Biện pháp">Nghệ thuật & Biện pháp</option>
                  <option value="Phân biệt & Mở rộng">Phân biệt & Mở rộng</option>
                  <option value="Lưu ý & Lỗi thường gặp">Lưu ý & Lỗi thường gặp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Tiêu đề luận điểm *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Vẻ đẹp tâm hồn Lão Hạc, Chi tiết cái chết..."
                  value={kpTitle}
                  onChange={(e) => setKpTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-900 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Nội dung phân tích *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Giải thích chi tiết luận điểm..."
                  value={kpDesc}
                  onChange={(e) => setKpDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-900 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Trích dẫn văn bản minh họa (Quote)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 'Lão gọi nó là cậu Vàng như một bà hiếm hoi...'"
                  value={kpQuote}
                  onChange={(e) => setKpQuote(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-900 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 italic"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-blue-900">
                <button
                  type="button"
                  onClick={() => setShowAddKpModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
                >
                  Lưu luận điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
