// @geckou/ui の移植時に修正したバグのリグレッションテスト
import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import {
  TabUI,
  DateSelector,
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
  SlideDownUi,
  DropdownUi,
  useFormValidation,
} from '../src'

declare global {
  // eslint-disable-next-line no-var
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
  it('月の変更で選択済みの日が範囲外になったらクランプされる', () => {
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

    const optionButtons = [...container.querySelectorAll('button')].filter(
      (b) => b.textContent === 'りんご'
    )
    expect(optionButtons).toHaveLength(1)
    expect(
      [...container.querySelectorAll('button')].some(
        (b) => b.textContent === 'みかん'
      )
    ).toBe(false)

    act(() => optionButtons[0].click())
    expect(onChange).toHaveBeenLastCalledWith('apple')
    expect(
      [...container.querySelectorAll('button')].some(
        (b) => b.textContent === 'りんご'
      )
    ).toBe(false)
  })

  it("入力を空にすると選択肢が閉じ、onChange('') が呼ばれる", () => {
    const onChange = vi.fn()
    renderBox('', onChange)
    const input = container.querySelector(
      'input[name="fruit"]'
    ) as HTMLInputElement

    act(() => setInputValue(input, 'り'))
    expect(container.querySelectorAll('button').length).toBeGreaterThan(0)
    expect(onChange).toHaveBeenLastCalledWith('り')

    // 修正前は早期 return しており、空にしても親へ通知されなかった
    act(() => setInputValue(input, ''))
    expect(container.querySelectorAll('button').length).toBe(0)
    expect(onChange).toHaveBeenLastCalledWith('')
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

  it('数値 0 でも validates が実行される', () => {
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

  it('空文字は必須エラーになる', () => {
    act(() => {
      root.render(<TextBox name="quantity" value="" isRequired />)
    })

    blur(container.querySelector('input')!)
    expect(container.textContent).toContain('必須項目です')
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

  it('未選択は必須エラーになる', () => {
    act(() => {
      root.render(
        <SelectBox name="count" options={options} value="" isRequired />
      )
    })

    blur(container.querySelector('select')!)
    expect(container.textContent).toContain('必須項目です')
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

  it('CheckBox: button に aria-pressed と disabled が反映される', () => {
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
    expect(button().getAttribute('aria-pressed')).toBe('false')
    expect(button().getAttribute('aria-label')).toBe('agree')

    act(() => button().click())
    expect(onChange).toHaveBeenLastCalledWith(true)

    renderCheckBox(true)
    expect(button().getAttribute('aria-pressed')).toBe('true')

    renderCheckBox(false, true)
    expect(button().disabled).toBe(true)
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

  it('ToggleButton: aria-pressed とアクセシブル名がある', () => {
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
    expect(button().getAttribute('aria-pressed')).toBe('false')
    expect(button().getAttribute('aria-label')).toBe('notification')

    act(() => button().click())
    expect(onChange).toHaveBeenLastCalledWith(true)

    renderToggle(true)
    expect(button().getAttribute('aria-pressed')).toBe('true')
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

  it('年月日欄を正しい値に直すと isAllValid が true に戻る', () => {
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
  // 回帰: isRequired が required 属性を付けるだけで、Vue 版が出す
  // 「必須項目です」の ErrorMessage が無かった
  it('RadioButtons: 必須で未選択なら必須エラーを出す', () => {
    const options = [
      { label: '個人', value: 'personal' },
      { label: '法人', value: 'corporate' },
    ]

    act(() => {
      root.render(<RadioButtons value="" options={options} isRequired />)
    })

    // 初回描画では出さない（Vue 版は watch で判定するため）
    expect(container.textContent).not.toContain('必須項目です')

    const radio = container.querySelectorAll<HTMLInputElement>(
      'input[type="radio"]'
    )[0]
    act(() => radio.click())
    act(() => {
      root.render(<RadioButtons value="" options={options} isRequired />)
    })

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
