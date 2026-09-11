import React, { useState, useEffect } from 'react';
import {
  Save,
  FolderOpen,
  X,
  Clock,
  Trash2,
  Edit2,
  Check,
  BookOpen,
  FileText,
  Sparkles,
  Layers,
  HelpCircle,
  HardDrive,
  RefreshCw,
  GitBranch,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Topic, SourceItem, AIPreview, StudyPack, TopicSnapshot } from '../types';
import { storage } from '../services/storage';
import { requestStudyPack } from '../services/api';

interface SnapshotManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic;
  sources: SourceItem[];
  preview?: AIPreview;
  studyPack?: StudyPack;
  onRestoreSuccess: (restoredData: {
    topic: Topic;
    sources: SourceItem[];
    preview?: AIPreview;
    studyPack?: StudyPack;
  }) => void;
}

export function SnapshotManagerModal({
  isOpen,
  onClose,
  topic,
  sources,
  preview,
  studyPack,
  onRestoreSuccess,
}: SnapshotManagerModalProps) {
  const [snapshots, setSnapshots] = useState<TopicSnapshot[]>([]);
  const [activeTab, setActiveTab] = useState<'versions' | 'save' | 'compare'>('versions');
  const [customShortName, setCustomShortName] = useState('');
  const [editingSnapshotId, setEditingSnapshotId] = useState<string | null>(null);
  const [editingNameInput, setEditingNameInput] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isReGenerating, setIsReGenerating] = useState(false);

  // Compare mode selection
  const [compareSourceId, setCompareSourceId] = useState<string>('');
  const [compareTargetId, setCompareTargetId] = useState<string>('');

  // Load snapshots when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSnapshots();
      const dateStr = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setCustomShortName(`${topic.title} [Lưu ${dateStr} ${timeStr}]`);
      setSuccessMessage(null);

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, topic.id, topic.title, onClose]);

  const loadSnapshots = () => {
    const snaps = storage.getSnapshots();
    setSnapshots(snaps);

    const topicSnaps = snaps.filter((s) => s.topicId === topic.id);
    if (topicSnaps.length >= 2) {
      setCompareSourceId(topicSnaps[1].id);
      setCompareTargetId(topicSnaps[0].id);
    } else if (topicSnaps.length === 1) {
      setCompareTargetId(topicSnaps[0].id);
    }
  };

  if (!isOpen) return null;

  const topicSnapshots = snapshots.filter((s) => s.topicId === topic.id);

  // PROMPT 03: Re-generate a NEW VERSION from original sources using Gemini API
  const handleReGenerateNewVersion = async () => {
    setIsReGenerating(true);
    setSuccessMessage(null);
    try {
      // 1. Request Gemini API to re-generate entire study pack
      const res = await requestStudyPack(topic, sources, preview);
      if (res.success && res.studyPack) {
        // 2. Keep original sources intact & create new version
        const newSnap = storage.createStudyPackVersion(
          topic,
          sources,
          preview,
          res.studyPack as StudyPack
        );

        // 3. Restore newly created version as current active
        const restored = storage.restoreSnapshot(newSnap.id);
        if (restored) {
          onRestoreSuccess(restored);
        }

        loadSnapshots();
        setSuccessMessage(`✨ Đã Re-generate thành công "${newSnap.shortName}" bằng Gemini API! Nguồn gốc được giữ nguyên.`);
        setActiveTab('versions');
      }
    } catch (err) {
      console.error('Re-generation failed:', err);
    } finally {
      setIsReGenerating(false);
    }
  };

  // Handle Save Manual Snapshot
  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSnap = storage.createSnapshot(
      topic,
      sources,
      preview,
      studyPack,
      customShortName
    );

    loadSnapshots();
    setSuccessMessage(`Đã lưu thành công snapshot version: "${newSnap.shortName}"!`);
    setActiveTab('versions');

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // Handle Restore Snapshot
  const handleRestore = (snap: TopicSnapshot) => {
    const restored = storage.restoreSnapshot(snap.id);
    if (restored) {
      onRestoreSuccess(restored);
      setSuccessMessage(`Đã chuyển sang làm việc trực tiếp với Version: "${snap.shortName}"!`);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  // Handle Rename
  const handleStartRename = (snap: TopicSnapshot) => {
    setEditingSnapshotId(snap.id);
    setEditingNameInput(snap.shortName);
  };

  const handleSaveRename = (snapId: string) => {
    if (editingNameInput.trim()) {
      storage.renameSnapshot(snapId, editingNameInput.trim());
      setEditingSnapshotId(null);
      loadSnapshots();
    }
  };

  // Handle Delete Snapshot
  const handleDeleteSnapshot = (snapId: string, shortName: string) => {
    if (confirm(`Bạn có chắc muốn xóa version "${shortName}" không?`)) {
      storage.deleteSnapshot(snapId);
      loadSnapshots();
    }
  };

  const selectedSourceSnap = snapshots.find((s) => s.id === compareSourceId);
  const selectedTargetSnap = snapshots.find((s) => s.id === compareTargetId);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-blue-800/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-blue-800 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 flex items-center justify-center text-sky-200 border border-blue-400/30">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-wide flex items-center space-x-2">
                <span>Quản Lý Versions & Re-generate Study Pack</span>
                <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-400/30">
                  Topic: {topic.title}
                </span>
              </h3>
              <p className="text-xs text-sky-300/80">
                Re-generate bài học bằng Gemini API key local, xem lịch sử các version và khôi phục khi cần.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Toast */}
        {successMessage && (
          <div className="bg-emerald-900/90 text-emerald-100 border-b border-emerald-700/80 px-6 py-2.5 text-xs font-semibold flex items-center space-x-2 animate-in slide-in-from-top duration-200">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Quick Action Bar for Re-generating */}
        <div className="bg-slate-950/80 px-6 py-3 border-b border-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Tạo mới bản Summary, Quiz, Flashcards, Q&A từ <strong>{sources.length} nguồn gốc</strong> hiện tại.
            </span>
          </div>

          <button
            onClick={handleReGenerateNewVersion}
            disabled={isReGenerating || sources.length === 0}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReGenerating ? 'animate-spin' : ''}`} />
            <span>{isReGenerating ? 'Đang Re-generate Version Mới...' : '✨ Re-generate Version Mới (Gemini)'}</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-blue-900 bg-slate-950/40 px-6 pt-3 space-x-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('versions')}
            className={`pb-3 px-3 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'versions'
                ? 'border-sky-400 text-sky-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Danh Sách Versions Bài "{topic.title}" ({topicSnapshots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('save')}
            className={`pb-3 px-3 flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'save'
                ? 'border-sky-400 text-sky-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Lưu Thủ Công (Save Snapshot)</span>
          </button>

          {topicSnapshots.length >= 2 && (
            <button
              onClick={() => setActiveTab('compare')}
              className={`pb-3 px-3 flex items-center space-x-2 border-b-2 transition-all ${
                activeTab === 'compare'
                  ? 'border-sky-400 text-sky-300 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>So Sánh 2 Version (Compare)</span>
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-200">
          {/* TAB 1: VERSIONS LIST */}
          {activeTab === 'versions' && (
            <div className="space-y-3">
              {topicSnapshots.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <GitBranch className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-400">Chưa có version lưu lịch sử nào cho tác phẩm này.</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Mỗi lần Re-generate hoặc Lưu snapshot, hệ thống sẽ tự động khởi tạo version mới để em có thể mở lại học tiếp bất cứ lúc nào.
                  </p>
                  <button
                    onClick={handleReGenerateNewVersion}
                    disabled={isReGenerating}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center space-x-1.5 hover:bg-blue-500 transition-colors shadow-md"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReGenerating ? 'animate-spin' : ''}`} />
                    <span>Re-generate Version Đầu Tiên Ngay</span>
                  </button>
                </div>
              ) : (
                topicSnapshots.map((snap, idx) => {
                  const isEditing = editingSnapshotId === snap.id;
                  const isCurrentActive = studyPack && snap.studyPack && JSON.stringify(snap.studyPack.summary) === JSON.stringify(studyPack.summary);
                  const formattedDate = new Date(snap.savedAt).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={`${snap.id}_${idx}`}
                      className={`border rounded-xl p-4 space-y-3 transition-all ${
                        isCurrentActive
                          ? 'bg-blue-950/70 border-sky-400 shadow-md shadow-sky-500/10'
                          : 'bg-slate-950/80 border-blue-900/60 hover:border-sky-500/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/60 pb-2.5">
                        {/* Title / Rename input */}
                        {isEditing ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="text"
                              value={editingNameInput}
                              onChange={(e) => setEditingNameInput(e.target.value)}
                              className="bg-slate-900 border border-sky-400 rounded-lg px-2.5 py-1 text-xs text-white flex-1 focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveRename(snap.id)}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 text-xs"
                              title="Lưu tên"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingSnapshotId(null)}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                              title="Hủy"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sky-200 text-sm flex items-center space-x-2">
                              <span>{snap.shortName}</span>
                              {isCurrentActive && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center space-x-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>Đang Mở / Active</span>
                                </span>
                              )}
                              {idx === 0 && !isCurrentActive && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                  Mới nhất
                                </span>
                              )}
                            </h4>
                            <button
                              onClick={() => handleStartRename(snap)}
                              className="text-slate-400 hover:text-sky-300 p-1 transition-colors"
                              title="Đổi tên version"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Thời gian tạo: {formattedDate}</span>
                        </div>
                      </div>

                      {/* Summary text snippet */}
                      {snap.studyPack?.summary?.shortSummary && (
                        <p className="text-xs text-slate-300 line-clamp-2 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          "{snap.studyPack.summary.shortSummary}"
                        </p>
                      )}

                      {/* Version Meta Badge & Stats */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700 flex items-center space-x-1">
                            <FileText className="w-3 h-3 text-sky-400" />
                            <span>{snap.metadata.sourcesCount} nguồn gốc</span>
                          </span>

                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700 flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>{snap.metadata.keyPointsCount} luận điểm</span>
                          </span>

                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700 flex items-center space-x-1">
                            <HelpCircle className="w-3 h-3 text-amber-400" />
                            <span>{snap.metadata.questionsCount} quiz</span>
                          </span>

                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700 flex items-center space-x-1">
                            <Layers className="w-3 h-3 text-indigo-400" />
                            <span>{snap.metadata.flashcardsCount} flashcards</span>
                          </span>
                        </div>

                        {/* Actions buttons */}
                        <div className="flex items-center space-x-2 self-end sm:self-auto">
                          {!isCurrentActive && (
                            <button
                              onClick={() => handleRestore(snap)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
                              title="Chuyển sang học với Version này"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Mở Version Này</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteSnapshot(snap.id, snap.shortName)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 transition-colors border border-slate-700"
                            title="Xóa version này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: MANUAL SAVE SNAPSHOT */}
          {activeTab === 'save' && (
            <form onSubmit={handleSaveSnapshot} className="space-y-5">
              <div className="bg-blue-950/40 border border-blue-800/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-blue-900/80 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>Lưu Trạng Thái Hiện Tại Thành Snapshot Version</span>
                  </span>
                  <span className="text-[10px] bg-blue-900 px-2 py-0.5 rounded text-sky-200 font-mono">
                    {topic.grade}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Tác phẩm / Môn học:</span>
                    <strong className="text-slate-100 font-semibold">{topic.title}</strong> ({topic.author})
                  </div>

                  <div>
                    <span className="text-slate-400 block">Nguồn học liệu gốc:</span>
                    <strong className="text-sky-300 font-semibold">{sources.length} tư liệu</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Bộ Study Pack:</span>
                    <strong className={studyPack ? 'text-emerald-400' : 'text-slate-400'}>
                      {studyPack
                        ? `${studyPack.keyPoints.length} luận điểm • ${studyPack.questions.length} quiz • ${studyPack.flashcards.length} flashcards`
                        : 'Chưa có'}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Đặt tên cho bản lưu Version (Short Name):</span>
                </label>
                <input
                  type="text"
                  value={customShortName}
                  onChange={(e) => setCustomShortName(e.target.value)}
                  placeholder="Ví dụ: v2.0 - Đã tinh chỉnh câu hỏi bài học..."
                  required
                  className="w-full bg-slate-950 border border-blue-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Snapshot Ngay</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: COMPARE VERSIONS SIDE BY SIDE */}
          {activeTab === 'compare' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-blue-900 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Chọn Version A (Cũ/So sánh):</label>
                  <select
                    value={compareSourceId}
                    onChange={(e) => setCompareSourceId(e.target.value)}
                    className="w-full bg-slate-900 border border-blue-800 rounded-lg p-2 text-white"
                  >
                    {topicSnapshots.map((s, idx) => (
                      <option key={`${s.id}_a_${idx}`} value={s.id}>
                        {s.shortName} ({new Date(s.savedAt).toLocaleTimeString('vi-VN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Chọn Version B (Mới/So sánh):</label>
                  <select
                    value={compareTargetId}
                    onChange={(e) => setCompareTargetId(e.target.value)}
                    className="w-full bg-slate-900 border border-blue-800 rounded-lg p-2 text-white"
                  >
                    {topicSnapshots.map((s, idx) => (
                      <option key={`${s.id}_b_${idx}`} value={s.id}>
                        {s.shortName} ({new Date(s.savedAt).toLocaleTimeString('vi-VN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedSourceSnap && selectedTargetSnap ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Version A Card */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-blue-800 space-y-3">
                    <h4 className="font-bold text-sky-300 text-sm border-b border-blue-900 pb-2">
                      A: {selectedSourceSnap.shortName}
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      Tạo ngày: {new Date(selectedSourceSnap.savedAt).toLocaleString('vi-VN')}
                    </p>
                    <div className="space-y-1 text-slate-300">
                      <p><strong>Số Quiz:</strong> {selectedSourceSnap.metadata.questionsCount}</p>
                      <p><strong>Số Luận Điểm:</strong> {selectedSourceSnap.metadata.keyPointsCount}</p>
                      <p><strong>Số Flashcards:</strong> {selectedSourceSnap.metadata.flashcardsCount}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300 space-y-1">
                      <strong className="block text-sky-400 font-semibold">Tóm tắt Version A:</strong>
                      <p className="line-clamp-4 leading-relaxed">
                        {selectedSourceSnap.studyPack?.summary?.shortSummary || 'Chưa có tóm tắt'}
                      </p>
                    </div>
                  </div>

                  {/* Version B Card */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-emerald-800/80 space-y-3">
                    <h4 className="font-bold text-emerald-300 text-sm border-b border-emerald-900/80 pb-2">
                      B: {selectedTargetSnap.shortName}
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      Tạo ngày: {new Date(selectedTargetSnap.savedAt).toLocaleString('vi-VN')}
                    </p>
                    <div className="space-y-1 text-slate-300">
                      <p><strong>Số Quiz:</strong> {selectedTargetSnap.metadata.questionsCount}</p>
                      <p><strong>Số Luận Điểm:</strong> {selectedTargetSnap.metadata.keyPointsCount}</p>
                      <p><strong>Số Flashcards:</strong> {selectedTargetSnap.metadata.flashcardsCount}</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300 space-y-1">
                      <strong className="block text-emerald-400 font-semibold">Tóm tắt Version B:</strong>
                      <p className="line-clamp-4 leading-relaxed">
                        {selectedTargetSnap.studyPack?.summary?.shortSummary || 'Chưa có tóm tắt'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-slate-400 py-6 text-xs">Vui lòng chọn 2 version khác nhau để đối sánh.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950 border-t border-blue-900 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Tất cả Version được lưu an toàn trong CSDL LocalStorage. Nguồn gốc bài học luôn được bảo toàn.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
