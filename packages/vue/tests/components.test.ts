// @geckou/ui-core への移行時に修正したバグのリグレッションテスト
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import BasicButton from '@/components/BasicButton.vue'
import CheckBox from '@/components/CheckBox.vue'
import CheckBoxes from '@/components/CheckBoxes.vue'
import CheckButton from '@/components/CheckButton.vue'
import DatePicker from '@/components/DatePicker.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import DateSelector from '@/components/DateSelector.vue'
import InputBox from '@/components/InputBox.vue'
import LabeledCheckbox from '@/components/LabeledCheckbox.vue'
import ModalBox from '@/components/ModalBox.vue'
import PopupBox from '@/components/PopupBox.vue'
import PostedDate from '@/components/ArticleList/Parts/PostedDate.vue'
import DropdownUi from '@/components/DropdownUi.vue'
import RadioButtons from '@/components/RadioButtons.vue'
import SelectBox from '@/components/SelectBox.vue'
import SlideDownUi from '@/components/SlideDownUi.vue'
import TabUI from '@/components/TabUI.vue'
import TextArea from '@/components/TextArea.vue'
import TextBox from '@/components/TextBox.vue'
import ToggleButton from '@/components/ToggleButton.vue'
import { INPUT_BOX_DEFAULT_STYLES } from '@geckou/ui-core'
import { FormValidationManager } from '@/scripts/form-validation-manager'

describe('DateSelector', () => {
  // 修正前は watchEffect が if (modelValue) のみで else が無く、
  // 親が値を空に戻しても前の選択が残っていた
  it('modelValue が空に戻されたらリセットする', async () => {
    const wrapper = mount(DateSelector, {
      props: { name: 'birthday', modelValue: '1990-05-20' },
    })

    const selected = () =>
      wrapper
        .findAll('select')
        .map((select) => (select.element as HTMLSelectElement).value)

    expect(selected()).toEqual(['1990', '05', '20'])

    await wrapper.setProps({ modelValue: '' })

    expect(selected()).toEqual(['', '', ''])
  })

  it('modelValue の変更に追従する', async () => {
    const wrapper = mount(DateSelector, {
      props: { name: 'birthday', modelValue: '1990-05-20' },
    })

    await wrapper.setProps({ modelValue: '2000-12-31' })

    expect(
      wrapper
        .findAll('select')
        .map((select) => (select.element as HTMLSelectElement).value)
    ).toEqual(['2000', '12', '31'])
  })

  // 回帰: 年の範囲が「今年-100 〜 今年-14」固定で、外れた value を渡すと
  // select が空表示になっていた
  it('minYear / maxYear で年の範囲を変えられる', () => {
    const wrapper = mount(DateSelector, {
      props: {
        name: 'publishedOn',
        modelValue: '2026-05-20',
        minYear: 2020,
        maxYear: 2030,
      },
    })

    const yearSelect = wrapper.find('select').element as HTMLSelectElement

    expect(yearSelect.value).toBe('2026')
    expect(yearSelect.options.length).toBe(12)
  })

  // 回帰: name / required が DOM に出ておらず、ネイティブ送信で値が送られなかった
  it('各 select に name と required が出る', () => {
    const wrapper = mount(DateSelector, {
      props: { name: 'birthday', modelValue: '', isRequired: true },
    })

    const selects = wrapper.findAll('select')

    expect(selects.map((select) => select.attributes('name'))).toEqual([
      'birthday-year',
      'birthday-month',
      'birthday-day',
    ])

    for (const select of selects) {
      expect(select.attributes('required')).toBeDefined()
    }
  })

  it('isRequired が false なら required は出ない', () => {
    const wrapper = mount(DateSelector, {
      props: { name: 'birthday', modelValue: '' },
    })

    for (const select of wrapper.findAll('select')) {
      expect(select.attributes('required')).toBeUndefined()
    }
  })
})

