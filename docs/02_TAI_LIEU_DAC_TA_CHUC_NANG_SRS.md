# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## Nền Tảng Ôn Tập Ngữ Văn Thông Minh — Văn Việt AI
*Tài liệu chuẩn hóa theo 3 giai đoạn phát triển Level 2 AI4Learn*

---

### 1. GIỚI THIỆU & MỤC TIÊU DỰ ÁN

- **Tên dự án:** Văn Việt AI – Smart Literature Learning & Study Pack Platform.
- **Mục tiêu:** Xây dựng nền tảng học tập cá nhân hóa môn Ngữ Văn cho học sinh THCS & THPT, tích hợp công nghệ trí tuệ nhân tạo Gemini 3.7 để đồng hành, phân tích và tạo bộ tài nguyên học tập đa phương thức, tuân thủ nguyên tắc giáo dục có trách nhiệm của UNESCO.
- **Đối tượng sử dụng:** Học sinh ôn thi chuyển cấp (Lớp 9 lên 10), học sinh THPT ôn thi Tốt nghiệp THPT Quốc gia, giáo viên Ngữ Văn.

---

### 2. ĐẶC TẢ YÊU CẦU CHỨC NĂNG THEO 3 GIAI ĐOẠN

#### Giai Đoạn 1 (Buổi 1): Khởi Tạo Nền Tảng (App Shell & Scope Locking)
- **FR-1.1: Quản lý hồ sơ tác phẩm:** Cho phép định danh tác phẩm với các trường: Tên bài học, Tác giả, Cấp lớp (Lớp 7 - Luyện thi ĐH), Thể loại (Truyện ngắn, Thơ, Ký...), Giai đoạn văn học.
- **FR-1.2: Thiết lập mục tiêu học tập:** Người học nhập mục tiêu cần đạt (ví dụ: *Nắm vững vẻ đẹp nhân cách Lão Hạc, bi kịch người nông dân trước cách mạng*).
- **FR-1.3: Khung kỹ năng tiếp thu:** Hiển thị và tùy chỉnh các kỹ năng cốt lõi: Phân tích nhân vật, Cảm thụ nghệ thuật, Đọc hiểu văn bản, Nghị luận xã hội liên hệ.
- **FR-1.4: Khung tiêu chuẩn UNESCO:** Tích hợp bộ quy tắc ứng xử AI học đường: Trách nhiệm giải trình của học sinh, chống sao chép văn mẫu, bảo vệ tính trung thực học thuật.
- **FR-1.5: Khung cấu trúc giai đoạn:** Bố trí placeholder rõ ràng cho các giai đoạn tiếp theo theo nguyên tắc khóa phạm vi v0.1.

#### Giai Đoạn 2 (Buổi 2): Nguồn Học Liệu (Text-First) & Màn Hình AI Preview
- **FR-2.1: Nhập liệu đa phương thức (Ưu tiên Text):**
  - *Văn bản (Text):* Nhập đoạn trích tác phẩm, văn bản gốc, lời bình giảng (nguồn chuẩn xác nhất).
  - *Hình ảnh (Image):* Nhập mô tả sơ đồ tư duy, trích lục OCR hỗ trợ nhận diện các nhánh ý.
  - *Liên kết web (URL):* Trích xuất thông tin tóm lược và ghi nhận miền nguồn gốc.
- **FR-2.2: Quản lý nguồn học liệu (CRUD đầy đủ):** Cho phép Thêm, Xem chi tiết, Chỉnh sửa nội dung và Xóa nguồn; lọc theo phân loại (Text / Ảnh / URL); tìm kiếm nhanh theo từ khóa.
- **FR-2.3: Màn hình "AI Đã Hiểu Gì":** Kích hoạt AI phân tích các nguồn đã nạp và trích xuất thành 4 nhóm thông tin:
  1. *Ý chính cốt lõi (Core Concepts):* Các thông điệp tư tưởng trung tâm.
  2. *Từ khóa & Nghệ thuật (Keywords):* Danh sách hashtag thuật ngữ then chốt.
  3. *Phạm vi kiến thức & Thể loại (Scope & Context):* Xác định đúng bối cảnh lịch sử và đặc trưng thể loại.
  4. *Ghi chú & Lỗ hổng (Gaps & Notes):* Chỉ ra các phần kiến thức còn thiếu trong nguồn để người học bổ sung.
