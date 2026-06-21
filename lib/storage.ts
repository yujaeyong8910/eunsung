import { Appointment } from '@/types';

const KEY_API = 'openrouter_api_key';
const KEY_APPTS = 'medical_appointments';

export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(KEY_API) ?? '';
}

export function saveApiKey(key: string): void {
  localStorage.setItem(KEY_API, key);
}

export function getAppointments(): Appointment[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY_APPTS) ?? '[]');
  } catch {
    return [];
  }
}

export function saveAppointments(list: Appointment[]): void {
  localStorage.setItem(KEY_APPTS, JSON.stringify(list));
}