describe('RadioButtons', () => {
  const options = [
    { label: '個人', value: 'personal' },
    { label: '法人', value: 'corporate' },
  ]

  // 修正前は :name="option.value" で選択肢ごとに別の name を振っており、
  // ラジオグループとして機能していなかった（キーボード移動・排他選択）
  it('すべての選択肢が同じ name を共有する', () => {
    const wrapper = mount(RadioButtons, {
      props: { modelValue: '', options },
    })

    const names = wrapper
      .findAll('input[type="radio"]')
      .map((input) => (input.element as HTMLInputElement).name)

    expect(new Set(names).size).toBe(1)
    expect(names[0]).toMatch(/^radio_group_.+$/)
  })

  it('name を渡すとそれを使う', () => {
    const wrapper = mount(RadioButtons, {
      props: { modelValue: '', options, name: 'contractType' },
    })

    const names = wrapper
      .findAll('input[type="radio"]')
      .map((input) => (input.element as HTMLInputElement).name)

    expect(names).toEqual(['contractType', 'contractType'])
  })

  // id は useId() で採番する（SSR と client で一致させるため）。
  // useId はアプリ単位で一意なので、同じアプリに複数置いた場合を検証する
  // （別アプリ同士の衝突は app.config.idPrefix で分ける）
  it('同じアプリに複数設置しても name が衝突しない', () => {
    const wrapper = mount({
      components: { RadioButtons },
      data: () => ({ options }),
      template: `
        <div>
          <RadioButtons :options="options" model-value="" />
          <RadioButtons :options="options" model-value="" />
        </div>
      `,
    })

    const names = wrapper
      .findAll('input[type="radio"]')
      .map((input) => (input.element as HTMLInputElement).name)

    expect(new Set(names).size).toBe(2)
  })

  // 修正前は !selectedValue.value で判定しており、数値の 0 が未選択扱いになって
  // 選択済みでも必須エラーが出ていた（SelectValue は string | number）。
  it('数値の 0 を選んでも必須エラーにしない', async () => {
    const wrapper = mount(RadioButtons, {
      props: {
        modelValue: '',
        options: [
          { label: 'なし', value: 0 },
          { label: 'あり', value: 1 },
        ],
        isRequired: true,
        // selectedValue は emit するだけの computed なので、
        // 親が modelValue を返さないと watch が走らない
        'onUpdate:modelValue': (value: string | number) => {
          void wrapper.setProps({ modelValue: value })
        },
      },
    })

    const radios = wrapper.findAll('input[type="radio"]')

    expect(radios).toHaveLength(2)

    await radios[0].setValue()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('必須項目です')
  })

  // このテストは今回の不具合では落ちない（修正前は immediate が false になり
  // 検証自体が走らなかったため）。0 を初期値に持つ必須項目でエラーを出す方向の
  // 退行を止めるために置いている
  it('modelValue が 0 でも必須エラーを出さない', async () => {
    const wrapper = mount(RadioButtons, {
      props: {
        modelValue: 0,
        options: [
          { label: 'なし', value: 0 },
          { label: 'あり', value: 1 },
        ],
        isRequired: true,
      },
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('必須項目です')
  })

  // 修正前は errorMessages を組み立てるだけで ErrorMessage を描画しておらず、
  // 必須チェックの結果が画面に出ていなかった
  it('選択が空に戻されたら必須エラーを描画する', async () => {
    const wrapper = mount(RadioButtons, {
      props: {
        modelValue: 1,
        options: [
          { label: 'なし', value: 0 },
          { label: 'あり', value: 1 },
        ],
        isRequired: true,
      },
    })

    expect(wrapper.text()).not.toContain('必須項目です')

    await wrapper.setProps({ modelValue: '' })
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('必須項目です')
  })
})

describe('TabUI', () => {
  const tabs = [
    { key: 'tabA', label: 'A' },
    { key: 'tabB', label: 'B' },
  ]

  // DOM id はインスタンスごとの接頭辞付き（`<uid>_tab_<key>`）
  const selectedKey = (wrapper: ReturnType<typeof mount>) =>
    wrapper
      .findAll('[role="tab"]')
      .find((tab) => tab.attributes('aria-selected') === 'true')
      ?.attributes('id')
      ?.replace(/^.*_tab_/, '')

  // 修正前は window 全体に keydown を張っていたため、フォーカス位置と無関係に
  // タブが切り替わり、1 画面に複数設置すると互いに競合した
  it('タブリスト外のキー操作では切り替わらない', async () => {
    const wrapper = mount(TabUI, { props: { tabs }, attachTo: document.body })

    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    )
    await wrapper.vm.$nextTick()

    expect(selectedKey(wrapper)).toBe('tabA')
    wrapper.unmount()
  })

  it('タブリスト上の矢印キーで切り替わる', async () => {
    const wrapper = mount(TabUI, { props: { tabs }, attachTo: document.body })

    await wrapper
      .find('[role="tablist"]')
      .trigger('keydown', { key: 'ArrowRight' })

    expect(selectedKey(wrapper)).toBe('tabB')
    wrapper.unmount()
  })

  it('末尾から先頭へ循環する', async () => {
    const wrapper = mount(TabUI, {
      props: { tabs, initialIndex: 1 },
      attachTo: document.body,
    })

    await wrapper
      .find('[role="tablist"]')
      .trigger('keydown', { key: 'ArrowRight' })

    expect(selectedKey(wrapper)).toBe('tabA')
    wrapper.unmount()
  })

  // 回帰: パネルにフォーカス可能な要素が無いと、キーボードで内容へ到達できない
  // （APG の Tabs パターン）
  it('パネルが tabindex="0" でキーボードの停止点になる', () => {
    const wrapper = mount(TabUI, { props: { tabs } })

    const panels = wrapper.findAll('[role="tabpanel"]')

    expect(panels).toHaveLength(2)
    expect(panels.every((panel) => panel.attributes('tabindex') === '0')).toBe(
      true
    )
  })

  it('Home / End で端のタブへ飛ぶ', async () => {
    const wrapper = mount(TabUI, { props: { tabs }, attachTo: document.body })
    const tablist = wrapper.find('[role="tablist"]')

    await tablist.trigger('keydown', { key: 'End' })
    expect(selectedKey(wrapper)).toBe('tabB')

    await tablist.trigger('keydown', { key: 'Home' })
    expect(selectedKey(wrapper)).toBe('tabA')

    wrapper.unmount()
  })

  // 回帰: emit が無く、親がアクティブタブを知る手段が無かった
  it('タブを選ぶと update:activeKey を emit する', async () => {
    const wrapper = mount(TabUI, { props: { tabs } })

    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')

    expect(wrapper.emitted('update:activeKey')).toEqual([['tabB']])
  })

  it('activeKey を渡せば親が選択状態を決められる（v-model:activeKey）', async () => {
    const wrapper = mount(TabUI, { props: { tabs, activeKey: 'tabB' } })

    expect(selectedKey(wrapper)).toBe('tabB')

    await wrapper.setProps({ activeKey: 'tabA' })
    expect(selectedKey(wrapper)).toBe('tabA')
  })

  // 回帰: initialIndex は初回しか見ないため、tabs が差し替わって現在の key が
  // 消えるとパネルが何も出なくなっていた
  it('tabs が差し替わって選択中の key が消えたら先頭へ寄せ、親へも伝える', async () => {
    const wrapper = mount(TabUI, { props: { tabs, initialIndex: 1 } })

    expect(selectedKey(wrapper)).toBe('tabB')

    await wrapper.setProps({
      tabs: [
        { key: 'tabA', label: 'A' },
        { key: 'tabC', label: 'C' },
      ],
    })

    expect(selectedKey(wrapper)).toBe('tabA')
    expect(wrapper.emitted('update:activeKey')).toEqual([['tabA']])
  })
})

// 回帰: 装飾のアイコンに aria-hidden が無く、スクリーンリーダーが
// 読み上げ対象にしていた（SelectBox / DateSelector の矢印、
// Dropdown / SlideDown のシェブロン、ModalBox の閉じるアイコン）
describe('装飾 SVG の aria-hidden', () => {
  const isDecorative = (svg: {
    attributes: (name: string) => string | undefined
  }) =>
    svg.attributes('aria-hidden') === 'true' &&
    svg.attributes('focusable') === 'false'

  it('SelectBox の矢印は読み上げ対象にならない', () => {
    const wrapper = mount(SelectBox, {
      props: {
        name: 's',
        modelValue: '',
        options: [{ label: 'a', value: 'a' }],
      },
    })

    const svgs = wrapper.findAll('svg')

    expect(svgs.length).toBeGreaterThan(0)
    expect(svgs.every(isDecorative)).toBe(true)
  })

  it('DateSelector の矢印は読み上げ対象にならない', () => {
    const wrapper = mount(DateSelector, {
      props: { name: 'd', modelValue: '' },
    })

    const svgs = wrapper.findAll('svg')

    expect(svgs.length).toBeGreaterThan(0)
    expect(svgs.every(isDecorative)).toBe(true)
  })

  it('SlideDownUi のシェブロンは読み上げ対象にならない', () => {
    const wrapper = mount(SlideDownUi, {
      props: { title: 't' },
      slots: { default: '<p>本文</p>' },
    })

    const svgs = wrapper.findAll('svg')

    expect(svgs.length).toBeGreaterThan(0)
    expect(svgs.every(isDecorative)).toBe(true)
  })

  it('ModalBox の閉じるアイコンは読み上げ対象にならない', () => {
    const wrapper = mount(ModalBox, {
      props: { isShown: true },
      slots: { default: '<p>本文</p>' },
      attachTo: document.body,
    })

    const svgs = wrapper.findAll('svg')

    expect(svgs.length).toBeGreaterThan(0)
    expect(svgs.every(isDecorative)).toBe(true)

    wrapper.unmount()
  })
})

// 回帰: 既定で maxLength が 30 / 100 だったため、指定していない
// 利用側で入力が黙って切られていた
describe('TextBox / TextArea の maxLength', () => {
  it('未指定なら maxlength 属性を付けない', () => {
    const textBox = mount(TextBox, { props: { name: 'text', modelValue: '' } })
    const textArea = mount(TextArea, {
      props: { name: 'area', modelValue: '' },
    })

    expect(textBox.find('input').attributes('maxlength')).toBeUndefined()
    expect(textArea.find('textarea').attributes('maxlength')).toBeUndefined()
  })

  it('指定すれば maxlength 属性を付ける', () => {
    const textBox = mount(TextBox, {
      props: { name: 'text', modelValue: '', maxLength: 10 },
    })
    const textArea = mount(TextArea, {
      props: { name: 'area', modelValue: '', maxLength: 20 },
    })

    expect(textBox.find('input').attributes('maxlength')).toBe('10')
    expect(textArea.find('textarea').attributes('maxlength')).toBe('20')
  })
})

describe('TextBox のバリデーション', () => {
  // v-model 相当。emit を受けて modelValue を戻さないと内部の値が更新されない
  const mountTextBox = (props: { name: string } & Record<string, unknown>) => {
    const wrapper: ReturnType<typeof mount<typeof TextBox>> = mount(TextBox, {
      props: {
        ...props,
        'onUpdate:modelValue': (newValue: string | number): void => {
          void wrapper.setProps({ modelValue: newValue })
        },
      },
    })

    return wrapper
  }

  // 修正前は !value 判定だったため、数値 0 が必須エラーになっていた
  it('数値 0 は必須エラーにならない', async () => {
    const wrapper = mountTextBox({
      name: 'amount',
      modelValue: 0,
      isRequired: true,
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).not.toContain('必須項目です')
  })

  it('空文字は必須エラーになる', async () => {
    const wrapper = mountTextBox({
      name: 'amount',
      modelValue: 'a',
      isRequired: true,
    })

    await wrapper.find('input').setValue('')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('必須項目です')
  })

  // 修正前は RegExp を直接 .test() しており、g / y フラグで lastIndex が変異していた
  it('g フラグ付き RegExp でも判定が安定する', async () => {
    const regex = /\d+/g
    const wrapper = mountTextBox({
      name: 'code',
      modelValue: '',
      validates: [{ regex, message: '数字を含めてください' }],
    })

    const input = wrapper.find('input')

    for (let i = 0; i < 3; i++) {
      await input.setValue('abc123')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).not.toContain('数字を含めてください')

      await input.setValue('abc')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('数字を含めてください')
    }

    // 呼び出し側の RegExp を変異させない
    expect(regex.lastIndex).toBe(0)
  })
})

describe('SelectBox', () => {
  // RadioButtons と同じ不具合。0 は正当な選択値なので未選択扱いにしない
  // 回帰: :name が無く、必須 prop の name が DOM に出ていなかった
  it('select に name が出る', () => {
    const wrapper = mount(SelectBox, {
      props: {
        name: 'count',
        modelValue: '',
        options: [{ label: '1 個', value: 1 }],
      },
    })

    expect(wrapper.find('select').attributes('name')).toBe('count')
  })

  it('数値の 0 を選んでも必須エラーにしない', async () => {
    const wrapper = mount(SelectBox, {
      props: {
        name: 'count',
        modelValue: '',
        options: [
          { label: '0 個', value: 0 },
          { label: '1 個', value: 1 },
        ],
        isRequired: true,
        // selectedValue は emit するだけの computed なので、
        // 親が modelValue を返さないと watch が走らない
        'onUpdate:modelValue': (value: string | number) => {
          void wrapper.setProps({ modelValue: value })
        },
      },
    })

    const select = wrapper.find('select')

    expect(select.exists()).toBe(true)

    await select.setValue('0')
    await wrapper.vm.$nextTick()

    expect(wrapper.props('modelValue')).toBe(0)
    expect(wrapper.text()).not.toContain('必須項目です')
  })

  it('未選択のまま操作したら必須エラーを出す', async () => {
    const wrapper = mount(SelectBox, {
      props: {
        name: 'count',
        modelValue: '',
        options: [
          { label: '0 個', value: 0 },
          { label: '1 個', value: 1 },
        ],
        isRequired: true,
      },
    })

    await wrapper.find('select').trigger('blur')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('必須項目です')
  })
})

describe('DropdownUi / SlideDownUi の a11y', () => {
  // 回帰: 閉じる手段が外側クリックか内容クリックだけで、Escape が効かず
  // トリガーへフォーカスも戻らなかった
  it('DropdownUi: Escape で閉じ、トリガーへフォーカスが戻る', async () => {
    const wrapper = mount(DropdownUi, {
      slots: { trigger: 'trigger', contents: '<button>項目</button>' },
      attachTo: document.body,
    })

    try {
      const trigger = wrapper.find('button')
      await trigger.trigger('click')
      expect(wrapper.vm.isContentsOpened).toBe(true)

      // ModalBox の中でダイアログまで閉じないよう preventDefault する。
      // trigger() の合成イベントでは defaultPrevented を見られないので自前で投げる
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })
      wrapper.findAll('button')[1]!.element.dispatchEvent(event)
      await nextTick()

      expect(wrapper.vm.isContentsOpened).toBe(false)
      expect(document.activeElement).toBe(trigger.element)
      expect(event.defaultPrevented).toBe(true)
    } finally {
      wrapper.unmount()
    }
  })

  it('DropdownUi: 閉じているときの Escape は握らない', async () => {
    const wrapper = mount(DropdownUi, {
      slots: { trigger: 'trigger', contents: 'contents' },
      attachTo: document.body,
    })

    try {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      })
      wrapper.find('button').element.dispatchEvent(event)
      await nextTick()

      expect(event.defaultPrevented).toBe(false)
    } finally {
      wrapper.unmount()
    }
  })

  it('DropdownUi / SlideDownUi: トリガーが aria-controls でパネルを指す', () => {
    const dropdown = mount(DropdownUi, {
      slots: { trigger: 'trigger', contents: 'contents' },
      attachTo: document.body,
    })
    const slideDown = mount(SlideDownUi, {
      slots: { trigger: 'trigger', default: '本文' },
      attachTo: document.body,
    })

    for (const wrapper of [dropdown, slideDown]) {
      const controls = wrapper.find('button').attributes('aria-controls')

      expect(controls).toBeDefined()
      expect(wrapper.element.querySelector(`[id="${controls}"]`)).not.toBeNull()
    }

    // ポップアップを開くトリガーであることを伝える（SlideDownUi は
    // ディスクロージャなので付けない）
    expect(dropdown.find('button').attributes('aria-haspopup')).toBe('true')
    expect(slideDown.find('button').attributes('aria-haspopup')).toBeUndefined()

    dropdown.unmount()
    slideDown.unmount()
  })

  it('DropdownUi: contents が無ければ aria-haspopup も付けない', () => {
    const wrapper = mount(DropdownUi, { slots: { trigger: 'trigger' } })
    const trigger = wrapper.find('button')

    expect(trigger.attributes('aria-controls')).toBeUndefined()
    expect(trigger.attributes('aria-haspopup')).toBeUndefined()
  })

  // 回帰: 高さを onUpdated でしか測っていなかったため、スロットの中の
  // 子コンポーネントが自前の状態で伸縮すると高さがずれていた
  it('DropdownUi: 中身の伸縮を ResizeObserver で拾う', async () => {
    const callbacks: Array<() => void> = []
    const original = globalThis.ResizeObserver

    globalThis.ResizeObserver = class {
      constructor(callback: () => void) {
        callbacks.push(callback)
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver

    const wrapper = mount(DropdownUi, {
      slots: { trigger: 'trigger', contents: 'contents' },
      attachTo: document.body,
    })

    // 途中で expect が落ちてもグローバルを戻す（後続テストへ影響させない）
    try {
      expect(callbacks).toHaveLength(1)

      await wrapper.find('button').trigger('click')

      const panel = wrapper.find('[id$="_panel"]')
      const inner = panel.element.firstElementChild as HTMLElement

      Object.defineProperty(inner, 'clientHeight', {
        configurable: true,
        value: 120,
      })
      callbacks[0]!()
      await nextTick()

      expect(panel.attributes('style')).toContain('120px')
    } finally {
      wrapper.unmount()
      globalThis.ResizeObserver = original
    }
  })
})

