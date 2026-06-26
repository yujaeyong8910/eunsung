'use client';

import { Settings, Stethoscope } from 'lucide-react';

interface Props {
  onSettingsClick: () => void;
}

export default function Header({ onSettingsClick }: Props) {
  return (
    <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-base leading-none">좋은삼선병원</h1>
          <p className="text-xs text-slate-400 mt-0.5">AI 진료 예약 도우미</p>
        </div>
      </div>

      <button
        onClick={onSettingsClick}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        title="API 설정"
      >
        <Settings className="w-5 h-5" />
      </button>
    </header>
  );
}
