import { Topic, SourceItem, AIPreview, StudyPack } from '../types';

export const DEFAULT_TOPICS: Topic[] = [
  {
    id: 'topic_thu_dung',
    title: 'Thu Đứng (Thu Điếu - Câu cá mùa thu)',
    author: 'Nguyễn Khuyến',
    period: 'Văn học trung đại Việt Nam (Cuối thế kỷ XIX)',
    genre: 'Thơ Nôm đường luật / Thất ngôn bát cú',
    grade: 'Lớp 10',
    learningGoal: 'Phân tích bức tranh mùa thu làng quê Bắc Bộ đặc sắc với đường nét tĩnh lặng, màu sắc trong trẻo; cảm nhận nỗi lòng u hoài, tình yêu thiên nhiên gắn liền với tấm lòng yêu nước thầm lặng của nhà thơ Nguyễn Khuyến.',
    targetSkills: ['Phân tích thơ Nôm Đường luật', 'Cảm thụ nghệ thuật tả cảnh ngụ tình', 'Nghị luận tác phẩm văn học Lớp 10'],
    tags: ['Thu Đứng', 'Thu Điếu', 'Nguyễn Khuyến', 'Lớp 10', 'Thơ Nôm Đường luật', 'Cảnh thu làng quê'],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'topic_dai_cao_binh_ngo',
    title: 'Đại cáo bình Ngô',
    author: 'Nguyễn Trãi',
    period: 'Văn học trung đại Việt Nam (Thế kỷ XV)',
    genre: 'Thể Cáo / Văn chính luận cổ điển',
    grade: 'Lớp 10',
    learningGoal: 'Phân tích tư tưởng nhân nghĩa tiến bộ, bản tuyên ngôn độc lập thứ hai của dân tộc, tinh thần tự hào Đại Việt và nghệ thuật chính luận tài tình của Nguyễn Trãi.',
    targetSkills: ['Phân tích văn chính luận', 'Cảm thụ tư tưởng nhân nghĩa', 'Nghị luận tác phẩm trung đại'],
    tags: ['Đại cáo bình Ngô', 'Nguyễn Trãi', 'Lớp 10', 'Nhân nghĩa', 'Tuyên ngôn độc lập', 'Bình Ngô'],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'topic_trao_duyen',
    title: 'Truyện Kiều – Trao duyên',
    author: 'Nguyễn Du',
    period: 'Văn học trung đại (Đầu thế kỷ XIX)',
    genre: 'Truyện thơ Nôm kiệt tác',
    grade: 'Lớp 10',
    learningGoal: 'Phân tích diễn biến tâm trạng quằn quại, bi kịch tình yêu tan vỡ và tấm lòng vị tha cao cả của Thúy Kiều khi cậy nhờ Thúy Vân thay mình trả nghĩa cho Kim Trọng.',
    targetSkills: ['Nghệ thuật miêu tả nội tâm', 'Phân tích ngôn ngữ thơ Nôm', 'Cảm thụ bi kịch nhân văn'],
    tags: ['Truyện Kiều', 'Trao duyên', 'Nguyễn Du', 'Lớp 10', 'Thúy Kiều', 'Thúy Vân', 'Kim Trọng'],
    createdAt: '2026-08-05T09:00:00.000Z',
    updatedAt: '2026-08-22T14:30:00.000Z',
  },
  {
    id: 'topic_chuyen_chuc_quan_den_tan_vien',
    title: 'Chuyện chức quan đền Tản Viên',
    author: 'Nguyễn Dữ',
    period: 'Văn học trung đại (Thế kỷ XVI)',
    genre: 'Truyền kỳ mạn lục / Truyện kỳ ảo',
    grade: 'Lớp 10',
    learningGoal: 'Hiểu được tính cách kiên cường, dũng cảm diệt trừ tà ma, bảo vệ công lý của Ngô Tử Văn; cảm nhận tinh thần tự tôn dân tộc và bài học về chính nghĩa thắng gian tà.',
    targetSkills: ['Phân tích nhân vật truyện kỳ ảo', 'Nhận diện yếu tố hoang đường', 'Đánh giá giá trị hiện thực'],
    tags: ['Chuyện chức quan đền Tản Viên', 'Nguyễn Dữ', 'Ngô Tử Văn', 'Lớp 10', 'Truyền kỳ mạn lục'],
    createdAt: '2026-08-10T11:00:00.000Z',
    updatedAt: '2026-08-24T16:00:00.000Z',
  },
  {
    id: 'topic_canh_ngay_he',
    title: 'Cảnh ngày hè (Bảo kính cảnh giới - bài 43)',
    author: 'Nguyễn Trãi',
    period: 'Văn học trung đại (Thế kỷ XV)',
    genre: 'Thơ Nôm đường luật',
    grade: 'Lớp 10',
    learningGoal: 'Cảm nhận bức tranh thiên nhiên mùa hè tràn đầy sức sống, màu sắc sinh động cùng tâm hồn yêu đời, khát khao dân giàu nước mạnh, chu cấp cho nhân dân của Nguyễn Trãi.',
    targetSkills: ['Phân tích thơ Nôm Đường luật', 'Cảm thụ bức tranh thiên nhiên', 'Nghị luận tâm hồn thi sĩ'],
    tags: ['Cảnh ngày hè', 'Nguyễn Trãi', 'Lớp 10', 'Bảo kính cảnh giới', 'Thơ Nôm'],
    createdAt: '2026-08-15T14:00:00.000Z',
    updatedAt: '2026-08-26T09:00:00.000Z',
  },
];

