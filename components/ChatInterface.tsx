'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, AlertCircle, KeyRound, RefreshCcw, CheckCircle2, ExternalLink } from 'lucide-react';
import { Message, Department, ChatStep } from '@/types';
import { sendMessage } from '@/lib/openrouter';
import MessageBubble from './MessageBubble';

const BOOKING_URL = 'https://www.samsun.or.kr/samsun/contents/view.do?mId=38';

interface Props {
  apiKey: string;
  onSettingsNeeded: () => void;
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    '안녕하세요! 좋은삼선병원 AI 진료 예약 도우미입니다.\n\n어떤 증상이나 불편사항이 있으신가요? 증상을 말씀해 주시면 적합한 진료과를 안내하고 병원 홈페이지 예약 페이지로 연결해 드리겠습니다.',
  timestamp: new Date().toISOString(),
  step: 'greeting',
};

export default function ChatInterface({ apiKey, onSettingsNeeded }: Props) {
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
    if (s === 'suggestion') return 2;
    if (s === 'analyzing') return 1;
    return 0;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendMessage(apiKey, history, {
        currentDepartment: currentDept ?? undefined,
      });

      if (response.department) setCurrentDept(response.department);

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        step: response.step,
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
  }, [input, loading, apiKey, messages, currentDept, onSettingsNeeded]);

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
          {['환자 문의 인식', '증상 분석', '예약 안내'].map((label, i) => (
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
            {msg.step === 'suggestion' && (
              <div className="ml-10 mt-3">
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  좋은삼선병원 홈페이지에서 예약하기
                </a>
              </div>
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
