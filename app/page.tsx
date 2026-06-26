'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatInterface from '@/components/ChatInterface';
import SettingsModal from '@/components/SettingsModal';
import { getApiKey, saveApiKey } from '@/lib/storage';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const key = getApiKey();
    setApiKey(key);
    if (!key) setShowSettings(true);
    setMounted(true);
  }, []);

  const handleApiKeySave = (key: string) => {
    saveApiKey(key);
    setApiKey(key);
    setShowSettings(false);
  };

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <Header onSettingsClick={() => setShowSettings(true)} />

      <div className="flex flex-1 min-h-0">
        <ChatInterface
          apiKey={apiKey}
          onSettingsNeeded={() => setShowSettings(true)}
        />
      </div>

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
