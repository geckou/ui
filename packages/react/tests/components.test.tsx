// @geckou/ui の移植時に修正したバグのリグレッションテスト
import { StrictMode, act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import {
  TabUI,
  DateSelector,
  LabeledCheckbox,
  DatePicker,
  DateRangePicker,
  SearchableSelectBox,
  FileInput,
  TextBox,
  TextArea,
  SelectBox,
  CheckButton,
  CheckBox,
  RadioButtons,
  ToggleButton,
  ModalBox,
  PopupBox,
  SlideDownUi,
  DropdownUi,
  useFormValidation,
} from '../src'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// jsdom には ResizeObserver が無いため（DropdownUi / SlideDownUi が使用）
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

function setSelectValue(select: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    'value'
  )!.set!
  setter.call(select, value)
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('TabUI', () => {
  const tabs = [
    { key: 'first', label: 'タブ1' },
    { key: 'second', label: 'タブ2' },
  ]

  function renderTabs() {
    act(() => {
      root.render(
        <TabUI
          tabs={tabs}
          panelSlots={{
            firstContents: <p>panel1</p>,
            secondContents: <p>panel2</p>,
          }}
        />
      )
    })
  }

  it('タブリスト上の矢印キーでタブが切り替わる', () => {
    renderTabs()
    const tablist = container.querySelector('[role="tablist"]')!

    act(() => {
      tablist.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
    })

    const selected = [...container.querySelectorAll('[role="tab"]')].map((t) =>
      t.getAttribute('aria-selected')
    )
    expect(selected).toEqual(['false', 'true'])
  })

  it('タブリスト外のキー入力では切り替わらない（元実装の window リスナー起因バグの修正）', () => {
    renderTabs()

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
      document.body.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      )
    })

    const selected = [...container.querySelectorAll('[role="tab"]')].map((t) =>
      t.getAttribute('aria-selected')
    )
    expect(selected).toEqual(['true', 'false'])
  })
})

describe('DateSelector', () => {
  it('月の変更で選択済みの日が範囲外になったらクランプされる', async () => {
    const onChange = vi.fn()
    act(() => {
      root.render(<DateSelector name="birthday" onChange={onChange} />)
    })

    const selects = () =>
      [...container.querySelectorAll('select')] as HTMLSelectElement[]

    act(() => setSelectValue(selects()[0], '2000'))
    act(() => setSelectValue(selects()[1], '03'))
    act(() => setSelectValue(selects()[2], '31'))
    expect(onChange).toHaveBeenLastCalledWith('2000-03-31')

    act(() => setSelectValue(selects()[1], '02'))

    // 2000年はうるう年なので 02/29 にクランプ
    expect(selects()[2].value).toBe('29')
    expect(onChange).toHaveBeenLastCalledWith('2000-02-29')

    await flushEffects()
  })

  it('親が value を空に戻すとリセットされる', () => {
    function renderWithValue(value: string) {
      act(() => {
        root.render(<DateSelector name="birthday" value={value} />)
      })
    }

    renderWithValue('2000-01-15')
    const selects = () =>
      [...container.querySelectorAll('select')] as HTMLSelectElement[]
    expect(selects()[0].value).toBe('2000')

    renderWithValue('')
    expect(selects().map((s) => s.value)).toEqual(['', '', ''])
  })
})

