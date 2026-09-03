// @geckou/ui-core への移行時に修正したバグのリグレッションテスト
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import CheckBoxes from '@/components/CheckBoxes.vue'
import CheckButton from '@/components/CheckButton.vue'
import DateSelector from '@/components/DateSelector.vue'
import InputBox from '@/components/InputBox.vue'
import ModalBox from '@/components/ModalBox.vue'
import PostedDate from '@/components/ArticleList/Parts/PostedDate.vue'
import DropdownUi from '@/components/DropdownUi.vue'
import RadioButtons from '@/components/RadioButtons.vue'
import SelectBox from '@/components/SelectBox.vue'
import SlideDownUi from '@/components/SlideDownUi.vue'
import TabUI from '@/components/TabUI.vue'
import TextBox from '@/components/TextBox.vue'
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
    let wrapper: ReturnType<typeof mount<typeof TextBox>>

    wrapper = mount(TextBox, {
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

    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(0)

    await wrapper.setProps({ options })

    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(2)
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
      .findAll('input[type="checkbox"]')
      .map((input) => (input.element as HTMLInputElement).checked)

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

  const stateOf = (wrapper: ReturnType<typeof mount>) =>
    wrapper.attributes('style') ?? ''

  it('2 つ目のコントロールにフォーカスしても focus 配色になる', async () => {
    const wrapper = mount(InputBox, twoControls)
    const before = stateOf(wrapper)

    const text = wrapper.findAll('input')[1].element as HTMLInputElement
    text.focus()
    await wrapper.trigger('focusin')
    await nextTick()

    expect(stateOf(wrapper)).not.toBe(before)

    wrapper.unmount()
  })

  it('空のまま blur しても valid 配色にしない', async () => {
    const wrapper = mount(InputBox, twoControls)
    const before = stateOf(wrapper)

    const text = wrapper.findAll('input')[1].element as HTMLInputElement
    text.focus()
    await wrapper.trigger('focusin')
    text.blur()
    await wrapper.trigger('blur')
    await nextTick()

    expect(stateOf(wrapper)).toBe(before)

    wrapper.unmount()
  })

  it('全て埋まったら valid 配色になる', async () => {
    const wrapper = mount(InputBox, twoControls)
    const before = stateOf(wrapper)

    const [date, text] = wrapper
      .findAll('input')
      .map((input) => input.element as HTMLInputElement)
    date.value = '2026-08-17'
    text.value = '2026'

    await wrapper.trigger('blur')
    await nextTick()

    expect(stateOf(wrapper)).not.toBe(before)

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
  it('DropdownUi は閉状態で inert を付ける', async () => {
    const wrapper = mount(DropdownUi, {
      slots: { trigger: 'メニュー', contents: '<a href="#x">リンク</a>' },
    })

    const contents = wrapper.findAll('div').at(-2)!

    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    expect(wrapper.html()).toContain('inert')

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
    expect(contents).toBeTruthy()
  })

  it('SlideDownUi は閉状態で inert を付ける', async () => {
    const wrapper = mount(SlideDownUi, {
      slots: { trigger: '開く', default: '<a href="#x">リンク</a>' },
    })

    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
    expect(wrapper.html()).toContain('inert')

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')
  })
})
