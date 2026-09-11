import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to extract client-side local API key from request headers
function getClientApiKey(req: express.Request): string | undefined {
  const headerKey = req.headers['x-gemini-api-key'] as string;
  if (headerKey && headerKey.trim()) return headerKey.trim();
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.substring(7).trim();
  }
  return undefined;
}

// Initialize Google GenAI with optional custom local API key or server ENV key
function getAIClient(customApiKey?: string): GoogleGenAI | null {
  const key = customApiKey?.trim() || process.env.GEMINI_API_KEY;
  if (!key) return null;

  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient Gemini Call with Retries and Model Fallbacks
async function callGeminiWithRetry(
  ai: GoogleGenAI,
  params: {
    prompt: string;
    systemInstruction?: string;
    schema?: any;
    temperature?: number;
  },
  maxRetries = 2
) {
  const models = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-3.7-flash'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const config: any = {};
        if (params.systemInstruction) {
          config.systemInstruction = params.systemInstruction;
        }
        if (params.temperature !== undefined) {
          config.temperature = params.temperature;
        }
        if (params.schema) {
          config.responseMimeType = 'application/json';
          config.responseSchema = params.schema;
        }

        const response = await ai.models.generateContent({
          model,
          contents: params.prompt,
          config,
        });

        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('fetch failed');

        console.warn(`[Gemini API Warning] Model ${model} (attempt ${attempt + 1}/${maxRetries + 1}) failed: ${errMsg}`);

        if (!isTransient || attempt === maxRetries) {
          break; // Try next model
        }
        // Exponential backoff wait
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

// Server-side fallback content generators (when Gemini API is overloaded)
function generateServerFallbackPreview(topicTitle: string, grade: string, sources: any[]) {
  return {
    coreConcepts: [
      `Khám phá hoàn cảnh sáng tác, vị trí lịch sử và tư tưởng nhân đạo cốt lõi của tác phẩm "${topicTitle}".`,
      `Phân tích những chuyển biến tâm lý nhân vật và các mâu thuẫn xung đột nghệ thuật trọng tâm.`,
      `Đánh giá các thủ pháp nghệ thuật tiêu biểu, ngôn ngữ biểu đạt và hình tượng nghệ thuật độc đáo.`,
      `Rút ra bài học nhân sinh sâu sắc và thông điệp thời đại theo chuẩn chương trình ${grade || 'Ngữ văn'}.`,
    ],
    keywords: [
      topicTitle,
      'Giá trị nhân đạo',
      'Hiện thực đời sống',
      'Nghệ thuật miêu tả',
      'Tâm lý nhân vật',
      'Chi tiết đắt giá',
    ],
    scopeAndGenre: `Tác phẩm Ngữ văn trọng tâm dành cho học sinh ${grade || 'Lớp 9-12'}. Phân tích dựa trên ${sources?.length || 0} nguồn tư liệu học tập.`,
    notesAndGaps: [
      'Nguồn tư liệu đã bao quát tương đối đầy đủ nội dung cơ bản.',
      'Khuyến khích học sinh đối sánh với văn bản sách giáo khoa để nắm vững các trích dẫn nguyên văn.',
    ],
  };
}

function generateServerFallbackStudyPack(topicTitle: string, grade: string, learningGoal: string) {
  return {
    summary: {
      shortSummary: `Tác phẩm "${topicTitle}" là một kiệt tác văn học tiêu biểu, khắc họa chân thực hiện thực đời sống và ngợi ca phẩm giá con người với tấm lòng nhân đạo sâu sắc.`,
      historicalContext: `Được sáng tác trong bối cảnh lịch sử đầy biến động, tác phẩm ghi lại dấu ấn của thời đại cùng sự trăn trở sâu sắc của nhà văn trước số phận con người.`,
      coreValues: `Kết hợp nhuần nhuyễn giữa giá trị hiện thực tố cáo và giá trị nhân văn cao đẹp, bồi đắp lòng trắc ẩn và sự hướng thiện cho bạn đọc.`,
      plotStructure: [
        '1. Khởi đầu: Giới thiệu không gian nghệ thuật và hoàn cảnh nhân vật.',
        '2. Phát triển: Các mâu thuẫn xã hội và xung đột nội tâm bắt đầu nảy sinh.',
        '3. Cao trào: Điểm nút bi kịch hoặc sự thức tỉnh mang tính bước ngoặt.',
        '4. Dư âm: Kết thúc gợi mở suy ngẫm triết lý về cuộc sống và con người.',
      ],
    },
    keyPoints: [
      {
        id: `kp_fallback_1`,
        category: 'Khái niệm & Bối cảnh',
        title: 'Bối cảnh thời đại và tư tưởng cốt lõi',
        description: 'Tác phẩm phản ánh chân thực những vấn đề bức thiết của xã hội và thân phận con người.',
      },
      {
        id: `kp_fallback_2`,
        category: 'Luận điểm Nội dung',
        title: 'Vẻ đẹp tâm hồn và phẩm giá con người',
        description: 'Dưới ngòi bút nhân văn, nhân vật tỏa sáng với những phẩm chất cao quý và tình yêu thương.',
      },
      {
        id: `kp_fallback_3`,
        category: 'Nghệ thuật & Biện pháp',
        title: 'Nghệ thuật xây dựng tình huống và khắc họa tâm lý',
        description: 'Ngôn từ tinh tế, tình huống độc đáo, giàu sức biểu cảm và tính gợi hình sâu sắc.',
      },
      {
        id: `kp_fallback_4`,
        category: 'Phân biệt & Mở rộng',
        title: 'Liên hệ đối sánh và mở rộng chủ đề',
        description: 'Mở rộng so sánh với các tác phẩm cùng đề tài để làm nổi bật nét độc đáo trong phong cách nghệ thuật.',
      },
      {
        id: `kp_fallback_5`,
        category: 'Lưu ý & Lỗi thường gặp',
        title: 'Tránh diễn xuôi hoặc kể lại cốt truyện đơn thuần',
        description: 'Cần bám sát luận điểm, phân tích nghệ thuật thay vì chỉ tóm tắt lại diễn biến văn bản.',
      },
    ],
    questions: [
      {
        id: `q_fallback_1`,
        type: 'true_false',
        question: `Tác phẩm "${topicTitle}" thể hiện cái nhìn nhân đạo sâu sắc và thấu hiểu kiếp người.`,
        correctAnswer: 'Đúng',
        explanation: 'Đây là giá trị tư tưởng nền tảng xuyên suốt tác phẩm.',
        difficulty: 'Cơ bản',
      },
      {
        id: `q_fallback_2`,
        type: 'true_false',
        question: 'Khi làm bài nghị luận văn học, chỉ cần ghi nhớ cốt truyện mà không cần phân tích nghệ thuật.',
        correctAnswer: 'Sai',
        explanation: 'Nghị luận văn học bắt buộc phải mổ xẻ các thủ pháp nghệ thuật, ngôn từ và chi tiết then chốt.',
        difficulty: 'Cơ bản',
      },
      {
        id: `q_fallback_3`,
        type: 'multiple_choice',
        question: `Yếu tố nghệ thuật nào đóng vai trò then chốt làm nên sức lay động của "${topicTitle}"?`,
        options: [
          'A. Ngòi bút miêu tả tâm lý sắc sảo và tình huống truyện độc đáo',
          'B. Chỉ sử dụng ngôn từ phóng đại thuần túy',
          'C. Tập trung vào các chi tiết kỳ ảo không có thực',
          'D. Hoàn toàn không miêu tả ngoại cảnh',
        ],
        correctAnswer: 'A. Ngòi bút miêu tả tâm lý sắc sảo và tình huống truyện độc đáo',
        explanation: 'Khắc họa tâm lý và tình huống là điểm tựa nghệ thuật lớn nhất của tác phẩm.',
        difficulty: 'Thông hiểu',
      },
      {
        id: `q_fallback_4`,
        type: 'fill_in_blank',
        question: `Giá trị cốt lõi của tác phẩm kết tinh ở tình yêu thương và lòng [...] nhân ái cao cả.`,
        correctAnswer: 'trắc ẩn',
        explanation: 'Lòng trắc ẩn và tình nhân ái là sợi chỉ đỏ xuyên suốt tác phẩm.',
        contextClue: 'Lòng [......] nhân ái cao cả',
        difficulty: 'Cơ bản',
      },
      {
        id: `q_fallback_5`,
        type: 'short_answer',
        question: `Nêu 01 bài học nhân sinh em rút ra được sau khi tìm hiểu tác phẩm "${topicTitle}"?`,
        correctAnswer: 'Bài học về sự trân trọng phẩm giá con người, biết thấu hiểu, đồng cảm và gìn giữ sự lương thiện trong mọi nghịch cảnh.',
        explanation: 'Học sinh trình bày rõ ràng cảm nhận cá nhân và liên hệ thực tế một cách chân thành.',
        difficulty: 'Vận dụng',
      },
    ],
    flashcards: [
      {
        id: `fc_fallback_1`,
        front: `Tư tưởng chủ đạo của tác phẩm "${topicTitle}" là gì?`,
        back: 'Ngợi ca phẩm giá con người, cảm thông sâu sắc với nỗi đau khổ và khát vọng sống chân chính.',
        category: 'Tư tưởng',
        mastered: false,
      },
      {
        id: `fc_fallback_2`,
        front: 'Đặc sắc về nghệ thuật xây dựng nhân vật?',
        back: 'Khắc họa nội tâm tinh tế qua hành động, độc thoại nội tâm và ngôn ngữ mang đậm cá tính.',
        category: 'Nghệ thuật',
        mastered: false,
      },
      {
        id: `fc_fallback_3`,
        front: 'Chi tiết nghệ thuật then chốt mang tính bước ngoặt?',
        back: 'Chi tiết bộc lộ bước chuyển biến tâm trạng hoặc làm bật lên bản chất số phận nhân vật.',
        category: 'Chi tiết nghệ thuật',
        mastered: false,
      },
    ],
    qaSeeds: [
      {
        id: `qa_fallback_1`,
        question: `Tại sao giá trị nhân đạo trong "${topicTitle}" vẫn còn nguyên giá trị đối với thời đại ngày nay?`,
        answer: 'Vì tác phẩm chạm tới những quy luật muôn đời của tình cảm con người: khát vọng được yêu thương, được tôn trọng và gìn giữ lương tri.',
        criticalThinkingTip: 'Hãy liên hệ với cách con người ngày nay đối xử với nhau trước những khó khăn.',
      },
      {
        id: `qa_fallback_2`,
        question: 'Làm thế nào để tránh lối viết văn rập khuôn, sáo mòn khi phân tích tác phẩm?',
        answer: 'Hãy tập trung mổ xẻ những chi tiết nhỏ giàu sức gợi, đặt nhân vật vào hoàn cảnh lịch sử cụ thể và bày tỏ rung cảm chân thực của chính mình.',
        criticalThinkingTip: 'Hãy chọn 1 hình ảnh văn học em thích nhất để làm điểm tựa cho bài viết.',
      },
    ],
    ethicsChecklist: {
      isHumanVerified: false,
      aiGeneratedNotice: 'Study Pack do hệ thống tạo lập tự động. Học sinh vui lòng kiểm tra và thẩm định lại.',
      checklistItems: {
        factualAccuracy: true,
        educationalIntent: true,
        unescoResponsibleUse: true,
        avoidPlagiarism: true,
      },
    },
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const clientKey = getClientApiKey(req);
  const ai = getAIClient(clientKey);
  res.json({
    status: 'ok',
    hasApiKey: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

// API: Verify local Gemini API Key (Round 5 - Local Only)
app.post('/api/gemini/verify-key', async (req, res) => {
  const clientKey = getClientApiKey(req) || req.body?.apiKey;
  if (!clientKey) {
    return res.status(400).json({ success: false, message: 'Chưa nhận được API Key để kiểm tra.' });
  }

  try {
    const ai = getAIClient(clientKey);
    if (!ai) {
      return res.status(400).json({ success: false, message: 'Không thể khởi tạo Gemini Client với key này.' });
    }

    const response = await callGeminiWithRetry(ai, {
      prompt: 'Trả lời duy nhất một từ: OK',
    });

    if (response && response.text) {
      return res.json({ success: true, message: 'API Key cá nhân hợp lệ và kết nối tới Google Gemini API thành công!' });
    } else {
      return res.status(400).json({ success: false, message: 'Phản hồi từ Gemini API không thành công.' });
    }
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.warn('[Verify Gemini Key Error]:', errMsg);
    return res.status(400).json({
      success: false,
      message: `Xác thực thất bại: ${errMsg.slice(0, 180)}`,
    });
  }
});

// API: Generate AI Preview ("AI đã hiểu gì") from sources
app.post('/api/ai/preview', async (req, res) => {
  const { topicTitle, grade, learningGoal, sources } = req.body;
  try {
    const clientKey = getClientApiKey(req);
    const ai = getAIClient(clientKey);

    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        preview: generateServerFallbackPreview(topicTitle, grade, sources),
      });
    }

    const sourcesText = Array.isArray(sources)
      ? sources
          .map(
            (s: any, idx: number) =>
              `[Nguồn ${idx + 1} - ${s.type?.toUpperCase()}]: ${s.title}\nNội dung: ${s.content || s.meta?.imageDesc || ''}`
          )
          .join('\n\n')
      : 'Không có nguồn văn bản chi tiết.';

    const prompt = `Bạn là chuyên gia sư phạm Ngữ văn Việt Nam. Hãy đóng vai AI phân tích học liệu đầu vào cho chủ đề/tác phẩm sau:
Chủ đề: "${topicTitle}" (Đối tượng: ${grade || 'Lớp 9-12'}).
Mục tiêu học tập: "${learningGoal || 'Ôn tập kiến thức tác phẩm, nắm vững giá trị nội dung và nghệ thuật'}".

Dưới đây là các nguồn học liệu học sinh đã nhập:
${sourcesText}

Hãy phân tích và trả về cấu trúc JSON đúng chuẩn như sau:
{
  "coreConcepts": ["Ý chính cốt lõi 1", "Ý chính cốt lõi 2", "Ý chính cốt lõi 3", "Ý chính cốt lõi 4"],
  "keywords": ["Từ khóa 1", "Từ khóa 2", "Từ khóa 3", "Từ khóa 4", "Từ khóa 5", "Từ khóa 6"],
  "scopeAndGenre": "Thể loại, hoàn cảnh sáng tác, phạm vi kiến thức chương trình",
  "notesAndGaps": ["Lưu ý quan trọng 1", "Chỗ cần bổ sung nguồn hoặc tài liệu đối sánh 2"]
}`;

    const response = await callGeminiWithRetry(ai, {
      prompt,
      schema: {
        type: Type.OBJECT,
        properties: {
          coreConcepts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Các ý chính cốt lõi AI đã hiểu từ tài liệu',
          },
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Các từ khóa quan trọng và thuật ngữ văn học',
          },
          scopeAndGenre: {
            type: Type.STRING,
            description: 'Phạm vi kiến thức, thể loại và bối cảnh tác phẩm',
          },
          notesAndGaps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Ghi chú về điểm khuyết thiếu cần bổ sung hoặc lưu ý kiểm chứng',
          },
        },
        required: ['coreConcepts', 'keywords', 'scopeAndGenre', 'notesAndGaps'],
      },
    });

    const jsonStr = response.text || '{}';
    const parsed = JSON.parse(jsonStr);
    return res.json({ success: true, preview: parsed });
  } catch (error: any) {
    console.warn('AI Preview generation fallback triggered due to:', error?.message || error);
    return res.json({
      success: true,
      isFallback: true,
      preview: generateServerFallbackPreview(topicTitle, grade, sources),
    });
  }
});

