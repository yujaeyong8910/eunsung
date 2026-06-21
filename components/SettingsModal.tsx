'use client';

import { useState } from 'react';
import { X, Key, Eye, EyeOff, ExternalLink, Info } from 'lucide-react';
import { saveApiKey } from '@/lib/storage';

interface Props {
  apiKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export default function SettingsModal({ apiKey, onSave, onClose }: Props) {
  const [key, setKey] = useState(apiKey);
  const [show, setShow] = useState(false);

  const handleSave = () => {
    const trimmed = key.trim();
    saveApiKey(trimmed);
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-900">API 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              OpenRouter API 키
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                onKeyDown={(e) => e.key === 'Enter' && key.trim() && handleSave()}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3.5">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-medium">API 키 발급 방법</p>
              <ol className="list-decimal list-inside space-y-0.5 text-amber-700">
                <li>openrouter.ai 에 회원가입</li>
                <li>Settings → API Keys 메뉴 이동</li>
                <li>Create Key 클릭 후 생성된 키 복사</li>
                <li>위 입력란에 붙여넣기</li>
              </ol>
              <p className="text-amber-600 mt-1">키는 브라우저 로컬 스토리지에만 저장됩니다.</p>
            </div>
          </div>

          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            OpenRouter에서 API 키 받기
          </a>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed rounded-xl text-sm text-white font-semibold transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
