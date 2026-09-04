import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createScrollLock } from '../src/scroll-lock.js'

type TestGlobal = typeof globalThis & {
  document?: unknown
  innerWidth?: number
}

const testGlobal = globalThis as TestGlobal

let body: { style: { overflow: string; paddingRight: string } }

/** node 環境なので document / innerWidth を最小限だけ用意する */
function setUpDocument(innerWidth: number, clientWidth: number) {
  body = { style: { overflow: '', paddingRight: '' } }

  testGlobal.document = { body, documentElement: { clientWidth } }
  testGlobal.innerWidth = innerWidth
}

beforeEach(() => {
  // スクロールバーが 15px 出ている状態
  setUpDocument(1000, 985)
})

afterEach(() => {
  delete testGlobal.document
  delete testGlobal.innerWidth
})

describe('createScrollLock', () => {
  it('ロックで overflow を hidden にし、解除で戻す', () => {
    const lock = createScrollLock()

    lock.toggle(true)
    expect(body.style.overflow).toBe('hidden')

    lock.toggle(false)
    expect(body.style.overflow).toBe('')
  })

  it('初回ロックでスクロールバー幅ぶんの padding-right を足す', () => {
    const lock = createScrollLock()

    lock.toggle(true)
    expect(body.style.paddingRight).toBe('15px')

    lock.toggle(false)
    expect(body.style.paddingRight).toBe('')
  })

  it('既にインラインの padding-right があれば calc で加算し、解除で元へ戻す', () => {
    body.style.paddingRight = '1rem'

    const lock = createScrollLock()

    lock.toggle(true)
    expect(body.style.paddingRight).toBe('calc(1rem + 15px)')

    lock.toggle(false)
    expect(body.style.paddingRight).toBe('1rem')
  })

  it('スクロールバーが無い環境では padding-right を触らない', () => {
    setUpDocument(1000, 1000)

    const lock = createScrollLock()

    lock.toggle(true)
    expect(body.style.overflow).toBe('hidden')
    expect(body.style.paddingRight).toBe('')

    lock.toggle(false)
    expect(body.style.paddingRight).toBe('')
  })

  it('重ねてロックしても padding は二重に足されず、最後の解除で戻る', () => {
    const outer = createScrollLock()
    const inner = createScrollLock()

    outer.toggle(true)
    inner.toggle(true)
    expect(body.style.paddingRight).toBe('15px')

    inner.toggle(false)
    // まだ外側がロック中なので維持される
    expect(body.style.overflow).toBe('hidden')
    expect(body.style.paddingRight).toBe('15px')

    outer.toggle(false)
    expect(body.style.overflow).toBe('')
    expect(body.style.paddingRight).toBe('')
  })

  it('同じ状態を二度要求してもロック数を数え違えない', () => {
    const lock = createScrollLock()

    lock.toggle(true)
    lock.toggle(true)
    lock.release()

    expect(body.style.overflow).toBe('')
    expect(body.style.paddingRight).toBe('')
  })

  it('document が無い環境（SSR）では何もしない', () => {
    delete testGlobal.document

    const lock = createScrollLock()

    expect(() => {
      lock.toggle(true)
      lock.release()
    }).not.toThrow()
  })
})
