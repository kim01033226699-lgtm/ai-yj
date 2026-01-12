'use client'

import type { Document } from './types'

const DB_NAME = 'ai-yj-documents'
const DB_VERSION = 1
const STORE_NAME = 'documents'

// IndexedDB 데이터베이스 열기
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // documents 스토어가 없으면 생성
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'path' })
        objectStore.createIndex('name', 'name', { unique: false })
        objectStore.createIndex('type', 'type', { unique: false })
      }
    }
  })
}

// 문서 저장
export async function saveDocument(document: Document): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(document)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// 여러 문서 저장
export async function saveDocuments(documents: Document[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    let errorOccurred = false

    for (const doc of documents) {
      const request = store.put(doc)
      request.onerror = () => {
        errorOccurred = true
      }
    }

    transaction.oncomplete = () => {
      if (errorOccurred) {
        reject(new Error('일부 문서 저장 실패'))
      } else {
        resolve()
      }
    }

    transaction.onerror = () => reject(transaction.error)
  })
}

// 모든 문서 가져오기
export async function getAllDocuments(): Promise<Document[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result as Document[])
  })
}

// 특정 문서 가져오기
export async function getDocument(path: string): Promise<Document | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.get(path)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result as Document | undefined)
  })
}

// 문서 삭제
export async function deleteDocument(path: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(path)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// 모든 문서 삭제
export async function clearAllDocuments(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// 문서 개수 가져오기
export async function getDocumentCount(): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.count()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}
