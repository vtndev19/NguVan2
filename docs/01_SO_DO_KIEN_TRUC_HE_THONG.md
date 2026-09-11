# SƠ ĐỒ KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE DIAGRAM)
## Nền Tảng Ôn Tập Ngữ Văn Thông Minh — Văn Việt AI

---

### 1. Tổng Quan Kiến Trúc (Architecture Overview)

Hệ thống **Văn Việt AI** được thiết kế theo mô hình **Client-Server 3 tầng chuẩn mực (Modern 3-Tier Fullstack Architecture)** kết hợp với **Local-First Persistence Strategy**:

```
+-----------------------------------------------------------------------------------+
|                        TẦNG 1: TRÌNH DIỄN (CLIENT-SIDE SPA)                       |
|                                                                                   |
|  [Buổi 1: App Shell & Vision] -> [Buổi 2: Nguồn & Preview] -> [Buổi 3: Study Pack] |
|   - Định hình môn & Chủ đề     - CRUD Source Items (Text/Img)  - Tóm tắt tác phẩm |
|   - Khung năng lực sư phạm     - Màn hình "AI đã hiểu gì"      - 5 Nhóm Luận điểm |
|   - Tiêu chuẩn đạo đức UNESCO  - Text-First Ingestion          - Câu hỏi 4 dạng   |
|                                                                - Flashcard 3D     |
|                                                                - Q&A & AI Mentor  |
+-----------------------------------------------------------------------------------+
                                          |
                      (1) REST API        |       (2) Local Storage Engine
                      (JSON Over HTTP)    |       (CRUD Operations)
                                          v
+-----------------------------------------------------------------------------------+
|                     TẦNG 2: MÁY CHỦ PROXY & ĐIỀU PHỐI AI (SERVER)                 |
|                                                                                   |
|   [Express Server] (Port 3000 / tsx & esbuild)                                    |
|     ├── POST /api/ai/preview     -> Phân tích ngữ nghĩa, trích xuất ý chính/từ khóa|
|     ├── POST /api/ai/studypack   -> Sinh Study Pack đa phương thức có cấu trúc    |
|     ├── POST /api/ai/chat        -> Cố vấn văn học sư phạm (Socratic method)      |
|     └── Google GenAI SDK         -> Gemini 3.7 Flash Engine                       |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                   TẦNG 3: CƠ SỞ DỮ LIỆU & LƯU TRỮ (LOCALSTORAGE ENGINE)           |
|                                                                                   |
|   - vanviet_topics_v1        : Danh mục tác phẩm, cấp lớp, mục tiêu học tập       |
|   - vanviet_sources_v1       : Nguồn trích đoạn văn bản, mô tả ảnh, link web      |
|   - vanviet_previews_v1      : Ý chính, từ khóa, phạm vi, lỗ hổng kiến thức       |
|   - vanviet_studypacks_v1    : Tóm tắt, keyPoints, questions, flashcards, Q&A     |
|   - vanviet_quiz_attempts_v1 : Lịch sử làm bài, điểm số trắc nghiệm               |
+-----------------------------------------------------------------------------------+
```

---

### 2. Chi Tiết Các Phân Tầng Kỹ Thuật

#### A. Tầng Trình Diễn (Client Presentation Layer)
- **Công nghệ chính:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Phân hệ điều hướng:**
  1. `Buổi 1: Khởi tạo v0.1` — Thiết lập hồ sơ tác phẩm, mục tiêu học tập, năng lực tiếp thu.
  2. `Buổi 2: Nguồn học liệu & AI Preview` — Quản lý nguồn (Text, Ảnh sơ đồ, URL) và màn hình kiểm tra "AI đã hiểu gì".
  3. `Buổi 3: Study Pack` — Trình bày bản tóm tắt, 5 nhóm luận điểm, bộ câu hỏi 4 dạng tương tác, thẻ flashcard 3D và khung chat Cố vấn văn học AI.
  4. `Docs & DB Manager` — Sơ đồ kiến trúc, tài liệu SRS và trình quản lý cơ sở dữ liệu LocalStorage.

#### B. Tầng Máy Chủ Proxy & AI (Express & Gemini Orchestration)
- **Công nghệ chính:** Node.js, Express 4.x, TypeScript (`server.ts`), `@google/genai` SDK.
- **Bảo mật API Key:** Biến môi trường `GEMINI_API_KEY` được lưu hoàn toàn ở phía máy chủ backend, tuyệt đối không lộ ra trình duyệt.
- **Cơ chế Fallback thông minh:** Khi môi trường thiếu API key hoặc gặp sự cố mạng, máy chủ kích hoạt bộ sinh dữ liệu dự phòng chuẩn mực sư phạm (Pedagogical Fallback Engine), đảm bảo ứng dụng luôn phản hồi ổn định 100%.

#### C. Tầng Lưu Trữ Cục Bộ (LocalStorage Data Engine)
- **Đặc tính:** Local-First, không phụ thuộc kết nối internet để đọc/ghi dữ liệu đã học.
- **Dịch vụ quản lý (`src/services/storage.ts`):** Cung cấp các phương thức CRUD chuẩn hóa, validation dữ liệu và công cụ Export/Import JSON.

---

### 3. Quy Trình Luồng Dữ Liệu (Data Flow Lifecycle)

1. **Khởi tạo chủ đề (Buổi 1):** Người học chọn hoặc tạo tác phẩm -> Lưu vào `vanviet_topics_v1`.
2. **Nạp học liệu (Buổi 2):** Người học thêm các đoạn trích văn bản, mô tả ảnh hoặc link tài liệu -> Lưu vào `vanviet_sources_v1`.
3. **Phân tích AI Preview (Buổi 2):** Client gửi yêu cầu phân tích -> Server xử lý qua Gemini -> Trả về 4 nhóm thông tin -> Lưu vào `vanviet_previews_v1`.
4. **Sinh Study Pack (Buổi 3):** Server tổng hợp toàn bộ nguồn và sinh bộ học liệu -> Lưu vào `vanviet_studypacks_v1`.
5. **Học tập & Tương tác (Buổi 3):** Học sinh làm bài kiểm tra 4 dạng, lật flashcard, chỉnh sửa luận điểm -> Cập nhật trực tiếp vào LocalStorage.
6. **Thẩm định người học (Human Verification):** Học sinh xác nhận đã đối chiếu văn bản gốc theo chuẩn UNESCO.
