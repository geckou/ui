import { describe, expect, it, vi } from 'vitest'
import { createFormValidationStore } from '../src/form-validation-store.js'

describe('createFormValidationStore', () => {
  it('未登録の入力は有効として扱う', () => {
    const store = createFormValidationStore()

    expect(store.isValid('unknown')).toBe(true)
    expect(store.getSnapshot()).toEqual({ isAllValid: true, invalidNames: [] })
  })

  it('無効な入力を登録すると isAllValid が false になる', () => {
    const store = createFormValidationStore()
    store.setValid('startedOn', false)

    expect(store.getSnapshot()).toEqual({
      isAllValid: false,
      invalidNames: ['startedOn'],
    })
  })

  it('remove すると管理対象から外れる', () => {
    const store = createFormValidationStore()
    store.setValid('startedOn', false)
    store.remove('startedOn')

    expect(store.getSnapshot().isAllValid).toBe(true)
  })

  it('reset ですべて破棄する', () => {
    const store = createFormValidationStore()
    store.setValid('a', false)
    store.setValid('b', false)
    store.reset()

    expect(store.getSnapshot()).toEqual({ isAllValid: true, invalidNames: [] })
  })

  it('購読者へ変更を通知する', () => {
    const store = createFormValidationStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    store.setValid('a', false)
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    store.setValid('b', false)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  // useSyncExternalStore は参照が変わるたびに再描画するため、
  // 内容が同じ間は同一参照を返さないと無限ループになる
  it('内容が変わらなければ同じスナップショット参照を返す', () => {
    const store = createFormValidationStore()
    const first = store.getSnapshot()

    store.setValid('a', true)

    expect(store.getSnapshot()).toBe(first)
  })

  it('同じ値の再登録では通知しない', () => {
    const store = createFormValidationStore()
    const listener = vi.fn()
    store.subscribe(listener)

    store.setValid('a', false)
    store.setValid('a', false)

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('内容が変われば別のスナップショット参照になる', () => {
    const store = createFormValidationStore()
    const first = store.getSnapshot()

    store.setValid('a', false)

    expect(store.getSnapshot()).not.toBe(first)
  })
})
