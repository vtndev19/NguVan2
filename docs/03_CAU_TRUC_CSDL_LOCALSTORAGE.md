# CẤU TRÚC CƠ SỞ DỮ LIỆU LOCALSTORAGE (DATABASE SCHEMA & DATA DICTIONARY)
## Nền Tảng Ôn Tập Ngữ Văn Thông Minh — Văn Việt AI

---

### 1. TỔNG QUAN CHIẾN LƯỢC LƯU TRỮ (STORAGE STRATEGY)

Hệ thống sử dụng **HTML5 Web Storage API (`localStorage`)** làm cơ sở dữ liệu chính phía máy trạm (Client-Side Storage Engine) với các ưu điểm:
1. **Zero-Latency:** Đọc và ghi đồng bộ tức thì, không phát sinh độ trễ mạng.
2. **Local-First & Offline-Capable:** Học sinh có thể ôn tập bất cứ lúc nào ngay cả khi offline.
3. **Data Privacy:** Toàn bộ ghi chú, câu trả lời và tác phẩm của học sinh được bảo mật hoàn toàn trên thiết bị cá nhân.
4. **Namespace Versioning:** Sử dụng tiền tố `vanviet_*_v1` để quản lý phiên bản schema, dễ dàng nâng cấp hoặc di trú dữ liệu trong tương lai.

---

### 2. TỪ ĐIỂN DỮ LIỆU & CẤU TRÚC BẢNG (DATA DICTIONARY)

#### Bảng 1: `vanviet_topics_v1`
*Quản lý danh mục các tác phẩm / chủ đề văn học học sinh đang ôn tập.*

- **Kiểu dữ liệu:** `Array<Topic>`
- **Định dạng JSON Schema:**
```typescript
interface Topic {
  id: string;              // Khóa chính (UUID / slug, ví dụ: 'lao-hac')
  title: string;           // Tên tác phẩm / bài học (ví dụ: 'Lão Hạc')
  author: string;          // Tên tác giả (ví dụ: 'Nam Cao')
  grade: GradeLevel;       // 'Lớp 7' | 'Lớp 8' | 'Lớp 9' | 'Lớp 10' | 'Lớp 11' | 'Lớp 12' | 'Luyện thi'
  genre: string;           // Thể loại (ví dụ: 'Truyện ngắn hiện thực phê phán')
  period: string;          // Giai đoạn văn học (ví dụ: 'Văn học hiện thực 1930 - 1945')
  learningGoal: string;    // Mục tiêu học tập trọng tâm do người học xác lập
  targetSkills: string[];  // Danh sách kỹ năng tiếp thu (ví dụ: ['Phân tích nhân vật', 'Nghị luận'])
  tags: string[];          // Nhãn phân loại
  createdAt: string;       // ISO 8601 Timestamp
  updatedAt: string;       // ISO 8601 Timestamp
}
```

---

#### Bảng 2: `vanviet_sources_v1`
*Quản lý toàn bộ nguồn học liệu đã nạp (Văn bản trích đoạn, Ảnh sơ đồ tư duy, URL tham khảo).*

- **Kiểu dữ liệu:** `Array<SourceItem>`
- **Định dạng JSON Schema:**
```typescript
interface SourceItem {
  id: string;              // Khóa chính
  topicId: string;         // Khóa ngoại liên kết với Topic.id
  type: 'text' | 'image' | 'url'; // Phân loại nguồn học liệu
  title: string;           // Tiêu đề nguồn học liệu
  content: string;         // Nội dung văn bản trích đoạn hoặc trích lục OCR
  meta?: {
    imageDesc?: string;    // Mô tả chi tiết hình ảnh / sơ đồ tư duy
    urlDomain?: string;    // Tên miền trang web tham khảo
    originalUrl?: string;  // Đường dẫn URL đầy đủ
    wordCount?: number;    // Số lượng từ ước tính
  };
  createdAt: string;       // ISO 8601 Timestamp
  updatedAt: string;       // ISO 8601 Timestamp
}
```

---

#### Bảng 3: `vanviet_previews_v1`
*Lưu kết quả phân tích ngữ nghĩa "AI Đã Hiểu Gì" từ các nguồn đã nạp ở Buổi 2.*