describe('DropdownUi / SlideDownUi の外側クリック', () => {
  // 修正前は v-click-outside ディレクティブに頼っていたが app.directive() の登録が
  // どこにも無く、「Failed to resolve directive: click-outside」で無効化されていた
  const pointerDownOutside = async () => {
    document.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true }) as unknown as Event
    )
    await nextTick()
  }

  it('DropdownUi: 外側の pointerdown で閉じる', async () => {
    const wrapper = mount(DropdownUi, {
      slots: { trigger: 'trigger', contents: 'contents' },
      attachTo: document.body,
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.vm.isContentsOpened).toBe(true)

    await pointerDownOutside()
    expect(wrapper.vm.isContentsOpened).toBe(false)

    wrapper.unmount()
  })

  it('DropdownUi: 内側の pointerdown では閉じない', async () => {
    const wrapper = mount(DropdownUi, {
      slots: { trigger: 'trigger', contents: 'contents' },
      attachTo: document.body,
    })

    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('pointerdown')
    await nextTick()

    expect(wrapper.vm.isContentsOpened).toBe(true)

    wrapper.unmount()
  })

  it('SlideDownUi: isDisableClickOutside なら外側クリックでも閉じない', async () => {
    const wrapper = mount(SlideDownUi, {
      props: { isDisableClickOutside: true },
      attachTo: document.body,
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.vm.isOpenedContents).toBe(true)

    await pointerDownOutside()
    expect(wrapper.vm.isOpenedContents).toBe(true)

    wrapper.unmount()
  })

  it('SlideDownUi: 既定では外側クリックで閉じる', async () => {
    const wrapper = mount(SlideDownUi, { attachTo: document.body })

    await wrapper.find('button').trigger('click')
    expect(wrapper.vm.isOpenedContents).toBe(true)

    await pointerDownOutside()
    expect(wrapper.vm.isOpenedContents).toBe(false)

    wrapper.unmount()
  })

  // 回帰(#70): React 版（SlideDownUiHandle）は isOpenedContents / close を
  // 公開しているのに、Vue 版は isOpenedContents しか出していなかった
  it('SlideDownUi: close を公開している（isDisableClickOutside でも閉じる）', async () => {
    const wrapper = mount(SlideDownUi, {
      props: { isDisableClickOutside: true },
      attachTo: document.body,
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.vm.isOpenedContents).toBe(true)

    wrapper.vm.close()
    await nextTick()
    expect(wrapper.vm.isOpenedContents).toBe(false)

    wrapper.unmount()
  })
})

describe('DateSelector と FormValidationManager', () => {
  // 修正前は setValid(!isRequired) で登録し、初期値からの判定は watch にあったため
  // 初回は発火せず、初期値ありの必須項目が「無効」のまま残っていた
  it('初期値ありの必須項目を有効として登録する', () => {
    const manager = new FormValidationManager()
    const wrapper = mount(DateSelector, {
      props: {
        name: 'birthday',
        modelValue: '1990-05-20',
        isRequired: true,
        formValidationManager: manager,
      },
    })

    expect(manager.isValid('birthday')).toBe(true)
    expect(manager.isAllValid.value).toBe(true)

    wrapper.unmount()
  })

  it('初期値なしの必須項目は無効として登録する', () => {
    const manager = new FormValidationManager()
    const wrapper = mount(DateSelector, {
      props: {
        name: 'birthday',
        modelValue: '',
        isRequired: true,
        formValidationManager: manager,
      },
    })

    expect(manager.isValid('birthday')).toBe(false)
    expect(manager.isAllValid.value).toBe(false)

    wrapper.unmount()
  })
})

describe('CheckButton', () => {
  // 修正前は <span> + @click の手動トグルで、input は display: none。
  // label 包装にしたことで、クリックは 1 回だけ切り替わる（二重トグルしない）
  it('label で包み、クリックで 1 回だけ切り替わる', async () => {
    const wrapper = mount(CheckButton, {
      props: { name: 'agreed', modelValue: false },
      attachTo: document.body,
    })

    expect(wrapper.element.tagName).toBe('LABEL')

    const input = wrapper.find('input')
    await input.setValue(true)

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])

    wrapper.unmount()
  })
})