// InputBox は MutationObserver / focusin で状態を更新するため、act() の
// 同期ブロックを抜けたあと（マイクロタスク）に setState が走る。
// テストの最後にここで流し込まないと「not wrapped in act」の警告が出る
async function flushEffects() {
  await act(async () => {})
}

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )!.set!
  setter.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('SearchableSelectBox', () => {
  const options = [
    { label: 'りんご', value: 'apple' },
    { label: 'みかん', value: 'orange' },
  ]

  function renderBox(value: string, onChange?: (v: string) => void) {
    act(() => {
      root.render(
        <SearchableSelectBox
          name="fruit"
          options={options}
          value={value}
          onChange={onChange}
        />
      )
    })
  }

  it('入力でフィルタされた選択肢が開き、選択で確定する', () => {
    const onChange = vi.fn()
    renderBox('', onChange)

    const input = container.querySelector(
      'input[name="fruit"]'
    ) as HTMLInputElement
    act(() => setInputValue(input, 'りん'))

    // #61 で候補は role="option" になった（listbox の中に button は置けない）
    const optionNodes = [...container.querySelectorAll('[role="option"]')]
    expect(optionNodes.map((node) => node.textContent)).toEqual(['りんご'])

    act(() => {
      optionNodes[0].dispatchEvent(
        new MouseEvent('pointerdown', { bubbles: true, cancelable: true })
      )
    })
    expect(onChange).toHaveBeenLastCalledWith('apple')
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(0)
  })

  it("入力を空にすると選択肢が閉じ、onChange('') が呼ばれる", () => {
    const onChange = vi.fn()
    renderBox('', onChange)
    const input = container.querySelector(
      'input[name="fruit"]'
    ) as HTMLInputElement

    act(() => setInputValue(input, 'り'))
    expect(
      container.querySelectorAll('[role="option"]').length
    ).toBeGreaterThan(0)
    expect(onChange).toHaveBeenLastCalledWith('り')

    // 修正前は早期 return しており、空にしても親へ通知されなかった
    act(() => setInputValue(input, ''))
    expect(container.querySelectorAll('[role="option"]').length).toBe(0)
    expect(onChange).toHaveBeenLastCalledWith('')
  })

  // 回帰(#61): 候補が素の <button> の列挙で、combobox の ARIA も
  // ↑↓ / Enter / Escape も無く、Tab で 1 件ずつ辿るしかなかった
  const input = () =>
    container.querySelector('input[name="fruit"]') as HTMLInputElement

  const pressKey = (key: string) =>
    act(() => {
      input().dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      )
    })

  it('combobox の ARIA を出す', () => {
    renderBox('')

    expect(input().getAttribute('role')).toBe('combobox')
    expect(input().getAttribute('aria-autocomplete')).toBe('list')
    expect(input().getAttribute('aria-expanded')).toBe('false')

    const listboxId = input().getAttribute('aria-controls')
    expect(listboxId).toBeTruthy()

    pressKey('ArrowDown')

    expect(input().getAttribute('aria-expanded')).toBe('true')

    const listbox = container.querySelector('[role="listbox"]')!
    expect(listbox.id).toBe(listboxId)
    expect(listbox.querySelectorAll('[role="option"]')).toHaveLength(2)
  })

  it('↑↓ で候補を辿り、aria-activedescendant と aria-selected が追従する', () => {
    renderBox('')

    pressKey('ArrowDown')
    const options = () => [...container.querySelectorAll('[role="option"]')]

    expect(input().getAttribute('aria-activedescendant')).toBe(options()[0].id)
    expect(options().map((o) => o.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
    ])

    pressKey('ArrowDown')
    expect(input().getAttribute('aria-activedescendant')).toBe(options()[1].id)

    // 末尾からさらに下げると先頭へ回る
    pressKey('ArrowDown')
    expect(input().getAttribute('aria-activedescendant')).toBe(options()[0].id)

    // 先頭から上げると末尾へ回る
    pressKey('ArrowUp')
    expect(input().getAttribute('aria-activedescendant')).toBe(options()[1].id)
  })

  // WAI-ARIA の Combobox パターンでは、閉じた状態の ↑ は開いて末尾を選ぶ。
  // 修正前は activeIndex を -1 のままにしており、1 回押しても何も選ばれなかった
  it('閉じているとき ↑ で開いて末尾の候補を選ぶ', () => {
    renderBox('')

    expect(input().getAttribute('aria-expanded')).toBe('false')

    pressKey('ArrowUp')

    expect(input().getAttribute('aria-expanded')).toBe('true')

    const options = [...container.querySelectorAll('[role="option"]')]
    expect(input().getAttribute('aria-activedescendant')).toBe(
      options[options.length - 1].id
    )
    expect(options.map((o) => o.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
    ])
  })

  it('Enter で選択中の候補を確定する', () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()

    act(() => {
      root.render(
        <SearchableSelectBox
          name="fruit"
          options={options}
          value=""
          onChange={onChange}
          onSelect={onSelect}
        />
      )
    })

    pressKey('ArrowDown')
    pressKey('ArrowDown')
    pressKey('Enter')

    expect(onSelect).toHaveBeenLastCalledWith('orange')
    expect(onChange).toHaveBeenLastCalledWith('orange')
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(0)
  })

  it('Escape で閉じる', () => {
    renderBox('')

    pressKey('ArrowDown')
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(2)

    pressKey('Escape')
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(0)
    expect(input().getAttribute('aria-expanded')).toBe('false')
  })
})