- **FR-2.4: Tiêu chí kiểm chứng Buổi 2:** Hỗ trợ người học đối chiếu: Đúng môn Văn, Không chung chung, Tránh hiểu sai lệch, Gợi ý bổ sung kịp thời.

#### Giai Đoạn 3 (Buổi 3): AI Content Generation & Study Pack Đa Phương Thức
- **FR-3.1: Bản Tóm Tắt & Bối Cảnh Tác Phẩm:**
  - Tóm tắt súc tích, mạch lạc.
  - Bối cảnh lịch sử & Hoàn cảnh sáng tác cụ thể.
  - Giá trị hiện thực và giá trị nhân đạo cốt lõi.
  - Sơ đồ mạch cốt truyện và cảm xúc nhân vật.
- **FR-3.2: Hệ Thống 5 Nhóm Luận Điểm Chuẩn Sư Phạm:**
  - Nhóm 1: *Khái niệm & Bối cảnh*
  - Nhóm 2: *Luận điểm Nội dung*
  - Nhóm 3: *Nghệ thuật & Biện pháp tu từ*
  - Nhóm 4: *Phân biệt & Mở rộng so sánh*
  - Nhóm 5: *Lưu ý & Lỗi thường gặp*
  - Mỗi luận điểm đều kèm trích dẫn chứng cứ văn học (`quote`) và cho phép học sinh trực tiếp Sửa / Xóa / Thêm mới (*Human-in-the-loop*).
- **FR-3.3: Luyện Tập Câu Hỏi 4 Dạng Tương Tác:**
  - *Dạng 1:* Câu hỏi Đúng / Sai (True / False).
  - *Dạng 2:* Câu hỏi Trắc nghiệm 4 lựa chọn (Multiple Choice ABCD).
  - *Dạng 3:* Câu hỏi Điền từ ngắn vào chỗ trống (Fill in the blank) có gợi ý.
  - *Dạng 4:* Câu hỏi Đọc hiểu & Hỏi-đáp ngắn (Short answer).
  - *Chấm điểm & Phản hồi:* Chấm điểm tự động, hiển thị đáp án chuẩn, giải thích barem chi tiết và hiệu ứng chúc mừng khi đạt điểm cao.
- **FR-3.4: Thẻ Ghi Nhớ Nhanh 3D (Interactive Flashcards):**
  - Thẻ lật hiệu ứng không gian 3D (Mặt trước: Câu hỏi/Thuật ngữ; Mặt sau: Giải nghĩa/Dẫn chứng).
  - Bộ lọc thẻ: Tất cả, Cần ôn lại, Đã thuộc; nút đánh dấu hoàn thành nhanh.
- **FR-3.5: Hạt Giống Gợi Mở (Q&A Seed) & Cố Vấn Văn Học AI:**
  - Danh sách các câu hỏi đào sâu tư duy phản biện.
  - Khung chat với Cố vấn sư phạm AI: Gợi mở hướng lập dàn bài, giải thích biện pháp nghệ thuật, tuyệt đối không làm hộ bài hay viết sẵn văn mẫu.
- **FR-3.6: Thẩm Định Học Thật & Chống Gian Lận (Human Verification):**
  - Rà soát 6 tiêu chí chất lượng nội dung.
  - Nút ký xác nhận thẩm định của học sinh trước khi hoàn tất bài học.

---

### 3. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

- **NFR-1 (Bảo mật):** Không lưu hoặc làm lộ API Key ở phía client. Toàn bộ cuộc gọi đến Gemini đều đi qua Express Proxy (`server.ts`).
- **NFR-2 (Hiệu năng):** Phản hồi giao diện dưới 100ms; tải dữ liệu LocalStorage tức thì.
- **NFR-3 (Khả năng chịu lỗi - Resiliency):** Tự động chuyển sang Pedagogical Fallback Data nếu mất kết nối mạng hoặc lỗi server, đảm bảo không gián đoạn trải nghiệm học tập.
- **NFR-4 (Tương thích):** Hoạt động mượt mà trên trình duyệt Desktop, Tablet và Mobile.