describe('CheckBoxes', () => {
  const options = [
    { label: '個人', value: 'personal' },
    { label: '法人', value: 'corporate' },
  ]

  // 回帰: options を初期化時に一度しか読んでおらず、API から取ってから渡す形で
  // 何も描画されなかった
  it('options が後から渡されても描画に追従する', async () => {
    const wrapper = mount(CheckBoxes, {
      props: { name: 'kind', options: [] },
    })

    // #53 で <button> の中の <input> をやめたので、チェックボックスの実体は
    // role="checkbox" の <button>（送信用の hidden はチェック時だけ描かれる）
    expect(wrapper.findAll('button[role="checkbox"]')).toHaveLength(0)

    await wrapper.setProps({ options })

    expect(wrapper.findAll('button[role="checkbox"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('法人')
  })

  it('options が差し替わっても選択状態は modelValue から引き直す', async () => {
    const wrapper = mount(CheckBoxes, {
      props: { name: 'kind', options, modelValue: ['corporate'] },
    })

    await wrapper.setProps({
      options: [...options, { label: '団体', value: 'group' }],
    })

    const checked = wrapper
      .findAll('button[role="checkbox"]')
      .map((button) => button.attributes('aria-checked') === 'true')

    expect(checked).toEqual([false, true, false])
  })
})

describe('PostedDate', () => {
  // 回帰: 無効な date を format に渡すと date-fns が RangeError を投げ、
  // 一覧全体が描画されなくなっていた
  it('無効な date でも throw せず空になる', () => {
    const wrapper = mount(PostedDate, { props: { date: '' } })

    expect(wrapper.text()).toBe('')
    // datetime="" は無効な HTML なので属性ごと出さない
    expect(wrapper.attributes('datetime')).toBeUndefined()
  })

  it('有効な date は書式どおりに描画する', () => {
    const wrapper = mount(PostedDate, { props: { date: '2026-08-17' } })

    expect(wrapper.text()).toBe('2026/08/17')
  })

  // 回帰(#70): <time> に datetime が無く、表示文字列しか機械可読な情報が
  // 無かった（formatString を変えると解釈できなくなる）
  it('<time> に機械可読な datetime を出す', () => {
    const wrapper = mount(PostedDate, {
      props: { date: '2026-08-17', formatString: 'M月d日' },
    })

    expect(wrapper.text()).toBe('8月17日')
    expect(wrapper.attributes('datetime')).toBe('2026-08-17')
  })
})

describe('InputBox の状態判定', () => {
  // 回帰: 最初の 1 要素だけを見ていたため、DatePicker のように
  // 「隠しの date input + 年月日欄」を持つ入力で配色が誤っていた
  const twoControls = {
    slots: {
      default: '<input type="date" /><input type="text" placeholder="年" />',
    },
    attachTo: document.body,
  }

  // style 文字列の「変わった / 変わらない」だけだと、valid を期待している箇所が
  // error になっても通ってしまう。トークンの実値で状態を特定する
  const STATES = ['default', 'focus', 'valid', 'error', 'disabled'] as const

  const shadowOf = (state: (typeof STATES)[number]) => {
    const css = INPUT_BOX_DEFAULT_STYLES[state]

    return `0 0 0 ${css?.border?.size} ${css?.border?.color} inset`
  }

  const stateOf = (wrapper: ReturnType<typeof mount>) => {
    const style = wrapper.attributes('style') ?? ''

    return STATES.find((state) => style.includes(shadowOf(state))) ?? style
  }

  it('2 つ目のコントロールにフォーカスしても focus 配色になる', async () => {
    const wrapper = mount(InputBox, twoControls)

    expect(stateOf(wrapper)).toBe('default')

    const text = wrapper.findAll('input')[1].element as HTMLInputElement
    text.focus()
    await wrapper.trigger('focusin')
    await nextTick()

    expect(stateOf(wrapper)).toBe('focus')

    wrapper.unmount()
  })

  it('空のまま blur しても valid 配色にしない', async () => {
    const wrapper = mount(InputBox, twoControls)

    const text = wrapper.findAll('input')[1].element as HTMLInputElement
    text.focus()
    await wrapper.trigger('focusin')
    text.blur()
    await wrapper.trigger('blur')
    await nextTick()

    expect(stateOf(wrapper)).toBe('default')

    wrapper.unmount()
  })

  // 回帰: onUnmounted の時点で ref は null なので解除が走らず、observer も
  // disconnect していなかった
  it('アンマウントで MutationObserver を解除する', () => {
    const disconnect = vi.fn()
    const original = globalThis.MutationObserver

    globalThis.MutationObserver = class {
      observe() {}
      disconnect() {
        disconnect()
      }
      takeRecords() {
        return []
      }
    } as unknown as typeof MutationObserver

    const wrapper = mount(InputBox, twoControls)
    wrapper.unmount()

    expect(disconnect).toHaveBeenCalled()

    globalThis.MutationObserver = original
  })

  it('全て埋まったら valid 配色になる', async () => {
    const wrapper = mount(InputBox, twoControls)

    const [date, text] = wrapper
      .findAll('input')
      .map((input) => input.element as HTMLInputElement)
    date.value = '2026-08-17'
    text.value = '2026'

    await wrapper.trigger('blur')
    await nextTick()

    expect(stateOf(wrapper)).toBe('valid')

    wrapper.unmount()
  })
})

describe('ModalBox', () => {
  // 回帰: 親が isShown=false にしたときと unmount 時にも emit しており、
  // 親のハンドラが再入していた
  it('自発的に閉じたときだけ close を emit する', async () => {
    const wrapper = mount(ModalBox, {
      props: { isShown: true },
      attachTo: document.body,
    })

    await wrapper.setProps({ isShown: false })
    expect(wrapper.emitted('close')).toBeUndefined()

    await wrapper.setProps({ isShown: true })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)

    // unmount 後は emitted() を取れないので、件数は解除前に控えておく
    const emittedBeforeUnmount = wrapper.emitted('close')!.length
    wrapper.unmount()
    expect(emittedBeforeUnmount).toBe(1)
  })

  // 回帰: Vue は :inert="false" を inert="false" として出す。inert は boolean 属性で
  // 値に関係なく効くため、表示中もモーダルの中身を操作できなくなっていた
  it('表示中は inert が付かない', async () => {
    const wrapper = mount(ModalBox, {
      props: { isShown: false },
      attachTo: document.body,
    })

    expect(wrapper.element.hasAttribute('inert')).toBe(true)

    await wrapper.setProps({ isShown: true })

    expect(wrapper.element.hasAttribute('inert')).toBe(false)

    wrapper.unmount()
  })

  it('Escape で close を emit する', async () => {
    const wrapper = mount(ModalBox, {
      props: { isShown: true },
      attachTo: document.body,
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.emitted('close')).toHaveLength(1)

    wrapper.unmount()
  })

  // 回帰: 子（SearchableSelectBox の候補リスト等）が Escape を処理しても
  // ダイアログまで閉じ、入力途中のフォームが消えていた
  it('子が preventDefault した Escape では close を emit しない', async () => {
    const wrapper = mount(ModalBox, {
      props: { isShown: true },
      attachTo: document.body,
    })

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true,
    })
    event.preventDefault()
    document.dispatchEvent(event)
    await nextTick()

    expect(wrapper.emitted('close')).toBeUndefined()

    wrapper.unmount()
  })

  // 回帰: モーダルを重ねると両方のハンドラが同じ Escape を受け取り、
  // 内側を閉じるつもりが外側まで閉じていた。ハンドラは両方 document に
  // 付いていて実行順は登録順で決まるため、外側が先に開く実際の使い方で試す
  it('入れ子のとき Escape で閉じるのは内側だけ', async () => {
    const onCloseOuter = vi.fn()
    const onCloseInner = vi.fn()

    const NestedModals = defineComponent({
      props: { isInnerShown: { type: Boolean, default: false } },
      setup(props) {
        return () =>
          h(
            ModalBox,
            { isShown: true, onClose: onCloseOuter },
            {
              // 内側は後から差し込む。Vue はハンドラを onMounted で登録するので、
              // 最初から居ると子（内側）が先に登録されてしまい順序の問題が出ない
              default: () =>
                props.isInnerShown
                  ? h(
                      ModalBox,
                      { isShown: true, onClose: onCloseInner },
                      { default: () => h('p', '内側') }
                    )
                  : null,
            }
          )
      },
    })

    // 先に外側だけを開く（= 外側のハンドラが先に document へ登録される）
    const wrapper = mount(NestedModals, {
      props: { isInnerShown: false },
      attachTo: document.body,
    })

    await wrapper.setProps({ isInnerShown: true })

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    )
    await nextTick()

    expect(onCloseInner).toHaveBeenCalledTimes(1)
    expect(onCloseOuter).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  // 自分が Escape を処理したら印を残す（外側で Escape を見ているアプリ側の
  // ハンドラまで一緒に反応しないように）
  it('Escape を処理したら preventDefault する', async () => {
    const wrapper = mount(ModalBox, {
      props: { isShown: true },
      attachTo: document.body,
    })

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true,
    })
    document.dispatchEvent(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(true)

    wrapper.unmount()
  })

  it('閉じるボタンにアクセシブル名がある', () => {
    const wrapper = mount(ModalBox, {
      props: { isShown: true },
      attachTo: document.body,
    })

    expect(
      wrapper.find('[role="dialog"] > button').attributes('aria-label')
    ).toBe('閉じる')

    wrapper.unmount()
  })

  it('閉じたら開く前の要素へフォーカスを戻す', async () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    const wrapper = mount(ModalBox, {
      props: { isShown: false },
      attachTo: document.body,
    })

    await wrapper.setProps({ isShown: true })
    await nextTick()
    expect(document.activeElement).not.toBe(trigger)

    await wrapper.setProps({ isShown: false })
    expect(document.activeElement).toBe(trigger)

    wrapper.unmount()
    trigger.remove()
  })
})