describe('FileInput', () => {
  it('ファイル選択で onChange、個別削除・全削除が機能する', () => {
    const files: File[] = []
    const onChange = vi.fn()

    function renderInput(value: File[]) {
      act(() => {
        root.render(<FileInput value={value} onChange={onChange} />)
      })
    }

    renderInput(files)
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    const file = new File(['data'], 'photo.png', { type: 'image/png' })
    Object.defineProperty(fileInput, 'files', { value: [file] })
    act(() => {
      fileInput.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(onChange).toHaveBeenLastCalledWith([file])

    renderInput([file])
    expect(container.textContent).toContain('photo.png')
    expect(container.textContent).toContain('全て削除')

    const removeAll = [...container.querySelectorAll('button')].find((b) =>
      b.textContent!.includes('全て削除')
    )!
    act(() => removeAll.click())
    expect(onChange).toHaveBeenLastCalledWith([])

    renderInput([])
    expect(container.textContent).not.toContain('photo.png')
  })
})

function blur(element: HTMLElement) {
  act(() => {
    element.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
  })
}

describe('TextBox のバリデーション', () => {
  it('数値 0 は必須エラーにならない', () => {
    act(() => {
      root.render(<TextBox name="quantity" value={0} isRequired />)
    })

    expect(container.textContent).not.toContain('必須項目です')
  })

  it('数値 0 でも validates が実行される', async () => {
    act(() => {
      root.render(
        <TextBox
          name="quantity"
          value={0}
          validates={[{ regex: /^[1-9]\d*$/, message: '1以上を入力' }]}
        />
      )
    })

    expect(container.textContent).toContain('1以上を入力')

    await flushEffects()
  })

  it('g フラグ付き RegExp でも連続検証の結果が安定する', () => {
    const validates = [{ regex: /^[0-9]+$/g, message: '数字のみ' }]
    act(() => {
      root.render(<TextBox name="quantity" value="123" validates={validates} />)
    })

    const input = container.querySelector('input')!
    blur(input)
    expect(container.textContent).not.toContain('数字のみ')

    blur(input)
    expect(container.textContent).not.toContain('数字のみ')
  })

  it('呼び出し側の RegExp の lastIndex を変異させない', () => {
    const regex = /^[0-9]+$/g
    act(() => {
      root.render(
        <TextBox
          name="quantity"
          value="123"
          validates={[{ regex, message: '数字のみ' }]}
        />
      )
    })

    blur(container.querySelector('input')!)
    expect(regex.lastIndex).toBe(0)
  })

  it('y フラグの位置制約（先頭一致）を保ったまま判定する', () => {
    const validates = [{ regex: /foo/y, message: '先頭が foo ではありません' }]
    act(() => {
      root.render(<TextBox name="code" value="xfoo" validates={validates} />)
    })

    const input = container.querySelector('input')!
    blur(input)
    expect(container.textContent).toContain('先頭が foo ではありません')

    blur(input)
    expect(container.textContent).toContain('先頭が foo ではありません')
  })

  it('空文字は必須エラーになる', async () => {
    act(() => {
      root.render(<TextBox name="quantity" value="" isRequired />)
    })

    blur(container.querySelector('input')!)
    expect(container.textContent).toContain('必須項目です')

    await flushEffects()
  })
})

describe('TextArea のバリデーション', () => {
  it('g フラグ付き RegExp でも連続検証の結果が安定する', () => {
    const validates = [{ regex: /^[a-z]+$/g, message: '英小文字のみ' }]
    act(() => {
      root.render(<TextArea name="memo" value="abc" validates={validates} />)
    })

    const textarea = container.querySelector('textarea')!
    blur(textarea)
    expect(container.textContent).not.toContain('英小文字のみ')

    blur(textarea)
    expect(container.textContent).not.toContain('英小文字のみ')
  })
})

describe('SelectBox のバリデーション', () => {
  const options = [
    { label: 'ゼロ', value: 0 },
    { label: 'イチ', value: 1 },
  ]

  it('値 0 の選択肢は必須エラーにならない', () => {
    act(() => {
      root.render(
        <SelectBox name="count" options={options} value={0} isRequired />
      )
    })

    blur(container.querySelector('select')!)
    expect(container.textContent).not.toContain('必須項目です')
  })

  it('値 0 の選択肢を選ぶと数値 0 が onChange に渡る', () => {
    const onChange = vi.fn()
    act(() => {
      root.render(
        <SelectBox name="count" options={options} onChange={onChange} />
      )
    })

    setSelectValue(container.querySelector('select')!, '0')
    expect(onChange).toHaveBeenLastCalledWith(0)
  })

  it('未選択は必須エラーになる', async () => {
    act(() => {
      root.render(
        <SelectBox name="count" options={options} value="" isRequired />
      )
    })

    blur(container.querySelector('select')!)
    expect(container.textContent).toContain('必須項目です')

    await flushEffects()
  })
})

// Issue #90: display:none の入力要素はタブ順・アクセシビリティツリーから除外されるため、
// sr-only 化してフォーカス到達できることのリグレッションテスト
describe('キーボードアクセシビリティ', () => {
  it('CheckButton: input が label 内にあり sr-only でフォーカス可能', () => {
    const onChange = vi.fn()
    act(() => {
      root.render(
        <CheckButton name="agree" checked={false} onChange={onChange} />
      )
    })

    const input = container.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement
    expect(input.classList.contains('hidden')).toBe(false)
    expect(input.classList.contains('sr-only')).toBe(true)
    expect(input.closest('label')).not.toBeNull()

    input.focus()
    expect(document.activeElement).toBe(input)

    // ネイティブ checkbox の Space トグルは click 経由で発火する
    act(() => input.click())
    expect(onChange).toHaveBeenLastCalledWith(true)
  })

  it('CheckBox: role=checkbox と aria-checked / disabled が反映される', () => {
    const onChange = vi.fn()

    function renderCheckBox(checked: boolean, isDisabled?: boolean) {
      act(() => {
        root.render(
          <CheckBox
            name="agree"
            checked={checked}
            onChange={onChange}
            isDisabled={isDisabled}
          />
        )
      })
    }

    renderCheckBox(false)
    const button = () => container.querySelector('button')!
    // aria-pressed はトグルボタン用。チェックボックスの意味論は role + aria-checked
    expect(button().getAttribute('role')).toBe('checkbox')
    expect(button().getAttribute('aria-checked')).toBe('false')
    expect(button().getAttribute('aria-label')).toBe('agree')

    act(() => button().click())
    expect(onChange).toHaveBeenLastCalledWith(true)

    renderCheckBox(true)
    expect(button().getAttribute('aria-checked')).toBe('true')

    renderCheckBox(false, true)
    expect(button().disabled).toBe(true)
  })

  // 回帰(#53): <button> の content model は interactive content を許さないので
  // 中に <input> を置けない。状態は data-checked で表し、送信用は hidden を外に出す
  it('CheckBox: button の中に input を置かず、チェック時だけ hidden を外に描く', () => {
    function renderCheckBox(checked: boolean, isDisabled?: boolean) {
      act(() => {
        root.render(
          <CheckBox name="agree" checked={checked} isDisabled={isDisabled} />
        )
      })
    }

    renderCheckBox(false)
    const button = () => container.querySelector('button')!
    expect(button().querySelector('input')).toBeNull()
    expect(container.querySelector('input[type="hidden"]')).toBeNull()
    expect(button().getAttribute('data-checked')).toBe('false')

    renderCheckBox(true)
    const hidden = container.querySelector(
      'input[type="hidden"]'
    ) as HTMLInputElement
    expect(hidden).not.toBeNull()
    expect(hidden.name).toBe('agree')
    expect(hidden.value).toBe('on')
    // button の外（兄弟）に出ていること
    expect(hidden.closest('button')).toBeNull()
    expect(button().getAttribute('data-checked')).toBe('true')

    // 無効なら送信されない（disabled な input はフォームに載らない）
    renderCheckBox(true, true)
    expect(
      (container.querySelector('input[type="hidden"]') as HTMLInputElement)
        .disabled
    ).toBe(true)
  })

  it('ToggleButton: button の中に input を置かず、ON のときだけ hidden を外に描く', () => {
    function renderToggle(checked: boolean) {
      act(() => {
        root.render(<ToggleButton name="notification" checked={checked} />)
      })
    }

    renderToggle(false)
    const button = () => container.querySelector('button')!
    expect(button().querySelector('input')).toBeNull()
    expect(container.querySelector('input[type="hidden"]')).toBeNull()

    renderToggle(true)
    const hidden = container.querySelector(
      'input[type="hidden"]'
    ) as HTMLInputElement
    expect(hidden).not.toBeNull()
    expect(hidden.name).toBe('notification')
    expect(hidden.closest('button')).toBeNull()
    expect(button().getAttribute('data-checked')).toBe('true')
  })

  it('RadioButtons: input が sr-only でフォーカス・選択できる', () => {
    const onChange = vi.fn()
    act(() => {
      root.render(
        <RadioButtons
          value=""
          onChange={onChange}
          options={[
            { label: 'りんご', value: 'apple' },
            { label: 'みかん', value: 'orange' },
          ]}
        />
      )
    })

    const inputs = [
      ...container.querySelectorAll('input[type="radio"]'),
    ] as HTMLInputElement[]
    expect(inputs).toHaveLength(2)
    for (const input of inputs) {
      expect(input.classList.contains('hidden')).toBe(false)
      expect(input.classList.contains('sr-only')).toBe(true)
    }

    inputs[0].focus()
    expect(document.activeElement).toBe(inputs[0])

    act(() => inputs[1].click())
    expect(onChange).toHaveBeenLastCalledWith('orange')
  })

  it('ToggleButton: role=switch と aria-checked / アクセシブル名がある', () => {
    const onChange = vi.fn()

    function renderToggle(checked: boolean) {
      act(() => {
        root.render(
          <ToggleButton
            name="notification"
            checked={checked}
            onChange={onChange}
          />
        )
      })
    }

    renderToggle(false)
    const button = () => container.querySelector('button')!
    // aria-pressed は押しボタン用。ON/OFF スイッチは role=switch + aria-checked
    expect(button().getAttribute('role')).toBe('switch')
    expect(button().getAttribute('aria-checked')).toBe('false')
    expect(button().getAttribute('aria-label')).toBe('notification')

    act(() => button().click())
    expect(onChange).toHaveBeenLastCalledWith(true)

    renderToggle(true)
    expect(button().getAttribute('aria-checked')).toBe('true')
  })

  // 回帰: <label> は <button> をラベル付けしないので、可視ラベルがあっても
  // アクセシブル名が name（機械名）になり、画面の文言と読み上げが食い違っていた
  it('LabeledCheckbox: 可視ラベルをアクセシブル名にする', () => {
    act(() => {
      root.render(
        <LabeledCheckbox name="agreement" label="利用規約に同意する" />
      )
    })

    const button = container.querySelector('button')!
    const labelledBy = button.getAttribute('aria-labelledby')

    expect(labelledBy).toBeTruthy()
    expect(button.getAttribute('aria-label')).toBeNull()
    expect(document.getElementById(labelledBy!)?.textContent).toBe(
      '利用規約に同意する'
    )
  })

  it('ModalBox: Escape で閉じ、閉じたらトリガーへフォーカスが戻る', () => {
    const onClose = vi.fn()
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    function renderModal(isShown: boolean) {
      act(() => {
        root.render(
          <ModalBox isShown={isShown} onClose={onClose}>
            <p>本文</p>
          </ModalBox>
        )
      })
    }

    renderModal(false)
    renderModal(true)

    expect(document.activeElement).not.toBe(trigger)

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(onClose).toHaveBeenCalledTimes(1)

    renderModal(false)
    expect(document.activeElement).toBe(trigger)

    trigger.remove()
  })

  // 回帰: 子（SearchableSelectBox の候補リスト等）が Escape を処理しても
  // ダイアログまで閉じ、入力途中のフォームが消えていた
  it('ModalBox: 子が preventDefault した Escape では閉じない', () => {
    const onClose = vi.fn()

    act(() => {
      root.render(
        <ModalBox isShown onClose={onClose}>
          <p>本文</p>
        </ModalBox>
      )
    })

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        cancelable: true,
      })
      event.preventDefault()
      document.dispatchEvent(event)
    })

    expect(onClose).not.toHaveBeenCalled()
  })

  // 回帰: モーダルを重ねると両方のハンドラが同じ Escape を受け取り、
  // 内側を閉じるつもりが外側まで閉じていた。ハンドラは両方 document に
  // 付いていて実行順は登録順で決まるため、外側が先に開く実際の使い方で試す
  it('ModalBox: 入れ子のとき Escape で閉じるのは内側だけ', () => {
    const onCloseOuter = vi.fn()
    const onCloseInner = vi.fn()

    function NestedModals({ isInnerShown }: { isInnerShown: boolean }) {
      return (
        <ModalBox isShown onClose={onCloseOuter}>
          <ModalBox isShown={isInnerShown} onClose={onCloseInner}>
            <p>内側</p>
          </ModalBox>
        </ModalBox>
      )
    }

    // 先に外側だけを開く（= 外側のハンドラが先に document へ登録される）
    act(() => root.render(<NestedModals isInnerShown={false} />))
    act(() => root.render(<NestedModals isInnerShown />))

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
      )
    })

    expect(onCloseInner).toHaveBeenCalledTimes(1)
    expect(onCloseOuter).not.toHaveBeenCalled()
  })

  // 自分が Escape を処理したら印を残す（外側で Escape を見ているアプリ側の
  // ハンドラまで一緒に反応しないように）
  it('ModalBox: Escape を処理したら preventDefault する', () => {
    act(() => {
      root.render(
        <ModalBox isShown onClose={() => {}}>
          <p>本文</p>
        </ModalBox>
      )
    })

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true,
    })

    act(() => {
      document.dispatchEvent(event)
    })

    expect(event.defaultPrevented).toBe(true)
  })

  it('ModalBox: 非表示時は inert、閉じるボタンにアクセシブル名がある', () => {
    function renderModal(isShown: boolean) {
      act(() => {
        root.render(
          <ModalBox isShown={isShown} onClose={() => {}}>
            <p>本文</p>
          </ModalBox>
        )
      })
    }

    renderModal(false)
    const overlay = () => container.firstElementChild as HTMLElement
    expect(overlay().hasAttribute('inert')).toBe(true)

    renderModal(true)
    expect(overlay().hasAttribute('inert')).toBe(false)

    const closeButton = container.querySelector('button[aria-label="閉じる"]')
    expect(closeButton).not.toBeNull()

    // 表示時はダイアログへ初期フォーカスが移る
    const dialog = container.querySelector('[role="dialog"]')
    expect(document.activeElement).toBe(dialog)

    // header が無い場合もダイアログにアクセシブル名がある
    expect(dialog!.getAttribute('aria-label')).toBe('ダイアログ')
  })

  it('ModalBox: header があれば aria-labelledby、ariaLabel 指定時はそれが優先される', () => {
    act(() => {
      root.render(
        <ModalBox isShown onClose={() => {}} header={<h2>設定</h2>}>
          <p>本文</p>
        </ModalBox>
      )
    })

    const dialog = () => container.querySelector('[role="dialog"]')!
    const labelledBy = dialog().getAttribute('aria-labelledby')
    expect(labelledBy).not.toBeNull()
    expect(document.getElementById(labelledBy!)?.textContent).toBe('設定')
    expect(dialog().hasAttribute('aria-label')).toBe(false)

    act(() => {
      root.render(
        <ModalBox isShown onClose={() => {}} ariaLabel="確認">
          <p>本文</p>
        </ModalBox>
      )
    })
    expect(dialog().getAttribute('aria-label')).toBe('確認')
  })

  it('SlideDownUi: トリガーに aria-expanded、閉状態のコンテンツは inert', () => {
    act(() => {
      root.render(
        <SlideDownUi trigger={<span>開く</span>}>
          <button type="button">中のボタン</button>
        </SlideDownUi>
      )
    })

    const trigger = container.querySelector('button')!
    expect(trigger.getAttribute('aria-expanded')).toBe('false')

    const contents = container.querySelector('[inert]')
    expect(contents).not.toBeNull()

    act(() => trigger.click())
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('[inert]')).toBeNull()
  })

  it('DropdownUi: トリガーに aria-expanded、閉状態のコンテンツは inert', () => {
    act(() => {
      root.render(
        <DropdownUi
          trigger={<span>メニュー</span>}
          contents={<button type="button">項目</button>}
        />
      )
    })

    const trigger = container.querySelector('button')!
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(container.querySelector('[inert]')).not.toBeNull()

    act(() => trigger.click())
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('[inert]')).toBeNull()
  })

  it('FileInput: ファイル選択 input が sr-only、削除ボタンにアクセシブル名がある', () => {
    const file = new File(['data'], 'photo.png', { type: 'image/png' })
    act(() => {
      root.render(<FileInput value={[file]} onChange={() => {}} />)
    })

    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement
    expect(input.classList.contains('hidden')).toBe(false)
    expect(input.classList.contains('sr-only')).toBe(true)

    const removeButton = container.querySelector(
      'button[aria-label="photo.png を削除"]'
    )
    expect(removeButton).not.toBeNull()
  })
})

