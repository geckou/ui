// @geckou/ui-core への移行時に修正したバグのリグレッションテスト
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CheckBox from '@/components/CheckBox.vue'
import CheckBoxes from '@/components/CheckBoxes.vue'
import CheckButton from '@/components/CheckButton.vue'
import DatePicker from '@/components/DatePicker.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import DateSelector from '@/components/DateSelector.vue'
import InputBox from '@/components/InputBox.vue'
import LabeledCheckbox from '@/components/LabeledCheckbox.vue'
import ModalBox from '@/components/ModalBox.vue'
import PostedDate from '@/components/ArticleList/Parts/PostedDate.vue'
import DropdownUi from '@/components/DropdownUi.vue'
import RadioButtons from '@/components/RadioButtons.vue'
import SelectBox from '@/components/SelectBox.vue'
import SlideDownUi from '@/components/SlideDownUi.vue'
import TabUI from '@/components/TabUI.vue'
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
  })

  it('有効な date は書式どおりに描画する', () => {
    const wrapper = mount(PostedDate, { props: { date: '2026-08-17' } })

    expect(wrapper.text()).toBe('2026/08/17')
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

    expect(wrapper.text()).toContain('月は01から12の間で入力してください')
    expect(manager.isAllValid.value).toBe(false)
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
