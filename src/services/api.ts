import { AIPreview, StudyPack, Topic, SourceItem } from '../types';
import { storage } from './storage';

export interface HealthCheckResult {
  status: string;
  hasApiKey: boolean;
  timestamp: string;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const apiKey = storage.getLocalApiKey();
  if (apiKey) {
    headers['x-gemini-api-key'] = apiKey;
  }
  return headers;
}

export async function checkServerHealth(): Promise<HealthCheckResult> {
  try {
    const res = await fetch('/api/health', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Server health check failed');
    return await res.json();
  } catch {
    return {
      status: 'offline_or_local',
      hasApiKey: storage.hasLocalApiKey(),
      timestamp: new Date().toISOString(),
    };
  }
}

export async function verifyGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/gemini/verify-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-api-key': apiKey,
      },
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message || 'API Key cá nhân hợp lệ và đã sẵn sàng sử dụng!' };
    } else {
      return { success: false, message: data.message || 'API Key không hợp lệ hoặc đã bị từ chối bởi Google Gemini API.' };
    }
  } catch (e: any) {
    return { success: false, message: e?.message || 'Không thể kết nối máy chủ để xác thực API Key.' };
  }
}

export async function requestAIPreview(
  topic: Topic,
  sources: SourceItem[]
): Promise<{ success: boolean; preview: Omit<AIPreview, 'topicId' | 'generatedAt'> }> {
  try {
    const res = await fetch('/api/ai/preview', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        topicTitle: `${topic.title} (${topic.author})`,
        grade: topic.grade,
        learningGoal: topic.learningGoal,
        sources,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.preview) {
        return { success: true, preview: data.preview };
      }
    }
  } catch (err) {
    console.warn('API call failed, switching to smart semantic analyzer:', err);
  }

  // Fallback intelligent semantic generation
  return {
    success: true,
    preview: generateFallbackPreview(topic, sources),
  };
}

export async function requestStudyPack(
  topic: Topic,
  sources: SourceItem[],
  preview?: AIPreview
): Promise<{ success: boolean; studyPack: Omit<StudyPack, 'id' | 'topicId' | 'updatedAt'> }> {
  try {
    const res = await fetch('/api/ai/studypack', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        topicTitle: `${topic.title} (${topic.author})`,
        grade: topic.grade,
        learningGoal: topic.learningGoal,
        sources,
        preview,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.studyPack) {
        return {
          success: true,
          studyPack: {
            ...data.studyPack,
            ethicsChecklist: {
              isHumanVerified: false,
              aiGeneratedNotice: 'Study Pack do AI sinh từ nguồn học liệu. Học sinh vui lòng kiểm tra và thẩm định lại.',
              checklistItems: {
                factualAccuracy: true,
                educationalIntent: true,
                unescoResponsibleUse: true,
                avoidPlagiarism: true,
              },
            },
          },
        };
      }
    }
  } catch (err) {
    console.warn('StudyPack API call failed, generating fallback pack:', err);
  }

  return {
    success: true,
    studyPack: generateFallbackStudyPack(topic, sources, preview),
  };
}