export const DEFAULT_SOURCES: SourceItem[] = [
  // Thu Đứng (Thu Điếu - Nguyễn Khuyến) Sources
  {
    id: 'src_tdung_01',
    topicId: 'topic_thu_dung',
    type: 'text',
    title: 'Văn bản toàn bài thơ Thu Đứng (Thu Điếu - Câu cá mùa thu) - Ngữ văn 10',
    content: `Ao thu lạnh lẽo trong veo,
Một chiếc thuyền câu bé tẻo teo.
Sóng biến tẻo teo theo làn hơi gợn,
Lá vàng trước gió khẽ đưa xèo.

Tầng mây lơ lửng trời xanh ngắt,
Ngõ trúc quanh co khách vắng teo.
Tựa gối buông cầu lâu chẳng được,
Cá đâu đớp động dưới chân beo.
(Nguyễn Khuyến - Thơ Nôm Đường luật Lớp 10)`,
    meta: { wordCount: 80 },
    createdAt: '2026-08-01T08:10:00.000Z',
    updatedAt: '2026-08-01T08:10:00.000Z',
  },
  {
    id: 'src_tdung_02',
    topicId: 'topic_thu_dung',
    type: 'text',
    title: 'Phân tích nghệ thuật tả cảnh ngụ tình & Tấm lòng thời thế của Nguyễn Khuyến (Ngữ văn 10)',
    content: `1. Bức tranh mùa thu vùng đồng bằng Bắc Bộ:
- Không gian thanh sơ, tĩnh lặng: Ao thu "lạnh lẽo", nước "trong veo", chiếc thuyền "bé tẻo teo".
- Màu sắc thanh nhã đặc trưng: Xanh ngắt của bầu trời, vàng của lá thu, xanh trong của ao thu.
- Âm thanh khẽ động: Tiếng lá rơi "đưa xèo", tiếng "cá đớp động" dưới chân beo làm nổi bật cái tĩnh lặng tuyệt đối (lấy động tả tĩnh).

2. Tâm trạng và tấm lòng thi nhân:
- Tư thế "tựa gối buông cầu": Không phải câu cá tìm niềm vui thanh cao thuần túy mà là cái cớ để trầm tư suy ngẫm về thời thế.
- Nỗi lòng yêu nước u hoài, thao thức trước cảnh đất nước đang rơi vào tay thực dân Pháp, nỗi đau của một nhà thơ sĩ phu bất lực trước thời cuộc.`,
    meta: { wordCount: 175 },
    createdAt: '2026-08-02T09:00:00.000Z',
    updatedAt: '2026-08-02T09:00:00.000Z',
  },

  // Đại cáo bình Ngô Sources
  {
    id: 'src_dcbn_01',
    topicId: 'topic_dai_cao_binh_ngo',
    type: 'text',
    title: 'Văn bản Trích đoạn & Bối cảnh sáng tác Đại cáo bình Ngô (Ngữ văn 10)',
    content: `Hoàn cảnh lịch sử: Đầu năm 1428, sau khi quân khởi nghĩa Lam Sơn đánh tan 15 vạn viện binh giặc Minh (chiến thắng Chi Lăng - Xương Giang), thừa lệnh Lê Lợi, Nguyễn Trãi viết "Đại cáo bình Ngô" để tuyên bố với toàn dân về sự nghiệp bình Ngô hoàn toàn thắng lợi, khẳng định chủ quyền độc lập của Đại Việt.
Trích đoạn lý luận cốt lõi:
"Tác nhân nghĩa chi bang,
Yên dân chi bản, tại ư trừ bạo.
Thánh nhân chi dụng, tiên ư cứu dân..."
Dịch thơ:
"Việc nhân nghĩa cốt ở yên dân,
Quân điếu phạt trước lo trừ bạo.
Như nước Đại Việt ta từ trước,
Vốn xưng nền văn hiến đã lâu.
Núi sông bờ cõi đã chia,
Phong tục Bắc Nam cũng khác.
Từ Triệu, Đinh, Lý, Trần bao đời xây nền độc lập,
Cùng Hán, Đường, Tống, Nguyên mỗi bên hùng bá một phương.
Tuy mạnh yếu có lúc khác nhau,
Song hào kiệt đời nào cũng có."`,
    meta: { wordCount: 180 },
    createdAt: '2026-08-01T08:15:00.000Z',
    updatedAt: '2026-08-01T08:15:00.000Z',
  },
  {
    id: 'src_dcbn_02',
    topicId: 'topic_dai_cao_binh_ngo',
    type: 'text',
    title: 'Phân tích Bảng đối sánh tội ác giặc Minh và Tinh thần Nhân nghĩa (Ngữ văn 10)',
    content: `1. Tư tưởng Nhân nghĩa: Không dừng ở tư tưởng Nho giáo truyền thống (quan hệ giữa người với người), Nguyễn Trãi mở rộng thành tư tưởng "Yên dân" và "Trừ bạo" - lấy nhân dân làm gốc, vì nhân dân mà đánh đuổi giặc xâm lược.
2. Tố cáo tội ác giặc Minh: Dùng hình ảnh gợi cảm và phóng đại nghệ thuật:
"Nướng dân đen trên ngọn lửa hung tàn,
Vùi con đỏ xuống dưới hầm tai họa..."
"Độc ác thay, trúc Nam Sơn không ghi hết tội,
Dơ bẩn thay, nước Đông Hải không rửa sạch mùi!"
3. Nghệ thuật chính luận: Kết cấu chặt chẽ 4 phần, sử dụng thể văn biền ngẫu sóng đôi cân đối, giàu hình ảnh và hào khí hùng oán.`,
    meta: { wordCount: 155 },
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  },
  {
    id: 'src_dcbn_03',
    topicId: 'topic_dai_cao_binh_ngo',
    type: 'image',
    title: 'Sơ đồ tư duy Bố cục 4 phần và Khí thế chiến thắng Đại cáo bình Ngô',
    content: 'Sơ đồ nhánh phân tích: 1. Luận đề nhân nghĩa & Chân lý độc lập -> 2. Tố cáo tội ác giặc Minh -> 3. Quá trình khởi nghĩa gian khổ đến chiến thắng oanh liệt -> 4. Tuyên bố độc lập hòa bình muôn đời.',
    meta: {
      imageDesc: 'Sơ đồ tư duy Ngữ văn 10 minh họa 4 phần tác phẩm Đại cáo bình Ngô: Mạch cảm xúc từ căm hờn giặc ngoại xâm đến tự hào dân tộc.',
      fileSize: '512 KB',
    },
    createdAt: '2026-08-03T15:20:00.000Z',
    updatedAt: '2026-08-03T15:20:00.000Z',
  },

  // Trao duyên Sources
  {
    id: 'src_td_01',
    topicId: 'topic_trao_duyen',
    type: 'text',
    title: 'Văn bản Trích đoạn Trao duyên (Trích Truyện Kiều - Nguyễn Du, Ngữ văn 10)',
    content: `Vị trí đoạn trích: Từ câu 723 đến câu 756 trong Truyện Kiều. Sau đêm thề nguyện, gia đình Kiều gặp biến cố gia biến (cha và em bị bắt). Kiều phải bán mình chuộc cha. Đêm trước ngày theo Mã Giám Sinh, Kiều nhờ Thúy Vân thay mình kết duyên với Kim Trọng.
Lớp từ ngữ trao duyên đặc biệt:
"Cậy em, em có chịu lời,
Ngồi lên cho chị lạy rồi sẽ thưa.
Giữa đường đứt gánh tương tư,
Keo loan chắp mối tơ thừa mặc em..."
Kỷ vật tình yêu gửi lại:
"Chiếc thoa với bức tờ mây
Duyên này thì giữ, vật này vân vi..."`,
    meta: { wordCount: 160 },
    createdAt: '2026-08-06T10:00:00.000Z',
    updatedAt: '2026-08-06T10:00:00.000Z',
  },
];