- **Kiểu dữ liệu:** `Record<topicId, AIPreview>`
- **Định dạng JSON Schema:**
```typescript
interface AIPreview {
  topicId: string;         // Khóa ngoại liên kết Topic
  coreConcepts: string[];  // 3-5 ý chính cốt lõi được AI bóc tách
  keywords: string[];      // Danh sách từ khóa trọng tâm & biện pháp nghệ thuật
  scopeAndGenre: string;   // Nhận diện phạm vi kiến thức và đặc trưng thể loại
  notesAndGaps: string[];  // Các ghi chú và lỗ hổng kiến thức cần bổ sung
  generatedAt: string;     // ISO 8601 Timestamp
}
```

---

#### Bảng 4: `vanviet_studypacks_v1`
*Lưu trữ toàn bộ bộ học liệu Study Pack đa phương thức được sinh ở Buổi 3, bao gồm cả các chỉnh sửa của người học (Human-in-the-loop).*

- **Kiểu dữ liệu:** `Record<topicId, StudyPack>`
- **Định dạng JSON Schema:**
```typescript
interface StudyPack {
  id: string;              // Khóa chính Study Pack
  topicId: string;         // Khóa ngoại Topic
  summary: {
    shortSummary: string;       // Bản tóm tắt tác phẩm súc tích
    historicalContext: string;  // Hoàn cảnh sáng tác & bối cảnh lịch sử
    coreValues: string;         // Giá trị hiện thực và nhân đạo
    plotStructure: string[];    // Các bước phát triển cốt truyện & cảm xúc
  };
  keyPoints: Array<{
    id: string;
    category: 'Khái niệm & Bối cảnh' | 'Luận điểm Nội dung' | 'Nghệ thuật & Biện pháp' | 'Phân biệt & Mở rộng' | 'Lưu ý & Lỗi thường gặp';
    title: string;
    description: string;
    quote?: string;             // Trích dẫn dẫn chứng văn bản gốc
    isUserModified?: boolean;   // Đánh dấu người học đã tự tay hiệu đính
  }>;
  questions: Array<{
    id: string;
    type: 'true_false' | 'multiple_choice' | 'fill_in_blank' | 'short_answer';
    question: string;
    options?: string[];         // 4 lựa chọn nếu là trắc nghiệm ABCD
    correctAnswer: string;      // Đáp án chuẩn xác
    explanation: string;        // Giải thích sư phạm & barem chấm điểm
    difficulty: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';
    contextClue?: string;       // Gợi ý ngữ cảnh khi điền từ
  }>;
  flashcards: Array<{
    id: string;
    front: string;              // Mặt trước: Câu hỏi / Thuật ngữ / Chi tiết
    back: string;               // Mặt sau: Trả lời / Ý nghĩa / Phân tích
    category: string;           // Nhóm kiến thức
    mastered: boolean;          // Trạng thái đã thuộc hay chưa
  }>;
  qaSeeds: Array<{
    id: string;
    question: string;
    answer: string;
    criticalThinkingTip: string;// Gợi mở đào sâu tư duy phản biện
  }>;
  ethicsChecklist: {
    isHumanVerified: boolean;   // Học sinh đã thẩm định đối chiếu nguồn gốc
    verifiedNotes?: string;
    verifiedDate?: string;
    aiGeneratedNotice: string;  // Cảnh báo AI hỗ trợ - Học sinh chịu trách nhiệm
  };
  updatedAt: string;
}
```

---

#### Bảng 5: `vanviet_active_topic_id_v1`
- **Kiểu dữ liệu:** `string`
- **Ý nghĩa:** Lưu trữ ID của chủ đề tác phẩm đang được chọn hiện tại để tự động phục hồi phiên làm việc khi tải lại trang.

#### Bảng 6: `vanviet_quiz_attempts_v1`
- **Kiểu dữ liệu:** `Record<topicId, Array<UserQuizAttempt>>`
- **Ý nghĩa:** Lưu lịch sử các lần nộp bài trắc nghiệm, điểm số đạt được và thời điểm hoàn thành để theo dõi tiến độ tiến bộ của học sinh.

---

### 3. CÁC TIỆN ÍCH DỮ LIỆU (DATABASE UTILITIES)

1. **`storage.exportAllData()`**: Xuất toàn bộ CSDL ra định dạng file JSON hoàn chỉnh để sao lưu hoặc nộp bài tập.
2. **`storage.importData(jsonString)`**: Nhập phục hồi toàn bộ dữ liệu từ file backup với cơ chế kiểm tra tính hợp lệ của schema.
3. **`storage.resetToDefaults()`**: Khôi phục dữ liệu mẫu ban đầu (Lão Hạc, Chiếc thuyền ngoài xa, v.v.).
4. **`storage.getDatabaseStats()`**: Đo lường dung lượng byte và thống kê số lượng bản ghi của từng thực thể.
