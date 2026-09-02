// @geckou/ui-core への移行時に修正したバグのリグレッションテスト
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import DateSelector from '@/components/DateSelector.vue'
import RadioButtons from '@/components/RadioButtons.vue'
import SelectBox from '@/components/SelectBox.vue'
import TabUI from '@/components/TabUI.vue'
import TextBox from '@/components/TextBox.vue'

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
    expect(names[0]).toMatch(/^radio_group_\d+$/)
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

  it('複数設置しても name が衝突しない', () => {
    const first = mount(RadioButtons, { props: { modelValue: '', options } })
    const second = mount(RadioButtons, { props: { modelValue: '', options } })

    const nameOf = (wrapper: ReturnType<typeof mount>) =>
      (wrapper.find('input[type="radio"]').element as HTMLInputElement).name

    expect(nameOf(first)).not.toBe(nameOf(second))
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

  const selectedKey = (wrapper: ReturnType<typeof mount>) =>
    wrapper
      .findAll('[role="tab"]')
      .find((tab) => tab.attributes('aria-selected') === 'true')
      ?.attributes('id')

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
  const mountTextBox = (props: Record<string, unknown>) => {
    const wrapper = mount(TextBox, {
      props: {
        ...props,
        'onUpdate:modelValue': (newValue: unknown) =>
          wrapper.setProps({ modelValue: newValue }),
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
