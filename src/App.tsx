import { useState, useEffect, useMemo } from 'react';
import { HelpCircle, Bot } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Buoi1Stage } from './components/Buoi1Stage';
import { Buoi2Stage } from './components/Buoi2Stage';
import { Buoi3Stage } from './components/Buoi3Stage';
import { Buoi4Stage } from './components/Buoi4Stage';
import { GroundedChatbot } from './components/GroundedChatbot';
import { DocsView } from './components/DocsView';
import { SnapshotManagerModal } from './components/SnapshotManagerModal';
import { ApiKeySettingsModal } from './components/ApiKeySettingsModal';
import { AppStage, Topic, SourceItem, AIPreview, StudyPack } from './types';
import { storage } from './services/storage';
import { checkServerHealth, HealthCheckResult } from './services/api';

export default function App() {
  const [currentStage, setCurrentStage] = useState<AppStage>('buoi1');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string>('');
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<HealthCheckResult>({
    status: 'checking',
    hasApiKey: false,
    timestamp: new Date().toISOString(),
  });

  // Loaded data for active topic
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [preview, setPreview] = useState<AIPreview | undefined>(undefined);
  const [studyPack, setStudyPack] = useState<StudyPack | undefined>(undefined);

  // Check health and initialize storage
  useEffect(() => {
    storage.initialize();
    refreshAllData();

    checkServerHealth().then((res) => {
      setServerStatus(res);
    });
  }, []);

  // Load initial data
  const refreshAllData = () => {
    const allTopics = storage.getTopics();
    setTopics(allTopics);

    let activeId = storage.getActiveTopicId();
    if (!activeId && allTopics.length > 0) {
      activeId = allTopics[0].id;
      storage.setActiveTopicId(activeId);
    }
    setActiveTopicId(activeId);

    if (activeId) {
      setSources(storage.getSourcesByTopicId(activeId));
      setPreview(storage.getPreviewByTopicId(activeId));
      setStudyPack(storage.getStudyPackByTopicId(activeId));
    }
  };

  // When active topic changes
  const activeTopic = useMemo(() => {
    return topics.find((t) => t.id === activeTopicId) || topics[0];
  }, [topics, activeTopicId]);

  const handleSelectTopic = (id: string) => {
    setActiveTopicId(id);
    storage.setActiveTopicId(id);
    setSources(storage.getSourcesByTopicId(id));
    setPreview(storage.getPreviewByTopicId(id));
    setStudyPack(storage.getStudyPackByTopicId(id));
  };

  const handleCreateTopic = (newTopic: Topic) => {
    storage.saveTopics([newTopic, ...storage.getTopics()]);
    storage.setActiveTopicId(newTopic.id);
    refreshAllData();
  };

  const handleTopicUpdated = (updated: Topic) => {
    setTopics((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleSourcesUpdated = () => {
    if (activeTopicId) {
      setSources(storage.getSourcesByTopicId(activeTopicId));
    }
  };

  const handlePreviewUpdated = (newPreview: AIPreview) => {
    setPreview(newPreview);
  };

  const handleStudyPackUpdated = (newPack: StudyPack) => {
    setStudyPack(newPack);
  };

  const handleRestoreSuccess = (restored: {
    topic: Topic;
    sources: SourceItem[];
    preview?: AIPreview;
    studyPack?: StudyPack;
  }) => {
    setTopics(storage.getTopics());
    setActiveTopicId(restored.topic.id);
    setSources(restored.sources);
    setPreview(restored.preview);
    setStudyPack(restored.studyPack);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans selection:bg-sky-200 selection:text-blue-950">
      {/* Top Navigation */}
      <Navbar
        currentStage={currentStage}
        onSelectStage={setCurrentStage}
        topics={topics}
        activeTopic={activeTopic}
        onSelectTopic={handleSelectTopic}
        onTopicCreated={handleCreateTopic}
        onDataReset={refreshAllData}
        onOpenSnapshotModal={() => setIsSnapshotModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        serverStatus={serverStatus}
      />

      {/* Local Gemini API Key Settings Modal */}
      <ApiKeySettingsModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={() => {
          checkServerHealth().then(setServerStatus);
        }}
      />

      {/* Snapshot Save / Load Modal */}
      {activeTopic && (
        <SnapshotManagerModal
          isOpen={isSnapshotModalOpen}
          onClose={() => setIsSnapshotModalOpen(false)}
          topic={activeTopic}
          sources={sources}
          preview={preview}
          studyPack={studyPack}
          onRestoreSuccess={handleRestoreSuccess}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentStage === 'buoi1' && (
          <Buoi1Stage
            topic={activeTopic}
            onTopicUpdated={handleTopicUpdated}
            onNextStage={() => setCurrentStage('buoi2')}
          />
        )}

        {currentStage === 'buoi2' && activeTopic && (
          <Buoi2Stage
            topic={activeTopic}
            sources={sources}
            preview={preview}
            onSourcesUpdated={handleSourcesUpdated}
            onPreviewUpdated={handlePreviewUpdated}
            onNextStage={() => setCurrentStage('buoi3')}
          />
        )}

        {currentStage === 'buoi3' && activeTopic && (
          <Buoi3Stage
            topic={activeTopic}
            sources={sources}
            preview={preview}
            studyPack={studyPack}
            onStudyPackUpdated={handleStudyPackUpdated}
            onOpenSnapshotModal={() => setIsSnapshotModalOpen(true)}
          />
        )}

        {currentStage === 'buoi4' && activeTopic && (
          <Buoi4Stage
            topic={activeTopic}
            sources={sources}
            preview={preview}
            studyPack={studyPack}
            onOpenSnapshotModal={() => setIsSnapshotModalOpen(true)}
          />
        )}

        {currentStage === 'chatbot' && activeTopic && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bg-slate-900 rounded-2xl p-6 text-slate-100 shadow-xl border border-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                    <Bot className="w-3.5 h-3.5" />
                    <span>TRỢ LÝ HỌC TẬP GROUNDED AI</span>
                  </span>
                  <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    Bám Sát Học Liệu Lớp 10
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
                  Trợ Lý Ngữ Văn AI: "{activeTopic.title}"
                </h1>
                <p className="text-slate-300 text-sm max-w-2xl">
                  Trợ lý AI trả lời thắc mắc, phân tích chi tiết tác phẩm bám sát các nguồn học liệu, bản preview và bộ Study Pack đã nạp cho bài học này.
                </p>
              </div>

              <div className="flex items-center space-x-2 self-start md:self-auto">
                <button
                  onClick={() => setCurrentStage('buoi4')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-200" />
                  <span>Chuyển Sang Ôn Tập Quiz</span>
                </button>
              </div>
            </div>

            <GroundedChatbot
              topic={activeTopic}
              sources={sources}
              preview={preview}
              studyPack={studyPack}
            />
          </div>
        )}

        {currentStage === 'docs' && <DocsView initialTab="architecture" />}
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-200/80 bg-white/90 py-6 mt-12 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-slate-700">
            <strong className="text-blue-900">Ngữ Văn 10</strong> — Nền tảng ôn tập môn Ngữ văn Lớp 10 thông minh tuân thủ chuẩn mực UNESCO AI Competencies.
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentStage('docs')}
              className="text-blue-700 hover:text-blue-900 font-medium hover:underline"
            >
              Hồ sơ Kỹ thuật (SRS & Sơ đồ)
            </button>
            <span>•</span>
            <span className="text-slate-500">Local-First Persistence Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
