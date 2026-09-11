import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  Bot,
  User,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Info,
  HelpCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Topic, SourceItem, AIPreview, StudyPack } from '../types';
import { requestAIChat } from '../services/api';

interface GroundedChatbotProps {
  topic: Topic;
  sources?: SourceItem[];
  preview?: AIPreview;
  studyPack?: StudyPack;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isOutofScope?: boolean;
}

export function GroundedChatbot({
  topic,
  sources = [],
  preview,
  studyPack,
}: GroundedChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPlayingId, setIsPlayingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message with topic grounded details
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome_msg',
      sender: 'bot',
      text: `Xin chào em! Cô/Thầy là **Trợ lý Ôn Bài Bám Sát Tài Liệu** cho chủ đề **"${topic.title}"** (${topic.author}).

📚 **Phạm vi kiến thức AI đã nạp:**
1. **${sources.length} Nguồn học liệu** (${sources.map((s) => s.title).join(', ') || 'Chưa có'})
2. **Bản AI Preview** (${preview?.coreConcepts?.length || 0} ý cốt lõi, ${preview?.keywords?.length || 0} từ khóa)
3. **Bộ Study Pack** (${studyPack?.keyPoints?.length || 0} luận điểm, ${studyPack?.questions?.length || 0} câu hỏi, ${studyPack?.flashcards?.length || 0} flashcards)

⚠️ **Lưu ý quan trọng**: Thầy/Cô chỉ trả lời những thắc mắc nằm trong hoặc suy ra từ tài liệu trên. Nếu em hỏi ngoài phạm vi, Thầy/Cô sẽ thông báo: *"Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp."* 

Em muốn giải đáp hay đào sâu phần nào trong bài học này?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([welcomeMsg]);
  }, [topic.id]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Text-to-Speech
  const handleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingId === msgId) {
      window.speechSynthesis.cancel();
      setIsPlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;

    utterance.onend = () => setIsPlayingId(null);
    utterance.onerror = () => setIsPlayingId(null);

    setIsPlayingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy text to clipboard
  const handleCopy = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Construct structured text payloads for grounding
  const getGroundingPayloads = () => {
    const sourcesText = sources
      .map((s, idx) => `[Nguồn ${idx + 1} - ${s.title}]: ${s.content || s.meta?.imageDesc || ''}`)
      .join('\n');

    const previewText = preview
      ? `Ý chính: ${preview.coreConcepts.join('; ')} | Từ khóa: ${preview.keywords.join(', ')} | Phạm vi: ${preview.scopeAndGenre}`
      : '';

    const studyPackText = studyPack
      ? `Tóm tắt: ${studyPack.summary?.shortSummary || ''} | Bối cảnh: ${studyPack.summary?.historicalContext || ''} | Giá trị: ${studyPack.summary?.coreValues || ''}
Luận điểm chính: ${studyPack.keyPoints?.map((k) => `${k.title}: ${k.description} (Trích dẫn: ${k.quote || 'N/A'})`).join('; ')}
Câu hỏi & Đáp án: ${studyPack.questions?.map((q) => `Q: ${q.question} -> A: ${q.correctAnswer} (${q.explanation})`).join('; ')}
Flashcards: ${studyPack.flashcards?.map((f) => `Front: ${f.front} -> Back: ${f.back}`).join('; ')}`
      : '';

    return { sourcesText, previewText, studyPackText };
  };

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputQuestion).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuestion('');
    setIsLoading(true);

    const { sourcesText, previewText, studyPackText } = getGroundingPayloads();

    try {
      const answer = await requestAIChat(topic.title, q, {
        context: `Tác phẩm ${topic.title} của ${topic.author}, thể loại ${topic.genre}, cấp học ${topic.grade}.`,
        sourcesText,
        previewText,
        studyPackText,
      });

      const isOutofScope = answer.includes('Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp');

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: answer,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isOutofScope,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: 'bot',
        text: 'Thầy/Cô gặp chút gián đoạn kết nối, em hãy thử hỏi lại câu hỏi nhé!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick suggestions based on active study pack
  const quickPrompts = [
    `Tóm tắt 3 luận điểm cốt lõi của tác phẩm "${topic.title}"?`,
    `Những chi tiết nghệ thuật đắt giá nhất trong bài học này là gì?`,
    `Hoàn cảnh sáng tác và tư tưởng nhân đạo của bài học là gì?`,
    `Gợi ý cách phân tích nhân vật chính theo đúng bài giảng?`,
  ];

  return (
    <div className="bg-white rounded-2xl border border-blue-200/80 shadow-md overflow-hidden flex flex-col h-[clamp(34rem,700px,85dvh)] max-h-[85dvh] min-w-0 animate-in fade-in duration-200">
      {/* Top Banner & Grounding Scope Indicator */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-4 sm:p-5 text-slate-100 flex-shrink-0 border-b border-blue-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start min-w-0 space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 border border-blue-400/40 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Bot className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Trợ Lý Ôn Bài Bám Sát Tài Liệu
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Strict Grounded AI</span>
                </span>
              </div>
              <p className="text-xs text-sky-200/90 flex items-center space-x-1 mt-0.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>
                  Đang giới hạn trong: <strong>{topic.title}</strong> ({sources.length} Nguồn • Preview • Study Pack)
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm('Xóa lịch sử trò chuyện và bắt đầu lại phiên hỏi đáp mới?')) {
                setMessages([messages[0]]);
              }
            }}
            className="self-end sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-700"
            title="Làm mới lịch sử hỏi đáp"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa trò chuyện</span>
          </button>
        </div>

        {/* Strict Scope Rules Disclaimer Box */}
        <div className="mt-3 bg-blue-950/70 rounded-xl p-2.5 border border-blue-800/80 flex items-start space-x-2 text-[11px] text-sky-200/90 leading-snug">
          <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Quy tắc bảo đảm kiến thức:</strong> Chatbot CHỈ trả lời câu hỏi trong phạm vi tài liệu đã nạp. Nếu câu hỏi ngoài phạm vi, AI sẽ đáp rõ: <em className="text-amber-300 font-semibold font-mono">"Nội dung này nằm ngoài phạm vi tài liệu đã cung cấp."</em>
          </div>
        </div>
      </div>

      {/* Messages History List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : msg.isOutofScope
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 text-sky-300 border border-blue-800'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div className={`min-w-0 max-w-[calc(100%-2.75rem)] sm:max-w-[78%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                      : msg.isOutofScope
                      ? 'bg-amber-50 text-amber-950 border border-amber-300/80 rounded-tl-none'
                      : 'bg-white text-slate-900 border border-blue-100 rounded-tl-none'
                  }`}
                >
                  {/* Warning tag if out of scope */}
                  {msg.isOutofScope && (
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 mb-2 pb-1.5 border-b border-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Thông báo phạm vi tài liệu</span>
                    </div>
                  )}

                  {/* Text render with paragraphs */}
                  <div className="space-y-2 whitespace-pre-wrap">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Citation Badge for Bot messages */}
                  {!isUser && !msg.isOutofScope && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1 text-blue-800 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Trích dẫn: Kho Nguồn & Study Pack bài {topic.title}</span>
                      </span>

<div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-blue-800 p-1 rounded hover:bg-slate-100 transition-colors"
                          title="Sao chép câu trả lời"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          className={`p-1 rounded transition-colors ${
                            isPlayingId === msg.id ? 'text-blue-800 font-bold bg-blue-50' : 'hover:text-blue-800 hover:bg-slate-100'
                          }`}
                          title="Đọc phát âm (Text-To-Speech)"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-sky-300 flex items-center justify-center border border-blue-800 shadow-xs">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-white border border-blue-100 rounded-2xl rounded-tl-none p-3.5 shadow-xs flex items-center space-x-2 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Trợ lý AI đang đối soát dữ liệu tài liệu...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Grounded Quick Prompts */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs">
        <span className="font-semibold text-slate-500 flex-shrink-0 flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Gợi ý hỏi:</span>
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 text-xs whitespace-nowrap transition-colors flex-shrink-0"
          >
            {prompt}
          </button>
        ))}

        {/* Special Out-of-Scope Test Button */}
        <button
          onClick={() => handleSendMessage('Công thức tính gia tốc trong môn Vật Lý là gì?')}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs whitespace-nowrap transition-colors flex-shrink-0 font-medium"
          title="Thử gửi câu hỏi ngoài tài liệu để kiểm tra tính năng Strict Grounding"
        >
          🧪 Thử hỏi ngoài tài liệu (Vật lý)
        </button>
      </div>

      {/* Bottom Input Form Area */}
      <div className="p-3 sm:p-4 bg-white border-t border-blue-100 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={`Hỏi bất kỳ điều gì về bài "${topic.title}" (AI sẽ chỉ trả lời trong tài liệu)...`}
            disabled={isLoading}
            className="min-w-0 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-xs flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </form>
      </div>
    </div>
  );
}
