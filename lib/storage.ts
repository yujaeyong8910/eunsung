import { supabase } from '@/lib/supabase';
import { Appointment } from '@/types';

const KEY_API = 'openrouter_api_key';

export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(KEY_API) ?? '';
}

export function saveApiKey(key: string): void {
  localStorage.setItem(KEY_API, key);
}

export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('booked_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    slot: {
      id: row.slot_id,
      date: row.slot_date,
      time: row.slot_time,
      department: row.slot_department,
      doctor: row.slot_doctor,
      available: true,
    },
    inquiry: row.inquiry,
    bookedAt: row.booked_at,
  }));
}

export async function addAppointment(apt: Appointment): Promise<void> {
  await supabase.from('appointments').insert({
    id: apt.id,
    slot_id: apt.slot.id,
    slot_date: apt.slot.date,
    slot_time: apt.slot.time,
    slot_department: apt.slot.department,
    slot_doctor: apt.slot.doctor,
    inquiry: apt.inquiry,
    booked_at: apt.bookedAt,
  });
}

export async function deleteAppointment(id: string): Promise<void> {
  await supabase.from('appointments').delete().eq('id', id);
}
