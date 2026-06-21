export type Department =
  | '소화기내과'
  | '순환기내과'
  | '호흡기내과'
  | '신장내과'
  | '내분비내과'
  | '정형외과'
  | '신경과'
  | '신경외과'
  | '외과'
  | '산부인과'
  | '소아청소년과'
  | '이비인후과'
  | '비뇨의학과'
  | '재활의학과'
  | '가정의학과';

export type Urgency = 'low' | 'medium' | 'high';

export type ChatStep =
  | 'greeting'
  | 'inquiry'
  | 'analyzing'
  | 'schedule_check'
  | 'suggestion'
  | 'confirmed';

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  department: Department;
  doctor: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  slot: TimeSlot;
  inquiry: string;
  bookedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  step?: ChatStep;
  slots?: TimeSlot[];
  urgency?: Urgency;
  department?: Department;
  symptoms?: string[];
}

export interface LLMResponse {
  message: string;
  step: ChatStep;
  department?: Department;
  urgency?: Urgency;
  symptoms?: string[];
  showSlots?: boolean;
}