describe('DatePicker', () => {
  it('親からの value 更新に追従する', () => {
    function renderWithValue(value: string) {
      act(() => {
        root.render(<DatePicker name="date" value={value} />)
      })
    }

    renderWithValue('2026-01-01')
    const dateInput = () =>
      container.querySelector('input[type="date"]') as HTMLInputElement
    expect(dateInput().value).toBe('2026-01-01')

    renderWithValue('2026-12-31')
    expect(dateInput().value).toBe('2026-12-31')
  })

  it('不正な value でもクラッシュしない', () => {
    expect(() => {
      act(() => {
        root.render(<DatePicker name="date" value="invalid-date" />)
      })
    }).not.toThrow()
  })

  it('type="month" では YYYY-MM 形式になる', () => {
    act(() => {
      root.render(<DatePicker name="month" type="month" value="2026-08-17" />)
    })

    const monthInput = container.querySelector(
      'input[type="month"]'
    ) as HTMLInputElement
    expect(monthInput.value).toBe('2026-08')
  })
})

// @geckou/ui-core への移行で修正したバグのリグレッションテスト
describe('DatePicker のタイムゾーン', () => {
  // 移行前は new Date(value).toISOString() を使っており、
  // JST のようなプラス方向のタイムゾーンで日付が前日へずれていた
  it('日付が前日へずれない', () => {
    const dateInput = () =>
      (container.querySelector('input[type="date"]') as HTMLInputElement).value

    for (const value of [
      '2026-08-25',
      '2026-01-01',
      '2026-12-31',
      '2024-02-29',
    ]) {
      act(() => {
        root.render(<DatePicker name="date" value={value} />)
      })
      expect(dateInput()).toBe(value)
    }
  })

  it("type='month' では YYYY-MM を返す", () => {
    act(() => {
      root.render(<DatePicker name="month" value="2026-08-25" type="month" />)
    })
    const monthInput = container.querySelector(
      'input[type="month"]'
    ) as HTMLInputElement
    expect(monthInput.value).toBe('2026-08')
  })
})