describe('閉じた開閉コンテンツはキーボードで触れない', () => {
  // 「中身のリンクへキーボードで到達できるか」をそのまま見る。
  // html() に 'inert' が含まれるかだけでは、開いたときに外れたことを検証できない
  const linkIsInert = (wrapper: ReturnType<typeof mount>) =>
    wrapper.find('a').element.closest('[inert]') !== null

  it('DropdownUi は閉状態だけ inert を付ける', async () => {
    const wrapper = mount(DropdownUi, {
      slots: { trigger: 'メニュー', contents: '<a href="#x">リンク</a>' },
    })
    const button = () => wrapper.find('button')

    expect(button().attributes('aria-expanded')).toBe('false')
    expect(linkIsInert(wrapper)).toBe(true)

    await button().trigger('click')

    expect(button().attributes('aria-expanded')).toBe('true')
    expect(linkIsInert(wrapper)).toBe(false)
  })

  it('SlideDownUi は閉状態だけ inert を付ける', async () => {
    const wrapper = mount(SlideDownUi, {
      slots: { trigger: '開く', default: '<a href="#x">リンク</a>' },
    })
    const button = () => wrapper.find('button')

    expect(button().attributes('aria-expanded')).toBe('false')
    expect(linkIsInert(wrapper)).toBe(true)

    await button().trigger('click')

    expect(button().attributes('aria-expanded')).toBe('true')
    expect(linkIsInert(wrapper)).toBe(false)
  })
})

describe('DatePicker', () => {
  const byLabel = (wrapper: ReturnType<typeof mount>, label: string) =>
    wrapper.find(`input[aria-label="${label}"]`)

  it('年月日欄の不正な値をエラーとして出し、manager にも無効を伝える', async () => {
    const manager = new FormValidationManager()
    const wrapper = mount(DatePicker, {
      props: {
        name: 'startedOn',
        modelValue: '',
        formValidationManager: manager,
      },
    })

    await byLabel(wrapper, 'startedOnの年').setValue('2024')
    await byLabel(wrapper, 'startedOnの月').setValue('13')
    await byLabel(wrapper, 'startedOnの日').setValue('01')
    await byLabel(wrapper, 'startedOnの日').trigger('blur')

    expect(wrapper.text()).toContain('月は01から12の間で入力してください')
    expect(manager.isAllValid.value).toBe(false)
  })

  // 回帰: 入力のたびに検証していたため、年に「2」と打った瞬間に
  // 「年は4桁の数字で入力してください」が role="alert" で読み上げられていた
  it('入力途中ではエラー文言を出さない（判定だけ更新する）', async () => {
    const manager = new FormValidationManager()
    const wrapper = mount(DatePicker, {
      props: {
        name: 'startedOn',
        modelValue: '',
        formValidationManager: manager,
      },
    })

    await byLabel(wrapper, 'startedOnの年').setValue('2')

    expect(wrapper.text()).not.toContain('年は4桁の数字で入力してください')
    expect(manager.isAllValid.value).toBe(false)

    await byLabel(wrapper, 'startedOnの年').trigger('blur')

    expect(wrapper.text()).toContain('年は4桁の数字で入力してください')
  })

  it('1 桁の月・日は欄を離れた時点で 2 桁へ正規化する', async () => {
    const wrapper = mount(DatePicker, {
      props: { name: 'startedOn', modelValue: '' },
    })

    await byLabel(wrapper, 'startedOnの年').setValue('2024')
    await byLabel(wrapper, 'startedOnの月').setValue('1')
    await byLabel(wrapper, 'startedOnの日').setValue('5')
    await byLabel(wrapper, 'startedOnの日').trigger('blur')

    expect(wrapper.text()).not.toContain('月は2桁の数字で入力してください')
    expect(
      (byLabel(wrapper, 'startedOnの月').element as HTMLInputElement).value
    ).toBe('01')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['2024-01-05'])
  })

  // 回帰: 不正な値のときに送信値を更新していなかったため、
  // 画面に「13 月」を表示したまま前の日付が親へ残っていた
  it('年月日欄が不正になったら送信値を空にする', async () => {
    const wrapper = mount(DatePicker, {
      props: { name: 'startedOn', modelValue: '2024-05-10' },
    })

    await byLabel(wrapper, 'startedOnの月').setValue('13')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
    expect(
      (
        wrapper.find('input[aria-label="startedOnのカレンダー"]')
          .element as HTMLInputElement
      ).value
    ).toBe('')
  })

  it('正しい値に直すと有効に戻る', async () => {
    const manager = new FormValidationManager()
    const wrapper = mount(DatePicker, {
      props: {
        name: 'startedOn',
        modelValue: '',
        formValidationManager: manager,
      },
    })

    await byLabel(wrapper, 'startedOnの年').setValue('2024')
    await byLabel(wrapper, 'startedOnの月').setValue('13')
    await byLabel(wrapper, 'startedOnの日').setValue('01')
    await byLabel(wrapper, 'startedOnの日').trigger('blur')
    expect(manager.isAllValid.value).toBe(false)

    await byLabel(wrapper, 'startedOnの月').setValue('12')

    expect(manager.isAllValid.value).toBe(true)
  })

  it('必須で空なら無効', async () => {
    const manager = new FormValidationManager()
    mount(DatePicker, {
      props: {
        name: 'startedOn',
        modelValue: '',
        isRequired: true,
        formValidationManager: manager,
      },
    })

    await nextTick()

    expect(manager.isAllValid.value).toBe(false)
  })

  it('min / max をネイティブ入力へ渡す', () => {
    const wrapper = mount(DatePicker, {
      props: {
        name: 'startedOn',
        modelValue: '',
        minDate: '2024-01-01',
        maxDate: '2024-12-31',
      },
    })

    const native = wrapper.find('input[type="date"]')

    expect(native.attributes('min')).toBe('2024-01-01')
    expect(native.attributes('max')).toBe('2024-12-31')
  })

  // 回帰: 年月日は type="text" なので、inputmode が無いとモバイルで
  // 数字キーボードが出ない
  it('年月日の入力欄に inputmode="numeric" が付く', () => {
    const wrapper = mount(DatePicker, {
      props: { name: 'startedOn', modelValue: '2024-01-01' },
    })

    const units = wrapper.findAll('input[type="text"]')

    expect(units).toHaveLength(3)
    expect(
      units.every((input) => input.attributes('inputmode') === 'numeric')
    ).toBe(true)
  })

  it('type="month" では年月の 2 つに inputmode="numeric" が付く', () => {
    const wrapper = mount(DatePicker, {
      props: { name: 'startedOn', modelValue: '2024-01', type: 'month' },
    })

    const units = wrapper.findAll('input[type="text"]')

    expect(units).toHaveLength(2)
    expect(
      units.every((input) => input.attributes('inputmode') === 'numeric')
    ).toBe(true)
  })
})

