import React, { useState, useEffect } from 'react';
import {
  Key,
  X,
  ShieldAlert,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Lock,
  Server,
  Info,
} from 'lucide-react';
import { storage } from '../services/storage';
import { verifyGeminiApiKey } from '../services/api';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: () => void;
}

export function ApiKeySettingsModal({
  isOpen,
  onClose,
  onKeyUpdated,
}: ApiKeySettingsModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showPlainKey, setShowPlainKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Load existing key from localStorage
  useEffect(() => {
    if (isOpen) {
      const existingKey = storage.getLocalApiKey();
      if (existingKey) {
        setApiKeyInput(existingKey);
        setIsSaved(true);
        setIsEditing(false);
      } else {
        setApiKeyInput('');
        setIsSaved(false);
        setIsEditing(true);
      }
      setStatusMessage(null);

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập Gemini API Key hợp lệ trước khi lưu.',
      });
      return;
    }

    if (!trimmed.startsWith('AIza')) {
      setStatusMessage({
        type: 'info',
        text: 'Lưu ý: Gemini API Key tiêu chuẩn thường bắt đầu bằng tiền tố "AIza...". Vui lòng kiểm tra lại nếu không chính xác.',
      });
    }

    storage.saveLocalApiKey(trimmed);
    setIsSaved(true);
    setIsEditing(false);
    setStatusMessage({
      type: 'success',
      text: '✨ Đã lưu Gemini API Key cục bộ (Local-Only) thành công!',
    });
    if (onKeyUpdated) onKeyUpdated();
  };

  const handleEditKey = () => {
    setIsEditing(true);
    setStatusMessage(null);
  };

  const handleDeleteKey = () => {
    if (
      window.confirm(
        'Bạn có chắc chắn muốn XÓA Gemini API Key khỏi trình duyệt này không?\n\nSau khi xóa, ứng dụng sẽ chuyển về chế độ phân tích ngữ nghĩa nội bộ/fallback.'
      )
    ) {
      storage.removeLocalApiKey();
      setApiKeyInput('');
      setIsSaved(false);
      setIsEditing(true);
      setStatusMessage({
        type: 'info',
        text: 'Đã xóa Gemini API Key khỏi localStorage thành công.',
      });
      if (onKeyUpdated) onKeyUpdated();
    }
  };

  const handleVerifyKey = async () => {
    const keyToTest = apiKeyInput.trim() || storage.getLocalApiKey() || '';
    if (!keyToTest) {
      setStatusMessage({
        type: 'error',
        text: 'Chưa có API Key nào để xác thực.',
      });
      return;
    }

    setIsVerifying(true);
    setStatusMessage(null);
    try {
      const res = await verifyGeminiApiKey(keyToTest);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `🟢 ${res.message}`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `🔴 ${res.message}`,
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[calc(100dvh-2rem)] p-4 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800">
          <div className="flex items-start min-w-0 space-x-3">
            <div className="p-3 bg-blue-950/80 border border-blue-800/80 rounded-2xl text-blue-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Cấu Hình GEMINI_API_KEY
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 border border-emerald-700 text-emerald-400">
                  Biến Môi Trường (Server Proxy)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ứng dụng ưu tiên sử dụng GEMINI_API_KEY được cấu hình an toàn trên máy chủ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="py-6 space-y-6 overflow-y-auto pr-1">
          {/* Key Input & Action Section */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Nhập Gemini API Key Cá Nhân</span>
              </label>

              {isSaved && !isEditing ? (
                <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-lg font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã Lưu Cục Bộ (localStorage)</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 text-xs text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-1 rounded-lg font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Chưa Cấu Hình</span>
                </span>
              )}
            </div>

            {/* Input & View Toggle */}
            <div className="relative">
              <input
                type={showPlainKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                disabled={isSaved && !isEditing}
                placeholder="Dán Gemini API Key của bạn vào đây (vd: AIzaSy...)"
                className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-100 placeholder-slate-500 disabled:opacity-70 disabled:bg-slate-900/50 outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPlainKey(!showPlainKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                title={showPlainKey ? 'Ẩn API Key' : 'Hiện API Key'}
              >
                {showPlainKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Masked Preview when saved */}
            {isSaved && !isEditing && (
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800">
                <span>Key đang hoạt động:</span>
                <span className="font-mono text-slate-200 font-bold">
                  {storage.getMaskedLocalApiKey()}
                </span>
              </div>
            )}

            {/* Action Buttons: Save, Edit, Delete, Verify */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {(!isSaved || isEditing) && (
                <button
                  onClick={handleSaveKey}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Key Cục Bộ</span>
                </button>
              )}

              {isSaved && !isEditing && (
                <button
                  onClick={handleEditKey}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs flex items-center space-x-2 transition-all"
                >
                  <Edit3 className="w-4 h-4 text-sky-400" />
                  <span>Thay Key Khác</span>
                </button>
              )}

              {isSaved && (
                <button
                  onClick={handleDeleteKey}
                  className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 font-bold text-xs flex items-center space-x-2 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Xóa Key</span>
                </button>
              )}

              <button
                onClick={handleVerifyKey}
                disabled={isVerifying || (!apiKeyInput && !isSaved)}
                className="px-4 py-2.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/80 font-bold text-xs flex items-center space-x-2 transition-all disabled:opacity-50 ml-auto"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`}
                />
                <span>{isVerifying ? 'Đang kiểm tra...' : 'Kiểm Tra Key'}</span>
              </button>
            </div>

            {/* Status Feedback Toast / Message */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-start space-x-2 animate-in fade-in ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-700'
                    : statusMessage.type === 'error'
                    ? 'bg-red-950/90 text-red-200 border border-red-700'
                    : 'bg-blue-950/90 text-blue-200 border border-blue-700'
                }`}
              >
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>

          {/* Explicit Security & Usage Notices */}
          <div className="bg-slate-950/90 border border-emerald-900/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm border-b border-emerald-900/40 pb-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>Cơ Chế Bảo Mật API Key Trên Máy Chủ (GEMINI_API_KEY)</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="font-bold text-emerald-400 min-w-[20px]">
                  1.
                </span>
                <span>
                  <strong className="text-white">Biến Môi Trường Máy Chủ (Environment Variable):</strong>{' '}
                  API Key được lưu trữ ẩn danh trên server bằng biến môi trường <code className="text-sky-300 font-mono">GEMINI_API_KEY</code>.
                </span>
              </li>

              <li className="flex items-start space-x-2">
                <span className="font-bold text-emerald-400 min-w-[20px]">
                  2.
                </span>
                <span>
                  <strong className="text-white">
                    Kiến Trúc Server Proxy Bảo Mật:
                  </strong>{' '}
                  Các yêu cầu gọi AI từ trình duyệt đều đi qua các tuyến API backend (<code className="text-sky-300 font-mono">/api/ai/*</code>). Trình duyệt client không trực tiếp nhìn thấy hoặc trích xuất được API Key.
                </span>
              </li>

              <li className="flex items-start space-x-2">
                <span className="font-bold text-emerald-400 min-w-[20px]">
                  3.
                </span>
                <span>
                  <strong className="text-white">
                    Tùy Chọn Override Cục Bộ:
                  </strong>{' '}
                  Người dùng có thể nhập Gemini API Key cá nhân bên trên để sử dụng riêng cho trình duyệt này nếu muốn nâng hạn ngạch cá nhân.
                </span>
              </li>
            </ul>
          </div>

          {/* Help link to get Gemini API key */}
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            <span>Chưa có Gemini API Key?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1.5 transition-colors"
            >
              <span>Lấy Key tại Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Đóng Settings
          </button>
        </div>
      </div>
    </div>
  );
}