describe('useFormValidation', () => {
  it('登録した入力の状態を集約する', () => {
    let api: ReturnType<typeof useFormValidation> | null = null

    function Probe() {
      api = useFormValidation()
      return <span>{String(api.isAllValid)}</span>
    }

    act(() => {
      root.render(<Probe />)
    })
    expect(container.textContent).toBe('true')

    act(() => api!.setValid('startedOn', false))
    expect(container.textContent).toBe('false')
    expect(api!.invalidNames).toEqual(['startedOn'])

    act(() => api!.setValid('startedOn', true))
    expect(container.textContent).toBe('true')

    act(() => api!.setValid('endedOn', false))
    expect(container.textContent).toBe('false')

    act(() => api!.remove('endedOn'))
    expect(container.textContent).toBe('true')
  })
})

describe('formValidationStore との接続', () => {
  // 修正前は useRegisterValidation を使うコンポーネントが 1 つも無く、
  // 空の必須項目があっても isAllValid が true のままだった
  function Form({
    isRequired = true,
    initialValue = '',
  }: {
    isRequired?: boolean
    initialValue?: string
  }) {
    const { isAllValid, invalidNames, store } = useFormValidation()
    const [value, setValue] = useState(initialValue)

    return (
      <div>
        <span data-testid="valid">{String(isAllValid)}</span>
        <span data-testid="invalid">{invalidNames.join(',')}</span>
        <DatePicker
          name="startedOn"
          value={value}
          isRequired={isRequired}
          formValidationStore={store}
          onChange={setValue}
        />
      </div>
    )
  }

  const valid = () =>
    container.querySelector('[data-testid="valid"]')!.textContent

  it('空の必須 DatePicker は isAllValid を false にする', () => {
    act(() => {
      root.render(<Form />)
    })

    expect(valid()).toBe('false')
    expect(
      container.querySelector('[data-testid="invalid"]')!.textContent
    ).toBe('startedOn')
  })

  it('日付を入れると isAllValid が true になる', () => {
    act(() => {
      root.render(<Form />)
    })
    expect(valid()).toBe('false')

    const dateInput =
      container.querySelector<HTMLInputElement>('input[type="date"]')!
    act(() => setInputValue(dateInput, '2024-01-01'))

    expect(valid()).toBe('true')
  })

  // 回帰: 年月日欄の不正値はエラー文言を出すだけで、登録する validity は
  // 必須の空欄しか見ておらず isAllValid が true のままだった
  it('年月日欄に不正な値を入れると isAllValid が false になる', () => {
    act(() => {
      root.render(<Form isRequired={false} />)
    })
    expect(valid()).toBe('true')

    const byLabel = (label: string) =>
      container.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!

    act(() => setInputValue(byLabel('startedOnの年'), '2024'))
    act(() => setInputValue(byLabel('startedOnの月'), '13'))
    act(() => setInputValue(byLabel('startedOnの日'), '01'))

    expect(valid()).toBe('false')
  })

  it('年月日欄を正しい値に直すと isAllValid が true に戻る', async () => {
    act(() => {
      root.render(<Form isRequired={false} />)
    })

    const byLabel = (label: string) =>
      container.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!

    act(() => setInputValue(byLabel('startedOnの年'), '2024'))
    act(() => setInputValue(byLabel('startedOnの月'), '13'))
    act(() => setInputValue(byLabel('startedOnの日'), '01'))
    expect(valid()).toBe('false')

    act(() => setInputValue(byLabel('startedOnの月'), '12'))

    expect(valid()).toBe('true')

    await flushEffects()
  })

  it('必須でなければ空でも有効', () => {
    act(() => {
      root.render(<Form isRequired={false} />)
    })

    expect(valid()).toBe('true')
  })

  it('DateSelector: 必須の未選択は無効、揃うと有効になる', () => {
    function SelectorForm() {
      const { isAllValid, store } = useFormValidation()
      const [value, setValue] = useState('')

      return (
        <div>
          <span data-testid="valid">{String(isAllValid)}</span>
          <DateSelector
            name="birthday"
            value={value}
            isRequired
            formValidationStore={store}
            onChange={setValue}
          />
        </div>
      )
    }

    act(() => {
      root.render(<SelectorForm />)
    })
    expect(valid()).toBe('false')

    const selects = container.querySelectorAll<HTMLSelectElement>('select')
    act(() => setSelectValue(selects[0], '1990'))
    act(() => setSelectValue(selects[1], '05'))
    act(() => setSelectValue(selects[2], '20'))

    expect(valid()).toBe('true')
  })
})

