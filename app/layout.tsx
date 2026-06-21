import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '좋은삼선병원 진료 예약',
  description: '좋은삼선병원 AI 진료 예약 도우미 — 증상 분석부터 예약 확정까지',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
