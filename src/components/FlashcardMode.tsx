import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Shuffle,
  Volume2,
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle,
  Eye,
  Check,
  Plus,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Flashcard, Topic } from '../types';
import { storage } from '../services/storage';

interface FlashcardModeProps {
  topic: Topic;
  flashcards?: Flashcard[];
  onUpdateFlashcards?: (updatedCards: Flashcard[]) => void;
}

export function FlashcardMode({ topic, flashcards: initialCards, onUpdateFlashcards }: FlashcardModeProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [autoFlipBackOnNext, setAutoFlipBackOnNext] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Load cards from initialCards or storage or fallback
  useEffect(() => {
    let loadedCards = initialCards && initialCards.length > 0 ? initialCards : [];

    if (loadedCards.length === 0) {
      const pack = storage.getStudyPackByTopicId(topic.id);
      if (pack && pack.flashcards && pack.flashcards.length > 0) {
        loadedCards = pack.flashcards;
      }
    }

    // Default multi-subject style fallback if topic has no flashcards
    if (loadedCards.length === 0) {
      loadedCards = [
        {
          id: 'fc_def_1',
          category: 'Khái niệm & Luận điểm',
          front: `Giá trị nhân đạo cốt lõi trong "${topic.title}" là gì?`,
          back: 'Sự trân trọng phẩm chất tốt đẹp của con người trong hoàn cảnh ngặt nghèo và cảm thông sâu sắc với nỗi đau thương của người lao động.',
          mastered: false,
        },
        {
          id: 'fc_def_2',
          category: 'Nghệ thuật & Biện pháp',
          front: `Đặc sắc nghệ thuật nổi bật của tác giả ${topic.author} là gì?`,
          back: `Khắc họa diễn biến tâm lý nhân vật tinh tế, ngôn ngữ giản dị mà giàu tính biểu cảm, giọng văn trầm lắng giàu chất thơ.`,
          mastered: false,
        },
        {
          id: 'fc_def_3',
          category: 'Dẫn chứng đắt giá',
          front: 'Từ khóa / Chi tiết nghệ thuật đắt giá cần ghi nhớ',
          back: 'Chi tiết tình huống truyện bất ngờ, hình ảnh biểu tượng nghệ thuật tập trung thể hiện chủ đề tư tưởng của tác phẩm.',
          mastered: false,
        },
        {
          id: 'fc_def_4',
          category: 'Lịch sử & Bối cảnh',
          front: `Hoàn cảnh ra đời của tác phẩm "${topic.title}"`,
          back: `Sáng tác trong giai đoạn ${topic.period || 'văn học hiện đại'}, gắn liền với những chuyển biến lịch sử và đời sống xã hội sâu sắc.`,
          mastered: false,
        },
      ];
    }

    setCards(loadedCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [topic.id, initialCards]);

  // Filtered cards
  const filteredCards = cards.filter((card) => {
    if (filterMode === 'mastered') return card.mastered;
    if (filterMode === 'unmastered') return !card.mastered;
    return true;
  });

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    if (filteredCards.length <= 1) return;
    if (autoFlipBackOnNext) setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length <= 1) return;
    if (autoFlipBackOnNext) setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  // Keyboard navigation, spacebar flip, M for mastered, 1-9 jump
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'KeyM' && currentCard) {
        e.preventDefault();
        handleToggleMastered(currentCard.id);
      } else if (e.code.startsWith('Digit') && e.code !== 'Digit0') {
        const num = parseInt(e.code.replace('Digit', ''), 10);
        if (num > 0 && num <= filteredCards.length) {
          e.preventDefault();
          setCurrentIndex(num - 1);
          if (autoFlipBackOnNext) setIsFlipped(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredCards.length, currentCard, autoFlipBackOnNext]);

  const handleShuffle = () => {
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleToggleMastered = (cardId: string) => {
    const updated = cards.map((c) => (c.id === cardId ? { ...c, mastered: !c.mastered } : c));
    setCards(updated);
    storage.toggleFlashcardMastered(topic.id, cardId);
    if (onUpdateFlashcards) onUpdateFlashcards(updated);
  };

  const handleTextToSpeech = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const masteredCount = cards.filter((c) => c.mastered).length;

  // Modal state for Flashcard CRUD
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [formData, setFormData] = useState<{ category: string; front: string; back: string }>({
    category: 'Khái niệm & Luận điểm',
    front: '',
    back: '',
  });

  const handleOpenAdd = () => {
    setEditingCard(null);
    setFormData({
      category: 'Khái niệm & Luận điểm',
      front: '',
      back: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (card: Flashcard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCard(card);
    setFormData({
      category: card.category || 'Khái niệm & Luận điểm',
      front: card.front || '',
      back: card.back || '',
    });
    setShowModal(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.front.trim() || !formData.back.trim()) return;

    if (editingCard) {
      // Update existing
      const success = storage.updateFlashcard(topic.id, editingCard.id, {
        category: formData.category,
        front: formData.front,
        back: formData.back,
      });
      if (success) {
        const updated = cards.map((c) =>
          c.id === editingCard.id ? { ...c, ...formData, isUserModified: true } : c
        );
        setCards(updated);
        if (onUpdateFlashcards) onUpdateFlashcards(updated);
      }
    } else {
      // Create new
      const newCard = storage.addFlashcard(topic.id, {
        category: formData.category,
        front: formData.front,
        back: formData.back,
        mastered: false,
      });
      if (newCard) {
        const updated = [...cards, newCard];
        setCards(updated);
        setCurrentIndex(updated.length - 1);
        if (onUpdateFlashcards) onUpdateFlashcards(updated);
      }
    }

    setShowModal(false);
  };

  const handleDeleteCard = (cardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ ghi nhớ này không?')) return;

    const success = storage.deleteFlashcard(topic.id, cardId);
    if (success) {
      const updated = cards.filter((c) => c.id !== cardId);
      setCards(updated);
      if (currentIndex >= updated.length && updated.length > 0) {
        setCurrentIndex(updated.length - 1);
      }
      setIsFlipped(false);
      if (onUpdateFlashcards) onUpdateFlashcards(updated);
    }
  };

  if (filteredCards.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-blue-100 p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Không có thẻ ghi nhớ nào trong mục danh mục này ({filterMode}).
        </p>
        <button
          onClick={() => setFilterMode('all')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
        >
          Xem tất cả {cards.length} thẻ
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER BAR */}
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-blue-900">
              FLASHCARD MODE • THẺ GHI NHỚ
            </span>
            <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
              {topic.title}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-blue-950 mt-1">
            Lật thẻ ghi nhớ & Ôn tập phản xạ
          </h2>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Thẻ Mới</span>
          </button>

          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-medium">
            <button
              onClick={() => {
                setFilterMode('all');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-blue-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({cards.length})
            </button>
            <button
              onClick={() => {
                setFilterMode('unmastered');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'unmastered'
                  ? 'bg-white text-rose-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cần ôn ({cards.length - masteredCount})
            </button>
            <button
              onClick={() => {
                setFilterMode('mastered');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'mastered'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã thuộc ({masteredCount})
            </button>
          </div>
        </div>
      </div>

      {/* PROGRESS TRACKER & LOGIC JUMP GRID */}
      <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Tiến độ ghi nhớ & Sơ đồ điều hướng nhanh</span>
          </span>
          <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            {masteredCount} / {cards.length} thẻ ({Math.round((masteredCount / (cards.length || 1)) * 100)}%)
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(masteredCount / (cards.length || 1)) * 100}%` }}
          />
        </div>

        {/* Quick Card Index Grid for Tech & Logic Learners */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Bảng nhảy nhanh thẻ (Click hoặc gõ số 1-{filteredCards.length}):
            </span>
            <div className="hidden sm:flex items-center space-x-3 text-[11px] text-slate-500">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Đã thuộc</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span>Chưa thuộc</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {filteredCards.map((card, idx) => {
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={card.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    if (autoFlipBackOnNext) setIsFlipped(false);
                  }}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center border ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400 shadow-sm'
                      : card.mastered
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title={`Thẻ ${idx + 1}: ${card.category} - ${card.front.substring(0, 30)}...`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN FLASHCARD STAGE */}
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Flip Instruction Pill */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
          <span className="flex items-center space-x-1 text-blue-700 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mẹo: Nhấn phím cách [Space] hoặc nhấp trực tiếp vào thẻ để lật</span>
          </span>
          <span className="font-mono">
            Thẻ {currentIndex + 1} / {filteredCards.length}
          </span>
        </div>

        {/* 3D FLIP CARD CONTAINER */}
        <div
          onClick={() => setIsFlipped((prev) => !prev)}
          className={`min-h-[260px] sm:min-h-[300px] p-6 sm:p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 select-none flex flex-col justify-between shadow-md relative overflow-hidden group ${
            isFlipped
              ? 'bg-gradient-to-br from-blue-50 via-sky-50 to-white border-blue-500 ring-2 ring-blue-400/30'
              : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
          }`}
        >
          {/* Top Indicator */}
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
              {currentCard.category}
            </span>

            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide flex items-center space-x-1 transition-all ${
                  isFlipped
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isFlipped ? 'MẶT SAU (GHI NHỚ / ĐÁP ÁN)' : 'MẶT TRƯỚC (CÂU HỎI / KHÁI NIỆM)'}</span>
              </span>

              {/* Text-to-speech button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTextToSpeech(isFlipped ? currentCard.back : currentCard.front);
                }}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isSpeaking ? 'bg-amber-100 border-amber-300 text-amber-800 animate-pulse' : 'bg-white/80 border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
                title="Đọc phát âm"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Card Content */}
          <div className="my-auto py-6 text-center z-10 space-y-3">
            <h3
              className={`text-lg sm:text-xl font-bold leading-relaxed transition-all ${
                isFlipped ? 'text-blue-950 font-serif' : 'text-slate-900'
              }`}
            >
              {isFlipped ? currentCard.back : currentCard.front}
            </h3>

            {!isFlipped && (
              <p className="text-xs text-slate-400 font-medium">
                (Nhấp thẻ hoặc ấn phím Space để xem đáp án/giải thích)
              </p>
            )}
          </div>

          {/* Bottom Card Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/60 z-10">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={(e) => handleOpenEdit(currentCard, e)}
                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center space-x-1 transition-colors"
                title="Sửa nội dung thẻ này"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sửa</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleDeleteCard(currentCard.id, e)}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                title="Xóa thẻ này"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xóa</span>
              </button>
            </div>

            {/* Mastered toggle button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMastered(currentCard.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border ${
                currentCard.mastered
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${currentCard.mastered ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{currentCard.mastered ? 'Đã thuộc thẻ này' : 'Đánh dấu đã thuộc'}</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION CONTROL BAR */}
        <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs flex items-center justify-between gap-2">
          <button
            onClick={handlePrev}
            disabled={filteredCards.length <= 1}
            className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Thẻ trước (←)</span>
          </button>

          {/* Flip Center Button */}
          <button
            onClick={() => setIsFlipped((prev) => !prev)}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
          >
            <RotateCcw className={`w-4 h-4 transition-transform duration-300 ${isFlipped ? 'rotate-180' : ''}`} />
            <span>Lật mặt {isFlipped ? 'trước' : 'sau'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={filteredCards.length <= 1}
            className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <span>Thẻ tiếp (→)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Extra Toolbar (Shuffle & Keyboard help) */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 px-1">
          <button
            onClick={handleShuffle}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5 text-blue-600" />
            <span>Xáo trộn thứ tự thẻ</span>
          </button>

          <label className="flex items-center space-x-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoFlipBackOnNext}
              onChange={(e) => setAutoFlipBackOnNext(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Tự động quay về mặt trước khi sang thẻ mới</span>
          </label>
        </div>
      </div>

      {/* CRUD MODAL FOR FLASHCARD */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span>{editingCard ? 'Chỉnh sửa Thẻ Ghi Nhớ' : 'Thêm Thẻ Ghi Nhớ Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Thể loại / Nhóm học liệu môn học</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {[
                    'Văn học & Luận điểm',
                    'Tiếng Anh & Từ vựng',
                    'Lịch sử & Bối cảnh',
                    'Toán & Công thức',
                    'Khoa học & Khái niệm',
                    'Nghệ thuật & Biện pháp',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: preset })}
                      className={`px-2 py-1 rounded-md text-[11px] border transition-colors ${
                        formData.category === preset
                          ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Hoặc tự nhập thể loại mới..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mặt trước (Câu hỏi / Khái niệm / Từ khóa)</label>
                <textarea
                  value={formData.front}
                  onChange={(e) => setFormData({ ...formData, front: e.target.value })}
                  rows={3}
                  placeholder="Nhập câu hỏi hoặc khái niệm cần ghi nhớ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mặt sau (Đáp án / Nội dung ghi nhớ / Giải thích)</label>
                <textarea
                  value={formData.back}
                  onChange={(e) => setFormData({ ...formData, back: e.target.value })}
                  rows={4}
                  placeholder="Nhập nội dung ghi nhớ đầy đủ hoặc kiến thức giải thích..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition-colors"
                >
                  {editingCard ? 'Cập nhật thẻ' : 'Lưu thẻ mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