describe('Vue 版との API 統一', () => {
  // 回帰: min / max はネイティブ入力にしか効かず、年月日欄から
  // 開始 > 終了 を入力しても検証されなかった
  it('DateRangePicker: 開始 > 終了なら範囲エラーを出す', () => {
    act(() => {
      root.render(
        <DateRangePicker
          name="period"
          value={{ start: '2024-05-01', end: '2024-04-01' }}
        />
      )
    })

    expect(container.textContent).toContain('終了日より後の日付は選べません')

    act(() => {
      root.render(
        <DateRangePicker
          name="period"
          value={{ start: '2024-04-01', end: '2024-05-01' }}
        />
      )
    })

    expect(container.textContent).not.toContain(
      '終了日より後の日付は選べません'
    )
  })

  // 回帰: 年の範囲が「今年-100 〜 今年-14」固定で、外れた value を渡すと
  // select が空表示になっていた
  it('DateSelector: minYear / maxYear で年の範囲を変えられる', () => {
    act(() => {
      root.render(
        <DateSelector
          name="publishedOn"
          value="2026-05-20"
          minYear={2020}
          maxYear={2030}
        />
      )
    })

    const yearSelect = container.querySelector<HTMLSelectElement>(
      'select[name="publishedOn-year"]'
    )!

    expect(yearSelect.value).toBe('2026')
    expect(yearSelect.options.length).toBe(12)
  })

  // 回帰: isRequired が required 属性を付けるだけで、Vue 版が出す
  // 「必須項目です」の ErrorMessage が無かった
  it('RadioButtons: 選択が空へ戻されたら必須エラーを出す', () => {
    const options = [
      { label: '個人', value: 'personal' },
      { label: '法人', value: 'corporate' },
    ]

    const renderRadios = (value: string) => {
      act(() => {
        root.render(<RadioButtons value={value} options={options} isRequired />)
      })
    }

    // 初回描画では出さない（Vue 版は watch で判定するため）
    renderRadios('')
    expect(container.textContent).not.toContain('必須項目です')

    renderRadios('personal')
    expect(container.textContent).not.toContain('必須項目です')

    // 親がフォームをリセットして空へ戻したケース
    renderRadios('')
    expect(container.textContent).toContain('必須項目です')
  })

  it('DateRangePicker: value が {start, end}、name は <name>Start / <name>End', () => {
    const onChange = vi.fn()

    act(() => {
      root.render(
        <DateRangePicker
          name="period"
          value={{ start: '2024-01-01', end: '2024-01-31' }}
          onChange={onChange}
        />
      )
    })

    const inputs = [
      ...container.querySelectorAll<HTMLInputElement>('input[type="date"]'),
    ]
    expect(inputs.map((input) => input.name)).toEqual([
      'periodStart',
      'periodEnd',
    ])
    expect(inputs.map((input) => input.value)).toEqual([
      '2024-01-01',
      '2024-01-31',
    ])

    // 開始 ↔ 終了の min / max が連動する
    expect(inputs[0].max).toBe('2024-01-31')
    expect(inputs[1].min).toBe('2024-01-01')

    act(() => setInputValue(inputs[0], '2024-01-10'))
    expect(onChange).toHaveBeenLastCalledWith({
      start: '2024-01-10',
      end: '2024-01-31',
    })
  })

  it("DateSelector: type='month' なら日を出さず YYYY-MM を返す", () => {
    const onChange = vi.fn()

    act(() => {
      root.render(
        <DateSelector name="startedOn" type="month" onChange={onChange} />
      )
    })

    const selects = container.querySelectorAll<HTMLSelectElement>('select')
    expect(selects).toHaveLength(2)

    act(() => setSelectValue(selects[0], '1990'))
    act(() => setSelectValue(selects[1], '05'))

    expect(onChange).toHaveBeenLastCalledWith('1990-05')
  })
})

