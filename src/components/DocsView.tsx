import { useState } from 'react';
import {
  FileCode2,
  Layers,
  Database,
  FileText,
  Copy,
  Check,
  Download,
  Terminal,
  Cpu,
  Server,
  Monitor,
  HardDrive,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { DocsTab } from '../types';
import { storage } from '../services/storage';

interface DocsViewProps {
  initialTab?: DocsTab;
}

export function DocsView({ initialTab = 'architecture' }: DocsViewProps) {
  const [activeTab, setActiveTab] = useState<DocsTab>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const stats = storage.getDatabaseStats();
  const rawExport = storage.exportAllData();

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/50 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Fullstack Technical Documentation
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                SRS + Architecture + LocalStorage Schema
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
              3 Hồ Sơ Kỹ Thuật & Tài Liệu Thiết Kế Hệ Thống
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl mt-1">
              Được biên soạn đầy đủ theo chuẩn Fullstack Developer, bao gồm Sơ đồ kiến trúc luồng dữ liệu, Tài liệu đặc tả chức năng 3 giai đoạn và Cấu trúc cơ sở dữ liệu lưu trữ trong LocalStorage.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-blue-100 shadow-xs space-x-2">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'architecture'
              ? 'bg-blue-600 text-white shadow shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Sơ Đồ Kiến Trúc Hệ Thống</span>
        </button>

        <button
          onClick={() => setActiveTab('srs')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'srs'
              ? 'bg-blue-600 text-white shadow shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>2. Tài Liệu Đặc Tả Chức Năng (SRS)</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'database'
              ? 'bg-blue-600 text-white shadow shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>3. Cấu Trúc CSDL LocalStorage</span>
        </button>
      </div>

      {/* 1. SƠ ĐỒ KIẾN TRÚC HỆ THỐNG */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Interactive Visual SVG Diagram */}
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-blue-950 mb-4 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Sơ Đồ Luồng Kiến Trúc Tổng Thể (System Architecture Flow)</span>
            </h3>

            {/* Architecture Visual Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Box 1: Client Tier */}
              <div className="p-5 rounded-xl border-2 border-sky-300 bg-sky-50/40 space-y-3">
                <div className="flex items-center space-x-2 text-sky-900">
                  <Monitor className="w-5 h-5" />
                  <h4 className="font-bold text-sm">TẦNG TRÌNH DIỄN (CLIENT)</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Công nghệ:</strong> React 19 + TypeScript + Tailwind CSS + Motion + Canvas Confetti.
                </p>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• Giai đoạn 1: App Shell & Hồ sơ Chủ đề v0.1</li>
                  <li>• Giai đoạn 2: Trình nạp học liệu Text-First & Màn hình AI Preview</li>
                  <li>• Giai đoạn 3: Study Pack đa phương thức, Flashcard 3D & AI Mentor</li>
                </ul>
              </div>

              {/* Box 2: Server Tier */}
              <div className="p-5 rounded-xl border-2 border-blue-300 bg-blue-50/40 space-y-3">
                <div className="flex items-center space-x-2 text-blue-900">
                  <Server className="w-5 h-5" />
                  <h4 className="font-bold text-sm">TẦNG XỬ LÝ (SERVER PROXY)</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Công nghệ:</strong> Express.js (Node.js) + Vite Middleware + Google GenAI SDK.
                </p>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• <code>POST /api/ai/preview</code>: Phân tích bóc tách ý chính, từ khóa</li>
                  <li>• <code>POST /api/ai/studypack</code>: Sinh trắc nghiệm 4 dạng, tóm tắt, flashcard</li>
                  <li>• <code>POST /api/ai/chat</code>: Cố vấn Ngữ văn theo chuẩn sư phạm UNESCO</li>
                </ul>
              </div>

              {/* Box 3: Storage Tier */}
              <div className="p-5 rounded-xl border-2 border-emerald-300 bg-emerald-50/40 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-900">
                  <HardDrive className="w-5 h-5" />
                  <h4 className="font-bold text-sm">TẦNG LƯU TRỮ (STORAGE)</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Công nghệ:</strong> Web Storage API (LocalStorage Engine v1) + JSON Serialization.
                </p>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  <li>• <code>vanviet_topics_v1</code>: Danh mục tác phẩm</li>
                  <li>• <code>vanviet_sources_v1</code>: Nguồn Text, Ảnh, URL</li>
                  <li>• <code>vanviet_studypacks_v1</code>: Toàn bộ Study Pack & Human edits</li>
                </ul>
              </div>
            </div>

            {/* Markdown Representation of Architecture */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-5 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 relative">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800 text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>ARCHITECTURE_DIAGRAM.md</span>
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      `# KIẾN TRÚC HỆ THỐNG VĂN VIỆT AI

+-------------------------------------------------------------------------------+
|                             CLIENT-SIDE LAYER (React 19 + Vite)               |
|                                                                               |
|  [Buổi 1: App Shell] ---> [Buổi 2: Nguồn & Preview] ---> [Buổi 3: Study Pack] |
|   - Tác phẩm & Mục tiêu     - CRUD Sources (Text/Img/URL)  - Summary & Context|
|   - Định hướng UNESCO       - Màn hình AI đã hiểu gì       - Luận điểm (5 nhóm|
|                                                            - 4 Dạng câu hỏi   |
|                                                            - Flashcard 3D     |
|                                                            - Q&A Seed & Chat  |
+-------------------------------------------------------------------------------+
                                      |
                     REST API Calls   |   Local Storage Engine
                     (JSON Payload)   |   (Sync / Async Adapter)
                                      v
+-------------------------------------------------------------------------------+
|                        EXPRESS SERVER & GEMINI AI LAYER                       |
|                                                                               |
|   [server.ts] (Port 3000)                                                     |
|     ├── POST /api/ai/preview     --> Google GenAI (gemini-3.6-flash)          |
|     ├── POST /api/ai/studypack   --> JSON Structured Schema Output            |
|     └── POST /api/ai/chat        --> UNESCO Sư phạm Prompt Pipeline           |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                       PERSISTENCE LAYER (LOCALSTORAGE)                        |
|                                                                               |
|   - vanviet_topics_v1        : Danh mục chủ đề, tác phẩm                      |
|   - vanviet_sources_v1       : Nguồn trích đoạn văn bản, mô tả ảnh, link web  |
|   - vanviet_previews_v1      : Ý chính, từ khóa, phạm vi, lỗ hổng             |
|   - vanviet_studypacks_v1    : Tóm tắt, keyPoints, questions, flashcards, Q&A |
|   - vanviet_quiz_attempts_v1 : Lịch sử làm bài và điểm số                     |
+-------------------------------------------------------------------------------+`,
                      'arch_md'
                    )
                  }
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center space-x-1"
                >
                  {copiedKey === 'arch_md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'arch_md' ? 'Đã sao chép' : 'Sao chép MD'}</span>
                </button>
              </div>
              <pre className="text-slate-300 whitespace-pre">
{`+-------------------------------------------------------------------------------+
|                             CLIENT-SIDE LAYER (React 19 + Vite)               |
|                                                                               |
|  [Buổi 1: App Shell] ---> [Buổi 2: Nguồn & Preview] ---> [Buổi 3: Study Pack] |
|   - Tác phẩm & Mục tiêu     - CRUD Sources (Text/Img/URL)  - Summary & Context|
|   - Định hướng UNESCO       - Màn hình AI đã hiểu gì       - Luận điểm (5 nhóm|
|                                                            - 4 Dạng câu hỏi   |
|                                                            - Flashcard 3D     |
|                                                            - Q&A Seed & Chat  |
+-------------------------------------------------------------------------------+
                                      |
                     REST API Calls   |   Local Storage Engine
                     (JSON Payload)   |   (Sync / Async Adapter)
                                      v
+-------------------------------------------------------------------------------+
|                        EXPRESS SERVER & GEMINI AI LAYER                       |
|                                                                               |
|   [server.ts] (Port 3000)                                                     |
|     ├── POST /api/ai/preview     --> Google GenAI (gemini-3.6-flash)          |
|     ├── POST /api/ai/studypack   --> JSON Structured Schema Output            |
|     └── POST /api/ai/chat        --> UNESCO Sư phạm Prompt Pipeline           |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
|                       PERSISTENCE LAYER (LOCALSTORAGE)                        |
|                                                                               |
|   - vanviet_topics_v1        : Danh mục chủ đề, tác phẩm                      |
|   - vanviet_sources_v1       : Nguồn trích đoạn văn bản, mô tả ảnh, link web  |
|   - vanviet_previews_v1      : Ý chính, từ khóa, phạm vi, lỗ hổng             |
|   - vanviet_studypacks_v1    : Tóm tắt, keyPoints, questions, flashcards, Q&A |
|   - vanviet_quiz_attempts_v1 : Lịch sử làm bài và điểm số                     |
+-------------------------------------------------------------------------------+`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 2. TÀI LIỆU ĐẶC TẢ CHỨC NĂNG (SRS) */}
      {activeTab === 'srs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-blue-100">
              <div>
                <h3 className="text-base font-bold text-blue-950">
                  Tài Liệu Đặc Tả Chức Năng (Software Requirements Specification - SRS)
                </h3>
                <p className="text-xs text-slate-500">
                  Chuẩn hóa theo 3 giai đoạn Level 2 của chương trình AI4Learn
                </p>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    `# TÀI LIỆU ĐẶC TẢ CHỨC NĂNG (SRS) - VĂN VIỆT AI

## 1. GIAI ĐOẠN 1 (BUỔI 1): KHỞI TẠO NỀN TẢNG V0.1
- **FR-1.1**: Định danh tác phẩm/chủ đề văn học (Tên, tác giả, thể loại, giai đoạn, cấp lớp).
- **FR-1.2**: Xác lập mục tiêu học tập & khung kỹ năng tiếp thu (Phân tích nhân vật, Cảm thụ nghệ thuật).
- **FR-1.3**: Thiết lập khung đạo đức học đường UNESCO (Chống gian lận, AI hỗ trợ học thật).
- **FR-1.4**: Bố trí placeholder cho các thành phần mở rộng tiếp theo.

## 2. GIAI ĐOẠN 2 (BUỔI 2): NGUỒN HỌC LIỆU & AI PREVIEW
- **FR-2.1**: Hỗ trợ 3 định dạng nguồn: Text-First (văn bản trích đoạn), Image (sơ đồ tư duy/OCR), URL (bài nghiên cứu).
- **FR-2.2**: Đầy đủ tính năng CRUD Nguồn học liệu (Create, Read, Update, Delete).
- **FR-2.3**: Màn hình "AI đã hiểu gì": Trích xuất Ý chính (Core Concepts), Từ khóa (Keywords), Phạm vi (Scope) và Lỗ hổng kiến thức (Gaps).
- **FR-2.4**: Tự động đồng bộ nguồn và bản preview vào LocalStorage.

## 3. GIAI ĐOẠN 3 (BUỔI 3): AI CONTENT GENERATION & STUDY PACK
- **FR-3.1 (Tóm tắt)**: Bản tóm tắt tác phẩm, hoàn cảnh sáng tác, giá trị hiện thực/nhân đạo, mạch cốt truyện.
- **FR-3.2 (Luận điểm)**: 5 nhóm luận điểm chuẩn sư phạm kèm trích dẫn dẫn chứng văn học.
- **FR-3.3 (Câu hỏi 4 dạng)**: Đúng/Sai, Trắc nghiệm ABCD, Điền từ ngắn, Hỏi-đáp ngắn đọc hiểu có barem chấm.
- **FR-3.4 (Flashcard 3D)**: Thẻ ghi nhớ lật 2 mặt, đánh dấu Đã thuộc / Cần ôn lại.
- **FR-3.5 (Q&A Seed & AI Mentor)**: Hạt giống gợi mở tư duy chiều sâu + Chatbot cố vấn sư phạm không giải hộ bài.
- **FR-3.6 (Human-in-the-loop)**: Học sinh được phép trực tiếp sửa đổi, xóa, thêm mới mọi nội dung AI sinh ra.`,
                    'srs_md'
                  )
                }
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center space-x-1.5"
              >
                {copiedKey === 'srs_md' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'srs_md' ? 'Đã chép SRS' : 'Sao chép SRS'}</span>
              </button>
            </div>

            {/* SRS Structured Accordion / Cards */}
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/80 space-y-2">
                <h4 className="font-bold text-blue-950 text-sm">
                  1. Phân Hệ Buổi 1: Khởi Tạo Nền Tảng (App Shell & Scope Locking)
                </h4>
                <ul className="space-y-1.5 text-slate-700">
                  <li>• <strong>Mục tiêu:</strong> Khóa đúng phạm vi v0.1, chỉ khởi tạo 1 môn/chủ đề thật, không làm giả mạo hay lan man.</li>
                  <li>• <strong>Yêu cầu chức năng:</strong> Chọn/Tạo hồ sơ tác phẩm, định nghĩa mục tiêu sư phạm, xác lập ranh giới đạo đức UNESCO.</li>
                  <li>• <strong>Tiêu chí nghiệm thu:</strong> Có app shell hoàn chỉnh, giao diện tối ưu học đường, không tạo chatbot giả hay dữ liệu rác.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">
                  2. Phân Hệ Buổi 2: Nguồn Học Liệu (Text-First) & AI Preview
                </h4>
                <ul className="space-y-1.5 text-slate-700">
                  <li>• <strong>Mục tiêu:</strong> Quản lý nguồn học liệu bám sát nguyên tắc Text-first (nguồn ổn định nhất), OCR ảnh & URL tài liệu.</li>
                  <li>• <strong>Yêu cầu chức năng:</strong> CRUD nguồn học liệu, màn hình preview "AI đã hiểu gì" (Ý chính, Từ khóa, Phạm vi, Lỗ hổng).</li>
                  <li>• <strong>Tiêu chí nghiệm thu:</strong> Lưu trữ bền vững LocalStorage, cho phép người dùng nhận diện chỗ AI hiểu chưa đúng để bổ sung nguồn.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">
                  3. Phân Hệ Buổi 3: AI Content Generation & Study Pack Đa Phương Thức
                </h4>
                <ul className="space-y-1.5 text-slate-700">
                  <li>• <strong>Mục tiêu:</strong> Tạo Study Pack toàn diện "học được thật", không chỉ lặp từ khóa bề nổi.</li>
                  <li>• <strong>Yêu cầu chức năng:</strong> Sinh Tóm tắt, 5 nhóm Luận điểm có trích dẫn, Bộ câu hỏi 4 dạng tương tác (Đ/S, ABCD, Điền từ, Tự luận), Flashcard 3D, Q&A Seed & Chat AI Mentor.</li>
                  <li>• <strong>Human-in-the-loop:</strong> Học sinh và giáo viên làm chủ hoàn toàn nội dung, có quyền sửa/xóa/thêm và ký biên bản thẩm định.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CẤU TRÚC CƠ SỞ DỮ LIỆU LOCALSTORAGE */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-100">
              <div>
                <h3 className="text-base font-bold text-blue-950">
                  Cấu Trúc Cơ Sở Dữ Liệu LocalStorage (Data Dictionary & Inspector)
                </h3>
                <p className="text-xs text-slate-500">
                  Dung lượng hiện tại: <span className="font-mono text-blue-700 font-bold">{stats.formattedSize}</span> — {stats.topicsCount} chủ đề, {stats.sourcesCount} nguồn, {stats.studyPacksCount} Study Packs
                </p>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    `# CẤU TRÚC DỮ LIỆU LOCALSTORAGE (SCHEMA DEFINITION)

1. Key: "vanviet_topics_v1"
   - Type: Array<Topic>
   - Schema: { id: string, title: string, author: string, grade: string, genre: string, period: string, learningGoal: string, targetSkills: string[], tags: string[], createdAt: string, updatedAt: string }

2. Key: "vanviet_sources_v1"
   - Type: Array<SourceItem>
   - Schema: { id: string, topicId: string, type: 'text' | 'image' | 'url', title: string, content: string, meta: { imageDesc?: string, urlDomain?: string, originalUrl?: string, wordCount?: number }, createdAt: string, updatedAt: string }

3. Key: "vanviet_previews_v1"
   - Type: Record<topicId, AIPreview>
   - Schema: { topicId: string, coreConcepts: string[], keywords: string[], scopeAndGenre: string, notesAndGaps: string[], generatedAt: string }

4. Key: "vanviet_studypacks_v1"
   - Type: Record<topicId, StudyPack>
   - Schema: {
       id: string,
       topicId: string,
       summary: { shortSummary: string, historicalContext: string, coreValues: string, plotStructure: string[] },
       keyPoints: Array<{ id: string, category: string, title: string, description: string, quote?: string, isUserModified?: boolean }>,
       questions: Array<{ id: string, type: 'true_false' | 'multiple_choice' | 'fill_in_blank' | 'short_answer', question: string, options?: string[], correctAnswer: string, explanation: string, difficulty: string, contextClue?: string }>,
       flashcards: Array<{ id: string, front: string, back: string, category: string, mastered: boolean }>,
       qaSeeds: Array<{ id: string, question: string, answer: string, criticalThinkingTip: string }>,
       ethicsChecklist: { isHumanVerified: boolean, verifiedNotes?: string, verifiedDate?: string, aiGeneratedNotice: string }
     }

5. Key: "vanviet_active_topic_id_v1"
   - Type: string (Active Topic ID)

6. Key: "vanviet_quiz_attempts_v1"
   - Type: Record<topicId, Array<UserQuizAttempt>>`,
                    'db_schema_md'
                  )
                }
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center space-x-1.5"
              >
                {copiedKey === 'db_schema_md' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'db_schema_md' ? 'Đã chép Schema' : 'Sao chép Schema'}</span>
              </button>
            </div>

            {/* Data Dictionary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono space-y-1.5">
                <p className="text-blue-800 font-bold">1. vanviet_topics_v1</p>
                <p className="text-slate-600">Array&lt;Topic&gt; — Quản lý danh mục tác phẩm và định hướng học tập.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono space-y-1.5">
                <p className="text-blue-800 font-bold">2. vanviet_sources_v1</p>
                <p className="text-slate-600">Array&lt;SourceItem&gt; — Chứa học liệu văn bản, mô tả ảnh OCR và URL.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono space-y-1.5">
                <p className="text-blue-800 font-bold">3. vanviet_previews_v1</p>
                <p className="text-slate-600">Record&lt;topicId, AIPreview&gt; — Lưu kết quả bóc tách ý chính và từ khóa.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono space-y-1.5">
                <p className="text-blue-800 font-bold">4. vanviet_studypacks_v1</p>
                <p className="text-slate-600">Record&lt;topicId, StudyPack&gt; — Toàn bộ Study Pack, câu hỏi, flashcard.</p>
              </div>
            </div>

            {/* Live Raw JSON Viewer */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">Dữ Liệu JSON Thực Tế Trong LocalStorage (Live Payload):</span>
                <button
                  onClick={() => handleCopy(rawExport, 'raw_json')}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                >
                  {copiedKey === 'raw_json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Sao chép toàn bộ JSON</span>
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800">
                <pre>{rawExport}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
