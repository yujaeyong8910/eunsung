'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, AlertCircle, KeyRound, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { Message, TimeSlot, Appointment, Department, ChatStep } from '@/types';
import { sendMessage } from '@/lib/openrouter';
import { getAvailableSlots, formatDate, formatTime } from '@/lib/schedule';
import MessageBubble from './MessageBubble';
import SlotPicker from './SlotPicker';

interface Props {
  apiKey: string;
  schedule: TimeSlot[];
  onBook: (apt: Appointment) => void;
  onSettingsNeeded: () => void;
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    '안녕하세요! 좋은삼선병원 AI 진료 예약 도우미입니다.\n\n어떤 증상이나 불편사항이 있으신가요? 말씀해 주시면 적합한 진료과와 예약 가능한 시간을 안내해 드리겠습니다.',
  timestamp: new Date().toISOString(),
  step: 'greeting',
};

export default function ChatInterface({ apiKey, schedule, onBook, onSettingsNeeded }: Props) {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDept, setCurrentDept] = useState<Department | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const breadcrumbStep = useMemo(() => {
    const lastBot = [...messages].reverse().find((m) => m.role === 'assistant');
    const s = lastBot?.step as ChatStep | undefined;
    if (s === 'confirmed' || s === 'suggestion') return 2;
    if (s === 'schedule_check' || s === 'analyzing') return 1;
    return 0;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!apiKey) {
      onSettingsNeeded();
      return;
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Build conversation history (readable content only)
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Determine if we should fetch slots
      const slotsForContext = currentDept ? getAvailableSlots(currentDept, schedule, 6) : undefined;

      const response = await sendMessage(apiKey, history, {
        currentDepartment: currentDept ?? undefined,
        availableSlots: slotsForContext,
      });

      // Update department state
      if (response.department) setCurrentDept(response.department);

      // Get slots to display inline
      const dept = response.department ?? currentDept;
      const displaySlots =
        response.showSlots && dept ? getAvailableSlots(dept, schedule, 6) : [];

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        step: response.step,
        slots: displaySlots.length > 0 ? displaySlots : undefined,
        urgency: response.urgency,
        department: response.department ?? undefined,
        symptoms: response.symptoms?.length ? response.symptoms : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [input, loading, apiKey, messages, currentDept, schedule, onSettingsNeeded]);

  const handleSlotSelect = useCallback(
    (slot: TimeSlot) => {
      const apt: Appointment = {
        id: `apt-${Date.now()}`,
        slot,
        inquiry: messages.find((m) => m.role === 'user')?.content ?? '',
        bookedAt: new Date().toISOString(),
      };
      onBook(apt);

      // Remove slots from all messages (prevent re-selecting)
      const userConfirm: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: `${formatDate(slot.date)} ${formatTime(slot.time)}, ${slot.department} ${slot.doctor}으로 예약하겠습니다.`,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev.map((m) => ({ ...m, slots: undefined })),
        userConfirm,
      ]);

      // Confirmation message
      const confirm: Message = {
        id: `b-${Date.now() + 1}`,
        role: 'assistant',
        content: `예약이 완료되었습니다!\n\n📅 날짜: ${formatDate(slot.date)}\n⏰ 시간: ${formatTime(slot.time)}\n🏥 진료과: ${slot.department}\n👨‍⚕️ 담당의: ${slot.doctor}\n\n진료 시 건강보험증을 지참해 주세요. 다른 불편사항이 있으시면 언제든지 말씀해 주세요.`,
        timestamp: new Date(Date.now() + 500).toISOString(),
        step: 'confirmed',
      };

      setTimeout(() => {
        setMessages((prev) => [...prev, confirm]);
      }, 400);
    },
    [messages, onBook]
  );

  const handleReset = () => {
    setMessages([WELCOME]);
    setCurrentDept(null);
    setError(null);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !loading && !!apiKey;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          {['환자 문의 인식', '일정 확인', '예약 제안'].map((label, i) => (
            <span key={i} className="flex items-center gap-1.5 text-xs">
              {i > 0 && <span className="text-slate-300 mx-0.5">›</span>}
              {i < breadcrumbStep ? (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" />{label}
                </span>
              ) : i === breadcrumbStep ? (
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" />{label}
                </span>
              ) : (
                <span className="text-slate-400">{label}</span>
              )}
            </span>
          ))}
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          title="대화 초기화"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          초기화
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            <MessageBubble message={msg} />
            {msg.slots && msg.slots.length > 0 && (
              <SlotPicker slots={msg.slots} onSelect={handleSlotSelect} />
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mb-5">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">오류가 발생했습니다</p>
              <p className="text-xs mt-0.5 text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 bg-white px-4 py-3">
        {!apiKey && (
          <button
            onClick={onSettingsNeeded}
            className="w-full flex items-center justify-center gap-2 py-2.5 mb-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 hover:bg-amber-100 transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            API 키를 설정해야 사용할 수 있습니다. 여기를 클릭하세요.
          </button>
        )}

        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <div className="flex-1 bg-slate-50 border border-slate-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl transition-all overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                apiKey
                  ? '증상이나 문의사항을 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)'
                  : '먼저 API 키를 설정해 주세요'
              }
              disabled={loading || !apiKey}
              rows={1}
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>

        <p className="text-xs text-center text-slate-400 mt-2">
          AI 예약 도우미는 참고용입니다. 응급 상황 시 119에 연락하세요.
        </p>
      </div>
    </div>
  );
}
