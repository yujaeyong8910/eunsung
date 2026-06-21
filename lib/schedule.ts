import { TimeSlot, Department } from '@/types';

const DEPARTMENTS: Department[] = [
  '소화기내과',
  '순환기내과',
  '호흡기내과',
  '신장내과',
  '내분비내과',
  '정형외과',
  '신경과',
  '신경외과',
  '외과',
  '산부인과',
  '소아청소년과',
  '이비인후과',
  '비뇨의학과',
  '재활의학과',
  '가정의학과',
];

const DOCTORS: Record<Department, string[]> = {
  소화기내과: ['이태영 진료부장', '임원 과장', '박상규 과장', '김동균 과장', '김현수 과장', '곽재훈 과장', '정수현 과장', '박민규 과장', '이혜영 과장'],
  순환기내과: ['심재광 센터장', '성주욱 과장', '임지훈 과장', '배장환 연구소장'],
  호흡기내과: ['윤늘봄 과장', '나해정 과장'],
  신장내과: ['이우철 과장', '박정민 과장', '길송이 과장'],
  내분비내과: ['최영근 부장', '김종호 과장'],
  정형외과: ['조형래 부원장', '은일수 관절센터장', '김창완 연구부장', '김대경 과장', '오용승 과장', '이완석 과장', '허태영 과장'],
  신경과: ['양태일 과장', '조기용 과장', '정재익 과장'],
  신경외과: ['안법흥 뇌혈관센터장', '김영하 과장', '김종열 센터장', '최윤희 과장'],
  외과: ['전명진 부장', '김윤석 과장', '김진민 과장'],
  산부인과: ['박성우 병원장', '방재희 과장'],
  소아청소년과: ['정영희 과장', '박기호 과장'],
  이비인후과: ['진효승 과장'],
  비뇨의학과: ['채종석 과장', '이권경 과장'],
  재활의학과: ['박주원 과장'],
  가정의학과: ['송영권 과장', '이연정 과장'],
};

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return Math.abs(h) / 2147483647;
}

export function generateSchedule(days = 14): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();

  for (let offset = 1; offset <= days; offset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    if (d.getDay() === 0) continue; // 일요일 제외

    const dateStr = d.toISOString().split('T')[0];

    for (const dept of DEPARTMENTS) {
      for (const time of TIME_SLOTS) {
        if (d.getDay() === 6 && time >= '14:00') continue; // 토요일 오후 제외
        for (const doctor of DOCTORS[dept]) {
          const seed = `${dateStr}${time}${dept}${doctor}`;
          const available = hashStr(seed) > 0.38;
          slots.push({
            id: `${dateStr}-${time.replace(':', '')}-${dept}-${doctor.split(' ')[0]}`,
            date: dateStr,
            time,
            department: dept,
            doctor,
            available,
          });
        }
      }
    }
  }
  return slots;
}

export function getAvailableSlots(
  department: Department,
  schedule: TimeSlot[],
  limit = 6
): TimeSlot[] {
  const todayStr = new Date().toISOString().split('T')[0];
  return schedule
    .filter((s) => s.department === department && s.available && s.date > todayStr)
    .slice(0, limit);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h < 12 ? '오전' : '오후';
  const display = h <= 12 ? h : h - 12;
  return `${period} ${display}:${String(m).padStart(2, '0')}`;
}