describe('DateRangePicker', () => {
  // 回帰: min / max はネイティブ入力にしか効かず、年月日欄から
  // 開始 > 終了 を入力しても検証されなかった
  it('開始 > 終了ならエラーを出し、manager にも無効を伝える', async () => {
    const manager = new FormValidationManager()
    const wrapper = mount(DateRangePicker, {
      props: {
        name: 'period',
        modelValue: { start: '2024-05-01', end: '2024-04-01' },
        formValidationManager: manager,
      },
    })

    await nextTick()

    expect(wrapper.text()).toContain('終了日より後の日付は選べません')
    expect(manager.isAllValid.value).toBe(false)
  })

  it('開始 <= 終了なら有効', async () => {
    const manager = new FormValidationManager()
    const wrapper = mount(DateRangePicker, {
      props: {
        name: 'period',
        modelValue: { start: '2024-04-01', end: '2024-05-01' },
        formValidationManager: manager,
      },
    })

    await nextTick()

    expect(wrapper.text()).not.toContain('終了日より後の日付は選べません')
    expect(manager.isAllValid.value).toBe(true)
  })

  it('片方だけならエラーにしない', async () => {
    const manager = new FormValidationManager()
    const wrapper = mount(DateRangePicker, {
      props: {
        name: 'period',
        modelValue: { start: '2024-05-01', end: '' },
        formValidationManager: manager,
      },
    })

    await nextTick()

    expect(wrapper.text()).not.toContain('終了日より後の日付は選べません')
  })
})

describe('LabeledCheckbox', () => {
  // 回帰: <label> は <button> をラベル付けしないので、可視ラベルがあっても
  // アクセシブル名が name（機械名）になり、画面の文言と読み上げが食い違っていた
  it('可視ラベルをアクセシブル名にする', () => {
    const wrapper = mount(LabeledCheckbox, {
      props: { name: 'agreement', label: '利用規約に同意する' },
      attachTo: document.body,
    })

    const button = wrapper.find('button')
    const labelledBy = button.attributes('aria-labelledby')

    expect(labelledBy).toBeTruthy()
    expect(button.attributes('aria-label')).toBeUndefined()
    expect(wrapper.find(`#${labelledBy}`).text()).toBe('利用規約に同意する')
    expect(button.attributes('role')).toBe('checkbox')
    expect(button.attributes('aria-checked')).toBe('false')

    wrapper.unmount()
  })
})

describe('CheckBox', () => {
  // 回帰(#58): isDisabled でも <button> に disabled が出ず、Tab で止まり
  // 支援技術には有効なチェックボックスとして読まれていた
  it('isDisabled のとき button に disabled が出る', () => {
    const wrapper = mount(CheckBox, {
      props: { name: 'agree', isDisabled: true },
    })

    const button = wrapper.find('button')

    expect(button.attributes('disabled')).toBeDefined()
    expect((button.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('有効なときは disabled が出ない', () => {
    const wrapper = mount(CheckBox, { props: { name: 'agree' } })

    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  // 回帰(#53): <button> の content model は interactive content を許さないので
  // 中に <input> を置けない。状態は data-checked で表し、送信用は hidden を外に出す
  it('button の中に input を置かない', () => {
    const wrapper = mount(CheckBox, {
      props: { name: 'agree', modelValue: true },
    })

    expect(wrapper.find('button input').exists()).toBe(false)
  })

  it('チェック時だけ送信用の hidden を button の外に描く', async () => {
    const wrapper = mount(CheckBox, {
      props: { name: 'agree', value: 'yes', modelValue: false },
    })

    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false)

    await wrapper.setProps({ modelValue: true })

    const hidden = wrapper.find('input[type="hidden"]')

    expect(hidden.exists()).toBe(true)
    expect(hidden.attributes('name')).toBe('agree')
    expect(hidden.attributes('value')).toBe('yes')
    // button の外（兄弟）に出ていること
    expect(hidden.element.closest('button')).toBeNull()
  })

  it('value が無いときはネイティブと同じ on を送る', () => {
    const wrapper = mount(CheckBox, {
      props: { name: 'agree', modelValue: true },
    })

    expect(wrapper.find('input[type="hidden"]').attributes('value')).toBe('on')
  })

  it('チェック状態を data-checked で表す', async () => {
    const wrapper = mount(CheckBox, {
      props: { name: 'agree', modelValue: false },
    })

    expect(wrapper.find('button').attributes('data-checked')).toBe('false')

    await wrapper.setProps({ modelValue: true })

    expect(wrapper.find('button').attributes('data-checked')).toBe('true')
  })

  it('複数ルートでも渡された属性は button へ付く', () => {
    const wrapper = mount(CheckBox, {
      props: { name: 'agree', modelValue: true },
      attrs: { 'data-testid': 'check' },
    })

    expect(wrapper.find('button').attributes('data-testid')).toBe('check')
  })
})

describe('ToggleButton', () => {
  // 回帰(#53): CheckBox と同じく button の中の input をやめた
  it('button の中に input を置かず、ON のときだけ hidden を外に描く', async () => {
    const wrapper = mount(ToggleButton, {
      props: { name: 'notification', modelValue: false },
    })

    expect(wrapper.find('button input').exists()).toBe(false)
    expect(wrapper.find('input[type="hidden"]').exists()).toBe(false)

    await wrapper.setProps({ modelValue: true })

    const hidden = wrapper.find('input[type="hidden"]')

    expect(hidden.exists()).toBe(true)
    expect(hidden.attributes('name')).toBe('notification')
    expect(hidden.element.closest('button')).toBeNull()
    expect(wrapper.find('button').attributes('data-checked')).toBe('true')
  })
})

describe('PopupBox', () => {
  // 回帰(#68): 3 秒で消える通知なのにライブリージョンでなく、
  // 支援技術には何も伝わっていなかった
  // 回帰(#81): 器だけをライブリージョンにして中身を常時描いていたため、
  // opacity の切り替えでは通知されず、非表示中も文言が読めていた
  it('表示するまで中身を持たず、表示で内容が入る', async () => {
    const wrapper = mount(PopupBox, {
      slots: { default: '保存しました' },
      attachTo: document.body,
    })

    const popup = () =>
      [...document.querySelectorAll('[role="status"]')].at(-1) as HTMLElement

    expect(popup()).not.toBeNull()
    expect(popup().textContent?.trim()).toBe('')
    ;(wrapper.vm as unknown as { showPopup: () => void }).showPopup()
    await nextTick()

    expect(popup().textContent).toContain('保存しました')

    wrapper.unmount()
  })
})

describe('DatePicker / DateSelector のアクセシブル名', () => {
  // 回帰(#59): name（フォームのフィールド名）から読み上げ名を作っていたため、
  // name="startedOn" だと「startedOnの年」と読まれていた
  it('DatePicker: ariaLabel を年月日のラベルに使う', () => {
    const wrapper = mount(DatePicker, {
      props: { name: 'startedOn', modelValue: '', ariaLabel: '開始日' },
    })

    const labels = wrapper
      .findAll('input[type="text"]')
      .map((input) => input.attributes('aria-label'))

    expect(labels).toEqual(['開始日の年', '開始日の月', '開始日の日'])
  })

  it('DatePicker: ariaLabel が無ければ name にフォールバックする', () => {
    const wrapper = mount(DatePicker, {
      props: { name: 'startedOn', modelValue: '' },
    })

    expect(wrapper.find('input[type="text"]').attributes('aria-label')).toBe(
      'startedOnの年'
    )
  })

  it('DatePicker: ariaLabelledBy があれば可視ラベルと単位を並べて指す', () => {
    const wrapper = mount(DatePicker, {
      props: { name: 'startedOn', modelValue: '', ariaLabelledBy: 'label_id' },
    })

    const year = wrapper.find('input[type="text"]')
    const labelledBy = year.attributes('aria-labelledby')

    expect(year.attributes('aria-label')).toBeUndefined()
    expect(labelledBy?.startsWith('label_id ')).toBe(true)

    const unitId = labelledBy!.split(' ')[1]

    expect(wrapper.find(`#${unitId}`).text()).toBe('の年')
  })

  // 回帰(#68): カレンダー起動用の date 入力は opacity: 0 で重ねているだけで
  // aria-label が無く、キーボード操作で「見えない・名前の無い」タブ停止点だった
  it('DatePicker: カレンダー起動用の入力にもアクセシブル名がある', () => {
    const wrapper = mount(DatePicker, {
      props: { name: 'startedOn', modelValue: '', ariaLabel: '開始日' },
    })

    expect(wrapper.find('input[type="date"]').attributes('aria-label')).toBe(
      '開始日のカレンダー'
    )
  })

  it('DatePicker: カレンダー起動用の入力も ariaLabelledBy に追従する', () => {
    const wrapper = mount(DatePicker, {
      props: { name: 'startedOn', modelValue: '', ariaLabelledBy: 'label_id' },
    })

    const calendar = wrapper.find('input[type="date"]')
    const labelledBy = calendar.attributes('aria-labelledby')

    expect(calendar.attributes('aria-label')).toBeUndefined()
    expect(labelledBy?.startsWith('label_id ')).toBe(true)

    const unitId = labelledBy!.split(' ')[1]

    expect(wrapper.find(`#${unitId}`).text()).toBe('のカレンダー')
  })

  it('DateSelector: ariaLabel を年月日のラベルに使う', () => {
    const wrapper = mount(DateSelector, {
      props: { name: 'birthday', modelValue: '', ariaLabel: '生年月日' },
    })

    const labels = wrapper
      .findAll('select')
      .map((select) => select.attributes('aria-label'))

    expect(labels).toEqual(['生年月日の年', '生年月日の月', '生年月日の日'])
  })

  it('DateSelector: ariaLabel が無ければ name にフォールバックする', () => {
    const wrapper = mount(DateSelector, {
      props: { name: 'birthday', modelValue: '' },
    })

    expect(wrapper.find('select').attributes('aria-label')).toBe('birthdayの年')
  })

  it('DateSelector: ariaLabelledBy があれば可視ラベルと単位を並べて指す', () => {
    const wrapper = mount(DateSelector, {
      props: { name: 'birthday', modelValue: '', ariaLabelledBy: 'label_id' },
    })

    const year = wrapper.find('select')
    const labelledBy = year.attributes('aria-labelledby')

    expect(year.attributes('aria-label')).toBeUndefined()
    expect(labelledBy?.startsWith('label_id ')).toBe(true)

    const unitId = labelledBy!.split(' ')[1]

    expect(wrapper.find(`#${unitId}`).text()).toBe('の年')
  })
})

describe('ModalBox のフォーカストラップ', () => {
  // 回帰(#56): 背景を inert にしていないため、Tab / Shift+Tab でダイアログの外の
  // リンクやボタンへフォーカスが抜けていた
  const mountModal = () =>
    mount(ModalBox, {
      props: { isShown: true },
      slots: {
        default: '<a href="#first">最初</a><a href="#last">最後</a>',
      },
      attachTo: document.body,
    })

  it('最後の要素で Tab したら最初の要素へ戻る', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)

    const wrapper = mountModal()
    // 開いた直後はダイアログ自身へフォーカスが移る（immediate な watch）
    await nextTick()
    const focusable = wrapper.findAll('a, button')
    const last = focusable[focusable.length - 1]!.element as HTMLElement

    last.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    await nextTick()

    expect(document.activeElement).toBe(focusable[0]!.element)

    wrapper.unmount()
    outside.remove()
  })

  it('最初の要素で Shift+Tab したら最後の要素へ回る', async () => {
    const wrapper = mountModal()
    await nextTick()
    const focusable = wrapper.findAll('a, button')
    const first = focusable[0]!.element as HTMLElement

    first.focus()
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })
    )
    await nextTick()

    expect(document.activeElement).toBe(
      focusable[focusable.length - 1]!.element
    )

    wrapper.unmount()
  })

  it('閉じている間は Tab を横取りしない', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()

    const wrapper = mount(ModalBox, {
      props: { isShown: false },
      slots: { default: '<a href="#first">最初</a>' },
      attachTo: document.body,
    })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    await nextTick()

    expect(document.activeElement).toBe(outside)

    wrapper.unmount()
    outside.remove()
  })
})

