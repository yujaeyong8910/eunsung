'use client';

import { Settings, Stethoscope, CalendarDays } from 'lucide-react';

interface Props {
  appointmentCount: number;
  onSettingsClick: () => void;
  onAppointmentsClick?: () => void;
}

export default function Header({ appointmentCount, onSettingsClick, onAppointmentsClick }: Props) {
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

      <div className="flex items-center gap-2">
        <button
          onClick={onAppointmentsClick}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            appointmentCount > 0
              ? 'text-blue-700 bg-blue-50 border-blue-100 hover:bg-blue-100 md:cursor-default'
              : 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-slate-100 md:cursor-default'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span className="md:hidden">{appointmentCount > 0 ? `${appointmentCount}건 예약` : '예약 없음'}</span>
          <span className="hidden md:inline">{appointmentCount > 0 ? `${appointmentCount}건 예약` : '예약 없음'}</span>
        </button>
        <button
          onClick={onSettingsClick}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="API 설정"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
