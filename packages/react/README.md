# @geckou/ui-react

Web（React 19 / Next.js）用の UI コンポーネント集。

ロジックは [`@geckou/ui-core`](../core) が持ち、このパッケージは DOM の記述だけを担当する。
同じ core を [`@geckou/ui-vue`](../vue) も使うため、バリデーション・日付処理の挙動は両者で一致する。

Mobile（Expo / NativeWind）では使えない（DOM 前提のため）。

## インストール

```bash
yarn add @geckou/ui-react
```

ビルド済みの JavaScript と型定義（`dist/`）を配布しています。トランスパイルの設定は要りません。

1. グローバル CSS に `@import '@geckou/ui-react/styles/tokens.css';` を追加（デザイントークン）
2. Tailwind を使う場合は、配布物をスキャン対象に加える

**Tailwind CSS v4 が必須です。** コンポーネントは `bg-(--background-color)`、
`rounded-(--radius-size)`、`flex-none!` のような v4 の記法を直書きしているため、
v3 ではこれらのクラスが生成されません。v4 はスキャン対象を CSS 側の `@source` で指定します。

```css
/* グローバル CSS */
@import 'tailwindcss';
@source '../node_modules/@geckou/ui-react/dist';

@import '@geckou/ui-react/styles/tokens.css';
```

`@source` のパスは、その CSS ファイルからの相対で書きます。

`'use client'` はビルド後も各ファイルの先頭に残るので、Next.js の App Router では
Server Component から直接 import できます（状態を持つコンポーネントだけが Client Component になります）。

> **0.1.1 以前から更新する場合**: ソース配布をやめたため、`next.config.ts` の
> `transpilePackages` から `'@geckou/ui-react'` を外し、Tailwind のスキャン対象を
> `src/**/*.{ts,tsx}` から `dist` に変えてください。`transpilePackages` は
> 残しても動きますが、スキャン対象が `src` のままだとクラスが検出されずスタイルが当たりません。