// 全体レビューで見つかったバグのリグレッションテスト
describe('BasicButton のローディングと hover 色', () => {
  it('ローディング中もアクセシブル名を保ち、disabled にしない', () => {
    const wrapper = mount(BasicButton, {
      props: { isLoading: true },
      slots: { default: '送信' },
    })

    const button = wrapper.find('button')

    // disabled にするとフォーカスが body へ落ちる（WAI-ARIA APG）
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.attributes('aria-disabled')).toBe('true')
    expect(button.attributes('aria-busy')).toBe('true')
    expect(button.text()).toContain('送信')
  })

  it('3 桁 hex でも hover 色が有効な値になる', () => {
    const wrapper = mount(BasicButton, {
      props: { cssStyle: { default: { backgroundColor: '#fff' } } },
    })

    // 以前は '#fffcc'（不正値）になり、hover で背景が消えていた
    expect(wrapper.find('button').attributes('style')).toContain(
      'color-mix(in srgb, #fff 80%, transparent)'
    )
  })

  it('cssStyle を差し替えると hover 色が追従する', async () => {
    const wrapper = mount(BasicButton, {
      props: {
        cssStyle: { default: {}, hover: { backgroundColor: 'rgb(1, 2, 3)' } },
      },
    })

    await wrapper.setProps({
      cssStyle: { default: {}, hover: { backgroundColor: 'rgb(4, 5, 6)' } },
    })

    expect(wrapper.find('button').attributes('style')).toContain('rgb(4, 5, 6)')
  })
})