// API: Generate Study Pack (Summary, Key Points, Multi-format Questions, Flashcards, QA Seeds)
app.post('/api/ai/studypack', async (req, res) => {
  const { topicTitle, grade, learningGoal, sources, preview } = req.body;
  try {
    const clientKey = getClientApiKey(req);
    const ai = getAIClient(clientKey);

    if (!ai) {
      return res.json({
        success: true,
        isFallback: true,
        studyPack: generateServerFallbackStudyPack(topicTitle, grade, learningGoal),
      });
    }

    const prompt = `Bạn là giáo viên chuyên gia bộ môn Ngữ Văn Việt Nam. Hãy tạo một bộ học liệu ôn tập cá nhân (Study Pack) toàn diện, bám sát chương trình phổ thông và chuẩn học đường (không chỉ lặp từ khóa mà phải học được thật, đào sâu nội dung và nghệ thuật).

Chủ đề / Tác phẩm: "${topicTitle}" (Dành cho học sinh: ${grade || 'Lớp 9-12'}).
Mục tiêu ôn tập: "${learningGoal}".

Dữ liệu nguồn đã hiểu:
Ý chính: ${(preview?.coreConcepts || []).join('; ')}
Từ khóa: ${(preview?.keywords || []).join(', ')}
Phạm vi: ${preview?.scopeAndGenre || ''}

Yêu cầu xuất ra JSON chuẩn với các phần:
1. summary: Bản tóm tắt súc tích, hoàn cảnh sáng tác, giá trị nội dung & hiện thực/nhân đạo, các chặng mạch cảm xúc/cốt truyện.
2. keyPoints: Danh sách 4-6 luận điểm cốt lõi, có phân loại category ("Khái niệm & Bối cảnh" | "Luận điểm Nội dung" | "Nghệ thuật & Biện pháp" | "Phân biệt & Mở rộng" | "Lưu ý & Lỗi thường gặp"), kèm trích dẫn dẫn chứng văn học tiêu biểu.
3. questions: Bộ câu hỏi cơ bản nhiều dạng gồm:
   - 2 câu Đúng/Sai (type: "true_false", correctAnswer là "Đúng" hoặc "Sai", explanation giải thích rõ ràng)
   - 3 câu Trắc nghiệm 4 lựa chọn (type: "multiple_choice", options 4 phương án, correctAnswer ghi phương án đúng, explanation chi tiết)
   - 2 câu Điền từ ngắn (type: "fill_in_blank", correctAnswer từ/cụm từ cần điền, contextClue là câu văn khuyết từ)
   - 2 câu Hỏi - đáp ngắn đọc hiểu (type: "short_answer", correctAnswer là câu trả lời mẫu chuẩn mực, explanation là gợi ý barem chấm)
4. flashcards: 5-8 thẻ ghi nhớ ôn nhanh 2 mặt (Mặt trước: Thuật ngữ/Biểu tượng/Câu hỏi nghệ thuật; Mặt sau: Phân tích ý nghĩa, dẫn chứng tiêu biểu).
5. qaSeeds: 3-4 câu hỏi gợi mở tư duy chiều sâu (Critical Thinking Q&A) để học sinh tự phản biện và hiểu bài sâu sắc.`;

    const response = await callGeminiWithRetry(ai, {
      prompt,
      schema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.OBJECT,
            properties: {
              shortSummary: { type: Type.STRING },
              historicalContext: { type: Type.STRING },
              coreValues: { type: Type.STRING },
              plotStructure: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['shortSummary', 'historicalContext', 'coreValues', 'plotStructure'],
          },
          keyPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: {
                  type: Type.STRING,
                  description: 'Khái niệm & Bối cảnh | Luận điểm Nội dung | Nghệ thuật & Biện pháp | Phân biệt & Mở rộng | Lưu ý & Lỗi thường gặp',
                },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                quote: { type: Type.STRING },
              },
              required: ['category', 'title', 'description'],
            },
          },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: {
                  type: Type.STRING,
                  description: 'true_false | multiple_choice | fill_in_blank | short_answer',
                },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                difficulty: { type: Type.STRING, description: 'Cơ bản | Thông hiểu | Vận dụng' },
                contextClue: { type: Type.STRING },
              },
              required: ['type', 'question', 'correctAnswer', 'explanation'],
            },
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                front: { type: Type.STRING },
                back: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ['front', 'back', 'category'],
            },
          },
          qaSeeds: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                criticalThinkingTip: { type: Type.STRING },
              },
              required: ['question', 'answer', 'criticalThinkingTip'],
            },
          },
        },
        required: ['summary', 'keyPoints', 'questions', 'flashcards', 'qaSeeds'],
      },
    });

    const jsonStr = response.text || '{}';
    const parsed = JSON.parse(jsonStr);

    // Ensure IDs exist for each item
    if (parsed.keyPoints) {
      parsed.keyPoints = parsed.keyPoints.map((kp: any, i: number) => ({
        id: kp.id || `kp_${Date.now()}_${i}`,
        ...kp,
      }));
    }
    if (parsed.questions) {
      parsed.questions = parsed.questions.map((q: any, i: number) => ({
        id: q.id || `q_${Date.now()}_${i}`,
        ...q,
      }));
    }
    if (parsed.flashcards) {
      parsed.flashcards = parsed.flashcards.map((f: any, i: number) => ({
        id: f.id || `fc_${Date.now()}_${i}`,
        mastered: false,
        ...f,
      }));
    }
    if (parsed.qaSeeds) {
      parsed.qaSeeds = parsed.qaSeeds.map((qa: any, i: number) => ({
        id: qa.id || `qa_${Date.now()}_${i}`,
        ...qa,
      }));
    }

    return res.json({ success: true, studyPack: parsed });
  } catch (error: any) {
    console.warn('StudyPack generation fallback triggered due to:', error?.message || error);
    return res.json({
      success: true,
      isFallback: true,
      studyPack: generateServerFallbackStudyPack(topicTitle, grade, learningGoal),
    });
  }
});

