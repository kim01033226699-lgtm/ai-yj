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

    // gemini-2.5-flash는 최신 모델로 향상된 성능 제공
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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
1. 문서에서 유사하거나 관련된 질문을 찾아 답변하세요.
2. 문서 내용을 기반으로 논리적 추론이 가능합니다.
   예: "PDF 또는 이미지 파일"이라는 답변이 있다면, "워드 파일이 가능한가?"라는 질문에 "문서에 따르면 PDF 또는 이미지 파일만 가능하며, 워드 파일에 대한 언급은 없습니다"라고 답변 가능.
3. 문서와 전혀 관련 없는 질문이거나, 추론조차 불가능한 경우에만 "NO_ANSWER"라고 답변하세요.
4. 연락처나 담당자 정보를 안내할 때는 반드시 본사 대표번호(02-6410-5000)와 내선번호를 함께 안내해야 합니다.
5. 답변은 친절하고 명확하게 작성하세요.

질문: ${question}

답변:`

    // API 호출 (재시도 로직 포함)
    let result
    let retryCount = 0
    const maxRetries = 2

    while (retryCount <= maxRetries) {
      try {
        result = await model.generateContent(prompt)
        break // 성공하면 루프 탈출
      } catch (apiError: any) {
        // 할당량 초과 에러 체크
        if (apiError?.message?.includes('quota') || apiError?.message?.includes('RESOURCE_EXHAUSTED')) {
          if (retryCount < maxRetries) {
            retryCount++
            console.log(`할당량 초과, ${retryCount}번째 재시도 중... (3초 후)`)
            await new Promise(resolve => setTimeout(resolve, 3000)) // 3초 대기
            continue
          } else {
            // 최대 재시도 초과
            return NextResponse.json(
              {
                error: 'API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.',
                details: '무료 티어 한도 초과 (분당/일일 요청 제한)'
              },
              { status: 429 }
            )
          }
        }
        // 다른 에러는 바로 throw
        throw apiError
      }
    }

    if (!result) {
      throw new Error('API 호출 실패')
    }

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

    // 에러 상세 정보 추출
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    const errorDetails = error instanceof Error && 'stack' in error ? error.stack : ''

    console.error('에러 상세:', {
      message: errorMessage,
      details: errorDetails,
      apiKeyExists: !!process.env.GEMINI_API_KEY,
      apiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) + '...'
    })

    return NextResponse.json(
      {
        error: 'AI 답변 생성 중 오류가 발생했습니다.',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