describe('グループのアクセシブル名', () => {
  it('RadioButtons が radiogroup になり、名前とエラーを結び付ける', async () => {
    const wrapper = mount(RadioButtons, {
      props: {
        modelValue: 'a',
        isRequired: true,
        ariaLabel: '種別',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    const group = wrapper.find('[role="radiogroup"]')
    expect(group.exists()).toBe(true)
    expect(group.attributes('aria-label')).toBe('種別')

    await wrapper.setProps({ modelValue: '' })

    const errorId = group.attributes('aria-describedby')
    expect(errorId).toBeTruthy()
    expect(wrapper.find(`#${errorId}`).text()).toContain('必須')
  })

  it('RadioButtons が cssStyle.textColor を --text-color へ出す', () => {
    const wrapper = mount(RadioButtons, {
      props: {
        modelValue: 'a',
        cssStyle: { default: { textColor: 'rgb(1, 2, 3)' } },
        options: [{ label: 'A', value: 'a' }],
      },
    })

    expect(wrapper.find('label').attributes('style')).toContain(
      '--text-color: rgb(1, 2, 3)'
    )
  })

  it('CheckBoxes が role="group" になる', () => {
    const wrapper = mount(CheckBoxes, {
      props: {
        name: 'fruits',
        ariaLabel: '果物',
        options: [{ label: 'りんご', value: 'apple' }],
      },
    })

    const group = wrapper.find('[role="group"]')
    expect(group.exists()).toBe(true)
    expect(group.attributes('aria-label')).toBe('果物')
  })

  it('CheckButton が ariaLabel を input へ渡す', () => {
    const wrapper = mount(CheckButton, {
      props: { name: 'favorite', ariaLabel: 'お気に入り' },
    })

    expect(wrapper.find('input').attributes('aria-label')).toBe('お気に入り')
  })
})

describe('ModalBox / PopupBox の初期状態', () => {
  it('最初から開いていてもダイアログへフォーカスを移す', async () => {
    const wrapper = mount(ModalBox, {
      props: { isShown: true },
      attachTo: document.body,
    })

    await nextTick()
    await nextTick()

    expect(document.activeElement).toBe(wrapper.find('[role="dialog"]').element)

    wrapper.unmount()
  })

  it('ダイアログ内で押し始めて背景で離しても閉じない', async () => {
    const wrapper = mount(ModalBox, {
      props: { isShown: true },
      slots: { default: '<p>本文</p>' },
      attachTo: document.body,
    })

    const overlay = wrapper.find('[aria-modal="true"]').element
      .parentElement as HTMLElement

    // ダイアログ内で pointerdown → 背景で click（テキスト選択のドラッグ）
    wrapper
      .find('p')
      .element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await overlay.dispatchEvent(new Event('click', { bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('close')).toBeUndefined()

    wrapper.unmount()
  })
})

// テストの空白を埋める（#107）。
// 既存の describe が触れていなかった振る舞いだけを対象にする
describe('TextArea', () => {
  it('必須で空なら blur でエラーを出す', async () => {
    const wrapper = mount(TextArea, {
      props: { name: 'note', modelValue: '', isRequired: true },
    })

    expect(wrapper.text()).not.toContain('必須')

    await wrapper.find('textarea').trigger('blur')

    expect(wrapper.text()).toContain('必須')
  })

  it('validates の正規表現に合わなければエラーを出す', async () => {
    const wrapper = mount(TextArea, {
      props: {
        name: 'note',
        modelValue: 'あいう',
        validates: [{ regex: /^[a-z]+$/, message: '半角英小文字で入力' }],
      },
    })

    await wrapper.find('textarea').trigger('blur')

    expect(wrapper.text()).toContain('半角英小文字で入力')
  })

  it('autoAdjustHeight が無ければ高さを触らない', async () => {
    const wrapper = mount(TextArea, {
      props: { name: 'note', modelValue: '' },
    })
    const textarea = wrapper.find('textarea').element

    await wrapper.setProps({ modelValue: '本文' })
    await nextTick()

    expect(textarea.style.height).toBe('')
  })

  // 回帰: 補正が padding 決め打ちの 2rem だったため、border-box の
  // リセット CSS を当てた環境で高さが 2rem 足りずスクロールになっていた
  it('autoAdjustHeight は box-sizing を見て高さを補正する', async () => {
    const adjustedHeight = async (boxSizing: 'border-box' | 'content-box') => {
      const wrapper = mount(TextArea, {
        props: { name: 'note', modelValue: '', autoAdjustHeight: true },
      })
      const textarea = wrapper.find('textarea').element

      textarea.style.boxSizing = boxSizing
      textarea.style.paddingTop = '10px'
      textarea.style.paddingBottom = '10px'
      textarea.style.borderTopWidth = '5px'
      textarea.style.borderBottomWidth = '5px'
      Object.defineProperty(textarea, 'scrollHeight', {
        configurable: true,
        value: 100,
      })

      await wrapper.setProps({ modelValue: '本文' })
      await nextTick()
      await nextTick()

      const height = textarea.style.height
      wrapper.unmount()

      return height
    }

    // border-box は border を足す（100 + 5 + 5）
    expect(await adjustedHeight('border-box')).toBe('110px')
    // content-box は padding を引く（100 - 10 - 10）
    expect(await adjustedHeight('content-box')).toBe('80px')
  })
})

describe('BasicButton の disabled', () => {
  it('isDisabled では disabled と aria-disabled が付く', () => {
    const wrapper = mount(BasicButton, {
      props: { isDisabled: true },
      slots: { default: '送信' },
    })

    const button = wrapper.find('button')

    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-disabled')).toBe('true')
    // 押せないだけで、ローディングではない
    expect(button.attributes('aria-busy')).toBeUndefined()
  })

  it('ローディング中のクリックは親のリスナーまで届かない', async () => {
    const onClick = vi.fn()
    const wrapper = mount(BasicButton, {
      props: { isLoading: true },
      attrs: { onClick },
      slots: { default: '送信' },
    })

    await wrapper.find('button').trigger('click')

    expect(onClick).not.toHaveBeenCalled()
  })

  it('buttonType を渡さなければ type="button"（意図しない送信を防ぐ）', () => {
    const wrapper = mount(BasicButton, { slots: { default: '送信' } })

    expect(wrapper.find('button').attributes('type')).toBe('button')
  })
})

describe('ToggleButton のキーボード操作', () => {
  // Enter / Space での起動はネイティブの button に任せている（jsdom は
  // keydown を click に変換しないので、ここで検証できるのは
  // 「button のままであること」まで）。div + role="switch" にすると
  // 自前でキー処理が要るため、要素と role を固定する
  it('role="switch" のネイティブ button で、click で切り替わる', async () => {
    const wrapper = mount(ToggleButton, {
      props: { name: 'notification', modelValue: false },
    })

    const button = wrapper.find('button')

    expect(button.element.tagName).toBe('BUTTON')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('role')).toBe('switch')

    await button.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('isDisabled ならクリックしても切り替わらない', async () => {
    const wrapper = mount(ToggleButton, {
      props: { name: 'notification', modelValue: false, isDisabled: true },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('アクセシブル名は ariaLabel、無ければ name にフォールバックする', () => {
    const withName = mount(ToggleButton, {
      props: { name: 'notification', modelValue: false },
    })
    const withLabel = mount(ToggleButton, {
      props: { name: 'notification', modelValue: false, ariaLabel: '通知' },
    })

    expect(withName.find('button').attributes('aria-label')).toBe(
      'notification'
    )
    expect(withLabel.find('button').attributes('aria-label')).toBe('通知')
  })
})

describe('CheckBoxes の必須検証と emit', () => {
  const options = [
    { label: '個人', value: 'personal' },
    { label: '法人', value: 'corporate' },
  ]

  it('選択を切り替えると値の配列を emit する', async () => {
    const wrapper = mount(CheckBoxes, {
      props: { name: 'kind', options },
    })

    await wrapper.findAll('button[role="checkbox"]')[1]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[['corporate']]])
  })

  it('必須で全部外すとエラーを出し、選び直すと消える', async () => {
    const wrapper = mount(CheckBoxes, {
      props: {
        name: 'kind',
        options,
        modelValue: ['personal'],
        isRequired: true,
      },
    })

    const first = () => wrapper.findAll('button[role="checkbox"]')[0]!

    await first().trigger('click')
    expect(wrapper.text()).toContain('必須')

    await first().trigger('click')
    expect(wrapper.text()).not.toContain('必須')
  })

  it('required でなければ空でもエラーにしない', async () => {
    const wrapper = mount(CheckBoxes, {
      props: { name: 'kind', options, modelValue: ['personal'] },
    })

    await wrapper.findAll('button[role="checkbox"]')[0]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[]])
    expect(wrapper.text()).not.toContain('必須')
  })
})

describe('DateSelector の emit 値', () => {
  const selectUnit = async (
    wrapper: ReturnType<typeof mount>,
    label: string,
    value: string
  ) => {
    const select = wrapper.find(`select[aria-label="${label}"]`)

    await select.setValue(value)
  }

  // 年の選択肢は「今年 - 100 〜 今年 - 14」。固定年だと将来この範囲から
  // 外れて落ちるので、今年からの相対で選ぶ
  const selectableYear = String(new Date().getFullYear() - 20)

  it('年月日が揃った時点で YYYY-MM-DD を emit する', async () => {
    const wrapper = mount(DateSelector, {
      props: { name: 'birthday', modelValue: '' },
    })

    await selectUnit(wrapper, 'birthdayの年', selectableYear)
    await selectUnit(wrapper, 'birthdayの月', '05')

    // 揃うまでは emit しない（中途半端な値を親へ渡さない）
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await selectUnit(wrapper, 'birthdayの日', '03')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      `${selectableYear}-05-03`,
    ])
  })

  it('type="month" なら YYYY-MM を emit する', async () => {
    const wrapper = mount(DateSelector, {
      props: { name: 'birthday', modelValue: '', type: 'month' },
    })

    await selectUnit(wrapper, 'birthdayの年', selectableYear)
    await selectUnit(wrapper, 'birthdayの月', '05')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      `${selectableYear}-05`,
    ])
  })

  it('削除ボタンで空文字を emit する', async () => {
    const wrapper = mount(DateSelector, {
      props: { name: 'birthday', modelValue: '2024-05-03' },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([''])
  })
})

describe('FormValidationManager', () => {
  it('登録が無ければ有効', () => {
    const manager = new FormValidationManager()

    expect(manager.isAllValid.value).toBe(true)
    expect(manager.invalidNames.value).toEqual([])
  })

  it('無効な入力があれば isAllValid が false になり、name が並ぶ', () => {
    const manager = new FormValidationManager()

    manager.setValid('startedOn', false)
    manager.setValid('endedOn', true)

    expect(manager.isAllValid.value).toBe(false)
    expect(manager.invalidNames.value).toEqual(['startedOn'])
    expect(manager.isValid('startedOn')).toBe(false)
    expect(manager.isValid('endedOn')).toBe(true)
    // 未登録は有効として扱う
    expect(manager.isValid('unknown')).toBe(true)
  })

  it('remove すると判定から外れる（アンマウントした入力を残さない）', () => {
    const manager = new FormValidationManager()

    manager.setValid('startedOn', false)
    expect(manager.isAllValid.value).toBe(false)

    manager.remove('startedOn')

    expect(manager.isAllValid.value).toBe(true)
    expect(manager.invalidNames.value).toEqual([])
  })

  it('reset で全部消える', () => {
    const manager = new FormValidationManager()

    manager.setValid('a', false)
    manager.setValid('b', false)
    manager.reset()

    expect(manager.isAllValid.value).toBe(true)
  })

  it('同じ name を上書きできる', () => {
    const manager = new FormValidationManager()

    manager.setValid('startedOn', false)
    manager.setValid('startedOn', true)

    expect(manager.isAllValid.value).toBe(true)
    expect(manager.invalidNames.value).toEqual([])
  })
})

describe('TabUI の initialIndex', () => {
  const tabs = [
    { key: 'tabA', label: 'A' },
    { key: 'tabB', label: 'B' },
  ]

  const selectedKey = (wrapper: ReturnType<typeof mount>) =>
    wrapper
      .findAll('[role="tab"]')
      .find((tab) => tab.attributes('aria-selected') === 'true')
      ?.attributes('id')
      ?.replace(/^.*_tab_/, '')

  it('範囲外なら先頭のタブを選ぶ', () => {
    expect(
      selectedKey(mount(TabUI, { props: { tabs, initialIndex: 5 } }))
    ).toBe('tabA')
    expect(
      selectedKey(mount(TabUI, { props: { tabs, initialIndex: -1 } }))
    ).toBe('tabA')
  })

  it('tabs が空でも描画でき、矢印キーで落ちない', async () => {
    const wrapper = mount(TabUI, { props: { tabs: [] } })

    expect(wrapper.findAll('[role="tab"]')).toHaveLength(0)

    await expect(
      wrapper.find('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })
    ).resolves.not.toThrow()
  })
})
