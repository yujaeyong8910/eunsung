'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatInterface from '@/components/ChatInterface';
import AppointmentSidebar from '@/components/AppointmentSidebar';
import MobileAppointmentSheet from '@/components/MobileAppointmentSheet';
import SettingsModal from '@/components/SettingsModal';
import { getApiKey, getAppointments, addAppointment, deleteAppointment } from '@/lib/storage';
import { generateSchedule } from '@/lib/schedule';
import { TimeSlot, Appointment } from '@/types';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileApts, setShowMobileApts] = useState(false);
  const [schedule, setSchedule] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const key = getApiKey();
    setApiKey(key);
    if (!key) setShowSettings(true);
    setSchedule(generateSchedule(14));
    getAppointments().then(setAppointments);
    setMounted(true);
  }, []);

  const handleBook = async (apt: Appointment) => {
    await addAppointment(apt);
    setAppointments((prev) => [...prev, apt]);
  };

  const handleCancel = async (id: string) => {
    await deleteAppointment(id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    setShowSettings(false);
  };

  const upcomingCount = appointments.filter((a) => {
    const now = new Date().toISOString().slice(0, 16);
    return `${a.slot.date}T${a.slot.time}` >= now;
  }).length;

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <Header
        appointmentCount={upcomingCount}
        onSettingsClick={() => setShowSettings(true)}
        onAppointmentsClick={() => setShowMobileApts(true)}
      />

      <div className="flex flex-1 min-h-0">
        <ChatInterface
          apiKey={apiKey}
          schedule={schedule}
          onBook={handleBook}
          onSettingsNeeded={() => setShowSettings(true)}
        />
        <AppointmentSidebar appointments={appointments} onCancel={handleCancel} />
      </div>

      {showMobileApts && (
        <MobileAppointmentSheet
          appointments={appointments}
          onCancel={(id) => { handleCancel(id); }}
          onClose={() => setShowMobileApts(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          onSave={handleApiKeySave}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
