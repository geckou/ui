import { describe, expect, it, vi } from 'vitest'
import {
  FOCUSABLE_SELECTOR,
  getFocusableElements,
  handleTabKey,
  type FocusTrapContainer,
  type FocusableLike,
} from '../src/focus-trap.js'

/** node 環境なので DOM は使わず、必要な形だけの偽物を組む */
function createElement(options: { inert?: boolean } = {}) {
  return {
    focus: vi.fn(),
    hasAttribute: (name: string) => name === 'inert' && !!options.inert,
  }
}

function createContainer(children: FocusableLike[]): FocusTrapContainer {
  return {
    focus: vi.fn(),
    hasAttribute: () => false,
    querySelectorAll: () => children,
  }
}

function createEvent(shiftKey = false, key = 'Tab') {
  return { key, shiftKey, preventDefault: vi.fn() }
}

describe('FOCUSABLE_SELECTOR', () => {
  it('tabindex="-1" と disabled な要素を除く', () => {
    expect(FOCUSABLE_SELECTOR).toContain('[tabindex]:not([tabindex="-1"])')
    expect(FOCUSABLE_SELECTOR).toContain('button:not([disabled])')
  })
})

describe('getFocusableElements', () => {
  it('コンテナが無ければ空', () => {
    expect(getFocusableElements(null)).toEqual([])
  })

  it('inert が付いた要素を除く', () => {
    const usable = createElement()
    const inert = createElement({ inert: true })

    expect(getFocusableElements(createContainer([usable, inert]))).toEqual([
      usable,
    ])
  })
})

describe('handleTabKey', () => {
  it('Tab 以外は何もしない', () => {
    const first = createElement()
    const event = createEvent(false, 'Enter')

    expect(handleTabKey(createContainer([first]), event, first)).toBe(false)
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('最後の要素で Tab したら最初の要素へ戻す', () => {
    const first = createElement()
    const last = createElement()
    const event = createEvent()

    expect(handleTabKey(createContainer([first, last]), event, last)).toBe(true)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(first.focus).toHaveBeenCalled()
  })

  it('最初の要素で Shift+Tab したら最後の要素へ回す', () => {
    const first = createElement()
    const last = createElement()
    const event = createEvent(true)

    expect(handleTabKey(createContainer([first, last]), event, first)).toBe(
      true
    )
    expect(event.preventDefault).toHaveBeenCalled()
    expect(last.focus).toHaveBeenCalled()
  })

  it('途中の要素ではブラウザ既定に任せる', () => {
    const first = createElement()
    const middle = createElement()
    const last = createElement()
    const event = createEvent()

    expect(
      handleTabKey(createContainer([first, middle, last]), event, middle)
    ).toBe(false)
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('ダイアログ自身から Shift+Tab したら最後の要素へ回す', () => {
    const first = createElement()
    const last = createElement()
    const container = createContainer([first, last])
    const event = createEvent(true)

    expect(handleTabKey(container, event, container)).toBe(true)
    expect(last.focus).toHaveBeenCalled()
  })

  it('ダイアログの外にフォーカスがあれば引き戻す', () => {
    const first = createElement()
    const last = createElement()
    const outside = createElement()
    const event = createEvent()

    expect(handleTabKey(createContainer([first, last]), event, outside)).toBe(
      true
    )
    expect(first.focus).toHaveBeenCalled()
  })

  it('フォーカスできる要素が無ければ Tab ごと止めてダイアログに留める', () => {
    const container = createContainer([])
    const event = createEvent()

    expect(handleTabKey(container, event, container)).toBe(true)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(container.focus).toHaveBeenCalled()
  })

  it('コンテナが無ければ何もしない', () => {
    const event = createEvent()

    expect(handleTabKey(null, event, null)).toBe(false)
  })
})
