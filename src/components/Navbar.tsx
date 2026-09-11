import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Database,
  FileCode2,
  Layers,
  ChevronDown,
  Plus,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  FileText,
  Menu,
  X,
  Target,
  HelpCircle,
  Activity,
  HardDrive,
  Save,
  FolderOpen,
  Bot,
  Key,
} from 'lucide-react';
import { AppStage, Topic, GradeLevel } from '../types';
import { storage } from '../services/storage';

interface NavbarProps {
  currentStage: AppStage;
  onSelectStage: (stage: AppStage) => void;
  topics: Topic[];
  activeTopic: Topic | undefined;
  onSelectTopic: (topicId: string) => void;
  onTopicCreated: (topic: Topic) => void;
  onDataReset: () => void;
  onOpenSnapshotModal: () => void;
  onOpenApiKeyModal?: () => void;
  serverStatus: { status: string; hasApiKey: boolean };
}

export function Navbar({
  currentStage,
  onSelectStage,
  topics,
  activeTopic,
  onSelectTopic,
  onTopicCreated,
  onDataReset,
  onOpenSnapshotModal,
  onOpenApiKeyModal,
  serverStatus,
}: NavbarProps) {
  const [showTopicMenu, setShowTopicMenu] = useState(false);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New topic form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGrade, setNewGrade] = useState<GradeLevel>('Lớp 10');
  const [newGenre, setNewGenre] = useState('Truyện ngắn');
  const [newPeriod, setNewPeriod] = useState('Văn học hiện đại');
  const [newGoal, setNewGoal] = useState('');

  const dbStats = storage.getDatabaseStats();

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = storage.addTopic({
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Tác giả dân gian / Chưa rõ',
      grade: newGrade,
      genre: newGenre,
      period: newPeriod,
      learningGoal:
        newGoal.trim() ||
        `Nắm vững giá trị nội dung, nghệ thuật và thông điệp của tác phẩm ${newTitle}.`,
      targetSkills: ['Đọc hiểu văn bản', 'Phân tích nhân vật', 'Nghị luận văn học'],
      tags: [newTitle, newAuthor, newGrade],
    });

    onTopicCreated(created);
    setShowNewTopicModal(false);
    setNewTitle('');
    setNewAuthor('');
    setNewGoal('');
  };

  const handleExportData = () => {
    const dataStr = storage.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nguvan10_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && storage.importAllData(content)) {
        onDataReset();
        setShowDataModal(false);
      }
    };
    reader.readAsText(file);
  };

  const stagesList = [
    {
      id: 'buoi1' as AppStage,
      title: 'Khởi tạo & Mục tiêu',
      shortTitle: 'Khởi tạo',
      icon: Target,
      activeColor: 'bg-blue-600 text-white font-semibold shadow-sm',
    },
    {
      id: 'buoi2' as AppStage,
      title: 'Kho Nguồn Học Liệu',
      shortTitle: 'Nguồn Học Liệu',
      icon: FileText,
      activeColor: 'bg-sky-600 text-white font-semibold shadow-sm',
    },
    {
      id: 'buoi3' as AppStage,
      title: 'Bộ Học Liệu AI (Study Pack)',
      shortTitle: 'Study Pack AI',
      icon: Sparkles,
      activeColor: 'bg-indigo-600 text-white font-semibold shadow-sm',
    },
    {
      id: 'buoi4' as AppStage,
      title: 'Ôn Tập & Luyện Quiz',
      shortTitle: 'Ôn Tập Quiz',
      icon: HelpCircle,
      activeColor: 'bg-emerald-600 text-white font-semibold shadow-sm',
    },
    {
      id: 'chatbot' as AppStage,
      title: 'Trợ Lý Grounded AI',
      shortTitle: 'Trợ Lý AI',
      icon: Bot,
      activeColor: 'bg-amber-600 text-white font-semibold shadow-sm',
    },
    {
      id: 'docs' as AppStage,
      title: 'Hồ Sơ Kỹ Thuật (SRS & DB)',
      shortTitle: 'Hồ Sơ Kỹ Thuật',
      icon: FileCode2,
      activeColor: 'bg-slate-800 text-sky-300 font-semibold border border-blue-700 shadow-sm',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950 border-b border-blue-900/70 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand & Topic Selector */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 flex-shrink-0">
                10
              </div>
              <div className="hidden min-[380px]:block">
                <span className="font-bold text-base sm:text-lg text-sky-300 tracking-wide block leading-tight">
                  Ngữ Văn 10
                </span>
                <span className="hidden xl:inline-block text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-sky-400 border border-blue-800">
                  Ôn Tập Ngữ Văn
                </span>
              </div>
            </div>

            {/* Topic Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTopicMenu(!showTopicMenu)}
                className="flex items-center space-x-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-800 hover:border-sky-400/60 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-100 transition-all max-w-[150px] sm:max-w-[220px]"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 flex-shrink-0" />
                <span className="font-medium truncate">
                  {activeTopic ? activeTopic.title : 'Chọn chủ đề'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-sky-300 flex-shrink-0" />
              </button>

              {showTopicMenu && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-blue-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wider border-b border-blue-900 flex justify-between items-center">
                    <span>Chủ đề Ngữ văn ({topics.length})</span>
                    <button
                      onClick={() => {
                        setShowTopicMenu(false);
                        setShowNewTopicModal(true);
                      }}
                      className="text-sky-300 hover:text-white flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm</span>
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {topics.map((t, idx) => (
                      <button
                        key={`${t.id}_${idx}`}
                        onClick={() => {
                          onSelectTopic(t.id);
                          setShowTopicMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm flex items-start space-x-2 hover:bg-blue-950/80 transition-colors ${
                          activeTopic?.id === t.id ? 'bg-blue-900/60 text-sky-200' : 'text-slate-300'
                        }`}
                      >
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-950 text-sky-300 font-mono mt-0.5 border border-blue-800">
                          {t.grade}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{t.title}</p>
                          <p className="text-xs text-slate-400 truncate">{t.author}</p>
                        </div>
                        {activeTopic?.id === t.id && (
                          <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-blue-900 px-2 pt-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowTopicMenu(false);
                        onOpenSnapshotModal();
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-emerald-700/90 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors border border-emerald-500/50 shadow-xs"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-emerald-200" />
                      <span>💾 Quản Lý Save / Load Môn</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowTopicMenu(false);
                        setShowNewTopicModal(true);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-blue-600/30 text-sky-200 hover:bg-blue-600/50 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors border border-blue-500/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tạo tác phẩm / chủ đề mới</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation with Feature Names */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-blue-900">
            {stagesList.map((stage) => {
              const IconComp = stage.icon;
              const isActive = currentStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => onSelectStage(stage.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive ? stage.activeColor : 'text-slate-300 hover:text-white hover:bg-blue-950/60'
                  }`}
                  title={stage.title}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-sky-400'}`} />
                  <span className="whitespace-nowrap">{stage.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Storage & Tools Controls */}
          <div className="flex items-center space-x-2">
            {/* Gemini API Key Settings Button */}
            {onOpenApiKeyModal && (
              <button
                onClick={onOpenApiKeyModal}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-xs ${
                  storage.hasLocalApiKey()
                    ? 'bg-blue-950/90 hover:bg-blue-900 border-blue-700 text-sky-200'
                    : 'bg-amber-950/80 hover:bg-amber-900 border-amber-700 text-amber-200 animate-pulse'
                }`}
                title="Cấu hình Gemini API Key cá nhân (Local-Only Round 5)"
              >
                <Key className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">
                  {storage.hasLocalApiKey() ? 'API Key: Active' : 'Cài Key Gemini'}
                </span>
              </button>
            )}

            {/* Server status pill */}
            <div
              className={`hidden md:flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border ${
                serverStatus.hasApiKey || storage.hasLocalApiKey()
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-800 text-amber-300'
              }`}
              title={
                serverStatus.hasApiKey || storage.hasLocalApiKey()
                  ? 'Gemini 3.7 Flash API đang kết nối'
                  : 'Chạy chế độ Semantic Engine nội bộ + Gemini Proxy'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  serverStatus.hasApiKey || storage.hasLocalApiKey() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="hidden xl:inline">{serverStatus.hasApiKey || storage.hasLocalApiKey() ? 'Gemini 3.7 Online' : 'Semantic Engine'}</span>
            </div>

            {/* Save / Load Working Copy Snapshot Button */}
            <button
              onClick={onOpenSnapshotModal}
              className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/80 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Lưu hoặc mở bản sao working copy (Tác phẩm, Nguồn, AI Preview, Study Pack)"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">Save/Load Môn</span>
            </button>

            {/* LocalStorage Inspector Trigger */}
            <button
              onClick={() => setShowDataModal(true)}
              className="flex items-center space-x-1.5 bg-blue-950 hover:bg-blue-900 border border-blue-800 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg text-xs transition-colors"
              title="Quản lý dữ liệu LocalStorage"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Data:</span>
              <span className="font-mono text-sky-300 font-semibold">{dbStats.formattedSize}</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-blue-950 border border-blue-800 text-sky-300 hover:text-white focus:outline-none"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Horizontal Scroll Tab Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1.5 border-t border-blue-900/80 scrollbar-none">
          {stagesList.map((stage) => {
            const IconComp = stage.icon;
            const isActive = currentStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(stage.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? stage.activeColor
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-850'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{stage.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-50 bg-slate-950/95 backdrop-blur-md p-4 space-y-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="space-y-1">
            <p className="text-xs font-bold text-sky-400 uppercase tracking-wider px-2 mb-2">
              DANH MỤC TÍNH NĂNG HỌC TẬP
            </p>
            {stagesList.map((stage) => {
              const IconComp = stage.icon;
              const isActive = currentStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    onSelectStage(stage.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-blue-900/80 border-blue-600 text-white font-bold'
                      : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-sky-400'}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold block">{stage.title}</span>
                      <span className="text-xs text-slate-400">Chuyển sang màn hình này</span>
                    </div>
                  </div>
                  {isActive && <CheckCircle2 className="w-5 h-5 text-sky-400" />}
                </button>
              );
            })}
          </div>

          {/* Quick Actions in Mobile Drawer */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSnapshotModal();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md"
            >
              <HardDrive className="w-4 h-4 text-emerald-200" />
              <span>💾 Quản Lý Save / Load Môn Học</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowNewTopicModal(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo tác phẩm / chủ đề mới</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowDataModal(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium flex items-center justify-center space-x-2 border border-slate-700"
            >
              <Database className="w-4 h-4 text-sky-400" />
              <span>Quản lý dữ liệu LocalStorage ({dbStats.formattedSize})</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Tạo Chủ Đề Mới */}
      {showNewTopicModal && (
        <div
          onClick={() => setShowNewTopicModal(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border border-stone-750 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-stone-100"
          >
            <h3 className="text-lg font-serif font-bold text-amber-400 mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Thêm Tác Phẩm / Chủ Đề Ngữ Văn Mới</span>
            </h3>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">
                  Tên Tác Phẩm / Chuyên đề *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thu Đứng (Thu Điếu), Truyện Kiều, Cảnh ngày hè..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">Tác giả</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Khuyến, Nguyễn Du..."
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">Cấp lớp</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as GradeLevel)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Lớp 7">Lớp 7</option>
                    <option value="Lớp 8">Lớp 8</option>
                    <option value="Lớp 9">Lớp 9</option>
                    <option value="Lớp 10">Lớp 10</option>
                    <option value="Lớp 11">Lớp 11</option>
                    <option value="Lớp 12">Lớp 12</option>
                    <option value="Luyện thi">Luyện thi ĐH / HSG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">Thể loại</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Thơ trữ tình, Truyện ngắn..."
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-1">Giai đoạn</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 1945-1975, Trung đại..."
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-400 mb-1">
                  Mục tiêu học tập chính
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Phân tích bức tranh thu làng quê Bắc Bộ và nỗi lòng ưu thời mẫn thế trong tác phẩm Thu Đứng..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowNewTopicModal(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-sm font-semibold transition-colors"
                >
                  Tạo chủ đề & Bắt đầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quản trị LocalStorage */}
      {showDataModal && (
        <div
          onClick={() => setShowDataModal(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-stone-900 border border-stone-750 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-stone-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-amber-400 flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Quản Trị Cơ Sở Dữ Liệu LocalStorage</span>
              </h3>
              <button
                onClick={() => setShowDataModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-4 mb-4 border border-slate-700 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Dung lượng đã sử dụng:</span>
                <span className="font-mono text-sky-400 font-bold">{dbStats.formattedSize}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Số lượng tác phẩm/chủ đề:</span>
                <span className="font-mono text-slate-100">{dbStats.topicsCount}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Số nguồn học liệu:</span>
                <span className="font-mono text-slate-100">{dbStats.sourcesCount}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Bộ Study Pack đã khởi tạo:</span>
                <span className="font-mono text-slate-100">{dbStats.studyPacksCount}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleExportData}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Sao lưu dữ liệu ra file JSON (Export)</span>
              </button>

              <label className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium flex items-center justify-center space-x-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Khởi phục từ file JSON (Import)</span>
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>

              <button
                onClick={() => {
                  if (confirm('Bạn có chắc muốn khôi phục toàn bộ CSDL về dữ liệu mẫu mặc định?')) {
                    storage.resetToDefaults();
                    onDataReset();
                    setShowDataModal(false);
                  }
                }}
                className="w-full py-2 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800 text-rose-300 text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Khôi phục CSDL gốc (Reset Default Database)</span>
              </button>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setShowDataModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
