'use client'

import { GoogleGenerativeAI } from '@google/generative-ai'

// Gemini API 클라이언트 초기화
export function getGeminiClient() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY가 설정되지 않았습니다.')
  }

  return new GoogleGenerativeAI(apiKey)
}

// 문서 기반 질문 응답
export async function askQuestion(
  question: string,
  documentContext: string,
  category?: string | null
): Promise<{ answer: string; hasAnswer: boolean }> {
  try {
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // 카테고리 정보 추가
    const categoryContext = category
      ? `\n\n참고: 현재 "${category}" 카테고리 관련 문서를 우선 참고하고 있습니다.`
      : ''

    // 프롬프트 구성
    const prompt = `다음은 참고 문서 내용입니다:

${documentContext}
${categoryContext}

---

위 문서를 기반으로 다음 질문에 답변해주세요. 

중요 사항:
1. 문서에 명확한 답변이 있는 경우에만 답변하고, 문서에 해당 정보가 없거나 불확실한 경우에는 "NO_ANSWER"라고만 답변하세요.
2. 연락처나 담당자 정보를 안내할 때는 반드시 본사 대표번호(02-6410-5000)와 내선번호를 함께 안내해야 합니다. 형식: "02-6410-5000(내선번호)" 또는 "02-6410-5000(내선번호1, 내선번호2)"
3. 내선번호만 안내하지 말고, 반드시 본사 대표번호와 함께 안내하세요.

질문: ${question}

답변:`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // 답변이 없는지 확인
    const hasAnswer =
      !text.includes('NO_ANSWER') &&
      !text.includes('문서에서 해당 정보를 찾을 수 없습니다') &&
      !text.includes('해당 정보를 찾을 수 없습니다') &&
      text.trim().length > 10

    return {
      answer: text,
      hasAnswer,
    }
  } catch (error) {
    console.error('Gemini API 오류:', error)
    throw new Error('AI 답변 생성 중 오류가 발생했습니다.')
  }
}


