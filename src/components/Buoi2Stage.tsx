import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Eye,
  RefreshCw,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { Topic, SourceItem, SourceType, AIPreview } from '../types';
import { storage } from '../services/storage';
import { requestAIPreview } from '../services/api';

interface Buoi2StageProps {
  topic: Topic;
  sources: SourceItem[];
  preview: AIPreview | undefined;
  onSourcesUpdated: () => void;
  onPreviewUpdated: (preview: AIPreview) => void;
  onNextStage: () => void;
}

export function Buoi2Stage({
  topic,
  sources,
  preview,
  onSourcesUpdated,
  onPreviewUpdated,
  onNextStage,
}: Buoi2StageProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Add / Edit Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSource, setEditingSource] = useState<SourceItem | null>(null);
  const [viewingSource, setViewingSource] = useState<SourceItem | null>(null);

  // Form fields
  const [sourceType, setSourceType] = useState<SourceType>('text');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceContent, setSourceContent] = useState('');
  const [sourceImageDesc, setSourceImageDesc] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const filteredSources = sources.filter((s) => {
    const matchesType = filterType === 'all' || s.type === filterType;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingSource(null);
    setSourceType('text');
    setSourceTitle('');
    setSourceContent('');
    setSourceImageDesc('');
    setSourceUrl('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (src: SourceItem) => {
    setEditingSource(src);
    setSourceType(src.type);
    setSourceTitle(src.title);
    setSourceContent(src.content);
    setSourceImageDesc(src.meta?.imageDesc || '');
    setSourceUrl(src.meta?.originalUrl || '');
    setShowAddModal(true);
  };

  const handleSaveSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTitle.trim()) return;

    let finalContent = sourceContent.trim();
    if (sourceType === 'image' && !finalContent) {
      finalContent = sourceImageDesc.trim() || 'Hình ảnh sơ đồ tư duy / minh họa tác phẩm.';
    } else if (sourceType === 'url' && !finalContent) {
      finalContent = `Tài liệu tham khảo từ nguồn URL: ${sourceUrl}`;
    }

    const meta = {
      imageDesc: sourceType === 'image' ? sourceImageDesc : undefined,
      originalUrl: sourceType === 'url' ? sourceUrl : undefined,
      urlDomain: sourceType === 'url' ? extractDomain(sourceUrl) : undefined,
      wordCount: finalContent.split(/\s+/).length,
    };

    if (editingSource) {
      storage.updateSource(editingSource.id, {
        type: sourceType,
        title: sourceTitle.trim(),
        content: finalContent,
        meta,
      });
    } else {
      storage.addSource({
        topicId: topic.id,
        type: sourceType,
        title: sourceTitle.trim(),
        content: finalContent,
        meta,
      });
    }

    onSourcesUpdated();
    setShowAddModal(false);
  };

  const handleDeleteSource = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa nguồn học liệu này khỏi danh sách?')) {
      storage.deleteSource(id);
      onSourcesUpdated();
    }
  };

  const handleTriggerAIPreview = async () => {
    if (sources.length === 0) {
      alert('Vui lòng thêm ít nhất một nguồn học liệu trước khi kích hoạt AI phân tích.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await requestAIPreview(topic, sources);
      if (res.success && res.preview) {
        const saved = storage.setPreviewForTopic(topic.id, res.preview);
        onPreviewUpdated(saved);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractDomain = (urlStr: string) => {
    try {
      const url = new URL(urlStr);
      return url.hostname.replace('www.', '');
    } catch {
      return 'web-resource';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border border-blue-900 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/30">
                Buổi 2: Nguồn Học Liệu & Màn Hình Preview
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-950 text-slate-300 border border-blue-800">
                Text-First Architecture
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Nhập Học Liệu & Khám Phá "AI Đã Hiểu Gì"
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl mt-1">
              Quản lý toàn diện các nguồn học liệu (văn bản trích đoạn, ảnh sơ đồ, liên kết tài liệu). Kích hoạt AI phân tích để kiểm chứng độ hiểu của mô hình trước khi sinh Study Pack.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenAddModal}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center space-x-2 shadow-md shadow-blue-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm nguồn học liệu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Sources Management + AI Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Source Management (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-blue-100">
              <div>
                <h2 className="text-base font-bold text-blue-950 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-700" />
                  <span>Danh Sách Nguồn Học Liệu ({sources.length})</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Lưu trữ vĩnh viễn trên LocalStorage của trình duyệt
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterType === 'all' ? 'bg-white text-blue-950 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất cả ({sources.length})
                </button>
                <button
                  onClick={() => setFilterType('text')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterType === 'text' ? 'bg-white text-blue-950 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Text ({sources.filter((s) => s.type === 'text').length})
                </button>
                <button
                  onClick={() => setFilterType('image')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterType === 'image' ? 'bg-white text-blue-950 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ảnh ({sources.filter((s) => s.type === 'image').length})
                </button>
                <button
                  onClick={() => setFilterType('url')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filterType === 'url' ? 'bg-white text-blue-950 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  URL ({sources.filter((s) => s.type === 'url').length})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề hoặc nội dung nguồn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Source Items List */}
            {filteredSources.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Chưa có nguồn học liệu nào phù hợp</p>
                <p className="text-xs text-slate-400 mt-1">
                  Nhấn nút "Thêm nguồn học liệu" để bổ sung văn bản hoặc trích đoạn tác phẩm.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSources.map((src) => (
                  <div
                    key={src.id}
                    className="p-4 rounded-xl border border-slate-200 bg-sky-50/20 hover:bg-sky-50/50 hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 flex-shrink-0 mt-0.5">
                          {src.type === 'text' && <FileText className="w-4 h-4 text-blue-700" />}
                          {src.type === 'image' && <ImageIcon className="w-4 h-4 text-emerald-600" />}
                          {src.type === 'url' && <LinkIcon className="w-4 h-4 text-sky-600" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                src.type === 'text'
                                  ? 'bg-blue-100 text-blue-900'
                                  : src.type === 'image'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {src.type}
                            </span>
                            <h3 className="text-sm font-bold text-blue-950 truncate">
                              {src.title}
                            </h3>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                            {src.content}
                          </p>

                          <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                            {src.meta?.wordCount && (
                              <span>~{src.meta.wordCount} từ</span>
                            )}
                            {src.meta?.urlDomain && (
                              <span className="flex items-center space-x-1 text-sky-600">
                                <ExternalLink className="w-3 h-3" />
                                <span>{src.meta.urlDomain}</span>
                              </span>
                            )}
                            {src.meta?.imageDesc && (
                              <span className="text-emerald-700">Mô tả ảnh: Đã xử lý</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewingSource(src)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Xem chi tiết nội dung"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(src)}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                          title="Sửa nguồn"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSource(src.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Xóa nguồn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Screen Preview "AI ĐÃ HIỂU GÌ" (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-blue-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-blue-950">
                    Màn Hình: "AI Đã Hiểu Gì"
                  </h2>
                  <p className="text-xs text-slate-500">
                    Phân tích ngữ nghĩa & cấu trúc từ các nguồn đã nhập
                  </p>
                </div>
              </div>

              <button
                onClick={handleTriggerAIPreview}
                disabled={isAnalyzing}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>{isAnalyzing ? 'Đang phân tích...' : 'Phân tích AI'}</span>
              </button>
            </div>

            {preview ? (
              <div className="space-y-4 text-xs">
                {/* 1. Core Concepts */}
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/60">
                  <h3 className="font-bold text-blue-950 mb-2 flex items-center space-x-1.5 uppercase text-[11px] tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>1. Ý Chính Cốt Lõi (Core Concepts)</span>
                  </h3>
                  <ul className="space-y-1.5 text-slate-800">
                    {preview.coreConcepts.map((concept, idx) => (
                      <li key={idx} className="flex items-start space-x-2 leading-relaxed">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Keywords */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-2 uppercase text-[11px] tracking-wider">
                    2. Từ Khóa Trọng Tâm & Nghệ Thuật (Keywords)
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white text-blue-900 border border-blue-200 font-medium"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Scope & Genre */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-1 uppercase text-[11px] tracking-wider">
                    3. Phạm Vi Kiến Thức & Thể Loại
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{preview.scopeAndGenre}</p>
                </div>

                {/* 4. Knowledge Gaps / Notes */}
                <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5 uppercase text-[11px] tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 text-sky-600" />
                    <span>4. Ghi Chú & Lỗ Hổng Cần Bổ Sung</span>
                  </h3>
                  <ul className="space-y-1 text-slate-600">
                    {preview.notesAndGaps.map((note, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5 leading-relaxed">
                        <span className="text-slate-400">-</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-150">
                  <button
                    onClick={onNextStage}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all group"
                  >
                    <span>Sang Buổi 3: Tạo Study Pack từ nguồn này</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl">
                <Sparkles className="w-8 h-8 text-sky-400 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium text-slate-700">Chưa có kết quả phân tích AI</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Nhấn nút <strong>"Phân tích AI"</strong> ở trên để AI đọc hiểu các nguồn học liệu và trích xuất ý chính.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Thêm/Sửa Nguồn Học Liệu */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-blue-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100"
          >
            <h3 className="text-lg font-bold text-sky-300 mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{editingSource ? 'Chỉnh Sửa Nguồn Học Liệu' : 'Thêm Nguồn Học Liệu Mới'}</span>
            </h3>

            {/* Type selector tabs */}
            <div className="flex space-x-2 p-1 bg-slate-950 rounded-xl mb-4 border border-blue-900">
              <button
                type="button"
                onClick={() => setSourceType('text')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors ${
                  sourceType === 'text'
                    ? 'bg-blue-600 text-white font-semibold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Văn bản (Text)</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceType('image')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors ${
                  sourceType === 'image'
                    ? 'bg-blue-600 text-white font-semibold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Hình ảnh sơ đồ</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceType('url')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors ${
                  sourceType === 'url'
                    ? 'bg-blue-600 text-white font-semibold shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Liên kết URL</span>
              </button>
            </div>

            <form onSubmit={handleSaveSource} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Tiêu đề nguồn học liệu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trích đoạn đoạn 1, Phân tích diễn biến tâm lý, Sơ đồ tư duy..."
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-blue-900 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {sourceType === 'text' && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Nội dung văn bản trích dẫn *
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Dán văn bản tác phẩm, đoạn trích dẫn chứng hoặc lời bình..."
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                    className="w-full bg-slate-950 border border-blue-900 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-sans leading-relaxed resize-none"
                  />
                </div>
              )}

              {sourceType === 'image' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Mô tả nội dung hình ảnh / Sơ đồ tư duy *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Mô tả các nhánh sơ đồ, cấu trúc luận điểm trên ảnh..."
                      value={sourceImageDesc}
                      onChange={(e) => setSourceImageDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-blue-900 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Chi tiết văn bản nhận diện (OCR / Trích lục)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Nhập trích đoạn văn bản trong ảnh (nếu có)..."
                      value={sourceContent}
                      onChange={(e) => setSourceContent(e.target.value)}
                      className="w-full bg-slate-950 border border-blue-900 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {sourceType === 'url' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Địa chỉ liên kết URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://vanchuongviet.org/..."
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-blue-900 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Tóm lược nội dung tham khảo từ trang web
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Trích dẫn các luận điểm chính từ bài viết..."
                      value={sourceContent}
                      onChange={(e) => setSourceContent(e.target.value)}
                      className="w-full bg-slate-950 border border-blue-900 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t border-blue-900">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
                >
                  {editingSource ? 'Lưu thay đổi' : 'Thêm vào LocalStorage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Chi Tiết Nguồn */}
      {viewingSource && (
        <div
          onClick={() => setViewingSource(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-blue-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100"
          >
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-blue-900">
              <div>
                <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-blue-950 text-sky-300 border border-blue-800">
                  {viewingSource.type}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-2">
                  {viewingSource.title}
                </h3>
              </div>
              <button
                onClick={() => setViewingSource(null)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-blue-900 text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {viewingSource.content}
            </div>

            {viewingSource.meta?.originalUrl && (
              <div className="mt-3 text-xs text-sky-400 flex items-center space-x-1">
                <span>Nguồn URL:</span>
                <a
                  href={viewingSource.meta.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline truncate"
                >
                  {viewingSource.meta.originalUrl}
                </a>
              </div>
            )}

            <div className="mt-5 text-right">
              <button
                onClick={() => setViewingSource(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