export const DEFAULT_PREVIEWS: Record<string, AIPreview> = {
  topic_thu_dung: {
    topicId: 'topic_thu_dung',
    coreConcepts: [
      'Bức tranh thu làng quê Bắc Bộ thanh sơ, dịu nhẹ và tĩnh lặng với điểm nhìn từ thuyền câu đến bầu trời bao la.',
      'Nghệ thuật sử dụng vần "eo" độc đáo (vần tử) tạo cảm giác không gian thu co hẹp, đượm buồn và tĩnh mịch.',
      'Thủ pháp nghệ thuật "lấy động tả tĩnh": Tiếng cá đớp động chân beo càng nhấn mạnh cái yên ả tuyệt đối của cảnh thu.',
      'Tâm trạng u hoài, thao thức thời thế và tình yêu quê hương đất nước kín đáo của Tam nguyên Yên Đổ Nguyễn Khuyến.',
    ],
    keywords: [
      'Thu Đứng',
      'Thu Điếu',
      'Nguyễn Khuyến',
      'Lớp 10',
      'Ao thu',
      'Tựa gối buông cầu',
      'Vần eo',
      'Lấy động tả tĩnh',
      'Thơ Nôm Đường luật',
    ],
    scopeAndGenre: 'Thơ Nôm Đường luật (Thất ngôn bát cú); Ngữ văn Lớp 10 (Sách giáo khoa Kết nối tri thức, Cánh diều, Chân trời sáng tạo); Trọng tâm phân tích bức tranh thiên nhiên và tâm trạng nhà thơ.',
    notesAndGaps: [
      'Lưu ý nghệ thuật gieo vần "eo" tinh tế (lạnh lẽo, tẻo teo, gợn, xèo, xanh ngắt, vắng teo, buông cầu, chân beo).',
      'So sánh điểm giống và khác nhau với 2 bài thơ thu khác trong chùm thơ thu của Nguyễn Khuyến (Thu Vịnh, Thu Ẩm).',
    ],
    generatedAt: '2026-08-01T10:00:00.000Z',
  },
  topic_dai_cao_binh_ngo: {
    topicId: 'topic_dai_cao_binh_ngo',
    coreConcepts: [
      'Tư tưởng Nhân nghĩa tiến bộ vượt thời đại: "Yên dân" và "Trừ bạo" gắn liền với độc lập dân tộc.',
      'Chân lý về sự tồn tại độc lập, chủ quyền lãnh thổ, văn hiến và lịch sử riêng của dân tộc Đại Việt.',
      'Căm phẫn tố cáo tội ác dã man, tàn bạo của giặc Minh xâm lược đối với nhân dân ta.',
      'Khí thế hào hùng của cuộc khởi nghĩa Lam Sơn và bản tuyên ngôn độc lập, hòa bình vĩnh viễn.',
    ],
    keywords: [
      'Đại cáo bình Ngô',
      'Nguyễn Trãi',
      'Tư tưởng nhân nghĩa',
      'Yên dân trừ bạo',
      'Nền văn hiến',
      'Chi Lăng - Xương Giang',
      'Văn chính luận',
      'Biền ngẫu',
    ],
    scopeAndGenre: 'Văn học trung đại Việt Nam - Thể Cáo; Chương trình Ngữ văn Lớp 10 (Sách giáo khoa Kết nối tri thức, Cánh diều, Chân trời sáng tạo); Trọng tâm phân tích nghệ thuật chính luận và tư tưởng nhân nghĩa.',
    notesAndGaps: [
      'Cần nắm vững ý nghĩa các từ Hán Việt trọng tâm (điếu phạt, nhân nghĩa, văn hiến, phong tục).',
      'Lưu ý so sánh tư tưởng nhân nghĩa của Nguyễn Trãi với tư tưởng Nho giáo nguyên bản để thấy tính phát triển tiến bộ.',
    ],
    generatedAt: '2026-08-04T10:00:00.000Z',
  },
  topic_trao_duyen: {
    topicId: 'topic_trao_duyen',
    coreConcepts: [
      'Mâu thuẫn giằng xé nội tâm Thúy Kiều: Giữa hành động trao duyên lý trí và sự luyến tiếc tình yêu tha thiết.',
      'Thành ý kính cẩn và lý lẽ thuyết phục khi nhờ vả Thúy Vân ("Cậy em", "lạy rồi sẽ thưa").',
      'Sự đau đớn tột cùng khi trao lại kỷ vật tình yêu và cảm giác mình như người đã chết.',
      'Tấm lòng vị tha, đức hy sinh cao cả và tiếng khóc xé lòng hướng về Kim Trọng.',
    ],
    keywords: [
      'Trao duyên',
      'Thúy Kiều',
      'Thúy Vân',
      'Kim Trọng',
      'Cậy em',
      'Chiếc thoa bức tờ mây',
      'Bi kịch tình yêu',
      'Truyện Kiều',
    ],
    scopeAndGenre: 'Truyện thơ Nôm trung đại; Ngữ văn Lớp 10; Trọng tâm phân tích diễn biến tâm lý nhân vật và độc thoại nội tâm.',
    notesAndGaps: [
      'Phân tích kỹ sự thay đổi đối tượng hội thoại: Từ nói với Thúy Vân chuyển sang độc thoại với chính mình và hướng về Kim Trọng.',
      'Lưu ý các từ ngữ mang tính ước lệ nghệ thuật kết hợp với ngôn ngữ bình dân sinh động.',
    ],
    generatedAt: '2026-08-07T11:00:00.000Z',
  },
};