describe('PopupBox', () => {
  // 回帰(#68): 3 秒で消える通知なのにライブリージョンでなく、
  // 支援技術には何も伝わっていなかった
  it('ライブリージョンとして読み上げ対象になる', () => {
    act(() => {
      root.render(<PopupBox>保存しました</PopupBox>)
    })

    const popup = document.querySelector('[role="status"]')

    expect(popup).not.toBeNull()
    expect(popup!.textContent).toBe('保存しました')
  })
})

describe('DatePicker / DateSelector のアクセシブル名', () => {
  // 回帰(#59): name（フォームのフィールド名）から読み上げ名を作っていたため、
  // name="startedOn" だと「startedOnの年」と読まれていた
  it('DatePicker: ariaLabel を年月日のラベルに使う', () => {
    act(() => {
      root.render(<DatePicker name="startedOn" value="" ariaLabel="開始日" />)
    })

    const labels = [...container.querySelectorAll('input[type="text"]')].map(
      (input) => input.getAttribute('aria-label')
    )

    expect(labels).toEqual(['開始日の年', '開始日の月', '開始日の日'])
  })

  it('DatePicker: ariaLabel が無ければ name にフォールバックする', () => {
    act(() => {
      root.render(<DatePicker name="startedOn" value="" />)
    })

    expect(
      container.querySelector('input[type="text"]')!.getAttribute('aria-label')
    ).toBe('startedOnの年')
  })

  it('DatePicker: ariaLabelledBy があれば可視ラベルと単位を並べて指す', () => {
    act(() => {
      root.render(
        <DatePicker name="startedOn" value="" ariaLabelledBy="label_id" />
      )
    })

    const year = container.querySelector('input[type="text"]')!
    const labelledBy = year.getAttribute('aria-labelledby')!

    expect(year.getAttribute('aria-label')).toBeNull()
    expect(labelledBy.startsWith('label_id ')).toBe(true)
    expect(
      container.querySelector(`[id="${labelledBy.split(' ')[1]}"]`)?.textContent
    ).toBe('の年')
  })

  // 回帰(#68): カレンダー起動用の date 入力は opacity-0 で重ねているだけで
  // aria-label が無く、キーボード操作で「見えない・名前の無い」タブ停止点だった
  it('DatePicker: カレンダー起動用の入力にもアクセシブル名がある', () => {
    act(() => {
      root.render(<DatePicker name="startedOn" value="" ariaLabel="開始日" />)
    })

    expect(
      container.querySelector('input[type="date"]')!.getAttribute('aria-label')
    ).toBe('開始日のカレンダー')
  })

  it('DatePicker: カレンダー起動用の入力も ariaLabelledBy に追従する', () => {
    act(() => {
      root.render(
        <DatePicker name="startedOn" value="" ariaLabelledBy="label_id" />
      )
    })

    const calendar = container.querySelector('input[type="date"]')!
    const labelledBy = calendar.getAttribute('aria-labelledby')!

    expect(calendar.getAttribute('aria-label')).toBeNull()
    expect(labelledBy.startsWith('label_id ')).toBe(true)
    expect(
      container.querySelector(`[id="${labelledBy.split(' ')[1]}"]`)?.textContent
    ).toBe('のカレンダー')
  })

  it('DateSelector: ariaLabel を年月日のラベルに使う', () => {
    act(() => {
      root.render(<DateSelector name="birthday" ariaLabel="生年月日" />)
    })

    const labels = [...container.querySelectorAll('select')].map((select) =>
      select.getAttribute('aria-label')
    )

    expect(labels).toEqual(['生年月日の年', '生年月日の月', '生年月日の日'])
  })

  it('DateSelector: ariaLabel が無ければ name にフォールバックする', () => {
    act(() => {
      root.render(<DateSelector name="birthday" />)
    })

    expect(container.querySelector('select')!.getAttribute('aria-label')).toBe(
      'birthdayの年'
    )
  })

  it('DateSelector: ariaLabelledBy があれば可視ラベルと単位を並べて指す', () => {
    act(() => {
      root.render(<DateSelector name="birthday" ariaLabelledBy="label_id" />)
    })

    const year = container.querySelector('select')!
    const labelledBy = year.getAttribute('aria-labelledby')!

    expect(year.getAttribute('aria-label')).toBeNull()
    expect(labelledBy.startsWith('label_id ')).toBe(true)
    expect(
      container.querySelector(`[id="${labelledBy.split(' ')[1]}"]`)?.textContent
    ).toBe('の年')
  })
})