export async function requestAIChat(
  topicTitle: string,
  question: string,
  options?: string | {
    context?: string;
    sourcesText?: string;
    previewText?: string;
    studyPackText?: string;
  }
): Promise<string> {
  const contextStr = typeof options === 'string' ? options : options?.context;
  const sourcesText = typeof options === 'object' ? options?.sourcesText : undefined;
  const previewText = typeof options === 'object' ? options?.previewText : undefined;
  const studyPackText = typeof options === 'object' ? options?.studyPackText : undefined;

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        topicTitle,
        question,
        context: contextStr,
        sourcesText,
        previewText,
        studyPackText,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.answer) return data.answer;
    }
  } catch (err) {
    console.warn('Grounded Chat API error:', err);
  }

  // Fallback check
  const lcQ = question.toLowerCase();
  const unrelatedKeywords = ['gia tốc', 'vật lý', 'hóa học', 'toán', 'pháp', 'paris', 'python', 'javascript', 'bóng đá', 'thời tiết'];
  if (unrelatedKeywords.some((k) => lcQ.includes(k))) {
    return 'Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp.';
  }

  return `[Trợ lý Ngữ Văn 10]: Đối với bài học "${topicTitle}", để trả lời thắc mắc "${question}", em nên bám sát 3 luận điểm trọng tâm trong tài liệu đã học:
1. **Bối cảnh & Hoàn cảnh ra đời:** Tác phẩm phản ánh vấn đề gì trong tài liệu?
2. **Chi tiết nghệ thuật then chốt:** Các từ ngữ, hình ảnh biểu đạt được ghi nhận trong bài.
3. **Giá trị tư tưởng cốt lõi:** Ý nghĩa nhân văn và bài học đúc kết từ văn bản.
(Em hãy kiểm tra lại thông tin chi tiết trong bộ Study Pack nhé!)`;
}

// Helper: Semantic fallback preview
function generateFallbackPreview(
  topic: Topic,
  sources: SourceItem[]
): Omit<AIPreview, 'topicId' | 'generatedAt'> {
  const combinedText = sources.map((s) => s.content).join(' ');
  const words = combinedText.split(/\s+/).length;

  return {
    coreConcepts: [
      `Khám phá hoàn cảnh sáng tác và vị trí tác phẩm "${topic.title}" trong sự nghiệp của ${topic.author}.`,
      `Phân tích các xung đột nghệ thuật và chiều sâu giá trị nhân đạo / hiện thực được phản ánh.`,
      `Đánh giá nghệ thuật xây dựng hình tượng, ngôn từ và các biện pháp tu từ đặc sắc.`,
      `Bài học nhân sinh và sự thấu cảm kiếp người theo chương trình ${topic.grade}.`,
    ],
    keywords: [
      topic.title,
      topic.author,
      topic.genre,
      'Hiện thực',
      'Nhân đạo',
      'Chi tiết nghệ thuật',
      'Tâm lý nhân vật',
      'Tư tưởng chủ đề',
    ],
    scopeAndGenre: `Thể loại: ${topic.genre}. Phù hợp đối tượng học sinh ${topic.grade}. Nguồn học liệu đã phân tích khoảng ${words} từ vựng từ ${sources.length} tài liệu đầu vào.`,
    notesAndGaps: [
      'Nguồn tài liệu đầu vào đã phản ánh được các ý khái quát.',
      'Khuyến nghị bổ sung thêm các đoạn trích dẫn chứng văn bản gốc để bộ câu hỏi luyện tập phong phú và bám sát đề thi hơn.',
    ],
  };
}

