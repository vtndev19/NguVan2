import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart2,
  RotateCcw,
  Target,
  ChevronRight,
  ShieldCheck,
  Layers,
  HelpCircle,
  Bot,
} from 'lucide-react';
import { Topic, StudyPack, UserQuizAttempt, SourceItem, AIPreview } from '../types';
import { storage } from '../services/storage';
import { QuizMode } from './QuizMode';
import { FlashcardMode } from './FlashcardMode';
import { GroundedChatbot } from './GroundedChatbot';
import { HardDrive } from 'lucide-react';

interface Buoi4StageProps {
  topic: Topic;
  sources?: SourceItem[];
  preview?: AIPreview;
  studyPack?: StudyPack;
  onOpenSnapshotModal?: () => void;
}

export function Buoi4Stage({
  topic,
  sources = [],
  preview,
  studyPack,
  onOpenSnapshotModal,
}: Buoi4StageProps) {
  const [revisionMode, setRevisionMode] = useState<'quiz' | 'flashcards' | 'chatbot'>('quiz');
  const [attempts, setAttempts] = useState<UserQuizAttempt[]>([]);

  const loadAttempts = () => {
    const allAttempts = storage.getQuizAttempts();
    setAttempts(allAttempts[topic.id] || []);
  };

  useEffect(() => {
    loadAttempts();
  }, [topic.id]);

  const questionsCount = studyPack?.questions?.length || 0;
  const flashcardsCount = studyPack?.flashcards?.length || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/60 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                BUỔI 4: ÔN TẬP & CỦNG CỐ
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Fast Feedback Loop • Grounded AI Chatbot
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
              Ôn Tập Tác Phẩm: {topic.title}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Chọn kiểu ôn tập phù hợp (Quiz Mode kiểm tra, Flashcard lật thẻ ghi nhớ, hoặc Trợ lý Chatbot bám sát tài liệu) để đào sâu kiến thức.
            </p>
          </div>

          {/* Revision Mode Selector Tabs & Version Manager */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenSnapshotModal && (
              <button
                onClick={onOpenSnapshotModal}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center space-x-1.5 transition-all border border-emerald-500/50 shadow-xs"
                title="Quản lý versions & đổi bản bài học"
              >
                <HardDrive className="w-4 h-4 text-emerald-200" />
                <span>📜 Quản Lý Versions</span>
              </button>
            )}

            <div className="flex flex-wrap bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 gap-1.5">
              <button
                onClick={() => setRevisionMode('quiz')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                  revisionMode === 'quiz'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-750'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-sky-300" />
                <span>Chế độ Quiz ({questionsCount || 3})</span>
              </button>

              <button
                onClick={() => setRevisionMode('flashcards')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                  revisionMode === 'flashcards'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-750'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-300" />
                <span>Flashcards 3D ({flashcardsCount || 4})</span>
              </button>

              <button
                onClick={() => setRevisionMode('chatbot')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                  revisionMode === 'chatbot'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-750'
                }`}
              >
                <Bot className="w-4 h-4 text-amber-300" />
                <span>Trợ Lý Grounded AI</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Learning Mode View */}
      {revisionMode === 'quiz' ? (
        <QuizMode
          topic={topic}
          questions={studyPack?.questions}
          onComplete={() => {
            loadAttempts();
          }}
        />
      ) : revisionMode === 'flashcards' ? (
        <FlashcardMode
          topic={topic}
          flashcards={studyPack?.flashcards}
        />
      ) : (
        <GroundedChatbot
          topic={topic}
          sources={sources}
          preview={preview}
          studyPack={studyPack}
        />
      )}

      {/* Attempt History Section */}
      {revisionMode === 'quiz' && attempts.length > 0 && (
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100">
            <h3 className="text-base font-bold text-blue-950 flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <span>Lịch Sử Luyện Tập Bài {topic.title} ({attempts.length} lần)</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {attempts.map((att, idx) => {
              const pct = Math.round((att.score / att.total) * 100);
              return (
                <div key={idx} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 font-bold flex items-center justify-center font-mono">
                      #{attempts.length - idx}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">
                        Đạt {att.score} / {att.total} câu ({pct}%)
                      </p>
                      <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(att.completedAt).toLocaleString('vi-VN')}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      pct >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : pct >= 50
                        ? 'bg-sky-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {pct >= 80 ? 'Xuất sắc' : pct >= 50 ? 'Đạt yêu cầu' : 'Cần ôn lại'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