`tokens.css` は既定値です。上書きする変数の一覧はリポジトリの [README](../../README.md#design-tokens) を参照してください。

## 使い方

```tsx
import { TextBox, BasicButton, ModalBox } from '@geckou/ui-react'
```

### フォーム全体の検証状態

`useFormValidation` で各入力の検証結果を集約する。
Vue 版の `FormValidationManager` と同じストア（`@geckou/ui-core`）を使う。
**`store` を入力コンポーネントの `formValidationStore` に渡してください**（渡さない入力は集計されません）。
対応しているのは `DatePicker` / `DateRangePicker` / `DateSelector`。

```tsx
const { isAllValid, store } = useFormValidation()
const [startedOn, setStartedOn] = useState('')
const [period, setPeriod] = useState({ start: '', end: '' })

return (
  <form>
    <DatePicker
      name="startedOn"
      value={startedOn}
      onChange={setStartedOn}
      isRequired
      formValidationStore={store}
    />
    <DateRangePicker name="period" value={period} onChange={setPeriod} />
    <button disabled={!isAllValid}>送信</button>
  </form>
)
```

props は Vue 版（`@geckou/ui-vue`）と揃えている。`v-model` にあたるものが
`value` + `onChange` になるだけで、名前と意味は同じ。

| Component | value | 主な props |
|-----------|-------|-----------|
| `DatePicker` | `string`（`YYYY-MM-DD` / `type="month"` なら `YYYY-MM`） | `name` / `isRequired` / `isDisabled` / `minDate` / `maxDate` / `size` / `type` / `formValidationStore` |
| `DateRangePicker` | `{ start: string; end: string }` | `DatePicker` と同じ（開始日と終了日の min / max が自動連動）。各入力の name は `<name>Start` / `<name>End` |
| `DateSelector` | `string`（`YYYY-MM-DD` / `type="month"` なら `YYYY-MM`） | `name` / `isRequired` / `type` / `formValidationStore` |

`DatePicker` / `DateSelector` の年月日欄の読み上げ名は、既定では `name` から作られます
（`name="startedOn"` なら「startedOnの年」）。`CheckBox` と同じ `ariaLabel` / `ariaLabelledBy`
を渡すと、そちらを土台に「の年」「の月」「の日」を繋げます。可視ラベルがあるなら
`ariaLabelledBy` でその要素を指してください（WCAG 2.5.3 Label in Name）。

```tsx
<DatePicker name="startedOn" ariaLabel="開始日" /> {/* 「開始日の年」 */}
<DatePicker name="startedOn" ariaLabelledBy={labelId} /> {/* 可視ラベル + 「の年」 */}
```

## 収録コンポーネント

フォーム系 25 種（`TextBox` / `TextArea` / `SelectBox` / `SearchableSelectBox` / `CheckBox` 系 /
`RadioButtons` / `ToggleButton` / `DatePicker` / `DateRangePicker` / `DateSelector` /
`FileInput` / `ModalBox` / `PopupBox` / `DropdownUi` / `SlideDownUi` / `TabUI` ほか）とアイコン 5 種。

記事一覧（ArticleList）は Vue 版のみに収録している。

## テスト

```bash
yarn workspace @geckou/ui-react test
```

## 0.6.0 の変更

- `ModalBox` を重ねたとき、Escape で閉じるのは**最前面の 1 枚だけ**になった
  （従来は内側と外側の `onClose` が両方呼ばれていた）。あわせて自分が Escape を
  処理したら `preventDefault()` する。外側で Escape を見ているアプリ側のハンドラが
  一緒に反応しなくなるので、`defaultPrevented` を見ずに閉じている処理があれば追従が要る
- `SearchableSelectBox` が候補 0 件のときは Escape を握らない（`preventDefault()` しない）。
  `ModalBox` の中で「何にもマッチしない語を入れた状態だと Escape を 2 回押す必要がある」
  のが直る
- `DatePicker` のカレンダー起動用入力にアクセシブル名（「◯◯のカレンダー」）が付き、
  キーボードで到達したときアイコン側に可視フォーカスが出る
- `PopupBox` が `role="status"`（ライブリージョン）になり、支援技術に通知が伝わる
- `DateRange` 型を公開の入口から export するようにした
  （`import type { DateRange } from '@geckou/ui-react'`）

## 0.5.0 の変更

- `DatePicker` / `DateSelector` が `ariaLabel` / `ariaLabelledBy` を受ける
  （未指定なら従来どおり `name` から読み上げ名を作る）
- `CheckBox` / `ToggleButton` が `<button>` の中に `<input>` を置かなくなった。
  状態は `<button>` の `data-checked` / `disabled` で表し、送信用の入力は
  チェック時だけ `<input type="hidden">` として `<button>` の外に描かれる。
  DOM を辿っているテストやスタイルがあれば追従が要る
- `ModalBox` が開いている間、Tab / Shift+Tab をダイアログ内で循環させる（フォーカストラップ）
- `SearchableSelectBox` が WAI-ARIA の Combobox パターンに沿い、↑↓ / Enter / Escape で操作できる

## 0.4.0 の変更

- `RadioButtons` が必須エラー（「必須項目です」）を描画する。Vue 版と同じく、
  値が空へ変化したときに出る
- `CheckBox` / `ToggleButton` のロールが `aria-pressed` から
  `role="checkbox" + aria-checked` / `role="switch" + aria-checked` に変わった。
  アクセシブル名は `ariaLabel` / `ariaLabelledBy` で渡せる（未指定なら従来どおり `name`）
- `DateSelector` に `minYear` / `maxYear` を追加（既定は従来どおり「今年 -100 〜 今年 -14」）
- `DateRangePicker` が範囲（開始 > 終了）を検証し、`<name>Range` という名前で
  `FormValidationStore` に登録する。`invalidNames` を見ている場合は増える
- `TabUI` の `color.text` を配線した

## License

[MIT](../../LICENSE)
