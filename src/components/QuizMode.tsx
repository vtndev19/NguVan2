import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Send,
  Award,
  Sparkles,
  BookOpen,
  Check,
  AlertCircle,
  BarChart3,
  Plus,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Question, Topic, QuestionType } from '../types';
import { storage } from '../services/storage';

interface QuizModeProps {
  topic: Topic;
  questions?: Question[];
  onComplete?: (score: number, total: number) => void;
}

export function QuizMode({ topic, questions: initialQuestions, onComplete }: QuizModeProps) {
  // Load questions from prop or storage or fallback
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // CRITICAL REQUIREMENT: Independent state per question id
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  // Track checked state per question id: { [questionId]: boolean }
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});

  // Entire quiz submission state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  // Filter mode: 'all' or 'incorrect_only'
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect'>('all');

  // CRUD state for Quiz Questions
  const [showQuestionModal, setShowQuestionModal] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [qFormData, setQFormData] = useState<{
    type: QuestionType;
    question: string;
    optionsText: string;
    correctAnswer: string;
    explanation: string;
    difficulty: 'Cơ bản' | 'Thông hiểu' | 'Vận dụng';
    contextClue: string;
  }>({
    type: 'multiple_choice',
    question: '',
    optionsText: 'A. \nB. \nC. \nD. ',
    correctAnswer: '',
    explanation: '',
    difficulty: 'Cơ bản',
    contextClue: '',
  });

  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQFormData({
      type: 'multiple_choice',
      question: '',
      optionsText: 'A. Đáp án A\nB. Đáp án B\nC. Đáp án C\nD. Đáp án D',
      correctAnswer: 'A. Đáp án A',
      explanation: 'Giải thích chi tiết lý do đáp án đúng...',
      difficulty: 'Cơ bản',
      contextClue: '',
    });
    setShowQuestionModal(true);
  };

  const handleOpenEditQuestion = (q: Question, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingQuestion(q);
    setQFormData({
      type: q.type,
      question: q.question,
      optionsText: q.options ? q.options.join('\n') : '',
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      contextClue: q.contextClue || '',
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qFormData.question.trim() || !qFormData.correctAnswer.trim()) return;

    const parsedOptions = qFormData.type === 'multiple_choice' || qFormData.type === 'true_false'
      ? qFormData.optionsText.split('\n').map((o) => o.trim()).filter(Boolean)
      : undefined;

    if (editingQuestion) {
      const success = storage.updateQuestion(topic.id, editingQuestion.id, {
        type: qFormData.type,
        question: qFormData.question,
        options: parsedOptions,
        correctAnswer: qFormData.correctAnswer,
        explanation: qFormData.explanation,
        difficulty: qFormData.difficulty,
        contextClue: qFormData.contextClue,
      });
      if (success) {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === editingQuestion.id
              ? {
                  ...q,
                  type: qFormData.type,
                  question: qFormData.question,
                  options: parsedOptions,
                  correctAnswer: qFormData.correctAnswer,
                  explanation: qFormData.explanation,
                  difficulty: qFormData.difficulty,
                  contextClue: qFormData.contextClue,
                  isUserModified: true,
                }
              : q
          )
        );
      }
    } else {
      const newQ = storage.addQuestion(topic.id, {
        type: qFormData.type,
        question: qFormData.question,
        options: parsedOptions,
        correctAnswer: qFormData.correctAnswer,
        explanation: qFormData.explanation,
        difficulty: qFormData.difficulty,
        contextClue: qFormData.contextClue,
      });
      if (newQ) {
        setQuestions((prev) => [...prev, newQ]);
        setCurrentIndex(questions.length);
      }
    }
    setShowQuestionModal(false);
  };

  const handleDeleteQuestion = (questionId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) return;

    const success = storage.deleteQuestion(topic.id, questionId);
    if (success) {
      const updated = questions.filter((q) => q.id !== questionId);
      setQuestions(updated);
      if (currentIndex >= updated.length && updated.length > 0) {
        setCurrentIndex(updated.length - 1);
      }
    }
  };

  // Filtered active questions
  const displayedQuestions = filterMode === 'incorrect' && isSubmitted
    ? questions.filter((q) => !isAnswerCorrect(q, userAnswers[q.id]))
    : questions;

  const currentQuestion = displayedQuestions[currentIndex] || questions[0];

  // Keyboard shortcuts for option selection (1-4, A-D) and navigation (Left/Right)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < displayedQuestions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      } else if (currentQuestion && (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false')) {
        const opts = currentQuestion.options || [];
        let chosenIdx = -1;
        if (['Digit1', 'KeyA'].includes(e.code) && opts.length >= 1) chosenIdx = 0;
        else if (['Digit2', 'KeyB'].includes(e.code) && opts.length >= 2) chosenIdx = 1;
        else if (['Digit3', 'KeyC'].includes(e.code) && opts.length >= 3) chosenIdx = 2;
        else if (['Digit4', 'KeyD'].includes(e.code) && opts.length >= 4) chosenIdx = 3;

        if (chosenIdx !== -1 && opts[chosenIdx]) {
          e.preventDefault();
          setUserAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: opts[chosenIdx],
          }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, displayedQuestions.length, currentQuestion]);

  useEffect(() => {
    let loadedQuestions = initialQuestions && initialQuestions.length > 0 ? initialQuestions : [];

    if (loadedQuestions.length === 0) {
      const pack = storage.getStudyPackByTopicId(topic.id);
      if (pack && pack.questions && pack.questions.length > 0) {
        loadedQuestions = pack.questions;
      }
    }

    // Fallback default questions if study pack has none
    if (loadedQuestions.length === 0) {
      loadedQuestions = [
        {
          id: 'q_default_1',
          type: 'multiple_choice',
          question: `Nhân vật / Nội dung trung tâm trong tác phẩm "${topic.title}" thể hiện giá trị nghệ thuật đặc sắc nào?`,
          options: [
            'A. Khắc họa tâm lý nhân vật tinh tế và chiều sâu nhân đạo',
            'B. Sử dụng lối kể chuyện khoa học thuần túy',
            'C. Tập trung vào miêu tả thiên nhiên không có con người',
            'D. Phản ánh thực tại thông qua yếu tố viễn tưởng',
          ],
          correctAnswer: 'A. Khắc họa tâm lý nhân vật tinh tế và chiều sâu nhân đạo',
          explanation: 'Tác phẩm chú trọng khai thác bi kịch tâm lý và phẩm chất tốt đẹp của con người trong hoàn cảnh ngặt nghèo.',
          difficulty: 'Cơ bản',
        },
        {
          id: 'q_default_2',
          type: 'true_false',
          question: `Tác phẩm "${topic.title}" thuộc thể loại ${topic.genre} của tác giả ${topic.author}.`,
          options: ['Đúng', 'Sai'],
          correctAnswer: 'Đúng',
          explanation: `Đúng, tác phẩm ${topic.title} do tác giả ${topic.author} sáng tác thuộc thể loại ${topic.genre}.`,
          difficulty: 'Cơ bản',
        },
        {
          id: 'q_default_3',
          type: 'fill_in_blank',
          question: `Điền từ thích hợp vào chỗ trống: Tác phẩm "${topic.title}" phản ánh đậm nét bối cảnh ______.`,
          correctAnswer: topic.period || 'văn học hiện đại',
          contextClue: 'Thời kỳ sáng tác của tác phẩm',
          explanation: `Bối cảnh chính của tác phẩm gắn liền với giai đoạn ${topic.period}.`,
          difficulty: 'Thông hiểu',
        },
      ];
    }

    setQuestions(loadedQuestions);
    setCurrentIndex(0);
    setUserAnswers({});
    setCheckedQuestions({});
    setIsSubmitted(false);
    setScoreResult(null);
  }, [topic.id, initialQuestions]);

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-blue-100 p-8 text-center text-slate-600">
        <p className="text-sm font-medium">Chưa có câu hỏi ôn tập cho tác phẩm này.</p>
      </div>
    );
  }

  // Independent handler for each question
  const handleAnswerChange = (questionId: string, answerValue: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerValue,
    }));
  };

  // Single question answer check logic
  function isAnswerCorrect(q: Question, userAns?: string): boolean {
    if (!userAns || userAns.trim() === '') return false;

    const normUser = userAns.trim().toLowerCase();
    const normCorrect = q.correctAnswer.trim().toLowerCase();

    // Direct match check
    if (normUser === normCorrect) return true;

    if (q.type === 'multiple_choice' || q.type === 'true_false') {
      // Helper to strip option prefixes like "A. ", "B. ", "1. ", "Đúng" etc.
      const stripPrefix = (str: string) => str.replace(/^[a-d0-9][.\-)\s]+/i, '').trim();
      const cleanUser = stripPrefix(normUser);
      const cleanCorrect = stripPrefix(normCorrect);

      if (cleanUser && cleanCorrect && cleanUser === cleanCorrect) return true;

      // Single option letter/symbol check (e.g., user selected "A" or "A. Đáp án A" vs correct "A")
      const userLetterMatch = normUser.match(/^([a-d])[.\-)\s]*/i);
      const correctLetterMatch = normCorrect.match(/^([a-d])[.\-)\s]*/i);

      if (userLetterMatch && correctLetterMatch && userLetterMatch[1] === correctLetterMatch[1]) {
        return true;
      }

      return false;
    }

    if (q.type === 'fill_in_blank') {
      return normUser.includes(normCorrect) || normCorrect.includes(normUser);
    }

    if (q.type === 'short_answer') {
      // For short answer, checking if key terms exist or marked user length
      return normUser.length >= 10;
    }

    return normUser === normCorrect;
  }

  // Check single question
  const handleCheckSingleQuestion = (qId: string) => {
    setCheckedQuestions((prev) => ({
      ...prev,
      [qId]: true,
    }));
  };

  // Submit entire quiz attempt
  const handleSubmitAll = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      const userAns = userAnswers[q.id];
      if (isAnswerCorrect(q, userAns)) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    setScoreResult({
      score: correctCount,
      total: questions.length,
      percentage,
    });
    setIsSubmitted(true);

    // Save attempt to LocalStorage
    storage.saveQuizAttempt({
      topicId: topic.id,
      answers: userAnswers,
      score: correctCount,
      total: questions.length,
      completedAt: new Date().toISOString(),
    });

    if (onComplete) {
      onComplete(correctCount, questions.length);
    }
  };

  // Reset attempt
  const handleReset = () => {
    setUserAnswers({});
    setCheckedQuestions({});
    setIsSubmitted(false);
    setScoreResult(null);
    setCurrentIndex(0);
    setFilterMode('all');
  };

  const currentAnswer = userAnswers[currentQuestion.id] || '';
  const isCurrentChecked = checkedQuestions[currentQuestion.id] || isSubmitted;
  const isCurrentCorrect = isAnswerCorrect(currentQuestion, currentAnswer);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Progress Header */}
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              QUIZ MODE • ÔN TẬP CỦNG CỐ
            </span>
            <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
              {topic.title}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-blue-950 mt-1">
            Luyện tập & Chấm điểm tức thì
          </h2>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAddQuestion}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm câu hỏi mới</span>
          </button>

          {isSubmitted && (
            <button
              onClick={() => setFilterMode(filterMode === 'all' ? 'incorrect' : 'all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                filterMode === 'incorrect'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{filterMode === 'incorrect' ? 'Xem tất cả' : 'Chỉ xem câu sai'}</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span>Làm lại từ đầu</span>
          </button>
        </div>
      </div>

      {/* Score Summary Banner if Submitted */}
      {isSubmitted && scoreResult && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-100">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                KẾT QUẢ LƯỢT QUIZ
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Bạn trả lời đúng <span className="text-blue-600 font-extrabold">{scoreResult.score} / {scoreResult.total}</span> câu hỏi ({scoreResult.percentage}%)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {scoreResult.percentage === 100
                  ? 'Hoàn hảo! Bạn đã nắm vững toàn bộ kiến thức của bài học này.'
                  : scoreResult.percentage >= 70
                  ? 'Khá tốt! Bạn chỉ cần xem lại 1 vài câu chưa đúng bên dưới.'
                  : 'Hãy dành thêm thời gian đọc lại tóm tắt và danh sách luận điểm chính ở Buổi 3.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs flex-shrink-0">
              <div className="bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 text-center">
                <span className="block text-emerald-700 text-[10px] font-bold uppercase">Số câu đúng</span>
                <span className="text-emerald-800 font-extrabold text-lg">{scoreResult.score} / {scoreResult.total}</span>
              </div>
              <div className="bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200 text-center">
                <span className="block text-rose-700 text-[10px] font-bold uppercase">Số câu sai</span>
                <span className="text-rose-800 font-extrabold text-lg">{scoreResult.total - scoreResult.score} / {scoreResult.total}</span>
              </div>
            </div>
          </div>

          {/* Quick breakdown list */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-700 block">Tổng hợp kết quả từng câu:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {questions.map((q, idx) => {
                const uAns = userAnswers[q.id];
                const isCorr = isAnswerCorrect(q, uAns);
                return (
                  <div
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-2.5 ${
                      isCorr
                        ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                        : 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5 ${
                      isCorr ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{q.question}</p>
                      <p className={`text-[11px] mt-0.5 ${isCorr ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isCorr ? '✓ Trả lời đúng' : `✗ Chưa đúng (Đáp án: ${q.correctAnswer})`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Question Stepper / Navigation Palette */}
      <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-semibold text-slate-600">
          <span className="flex items-center space-x-1.5">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Sơ đồ câu hỏi ({displayedQuestions.length} câu)</span>
          </span>
          <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-normal">
            <span>
              Đã làm: <strong className="text-blue-700 font-bold">{Object.keys(userAnswers).filter((k) => userAnswers[k]?.trim() !== '').length}</strong> / {questions.length}
            </span>
            <span className="hidden md:inline text-slate-400">•</span>
            <span className="hidden md:inline text-blue-600 font-medium">
              💡 Phím tắt: [1-4 / A-D] chọn đáp án • [← / →] chuyển câu
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {displayedQuestions.map((q, idx) => {
            const hasAns = !!userAnswers[q.id] && userAnswers[q.id].trim() !== '';
            const isChecked = checkedQuestions[q.id] || isSubmitted;
            const isCorrect = isAnswerCorrect(q, userAnswers[q.id]);

            let btnStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';

            if (idx === currentIndex) {
              btnStyle = 'bg-blue-600 text-white font-bold ring-2 ring-blue-400 shadow-xs border-blue-600';
            } else if (isChecked) {
              btnStyle = isCorrect
                ? 'bg-emerald-100 text-emerald-800 font-bold border-emerald-300'
                : 'bg-rose-100 text-rose-800 font-bold border-rose-300';
            } else if (hasAns) {
              btnStyle = 'bg-sky-100 text-blue-900 font-semibold border-sky-300';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl border text-xs font-mono transition-all flex items-center justify-center ${btnStyle}`}
                title={`Câu ${idx + 1}: ${q.question.substring(0, 40)}...`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE QUESTION CARD */}
      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm space-y-6 relative overflow-hidden">
        {/* Question Header Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-blue-100">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">
              Q{currentIndex + 1}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              {currentQuestion.type === 'multiple_choice' && 'Trắc nghiệm (4 lựa chọn)'}
              {currentQuestion.type === 'true_false' && 'Đúng / Sai'}
              {currentQuestion.type === 'fill_in_blank' && 'Điền từ vào chỗ trống'}
              {currentQuestion.type === 'short_answer' && 'Trả lời ngắn / Tự luận'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-50 text-blue-800 font-medium border border-sky-200">
              Độ khó: {currentQuestion.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={(e) => handleOpenEditQuestion(currentQuestion, e)}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center space-x-1 transition-colors"
              title="Sửa câu hỏi này"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Sửa</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleDeleteQuestion(currentQuestion.id, e)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
              title="Xóa câu hỏi này"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>

            <span className="text-xs text-slate-400 font-mono pl-1">
              {currentIndex + 1} / {displayedQuestions.length}
            </span>
          </div>
        </div>

        {/* Question Content */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-blue-950 leading-relaxed">
            {currentQuestion.question}
          </h3>
        </div>

        {/* ANSWER INPUT SECTION */}
        <div className="space-y-3 pt-2">
          {/* TYPE 1: MULTIPLE CHOICE */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div className="grid grid-cols-1 gap-2.5">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = currentAnswer === opt;
                let cardStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300';

                if (isCurrentChecked) {
                  if (opt === currentQuestion.correctAnswer) {
                    cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold ring-1 ring-emerald-400';
                  } else if (isSelected) {
                    cardStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-semibold';
                  } else {
                    cardStyle = 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  cardStyle = 'bg-blue-50 border-blue-600 text-blue-950 font-bold ring-2 ring-blue-500/30';
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleAnswerChange(currentQuestion.id, opt)}
                    className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm font-medium text-left flex items-start space-x-3 transition-all cursor-pointer ${cardStyle}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[11px] ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300 bg-white text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </div>
                    <span className="flex-1 leading-snug">{opt}</span>
                    {isCurrentChecked && opt === currentQuestion.correctAnswer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    )}
                    {isCurrentChecked && isSelected && opt !== currentQuestion.correctAnswer && (
                      <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* TYPE 2: TRUE / FALSE */}
          {currentQuestion.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4">
              {['Đúng', 'Sai'].map((val) => {
                const isSelected = currentAnswer === val;
                let cardStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';

                if (isCurrentChecked) {
                  if (val === currentQuestion.correctAnswer) {
                    cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                  } else if (isSelected) {
                    cardStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-bold';
                  }
                } else if (isSelected) {
                  cardStyle = 'bg-blue-600 text-white font-bold border-blue-600 shadow-sm';
                }

                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAnswerChange(currentQuestion.id, val)}
                    className={`p-4 rounded-xl border text-sm font-bold text-center transition-all ${cardStyle}`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          )}

          {/* TYPE 3: FILL IN BLANK */}
          {currentQuestion.type === 'fill_in_blank' && (
            <div className="space-y-2">
              {currentQuestion.contextClue && (
                <p className="text-xs text-blue-900 bg-sky-50 p-2.5 rounded-lg border border-sky-150 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span><strong>Gợi ý ngữ cảnh:</strong> {currentQuestion.contextClue}</span>
                </p>
              )}

              <input
                type="text"
                placeholder="Nhập từ hoặc cụm từ trả lời vào đây..."
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-slate-800"
              />
            </div>
          )}

          {/* TYPE 4: SHORT ANSWER / ESSAY */}
          {currentQuestion.type === 'short_answer' && (
            <div className="space-y-2">
              <textarea
                rows={4}
                placeholder="Nhập câu trả lời/luận điểm của bạn..."
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="w-full p-3.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none transition-all"
              />
            </div>
          )}
        </div>

        {/* SINGLE QUESTION CHECK / FEEDBACK DISPLAY */}
        {isCurrentChecked && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm space-y-3 animate-in fade-in duration-200 ${
              isCurrentCorrect
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                : 'bg-rose-50/90 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm">
              {isCurrentCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-800">Kết quả: ĐÚNG</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span className="text-rose-800">Kết quả: CHƯA ĐÚNG</span>
                </>
              )}
            </div>

            <div className="pt-2 space-y-1.5 text-slate-800 leading-relaxed border-t border-slate-200/60">
              <p>
                <strong>Đáp án đúng:</strong>{' '}
                <span className="text-emerald-800 font-bold">{currentQuestion.correctAnswer}</span>
              </p>
              <p className="text-slate-700">
                <strong>Phân tích Barem:</strong> {currentQuestion.explanation}
              </p>
            </div>

            {/* Concise Study Hint / Gợi ý ngắn để ôn lại */}
            {!isCurrentCorrect && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <span>💡 Gợi ý ngắn để ôn lại:</span>
                </div>
                <p className="text-amber-900 leading-relaxed">
                  {currentQuestion.contextClue
                    ? `Chú ý từ khóa: "${currentQuestion.contextClue}". `
                    : ''}
                  Hãy đọc lại phần Tóm tắt nội dung và Luận điểm chính của tác phẩm <strong>{topic.title}</strong> tại Buổi 3 để củng cố lại câu hỏi này.
                </p>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM ACTION TOOLBAR */}
        <div className="pt-4 border-t border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Check question button */}
          <div>
            {!isCurrentChecked ? (
              <button
                type="button"
                onClick={() => handleCheckSingleQuestion(currentQuestion.id)}
                disabled={!currentAnswer || currentAnswer.trim() === ''}
                className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Kiểm tra đáp án câu này</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đã kiểm tra kết quả</span>
              </span>
            )}
          </div>

          {/* Stepper buttons & Submit entire quiz */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 text-xs font-semibold flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Câu trước</span>
            </button>

            {currentIndex < displayedQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(displayedQuestions.length - 1, prev + 1))}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center space-x-1"
              >
                <span>Câu tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              !isSubmitted && (
                <button
                  type="button"
                  onClick={handleSubmitAll}
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Nộp bài & Chấm toàn bộ</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* CRUD MODAL FOR QUIZ QUESTION */}
      {showQuestionModal && (
        <div
          onClick={() => setShowQuestionModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>{editingQuestion ? 'Chỉnh sửa Câu hỏi Quiz' : 'Thêm Câu hỏi Quiz Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowQuestionModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dạng câu hỏi</label>
                  <select
                    value={qFormData.type}
                    onChange={(e) => setQFormData({ ...qFormData, type: e.target.value as QuestionType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  >
                    <option value="multiple_choice">Trắc nghiệm (4 lựa chọn)</option>
                    <option value="true_false">Đúng / Sai</option>
                    <option value="fill_in_blank">Điền từ vào chỗ trống</option>
                    <option value="short_answer">Trả lời ngắn / Tự luận</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ nhận thức</label>
                  <select
                    value={qFormData.difficulty}
                    onChange={(e) => setQFormData({ ...qFormData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  >
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung câu hỏi</label>
                <textarea
                  value={qFormData.question}
                  onChange={(e) => setQFormData({ ...qFormData, question: e.target.value })}
                  rows={3}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              {(qFormData.type === 'multiple_choice' || qFormData.type === 'true_false') && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Danh sách phương án (mỗi dòng một phương án)
                  </label>
                  <textarea
                    value={qFormData.optionsText}
                    onChange={(e) => setQFormData({ ...qFormData, optionsText: e.target.value })}
                    rows={4}
                    placeholder={'A. Phương án A\nB. Phương án B\nC. Phương án C\nD. Phương án D'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đáp án đúng</label>
                <input
                  type="text"
                  value={qFormData.correctAnswer}
                  onChange={(e) => setQFormData({ ...qFormData, correctAnswer: e.target.value })}
                  placeholder="Nhập chính xác phương án đúng (Ví dụ: A. Đáp án A)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giải thích đáp án & Kiến thức gợi mở</label>
                <textarea
                  value={qFormData.explanation}
                  onChange={(e) => setQFormData({ ...qFormData, explanation: e.target.value })}
                  rows={3}
                  placeholder="Giải thích vì sao đáp án này đúng và căn cứ trong tác phẩm..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {qFormData.type === 'fill_in_blank' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gợi ý ngữ cảnh (Context Clue)</label>
                  <input
                    type="text"
                    value={qFormData.contextClue}
                    onChange={(e) => setQFormData({ ...qFormData, contextClue: e.target.value })}
                    placeholder="Gợi ý thêm cho học sinh khi điền..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              )}

              <div className="pt-3 border-t flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition-colors"
                >
                  {editingQuestion ? 'Cập nhật câu hỏi' : 'Lưu câu hỏi mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