export const DEFAULT_STUDYPACKS: Record<string, StudyPack> = {
  topic_thu_dung: {
    id: 'sp_thu_dung',
    topicId: 'topic_thu_dung',
    summary: {
      shortSummary: '"Thu Đứng" (Thu Điếu - Câu cá mùa thu) của Nguyễn Khuyến là kiệt tác thơ Nôm Đường luật trong chùm 3 bài thơ thu danh tiếng. Tác phẩm khắc họa bức tranh mùa thu đặc trưng của làng quê Bắc Bộ tĩnh lặng, trong trẻo, đồng thời thể hiện tâm sự u hoài, tình yêu thiên nhiên gắn liền với tấm lòng yêu nước thầm lặng của nhà thơ.',
      historicalContext: 'Được sáng tác khi Nguyễn Khuyến từ quan về ở ẩn tại quê nhà Bình Luc (Hà Nam) vào cuối thế kỷ XIX, trong cảnh đất nước rơi vào tay thực dân Pháp.',
      coreValues: 'Giá trị tư tưởng: Tình yêu thiên nhiên tha thiết và tấm lòng ưu thời mẫn thế sâu sắc. Giá trị nghệ thuật: Đỉnh cao thơ Nôm Đường luật với nghệ thuật gieo vần "eo" độc đáo, khả năng tạo hình và lấy động tả tĩnh tài hoa.',
      plotStructure: [
        '1. Hai câu thực/đề: Bức tranh ao thu không gian hẹp với cảnh ao thu và chiếc thuyền câu nhỏ bé.',
        '2. Hai câu thực: Chuyển động khẽ khàng của làn sóng gợn và chiếc lá vàng rơi trước gió.',
        '3. Hai câu luận: Không gian thu mở rộng lên bầu trời xanh ngắt và ngõ trúc quanh co vắng lặng.',
        '4. Hai câu kết: Tư thế buông cầu trầm tư và âm thanh cá đớp động chân beo xua tan cái tĩnh lặng.',
      ],
    },
    keyPoints: [
      {
        id: 'kp_tdung_1',
        category: 'Khái niệm & Bối cảnh',
        title: 'Bức tranh Mùa thu Làng quê Bắc Bộ trong trẻo',
        description: 'Cảnh thu được đón nhận từ nhiều góc độ và khoảng cách (từ ao thu đến bầu trời cao, rồi quay lại ngõ trúc). Tất cả khoác lên vẻ đẹp dịu nhẹ, thanh sơ đặc trưng của làng quê Việt Nam.',
        quote: 'Ao thu lạnh lẽo trong veo / Một chiếc thuyền câu bé tẻo teo.',
      },
      {
        id: 'kp_tdung_2',
        category: 'Luận điểm Nội dung',
        title: 'Nghệ thuật gieo vần "eo" (Vần tử) độc đáo',
        description: 'Vần "eo" (lạnh lẽo, tẻo teo, gợn, xèo, vắng teo, chân beo) gợi không gian co hẹp dần, điểm xuyết những nét động nhẹ nhàng nhưng càng làm nổi bật cái tĩnh mịch sâu lắng.',
        quote: 'Sóng biến tẻo teo theo làn hơi gợn / Lá vàng trước gió khẽ đưa xèo.',
      },
      {
        id: 'kp_tdung_3',
        category: 'Nghệ thuật & Biện pháp',
        title: 'Thủ pháp Lấy động tả tĩnh tài tình',
        description: 'Tiếng cá đớp động chân beo ở cuối bài thơ là âm thanh duy nhất phá tan sự im lặng, nhưng chính âm thanh nhỏ bé ấy lại làm tăng thêm sự tĩnh lặng tuyệt đối của không gian thu.',
        quote: 'Tựa gối buông cầu lâu chẳng được / Cá đâu đớp động dưới chân beo.',
      },
      {
        id: 'kp_tdung_4',
        category: 'Phân biệt & Mở rộng',
        title: 'Tâm sự U hoài và Tấm lòng Ưu thời mẫn thế',
        description: 'Tư thế "tựa gối buông cầu" cho thấy câu cá chỉ là cái cớ để nhà thơ suy ngẫm về thời cuộc. Đó là nỗi đau đớn, xót xa trước cảnh nước mất nhà tan của một trí thức tâm huyết.',
        quote: 'Ngõ trúc quanh co khách vắng teo / Tựa gối buông cầu lâu chẳng được.',
      },
    ],
    questions: [
      {
        id: 'q_tdung_1',
        type: 'multiple_choice',
        question: 'Bài thơ "Thu Đứng" (Thu Điếu) của Nguyễn Khuyến được viết theo thể thơ nào trong chương trình Ngữ văn 10?',
        options: [
          'A. Thất ngôn bát cú Đường luật',
          'B. Song thất lục bát',
          'C. Lục bát truyền thống',
          'D. Thất ngôn tứ tuyệt',
        ],
        correctAnswer: 'A. Thất ngôn bát cú Đường luật',
        explanation: 'Bài thơ gồm 8 câu, mỗi câu 7 chữ, gieo vần ở các câu 1, 2, 4, 6, 8 theo chuẩn quy luật Thất ngôn bát cú Đường luật.',
        difficulty: 'Cơ bản',
      },
      {
        id: 'q_tdung_2',
        type: 'multiple_choice',
        question: 'Vần thơ độc đáo nào được gieo xuyên suốt bài thơ Thu Đứng (Thu Điếu)?',
        options: [
          'A. Vần "eo" (lạnh lẽo, tẻo teo, xèo, vắng teo, chân beo)',
          'B. Vần "ang"',
          'C. Vần "iên"',
          'D. Vần "uông"',
        ],
        correctAnswer: 'A. Vần "eo" (lạnh lẽo, tẻo teo, xèo, vắng teo, chân beo)',
        explanation: 'Bài thơ nổi tiếng với nghệ thuật gieo vần "eo" (vần tử) tạo cảm giác không gian co hẹp và tĩnh mịch.',
        difficulty: 'Thông hiểu',
      },
      {
        id: 'q_tdung_3',
        type: 'multiple_choice',
        question: 'Thủ pháp nghệ thuật nào nổi bật ở hai câu kết của bài thơ?',
        options: [
          'A. Lấy động tả tĩnh',
          'B. Điệp từ điệp ngữ',
          'C. So sánh nhân hóa',
          'D. Ẩn dụ chuyển đổi cảm giác',
        ],
        correctAnswer: 'A. Lấy động tả tĩnh',
        explanation: 'Tiếng "cá đớp động dưới chân beo" nhỏ bé được dùng để làm nổi bật không gian vô cùng tĩnh lặng (lấy động tả tĩnh).',
        difficulty: 'Thông hiểu',
      },
      {
        id: 'q_tdung_4',
        type: 'multiple_choice',
        question: 'Cảm xúc bao trùm lên toàn bộ bài thơ Thu Đứng là gì?',
        options: [
          'A. Nỗi u hoài, lặng lẽ và tấm lòng yêu nước thầm lặng',
          'B. Vui tươi, hồ hởi trước vẻ đẹp thiên nhiên',
          'C. Căm phẫn mãnh liệt trước kẻ thù xâm lược',
          'D. Thích thú với niềm vui đi câu cá giải trí',
        ],
        correctAnswer: 'A. Nỗi u hoài, lặng lẽ và tấm lòng yêu nước thầm lặng',
        explanation: 'Bài thơ thể hiện tình yêu thiên nhiên sâu sắc gắn liền với nỗi u hoài, thao thức về vận mệnh đất nước.',
        difficulty: 'Vận dụng',
      },
    ],
    flashcards: [
      {
        id: 'fc_tdung_1',
        front: 'Nguyễn Khuyến mang hiệu là gì và ông thuộc chùm thơ thu nổi tiếng nào trong Ngữ văn 10?',
        back: 'Nguyễn Khuyến hiệu là Quán Sơn, được gọi là Tam nguyên Yên Đổ. Ông nổi tiếng với chùm 3 bài thơ thu: Thu Điếu (Thu Đứng), Thu Vịnh và Thu Ẩm.',
        category: 'Tác giả & Tác phẩm',
        mastered: false,
      },
      {
        id: 'fc_tdung_2',
        front: 'Những hình ảnh và màu sắc nào đặc trưng cho cảnh thu làng quê Bắc Bộ trong bài thơ?',
        back: 'Nước ao "trong veo", chiếc thuyền "bé tẻo teo", sóng "gợn", lá vàng "đưa xèo", trời "xanh ngắt", ngõ trúc "quanh co vắng teo".',
        category: 'Hình tượng Thơ',
        mastered: false,
      },
      {
        id: 'fc_tdung_3',
        front: 'Ý nghĩa của tư thế "Tựa gối buông cầu lâu chẳng được" là gì?',
        back: 'Tư thế trầm tư thể hiện câu cá chỉ là cái cớ; tâm trí nhà thơ đang bận tâm suy ngẫm về thời cuộc và nỗi lòng ưu thời mẫn thế.',
        category: 'Nghệ thuật & Ý nghĩa',
        mastered: false,
      },
    ],
    qaSeeds: [
      {
        id: 'qa_tdung_1',
        question: 'Tại sao nói bức tranh thu trong "Thu Đứng" mang nét đặc trưng nhất cho mùa thu làng quê Bắc Bộ?',
        answer: 'Vì bài thơ chọn những cảnh vật vô cùng quen thuộc và giản dị của làng quê Bắc Bộ: chiếc ao nhỏ, thuyền câu, ngõ trúc quanh co, màu trời xanh ngắt. Bức tranh không khoa trương mà thanh sơ, dịu nhẹ và giàu đĩnh đạc dân tộc.',
        criticalThinkingTip: 'Hãy liên hệ với cảnh thu vùng đồng bằng Bắc Bộ và chùm thơ thu của Nguyễn Khuyến.',
      },
      {
        id: 'qa_tdung_2',
        question: 'Phân tích nghệ thuật sử dụng từ ngữ tả cảnh của Nguyễn Khuyến trong bài thơ?',
        answer: 'Nguyễn Khuyến sử dụng các từ láy và tính từ gợi hình rất tinh tế ("lạnh lẽo", "trong veo", "bé tẻo teo", "vắng teo"). Mức độ tĩnh lặng và nhỏ bé được nhân lên qua cách gieo vần "eo" khéo léo, tạo nên nhịp điệu êm đềm nhưng trăn trở.',
        criticalThinkingTip: 'Chú ý cách gieo vần "eo" khéo léo và tác dụng của từ láy.',
      },
    ],
    ethicsChecklist: {
      isHumanVerified: true,
      verifiedNotes: 'Dữ liệu được biên soạn và kiểm duyệt theo chuẩn chương trình Ngữ Văn Lớp 10 (Sách giáo khoa GDPT 2018).',
      verifiedDate: '2026-08-01',
      aiGeneratedNotice: 'Bộ Study Pack được tổng hợp trên nền tảng nguồn học liệu chuẩn và hỗ trợ bởi AI.',
      checklistItems: {
        factualAccuracy: true,
        educationalIntent: true,
        unescoResponsibleUse: true,
        avoidPlagiarism: true,
      },
    },
    updatedAt: '2026-08-01T12:00:00.000Z',
  },
  topic_dai_cao_binh_ngo: {
    id: 'sp_dai_cao_binh_ngo',
    topicId: 'topic_dai_cao_binh_ngo',
    summary: {
      shortSummary: '"Đại cáo bình Ngô" của Nguyễn Trãi là bản tuyên ngôn độc lập thứ hai của dân tộc Việt Nam, một ắng văn ngàn đời hùng mạ. Tác phẩm tổng kết cuộc kháng chiến chống quân Minh thắng lợi, khẳng định chủ quyền dân tộc trên nền tảng tư tưởng nhân nghĩa cao đẹp và tinh thần yêu nước sâu sắc.',
      historicalContext: 'Được sáng tác vào đầu năm 1428 sau khi nghĩa quân Lam Sơn do Lê Lợi lãnh đạo hoàn toàn giải phóng đất nước, quét sạch 15 vạn quân viện binh nhà Minh.',
      coreValues: 'Giá trị tư tưởng: Khai sáng tư tưởng nhân nghĩa tiến bộ lấy dân làm gốc. Giá trị nghệ thuật: Đỉnh cao văn chính luận cổ điển với kết cấu biền ngẫu mẫu mực, lập luận sắc bén và cảm xúc hào hùng.',
      plotStructure: [
        '1. Đội đoạn 1: Nêu luận đề chính nghĩa (Tư tưởng nhân nghĩa & Chân lý độc lập dân tộc).',
        '2. Đoạn 2: Tố cáo tội ác tày trời của giặc Minh xâm lược.',
        '3. Đoạn 3: Bức tranh toàn cảnh cuộc khởi nghĩa Lam Sơn từ gian lao đến chiến thắng oanh liệt.',
        '4. Đoạn 4: Lời tuyên bố độc lập, mở ra kỷ nguyên hòa bình tươi sáng cho đất nước.',
      ],
    },
    keyPoints: [
      {
        id: 'kp_dcbn_1',
        category: 'Khái niệm & Bối cảnh',
        title: 'Tư tưởng Nhân nghĩa tiến bộ của Nguyễn Trãi',
        description: 'Tư tưởng nhân nghĩa không chỉ là đạo lý Nho giáo mà được Nguyễn Trãi nâng lên thành đường lối cứu nước: "Yên dân" (cho dân cuộc sống thanh bình) và "Trừ bạo" (diệt trừ giặc Minh cướp nước).',
        quote: 'Việc nhân nghĩa cốt ở yên dân / Quân điếu phạt trước lo trừ bạo.',
      },
      {
        id: 'kp_dcbn_2',
        category: 'Luận điểm Nội dung',
        title: 'Chân lý toàn diện về Độc lập Dân tộc',
        description: 'Nguyễn Trãi khẳng định độc lập dân tộc dựa trên 5 yếu tố bền vững: Cương vực lãnh thổ, nền văn hiến lâu đời, phong tục tập quán riêng, lịch sử các triều đại song song và lực lượng hào nhiệt đời nào cũng có.',
        quote: 'Như nước Đại Việt ta từ trước / Vốn xưng nền văn hiến đã lâu...',
      },
      {
        id: 'kp_dcbn_3',
        category: 'Luận điểm Nội dung',
        title: 'Bản án tố cáo tội ác giặc Minh tàn bạo',
        description: 'Bản án đanh thép vạch trần âm mưu cướp nước, chủ trương diệt chủng và bóc quẹt vơ vét tài nguyên, dồn ép nhân dân ta vào thảm cảnh cùng cực.',
        quote: 'Nướng dân đen trên ngọn lửa hung tàn / Vùi con đỏ xuống dưới hầm tai họa.',
      },
      {
        id: 'kp_dcbn_4',
        category: 'Nghệ thuật & Biện pháp',
        title: 'Nghệ thuật chính luận tài tình và thể văn Biền ngẫu',
        description: 'Kết cấu chặt chẽ, câu văn biền ngẫu sóng đôi nhịp nhàng, sự kết hợp tài tình giữa lý lẽ sắc bén và hình ảnh giàu tính biểu cảm, giọng điệu chuyển biến linh hoạt theo mạch cảm xúc.',
        quote: 'Độc ác thay, trúc Nam Sơn không ghi hết tội / Dơ bẩn thay, nước Đông Hải không rửa sạch mùi!',
      },
      {
        id: 'kp_dcbn_5',
        category: 'Phân biệt & Mở rộng',
        title: 'Đối sánh Đại cáo bình Ngô với Nam quốc sơn hà',
        description: 'Nếu "Nam quốc sơn hà" (Lý Thường Kiệt) khẳng định chủ quyền qua yếu tố thần linh ("thần sách"), thì "Đại cáo bình Ngô" khẳng định độc lập bằng chiều sâu lịch sử, văn hóa, văn hiến và sức mạnh nhân dân.',
      },
      {
        id: 'kp_dcbn_6',
        category: 'Lưu ý & Lỗi thường gặp',
        title: 'Lỗi nhầm lẫn khái niệm Nhân nghĩa Nho giáo',
        description: 'Học sinh lớp 10 thường nhầm tư tưởng nhân nghĩa của Nguyễn Trãi là sự rập khuôn Nho giáo. Cần nhấn mạnh tính nhân văn, vì dân và mang tinh thần dân tộc sâu sắc của ông.',
      },
    ],
    questions: [
      {
        id: 'q_dcbn_01',
        type: 'true_false',
        question: 'Tư tưởng nhân nghĩa trong "Đại cáo bình Ngô" của Nguyễn Trãi lấy việc thương dân, yên dân và trừ bạo xâm lược làm gốc.',
        correctAnswer: 'Đúng',
        explanation: 'Đây là cốt lõi tư tưởng tiến bộ của Nguyễn Trãi: Nhân nghĩa gắn liền với sự nghiệp chống xâm lược bảo vệ nhân dân.',
        difficulty: 'Cơ bản',
      },
      {
        id: 'q_dcbn_02',
        type: 'true_false',
        question: 'Trong đoạn mở đầu, Nguyễn Trãi khẳng định độc lập dân tộc chỉ dựa duy nhất vào sức mạnh quân sự.',
        correctAnswer: 'Sai',
        explanation: 'Nguyễn Trãi khẳng định độc lập dựa trên 5 yếu tố: Văn hiến, lãnh thổ, phong tục, lịch sử triều đại và con người hào kiệt.',
        difficulty: 'Cơ bản',
      },
      {
        id: 'q_dcbn_03',
        type: 'multiple_choice',
        question: 'Hình ảnh so sánh nghệ thuật nào được dùng để nhấn mạnh tội ác không thể dung thứ của quân xâm lược Minh?',
        options: [
          'A. Trúc Nam Sơn không ghi hết tội, nước Đông Hải không rửa sạch mùi',
          'B. Buồm căng gió lớn vượt sóng trùng dương',
          'C. Đầu súng trăng treo giữa rừng sương muối',
          'D. Cỏ cây chen đá lá chen hoa',
        ],
        correctAnswer: 'A. Trúc Nam Sơn không ghi hết tội, nước Đông Hải không rửa sạch mùi',
        explanation: 'Câu văn biền ngẫu dùng hình ảnh thiên nhiên mênh mông để lột tả tội ác tày trời của kẻ thù.',
        difficulty: 'Thông hiểu',
      },
      {
        id: 'q_dcbn_04',
        type: 'multiple_choice',
        question: 'Cụm từ "Việc nhân nghĩa cốt ở yên dân" mang ý nghĩa trọng tâm nào trong toàn bộ tác phẩm?',
        options: [
          'A. Định hướng cuộc sống an nhàn gạt bỏ lo âu',
          'B. Luận đề chính nghĩa: Mọi hành động cứu nước phải xuất phát từ mục tiêu làm cho nhân dân được sống bình yên, tự do',
          'C. Khuyên nhân dân chấp nhận sưu thuế',
          'D. Yêu cầu thương lượng hòa hoãn với địch',
        ],
        correctAnswer: 'B. Luận đề chính nghĩa: Mọi hành động cứu nước phải xuất phát từ mục tiêu làm cho nhân dân được sống bình yên, tự do',
        explanation: 'Yên dân là mục đích, trừ bạo là phương tiện để thực hiện tinh thần nhân nghĩa.',
        difficulty: 'Thông hiểu',
      },
      {
        id: 'q_dcbn_05',
        type: 'fill_in_blank',
        question: 'Điền từ còn thiếu vào câu thơ nổi tiếng: "Tuy mạnh yếu có lúc khác nhau / Song [...] đời nào cũng có."',
        correctAnswer: 'hào kiệt',
        explanation: 'Tự hào về truyền thống con người Đại Việt bất khuất, đời nào cũng có những anh hùng hào kiệt đứng lên dựng nước.',
        contextClue: 'Song [......] đời nào cũng có.',
        difficulty: 'Cơ bản',
      },
      {
        id: 'q_dcbn_06',
        type: 'short_answer',
        question: 'Tại sao "Đại cáo bình Ngô" được tôn vinh là bản Tuyên ngôn độc lập thứ hai của dân tộc?',
        correctAnswer: 'Vì tác phẩm chính thức tuyên bố chấm dứt ách đô hộ của nhà Minh, khẳng định chủ quyền toàn vẹn lãnh thổ Đại Việt và tuyên ngôn kỷ nguyên độc lập hòa bình muôn đời cho đất nước.',
        explanation: 'Cần nêu rõ lý do tuyên bố chấm dứt chiến tranh, khẳng định chủ quyền và mở ra thời kỳ mới.',
        difficulty: 'Vận dụng',
      },
    ],
    flashcards: [
      {
        id: 'fc_dcbn_1',
        front: 'Hoàn cảnh ra đời của "Đại cáo bình Ngô"?',
        back: 'Sáng tác đầu năm 1428 sau khi nghĩa quân Lam Sơn quét sạch 15 vạn quân Minh, chính thức tuyên bố độc lập dân tộc.',
        category: 'Tác giả & Bối cảnh',
        mastered: false,
      },
      {
        id: 'fc_dcbn_2',
        front: 'Hai cốt lõi của Tư tưởng Nhân nghĩa theo Nguyễn Trãi?',
        back: '1. Yên dân (đem lại cuộc sống bình yên cho nhân dân); 2. Trừ bạo (diệt trừ kẻ thù tàn bạo xâm lược).',
        category: 'Tư tưởng trọng tâm',
        mastered: false,
      },
      {
        id: 'fc_dcbn_3',
        front: 'Đặc điểm thể loại "Cáo"?',
        back: 'Thể văn chính luận cổ điển do vua chúa/thủ lĩnh dùng để bố cáo sự kiện trọng đại quốc gia cho toàn dân được biết.',
        category: 'Thể loại văn học',
        mastered: false,
      },
      {
        id: 'fc_dcbn_4',
        front: 'Nghệ thuật nổi bật trong đoạn tố cáo tội ác giặc Minh?',
        back: 'Sử dụng hình ảnh tượng trưng phóng đại, nhịp điệu dồn dập, câu văn biền ngẫu sóng đôi giàu sức biểu cảm căm hờn.',
        category: 'Nghệ thuật',
        mastered: false,
      },
    ],
    qaSeeds: [
      {
        id: 'qa_dcbn_1',
        question: 'Tư tưởng "Yên dân" của Nguyễn Trãi có giá trị như thế nào đối với công cuộc xây dựng đất nước ngày nay?',
        answer: 'Tư tưởng "Yên dân" nhắc nhở bài học lấy dân làm gốc, mọi chính sách phát triển phải hướng tới hạnh phúc, sự an toàn và ấm no của nhân dân.',
        criticalThinkingTip: 'Liên hệ với quan điểm "Dân là gốc" trong các chính sách xã hội hiện đại.',
      },
      {
        id: 'qa_dcbn_2',
        question: 'Làm thế nào để phân tích bài văn biền ngẫu Đại cáo bình Ngô mà không bị sa vào học thuộc lòng?',
        answer: 'Hãy bám sát mạch logic 4 phần, mổ xẻ sự thay đổi giọng điệu (từ trang nghiêm hào hùng -> căm phẫn đanh thép -> sục sôi chiến thắng -> tự hào thanh bình).',
        criticalThinkingTip: 'Hãy chọn 1 cặp câu biền ngẫu em ấn tượng nhất để phân tích tính sóng đôi về từ ngữ và hình ảnh.',
      },
    ],
    ethicsChecklist: {
      isHumanVerified: true,
      verifiedNotes: 'Đã thẩm định chuẩn theo SGK Ngữ văn 10 (Chương trình Giáo dục phổ thông mới 2018); nội dung bám sát kiến thức trọng tâm.',
      verifiedDate: '2026-08-28',
      aiGeneratedNotice: 'Học liệu ôn tập Ngữ văn 10 được hệ thống hóa chuẩn hóa cho học sinh Lớp 10.',
      checklistItems: {
        factualAccuracy: true,
        educationalIntent: true,
        unescoResponsibleUse: true,
        avoidPlagiarism: true,
      },
    },
    updatedAt: '2026-08-28T14:00:00.000Z',
  },
};