describe('ModalBox のフォーカストラップ', () => {
  // 回帰(#56): 背景を inert にしていないため、Tab / Shift+Tab でダイアログの外の
  // リンクやボタンへフォーカスが抜けていた
  function renderModal(isShown = true) {
    act(() => {
      root.render(
        <ModalBox isShown={isShown} onClose={() => {}}>
          <a href="#first">最初</a>
          <a href="#last">最後</a>
        </ModalBox>
      )
    })
  }

  const focusable = () =>
    [...container.querySelectorAll('a, button')] as HTMLElement[]

  it('最後の要素で Tab したら最初の要素へ戻る', () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)

    renderModal()
    const elements = focusable()
    elements[elements.length - 1]!.focus()

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    })

    expect(document.activeElement).toBe(elements[0])
    outside.remove()
  })

  it('最初の要素で Shift+Tab したら最後の要素へ回る', () => {
    renderModal()
    const elements = focusable()
    elements[0]!.focus()

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })
      )
    })

    expect(document.activeElement).toBe(elements[elements.length - 1])
  })

  it('閉じている間は Tab を横取りしない', () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)

    renderModal(false)
    outside.focus()

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    })

    expect(document.activeElement).toBe(outside)
    outside.remove()
  })

  // 回帰(#56 の details): StrictMode では effect が 2 回走り、2 回目に
  // lastFocused がダイアログ自身になって復帰しなくなっていた
  it('StrictMode でも閉じたら開く前の要素へフォーカスが戻る', () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    function renderStrict(isShown: boolean) {
      act(() => {
        root.render(
          <StrictMode>
            <ModalBox isShown={isShown} onClose={() => {}}>
              <p>本文</p>
            </ModalBox>
          </StrictMode>
        )
      })
    }

    renderStrict(true)
    expect(document.activeElement).not.toBe(trigger)

    renderStrict(false)
    expect(document.activeElement).toBe(trigger)

    trigger.remove()
  })
})
