import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const PRESET_ANSWERS_FILE = path.join(process.cwd(), 'public', 'preset-answers.json')

// GET: 프리셋 답변 데이터 읽기
export async function GET() {
  try {
    const fileContents = await fs.readFile(PRESET_ANSWERS_FILE, 'utf8')
    const data = JSON.parse(fileContents)
    return NextResponse.json(data)
  } catch (error: any) {
    // 파일이 없으면 기본값 반환
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 404 })
    }
    console.error('프리셋 답변 읽기 오류:', error)
    return NextResponse.json({ error: '파일 읽기 실패' }, { status: 500 })
  }
}

// POST: 프리셋 답변 데이터 저장
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // 디렉토리가 없으면 생성
    const dir = path.dirname(PRESET_ANSWERS_FILE)
    await fs.mkdir(dir, { recursive: true })
    
    // 파일에 저장
    await fs.writeFile(PRESET_ANSWERS_FILE, JSON.stringify(data, null, 2), 'utf8')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('프리셋 답변 저장 오류:', error)
    return NextResponse.json({ error: '파일 저장 실패' }, { status: 500 })
  }
}

