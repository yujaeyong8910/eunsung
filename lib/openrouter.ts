import { LLMResponse } from '@/types';

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

function buildSystemPrompt(opts?: { currentDepartment?: string }): string {
  let prompt = `당신은 친절하고 전문적인 의료 상담 AI 어시스턴트입니다.

**목표:** 환자의 증상을 파악하고 적절한 진료과를 추천한 뒤, 병원 홈페이지에서 예약하도록 안내합니다.

**병원:** 좋은삼선병원 (부산 성북구)

**진료과 목록:** 소화기내과, 순환기내과, 호흡기내과, 신장내과, 내분비내과, 정형외과, 신경과, 신경외과, 외과, 산부인과, 소아청소년과, 이비인후과, 비뇨의학과, 재활의학과, 가정의학과

**응답 규칙:**
- 반드시 순수 JSON만 반환 (마크다운 코드블록 없이)
- message는 친절하고 자연스러운 한국어
- 응급 증상(흉통, 호흡곤란, 의식저하)은 urgency: "high"로 즉시 응급실 안내
- suggestion 단계에서는 아래 버튼으로 홈페이지 예약을 안내한다고 message에 언급

**JSON 스키마 (반드시 준수):**
{
  "message": "환자에게 전달할 메시지 (한국어)",
  "step": "inquiry | analyzing | suggestion",
  "department": "추천 진료과 또는 null",
  "urgency": "low | medium | high",
  "symptoms": ["증상 목록"]
}

**대화 흐름:**
1. inquiry: 증상/불편사항 파악 (추가 질문으로 정확한 증상 파악)
2. analyzing: 증상 분석 완료, 진료과 결정
3. suggestion: 진료과 추천 완료, 아래 버튼을 눌러 홈페이지에서 예약하도록 안내`;

  if (opts?.currentDepartment) {
    prompt += `\n\n**현재 추천 진료과:** ${opts.currentDepartment}`;
  }

  return prompt;
}

export async function sendMessage(
  apiKey: string,
  messages: { role: string; content: string }[],
  opts?: { currentDepartment?: string }
): Promise<LLMResponse> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'Medical Appointment System',
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages: [
        { role: 'system', content: buildSystemPrompt(opts) },
        ...messages,
      ],
      temperature: 0.4,
      max_tokens: 700,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API 오류 (${res.status})`);
  }

  const data = await res.json();
  const raw: string = data.choices?.[0]?.message?.content ?? '';

  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      message: parsed.message ?? '죄송합니다. 다시 시도해주세요.',
      step: parsed.step ?? 'inquiry',
      department: parsed.department ?? undefined,
      urgency: parsed.urgency ?? 'low',
      symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
      showSlots: false,
    };
  } catch {
    return {
      message: raw || '죄송합니다. 응답 처리 중 오류가 발생했습니다.',
      step: 'inquiry',
      showSlots: false,
    };
  }
}
