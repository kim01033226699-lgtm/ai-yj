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
      throw new Error(error.error || 'API 호출 실패')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('AI 답변 요청 오류:', error)
    throw error
  }
}