// API: Literary AI Mentor Chat with Strict Document Grounding
app.post('/api/ai/chat', async (req, res) => {
  const { topicTitle, question, context, sourcesText, previewText, studyPackText } = req.body;
  try {
    const clientKey = getClientApiKey(req);
    const ai = getAIClient(clientKey);

    const groundingContext = `
[DANH MỤC TÀI LIỆU HỌC TẬP ĐƯỢC CUNG CẤP FOR "${topicTitle}"]
- Tóm tắt ngữ cảnh / Context: ${context || 'N/A'}
- Các nguồn học liệu (Sources): ${sourcesText || 'Chưa cung cấp văn bản chi tiết'}
- Phân tích AI Preview: ${previewText || 'Chưa có preview'}
- Nội dung Bộ Study Pack (Luận điểm, Tóm tắt, Flashcard, Q&A): ${studyPackText || 'Chưa khởi tạo study pack'}
`;

    if (!ai) {
      // Local semantic checking when offline / no API key
      const lcQ = (question || '').toLowerCase();
      const lcDoc = (groundingContext + ' ' + topicTitle).toLowerCase();

      // Check keyword overlap
      const qTokens = lcQ.split(/\s+/).filter((w: string) => w.length > 2);
      const matchCount = qTokens.filter((t: string) => lcDoc.includes(t)).length;

      // Unrelated keywords trigger strict out-of-scope answer
      const unrelatedKeywords = ['gia tốc', 'vật lý', 'hóa học', 'toán', 'pháp', 'paris', 'python', 'javascript', 'bóng đá', 'thời tiết'];
      const isUnrelated = unrelatedKeywords.some((k) => lcQ.includes(k) && !lcDoc.includes(k));

      if (isUnrelated || (qTokens.length > 2 && matchCount === 0)) {
        return res.json({
          success: true,
          isFallback: true,
          isOutofScope: true,
          answer: 'Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp.',
        });
      }

      return res.json({
        success: true,
        isFallback: true,
        answer: `[Trợ lý Ngữ Văn 10 - Bám sát tài liệu]: Đối với tác phẩm "${topicTitle}", căn cứ theo tài liệu đã tải lên, em lưu ý các điểm trọng tâm sau để trả lời câu hỏi "${question}":
1. Bám sát luận điểm chính và các chi tiết nghệ thuật tiêu biểu trong phần Tóm tắt & Study Pack.
2. Trích dẫn đúng câu từ, hình ảnh nghệ thuật được đề cập trong nguồn học liệu.
3. Rút ra bài học tư tưởng và ý nghĩa nhân văn theo đúng định hướng của bài học.`,
      });
    }

    const systemInstruction = `Bạn là "Trợ lý Ôn Bài Bám Sát Tài Liệu Ngữ Văn 10" (Grounded AI Tutor) dành cho học sinh Lớp 10.
NGUYÊN TẮC BẮT BỘC (STRICT GROUNDING RULES):
1. Bạn CHỈ ĐƯỢC PHÉP trả lời những câu hỏi có nội dung nằm trong hoặc có thể suy ra trực tiếp từ các Tài liệu học tập (Sources, Analysis Preview, Study Pack) được cung cấp trong ngữ cảnh.
2. NẾU câu hỏi của học sinh NẰM NGOÀI PHẠM VI các tài liệu được cung cấp hoặc không thể suy ra từ tài liệu, bạn BẮT BUỘC PHẢI TRẢ LỜI CHÍNH XÁC CÂU:
"Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp."
(Sau câu này, em có thể thêm 1 câu ngắn gọn khuyên học sinh kiểm tra lại tài liệu hoặc chọn chủ đề phù hợp).
3. KHÔNG ĐƯỢC trả lời các câu hỏi kiến thức ngoài bài học (Toán, Lý, Hóa, Lập trình, Địa lý ngoài lề, Tin tức thời sự...).
4. Trả lời bằng tiếng Việt thân thiện, ngôn ngữ trong sáng, chuẩn mực sư phạm, xưng "Trợ lý Ngữ Văn 10" với "em".`;

    const prompt = `${groundingContext}

Câu hỏi của học sinh: "${question}"

Hãy kiểm tra kỹ xem câu hỏi có nằm trong phạm vi tài liệu ở trên hay không và trả lời đúng theo quy tắc strict grounding.`;

    const response = await callGeminiWithRetry(ai, {
      prompt,
      systemInstruction,
      temperature: 0.2, // Low temperature for high precision grounding
    });

    return res.json({
      success: true,
      answer: response.text || 'Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp.',
    });
  } catch (error: any) {
    console.warn('Grounded chat error, using semantic fallback:', error?.message || error);
    return res.json({
      success: true,
      isFallback: true,
      answer: `[Trợ lý Ngữ Văn 10]: Đối với bài học "${topicTitle}", em hãy bám sát nội dung phần Tóm tắt và Luận điểm đã được tổng hợp trong tài liệu để trả lời câu hỏi "${question}" nhé!`,
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(` Văn Việt AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
