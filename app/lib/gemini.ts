// 서버 API를 통해 질문 응답 (API 키 보안을 위해)
export async function askQuestion(
  question: string,
  documentContext: string,
  categoryLabel: string
): Promise<{ answer: string; hasAnswer: boolean }> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        documentContext,
        categoryLabel,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('API 응답 오류:', {
        status: response.status,
        statusText: response.statusText,
        error: error
      })
      throw new Error(error.details || error.error || 'API 호출 실패')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('AI 답변 요청 오류:', error)
    if (error instanceof Error) {
      console.error('오류 상세:', error.message, error.stack)
    }
    throw error
  }
}






