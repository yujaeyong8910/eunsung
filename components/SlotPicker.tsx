'use client';

import { useState } from 'react';
import { TimeSlot } from '@/types';
import { formatDate, formatTime } from '@/lib/schedule';
import { Calendar, Clock, UserRound, X, CheckCircle2 } from 'lucide-react';

interface Props {
  slots: TimeSlot[];
  onSelect: (slot: TimeSlot) => void;
}

export default function SlotPicker({ slots, onSelect }: Props) {
  const [pending, setPending] = useState<TimeSlot | null>(null);

  if (slots.length === 0) return null;

  const handleConfirm = () => {
    if (!pending) return;
    onSelect(pending);
    setPending(null);
  };

  return (
    <>
      <div className="ml-10 mt-3 mb-1">
        <p className="text-xs font-medium text-slate-500 mb-2 pl-1">
          예약 가능한 시간을 선택하세요
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setPending(slot)}
              className="group flex flex-col gap-1.5 p-3 bg-white border-2 border-blue-100 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-left transition-all duration-150 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-1 text-blue-700 font-semibold text-xs">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{formatDate(slot.date)}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-700 text-sm font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                {formatTime(slot.time)}
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <UserRound className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{slot.doctor}</span>
              </div>
              <div className="mt-0.5">
                <span className="inline-block bg-blue-100 group-hover:bg-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium transition-colors">
                  {slot.department}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {pending && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">예약 확인</h2>
              <button
                onClick={() => setPending(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-14 flex-shrink-0">진료과</span>
                  <span className="font-semibold text-blue-700">{pending.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-14 flex-shrink-0">담당의</span>
                  <span className="font-medium text-slate-800">{pending.doctor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-14 flex-shrink-0">날짜</span>
                  <span className="font-medium text-slate-800">{formatDate(pending.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-14 flex-shrink-0">시간</span>
                  <span className="font-medium text-slate-800">{formatTime(pending.time)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center">
                위 시간으로 예약하시겠습니까?
              </p>
            </div>

            <div className="flex gap-2 px-5 pb-5">
              <button
                onClick={() => setPending(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                예약 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