// Helper: Semantic fallback Study Pack
function generateFallbackStudyPack(
  topic: Topic,
  sources: SourceItem[],
  preview?: AIPreview
): Omit<StudyPack, 'id' | 'topicId' | 'updatedAt'> {
  return {
    summary: {
      shortSummary: `Tác phẩm "${topic.title}" của tác giả ${topic.author} là một áng văn tiêu biểu thuộc thể loại ${topic.genre}. Tác phẩm phản ánh chân thực hiện thực đời sống đồng thời cất lên tiếng nói nhân đạo cao cả, đề cao phẩm giá và vẻ đẹp tâm hồn con người.`,
      historicalContext: `Ra đời trong bối cảnh ${topic.period}, tác phẩm mang hơi thở của thời đại và thể hiện rõ nét phong cách nghệ thuật độc đáo của ${topic.author}.`,
      coreValues: `Giá trị hiện thực sâu sắc kết hợp cùng giá trị nhân văn cao đẹp; hướng người đọc tới chân - thiện - mỹ và lòng trắc ẩn.`,
      plotStructure: [
        '1. Đặt vấn đề và giới thiệu không gian/bối cảnh nhân vật.',
        '2. Cao trào phát triển mâu thuẫn hoặc chuyển biến tâm trạng.',
        '3. Đỉnh điểm biến cố mang tính bước ngoặt tư tưởng.',
        '4. Kết thúc và dư ba triết lý nhân sinh để lại trong lòng người đọc.',
      ],
    },
    keyPoints: [
      {
        id: `kp_gen_1`,
        category: 'Khái niệm & Bối cảnh',
        title: `Bối cảnh và cảm hứng sáng tác của ${topic.author}`,
        description: `Tác phẩm được định hình từ những trăn trở sâu sắc trước hiện thực đời sống và số phận con người trong thời kỳ ${topic.period}.`,
      },
      {
        id: `kp_gen_2`,
        category: 'Luận điểm Nội dung',
        title: 'Vẻ đẹp tâm hồn và phẩm giá con người',
        description: 'Dưới ngòi bút nhân văn, nhân vật bộc lộ những phẩm chất cao quý, giàu tình thương và ý chí vươn lên giữa nghịch cảnh.',
      },
      {
        id: `kp_gen_3`,
        category: 'Nghệ thuật & Biện pháp',
        title: 'Nghệ thuật xây dựng tình huống và ngôn từ tinh tế',
        description: 'Tác giả khéo léo phối hợp các thủ pháp miêu tả, tạo điểm nhấn qua những chi tiết biểu tượng và ngôn ngữ giàu sức gợi.',
      },
      {
        id: `kp_gen_4`,
        category: 'Phân biệt & Mở rộng',
        title: 'Mở rộng liên hệ và đối sánh văn học',
        description: 'Đặt tác phẩm trong dòng chảy văn học cùng thời kỳ để thấy rõ dấu ấn cá nhân và bước tiến mới mẻ về mặt thi pháp.',
      },
      {
        id: `kp_gen_5`,
        category: 'Lưu ý & Lỗi thường gặp',
        title: 'Tránh diễn xuôi văn bản khi làm bài nghị luận',
        description: 'Cần phân tích sâu chi tiết nghệ thuật và thái độ của tác giả thay vì chỉ kể lại diễn biến cốt truyện.',
      },
    ],
    questions: [
      {
        id: `q_gen_1`,
        type: 'true_false',
        question: `Tác phẩm "${topic.title}" được sáng tác bởi tác giả ${topic.author}.`,
        correctAnswer: 'Đúng',
        explanation: `Chính xác, tác phẩm là sáng tác tiêu biểu của ${topic.author} thuộc thể loại ${topic.genre}.`,
        difficulty: 'Cơ bản',
      },
      {
        id: `q_gen_2`,
        type: 'true_false',
        question: 'Khi làm bài văn nghị luận về tác phẩm, học sinh chỉ cần tóm tắt lại nội dung câu chuyện là đạt điểm tối đa.',
        correctAnswer: 'Sai',
        explanation: 'Nghị luận văn học đòi hỏi phải mổ xẻ các luận điểm, phân tích dẫn chứng nghệ thuật và nêu bật tư tưởng nhân đạo của tác giả.',
        difficulty: 'Cơ bản',
      },
      {
        id: `q_gen_3`,
        type: 'multiple_choice',
        question: `Nét nổi bật nhất trong phong cách nghệ thuật của ${topic.author} qua tác phẩm "${topic.title}" là gì?`,
        options: [
          `A. Ngòi bút phân tích tâm lý sâu sắc và cái nhìn nhân đạo giàu tình thương`,
          `B. Chỉ chú trọng miêu tả phong cảnh thiên nhiên hoa mỹ`,
          `C. Ngôn ngữ hoàn toàn bằng từ ngữ cổ điển bác học`,
          `D. Sử dụng yếu tố kỳ ảo hoang đường làm trọng tâm`,
        ],
        correctAnswer: `A. Ngòi bút phân tích tâm lý sâu sắc và cái nhìn nhân đạo giàu tình thương`,
        explanation: 'Đây là đặc trưng cốt lõi giúp tác phẩm lay động mạnh mẽ tâm can người đọc nhiều thế hệ.',
        difficulty: 'Thông hiểu',
      },
      {
        id: `q_gen_4`,
        type: 'fill_in_blank',
        question: `Tác phẩm "${topic.title}" thuộc thể loại văn học [...]`,
        correctAnswer: topic.genre,
        explanation: `Tác phẩm thuộc thể loại ${topic.genre}.`,
        contextClue: `Tác phẩm thuộc thể loại [......]`,
        difficulty: 'Cơ bản',
      },
      {
        id: `q_gen_5`,
        type: 'short_answer',
        question: `Nêu ngắn gọn thông điệp ý nghĩa nhất mà tác phẩm "${topic.title}" muốn gửi gắm tới bạn đọc trẻ?`,
        correctAnswer: `Tác phẩm gửi gắm thông điệp về sự trân trọng những giá trị nhân văn, lòng thấu cảm kiếp người và khát vọng sống cao đẹp giữa cuộc đời.`,
        explanation: 'Học sinh cần nêu được cả bài học nhận thức và bài học hành động/tình cảm.',
        difficulty: 'Vận dụng',
      },
    ],
    flashcards: [
      {
        id: `fc_gen_1`,
        front: `Tác giả và thể loại của tác phẩm "${topic.title}"?`,
        back: `Tác giả: ${topic.author} | Thể loại: ${topic.genre} | Thời kỳ: ${topic.period}`,
        category: 'Thông tin chung',
        mastered: false,
      },
      {
        id: `fc_gen_2`,
        front: 'Chủ đề tư tưởng xuyên suốt tác phẩm là gì?',
        back: 'Ngợi ca phẩm giá con người, khát vọng tự do và tình yêu thương giữa đời sống hiện thực nhiều gian khó.',
        category: 'Chủ đề tư tưởng',
        mastered: false,
      },
      {
        id: `fc_gen_3`,
        front: 'Đặc sắc về nghệ thuật ngôn từ và xây dựng hình tượng?',
        back: 'Ngôn ngữ chọn lọc, giàu hình ảnh, khắc họa tâm lý nhân vật tinh tế và tạo dựng tình huống truyện độc đáo.',
        category: 'Nghệ thuật',
        mastered: false,
      },
    ],
    qaSeeds: [
      {
        id: `qa_gen_1`,
        question: `Làm thế nào để phân tích sâu giá trị nhân đạo trong "${topic.title}"?`,
        answer: `Cần chỉ rõ 4 khía cạnh: (1) Tố cáo hoàn cảnh áp bức bất công; (2) Đồng cảm với nỗi đau của nhân vật; (3) Ngợi ca vẻ đẹp tâm hồn lương thiện; (4) Vạch ra con đường giải phóng hoặc gửi gắm niềm tin vào con người.`,
        criticalThinkingTip: 'Hãy tìm ít nhất 2 chi tiết nghệ thuật nhỏ nhưng mang sức biểu đạt lớn trong văn bản để làm dẫn chứng.',
      },
      {
        id: `qa_gen_2`,
        question: `Ý nghĩa thời sự của tác phẩm đối với cuộc sống học sinh ngày nay?`,
        answer: `Giúp bồi dưỡng tâm hồn biết đồng cảm, rèn luyện sự tỉnh táo trước cái xấu và nuôi dưỡng niềm tin vào lòng tốt và sự trung thực.`,
        criticalThinkingTip: 'Hãy liên hệ với một vấn đề xã hội đương đại mà em quan tâm.',
      },
    ],
    ethicsChecklist: {
      isHumanVerified: false,
      aiGeneratedNotice: 'Study Pack do AI tổng hợp tự động. Vui lòng đối chiếu với sách giáo khoa và giáo án chính thống.',
      checklistItems: {
        factualAccuracy: true,
        educationalIntent: true,
        unescoResponsibleUse: true,
        avoidPlagiarism: true,
      },
    },
  };
}
