import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Edit3,
  CheckCircle,
  HelpCircle,
  FileText,
  Clock,
  Award,
  Sparkle,
} from 'lucide-react';
import { Topic, GradeLevel } from '../types';
import { storage } from '../services/storage';

interface Buoi1StageProps {
  topic: Topic | undefined;
  onTopicUpdated: (topic: Topic) => void;
  onNextStage: () => void;
}

export function Buoi1Stage({ topic, onTopicUpdated, onNextStage }: Buoi1StageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(topic?.title || '');
  const [editAuthor, setEditAuthor] = useState(topic?.author || '');
  const [editGrade, setEditGrade] = useState<GradeLevel>(topic?.grade || 'Lớp 10');
  const [editGenre, setEditGenre] = useState(topic?.genre || '');
  const [editPeriod, setEditPeriod] = useState(topic?.period || '');
  const [editGoal, setEditGoal] = useState(topic?.learningGoal || '');

  if (!topic) {
    return (
      <div className="p-12 text-center text-slate-500">
        Vui lòng chọn hoặc tạo một chủ đề/tác phẩm để bắt đầu.
      </div>
    );
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storage.updateTopic(topic.id, {
      title: editTitle.trim() || topic.title,
      author: editAuthor.trim() || topic.author,
      grade: editGrade,
      genre: editGenre.trim() || topic.genre,
      period: editPeriod.trim() || topic.period,
      learningGoal: editGoal.trim() || topic.learningGoal,
    });
    if (updated) {
      onTopicUpdated(updated);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner & Stage Mission */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border border-blue-900 rounded-2xl p-6 sm:p-8 text-slate-100 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-200 border border-sky-400/30">
              Buổi 1: Khởi Tạo Nền Tảng (Version 0.1)
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-950 text-slate-300 border border-blue-800">
              Khung Đề Cương & Mục Tiêu Học Tập
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              UNESCO Safe AI Framework
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
            Hệ Thống Ôn Tập Cá Nhân Môn Ngữ Văn Lớp 10
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
            Khởi tạo app shell v0.1 cho tác phẩm Ngữ văn 10 trọng tâm, xác lập rõ mục tiêu tiếp thu kiến thức, đối tượng học sinh Lớp 10 và các khung năng lực cốt lõi trước khi nạp học liệu và kích hoạt AI phân tích ở các buổi tiếp theo.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-900/80">
            <div>
              <p className="text-xs text-slate-400">Môn học / Cấp học</p>
              <p className="text-sm sm:text-base font-bold text-sky-300">Ngữ Văn Lớp 10 (THPT)</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Tác phẩm trọng tâm</p>
              <p className="text-sm sm:text-base font-bold text-white truncate">{topic.title}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Đối tượng tiếp cận</p>
              <p className="text-sm sm:text-base font-bold text-white">{topic.grade}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Tiến độ quy trình</p>
              <p className="text-sm sm:text-base font-bold text-emerald-400 flex items-center space-x-1">
                <span>Giai đoạn 1 / 3</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Topic Profile & UNESCO Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Topic Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-blue-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-blue-950">
                    Hồ Sơ Chủ Đề & Tác Phẩm Đang Học
                  </h2>
                  <p className="text-xs text-slate-500">
                    Thông tin định danh và bối cảnh tác phẩm đã cấu hình trong v0.1
                  </p>
                </div>
              </div>

              {!isEditing && (
                <button
                  onClick={() => {
                    setEditTitle(topic.title);
                    setEditAuthor(topic.author);
                    setEditGrade(topic.grade);
                    setEditGenre(topic.genre);
                    setEditPeriod(topic.period);
                    setEditGoal(topic.learningGoal);
                    setIsEditing(true);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-800 hover:bg-blue-50 hover:border-blue-400 text-xs font-medium transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chỉnh sửa hồ sơ</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tên Tác Phẩm / Chủ đề</label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tác giả</label>
                    <input
                      type="text"
                      required
                      value={editAuthor}
                      onChange={(e) => setEditAuthor(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Cấp lớp</label>
                    <select
                      value={editGrade}
                      onChange={(e) => setEditGrade(e.target.value as GradeLevel)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="Lớp 7">Lớp 7</option>
                      <option value="Lớp 8">Lớp 8</option>
                      <option value="Lớp 9">Lớp 9</option>
                      <option value="Lớp 10">Lớp 10</option>
                      <option value="Lớp 11">Lớp 11</option>
                      <option value="Lớp 12">Lớp 12</option>
                      <option value="Luyện thi">Luyện thi ĐH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Thể loại</label>
                    <input
                      type="text"
                      value={editGenre}
                      onChange={(e) => setEditGenre(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Giai đoạn văn học</label>
                    <input
                      type="text"
                      value={editPeriod}
                      onChange={(e) => setEditPeriod(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Mục tiêu học tập chính</label>
                  <textarea
                    rows={3}
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                  >
                    Lưu cập nhật
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-medium">
                          {topic.grade}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {topic.genre}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-blue-950 mt-2">
                        {topic.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-600">
                        Tác giả: <span className="text-blue-900 font-semibold">{topic.author}</span> — Thời kỳ: {topic.period}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Target Learning Goal */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span>Mục tiêu học tập & Tiếp thu</span>
                  </h4>
                  <p className="text-sm text-slate-800 bg-blue-50/60 p-3.5 rounded-xl border border-blue-200/60 leading-relaxed italic">
                    "{topic.learningGoal}"
                  </p>
                </div>

                {/* Target Skills */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Kỹ năng trọng tâm rèn luyện</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {topic.targetSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-sky-50 text-blue-900 border border-sky-200 text-xs font-medium flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Placeholders for upcoming stages */}
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-blue-950 mb-2 flex items-center space-x-2">
              <Sparkle className="w-4 h-4 text-blue-600" />
              <span>Cấu Trúc Khung Lộ Trình Phát Triển 3 Buổi (Milestone Progress)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Theo đúng quy tắc phân định phạm vi Buổi 1, các khối chức năng được bố trí dạng khung cấu trúc và sẽ kích hoạt tuần tự.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border-2 border-blue-500 bg-blue-50/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">BUỔI 1 (Hoàn thành)</span>
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs font-semibold text-slate-900">Khởi tạo App Shell & Mục tiêu</p>
                <p className="text-[11px] text-slate-600">Định hình chủ đề, thiết lập ranh giới sư phạm và khung UNESCO.</p>
              </div>

              <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-900">BUỔI 2</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-200 text-sky-900 font-semibold">Sẵn sàng</span>
                </div>
                <p className="text-xs font-semibold text-slate-900">Nhập Nguồn & AI Preview</p>
                <p className="text-[11px] text-slate-600">Text-first, OCR ảnh, URL & màn hình "AI đã hiểu gì".</p>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">BUỔI 3</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 font-semibold">Sẵn sàng</span>
                </div>
                <p className="text-xs font-semibold text-slate-900">Study Pack & Q&A Seed</p>
                <p className="text-[11px] text-slate-600">Tóm tắt, Luận điểm, 4 dạng trắc nghiệm/tự luận, Flashcard 3D.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: UNESCO Framework & Next Action */}
        <div className="space-y-6">
          {/* UNESCO Responsible AI Guidelines */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-blue-900 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-sky-300">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-base text-white">Bộ Tiêu Chuẩn UNESCO Trong Học Đường</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Văn Việt AI tuân thủ nguyên tắc giáo dục có trách nhiệm: AI là công cụ đồng hành hỗ trợ tư duy, không thay thế việc đọc tác phẩm gốc và không sản sinh văn mẫu sao chép.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-sky-400 font-bold">1.</span>
                <span><strong>Trách nhiệm giải trình của học sinh:</strong> Luôn đọc văn bản gốc và đối chiếu thông tin AI sinh ra.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-sky-400 font-bold">2.</span>
                <span><strong>Không học vẹt, sao chép:</strong> Nắm bắt luận điểm và nghệ thuật để tự viết bài theo cảm xúc cá nhân.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-sky-400 font-bold">3.</span>
                <span><strong>Bảo mật & Tôn trọng bản quyền:</strong> Chỉ nạp tài liệu trích dẫn học tập hợp pháp.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-blue-900/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Chuẩn mực: UNESCO AI Competencies</span>
              <span className="text-emerald-400">✓ Đã kích hoạt</span>
            </div>
          </div>

          {/* Action Card: Advance to Buoi 2 */}
          <div className="bg-gradient-to-br from-blue-900/10 via-sky-500/10 to-transparent rounded-2xl p-6 border border-blue-300/60 space-y-4">
            <div className="flex items-center space-x-2 text-blue-950">
              <Sparkles className="w-5 h-5 text-blue-700" />
              <h3 className="font-bold text-base text-blue-950">Tiếp tục sang Buổi 2</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Bạn đã hoàn thành việc xác định chủ đề và mục tiêu ở Buổi 1. Hãy chuyển sang Buổi 2 để nạp nguồn học liệu (văn bản, ảnh, tài liệu) và xem màn hình phân tích <strong>"AI đã hiểu gì"</strong>.
            </p>

            <button
              onClick={onNextStage}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 transition-all group"
            >
              <span>Chuyển sang Buổi 2: Nguồn & AI Preview</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
