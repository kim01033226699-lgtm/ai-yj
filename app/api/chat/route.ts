import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// 서버 사이드에서만 실행되므로 NEXT_PUBLIC_ 접두사 없이 사용
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { question, documentContext, categoryLabel } = await request.json()

    if (!question || !documentContext) {
      return NextResponse.json(
        { error: '질문과 문서 컨텍스트가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // 카테고리 정보 추가
    const categoryContext = categoryLabel
      ? `\n\n참고: 현재 "${categoryLabel}" 카테고리 관련 문서를 우선 참고하고 있습니다.`
      : ''

    const prompt = `다음은 참고 문서 내용입니다:

${documentContext}
${categoryContext}

---

위 문서를 기반으로 다음 질문에 답변해주세요.

중요 사항:
1. 문서에 명확한 답변이 있는 경우에만 답변하고, 문서에 해당 정보가 없거나 불확실한 경우에는 "NO_ANSWER"라고만 답변하세요.
2. 연락처나 담당자 정보를 안내할 때는 반드시 본사 대표번호(02-6410-5000)와 내선번호를 함께 안내해야 합니다.
3. 답변은 친절하고 명확하게 작성하세요.

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

    return NextResponse.json({
      hasAnswer,
      answer: text,
    })
  } catch (error) {
    console.error('AI 답변 생성 오류:', error)
    return NextResponse.json(
      { error: 'AI 답변 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
