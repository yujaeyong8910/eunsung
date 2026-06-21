'use client';

import { Message } from '@/types';
import { Bot, User, CheckCircle2, AlertTriangle, Stethoscope } from 'lucide-react';

interface Props {
  message: Message;
}

const URGENCY_CONFIG = {
  high:   { label: '긴급', bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200'   },
  medium: { label: '빠른 진료 권장', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  low:    { label: '일반', bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200' },
};

export default function MessageBubble({ message }: Props) {
  const isBot = message.role === 'assistant';
  const isConfirmed = message.step === 'confirmed';

  const lines = message.content.split('\n');

  const renderContent = () => (
    <span>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </span>
  );

  if (!isBot) {
    return (
      <div className="flex items-end gap-2 justify-end">
        <div className="max-w-[78%]">
          <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed">
            {renderContent()}
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right pr-1">
            {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mb-5">
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    );
  }

  const iconBg = isConfirmed ? 'bg-emerald-100' : 'bg-blue-100';
  const Icon = isConfirmed ? CheckCircle2 : Bot;
  const iconColor = isConfirmed ? 'text-emerald-600' : 'text-blue-600';

  const bubbleClass = isConfirmed
    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
    : 'bg-white border border-slate-200 text-slate-800';

  const urgency = message.urgency && URGENCY_CONFIG[message.urgency];
  const showMeta = (message.department || message.urgency || (message.symptoms && message.symptoms.length > 0))
    && (message.step === 'analyzing' || message.step === 'schedule_check' || message.step === 'suggestion');

  return (
    <div className="flex items-end gap-2">
      <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 mb-5`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="max-w-[78%]">
        <div className={`rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed ${bubbleClass}`}>
          {renderContent()}

          {showMeta && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
              {message.department && (
                <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  <Stethoscope className="w-3 h-3" />
                  {message.department}
                </span>
              )}
              {urgency && (
                <span className={`inline-flex items-center gap-1 ${urgency.bg} border ${urgency.border} ${urgency.text} text-xs px-2 py-0.5 rounded-full font-medium`}>
                  <AlertTriangle className="w-3 h-3" />
                  {urgency.label}
                </span>
              )}
              {message.symptoms?.map((s, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1 pl-1">
          {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
