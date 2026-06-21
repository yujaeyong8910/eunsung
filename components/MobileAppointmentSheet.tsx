'use client';

import { Appointment } from '@/types';
import { formatDate, formatTime } from '@/lib/schedule';
import { X, CalendarDays, Clock, UserRound, Stethoscope, ClipboardList } from 'lucide-react';

interface Props {
  appointments: Appointment[];
  onCancel: (id: string) => void;
  onClose: () => void;
}

export default function MobileAppointmentSheet({ appointments, onCancel, onClose }: Props) {
  const now = new Date().toISOString();
  const upcoming = [...appointments]
    .filter((a) => `${a.slot.date}T${a.slot.time}` >= now.slice(0, 16))
    .sort((a, b) => `${a.slot.date}${a.slot.time}`.localeCompare(`${b.slot.date}${b.slot.time}`));

  const past = [...appointments]
    .filter((a) => `${a.slot.date}T${a.slot.time}` < now.slice(0, 16))
    .sort((a, b) => `${b.slot.date}${b.slot.time}`.localeCompare(`${a.slot.date}${a.slot.time}`));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col justify-end z-50 md:hidden">
      <div className="bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-800">예약 현황</h2>
              <p className="text-xs text-slate-400">{upcoming.length}건 예정</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {upcoming.length === 0 && past.length === 0 && (
            <div className="text-center py-10">
              <CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">예약 없음</p>
              <p className="text-xs text-slate-300 mt-1">채팅으로 예약을 시작하세요</p>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">예정된 예약</p>
              <div className="space-y-2">
                {upcoming.map((apt) => (
                  <div key={apt.id} className="relative group bg-white border border-blue-100 rounded-xl p-3">
                    <button
                      onClick={() => onCancel(apt.id)}
                      className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all"
                      title="예약 취소"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-sm font-semibold text-blue-700">{apt.slot.department}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <CalendarDays className="w-3 h-3 text-slate-400" />
                        {formatDate(apt.slot.date)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatTime(apt.slot.time)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <UserRound className="w-3 h-3 text-slate-400" />
                        {apt.slot.doctor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1 mt-2">지난 예약</p>
              <div className="space-y-2 opacity-60">
                {past.map((apt) => (
                  <div key={apt.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-500">{apt.slot.department}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays className="w-3 h-3 text-slate-400" />
                        {formatDate(apt.slot.date)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatTime(apt.slot.time)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
