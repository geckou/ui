# @geckou/ui-core

[`@geckou/ui-vue`](../vue) と [`@geckou/ui-react`](../react) が共有する、
フレームワーク非依存のロジック層。Vue も React も使わない純粋な TypeScript です。

コンポーネントを使わず、バリデーションや日付処理だけ利用することもできます。

```bash
yarn add @geckou/ui-core
```

## なぜ分けているか

Vue 版と React 版を別々に実装していたため、同じバグが両方に存在し、
片方だけ直ってもう片方に残る、という事故が起きました。
フレームワークに依存しないロジックをここへ集約し、テストを付けています。

## API

### バリデーション

```ts
import { isEmptyValue, runValidates, validateInputValue } from '@geckou/ui-core'
```

| 関数 | 説明 |
|---|---|
| `isEmptyValue(value)` | 空かどうか。**数値 `0` や `'0'` は空とみなさない**（`!value` 判定だと 0 が必須エラーになる） |
| `runValidates(value, validates)` | 各 `RegExp` を適用し、一致しなかった `message` を返す。`g` / `y` フラグ付きでも判定が安定するよう毎回クローンして評価し、**呼び出し側の `lastIndex` を変異させない** |
| `validateInputValue(value, { isRequired, validates })` | 必須チェックと `validates` をまとめて適用し、メッセージの配列を返す |

### 日付

```ts
import {
  formatDateValue,
  splitDate,
  composeDateValue,
  validateDateObject,
  daysInMonth,
} from '@geckou/ui-core'
```

| 関数 | 説明 |
|---|---|
| `formatDateValue(value, type?)` | `YYYY-MM-DD`（`type='month'` なら `YYYY-MM`）へ正規化。**`toISOString()` を使わないためタイムゾーンで日付がずれない**。不正な文字列は空文字を返す |
| `splitDate(value)` | `YYYY-MM-DD` を `{ year, month, day }` へ分解 |
| `composeDateValue(dateObject, type?)` | 年月日から日付文字列を組み立てる。要素が欠けていれば空文字 |
| `validateDateObject(dateObject, { type, isRequired })` | 桁数・月の範囲・その月に存在する日かを検証し `{ isValid, message }` を返す |
| `daysInMonth(year, month)` | 指定した年月の日数（`month` は 1 始まり。うるう年を考慮） |

### 文字変換

```ts
import { convertFullWidthToHalfWidth } from '@geckou/ui-core'
```

全角の英数字を半角へ変換します。全角以外はそのまま残します。

### フォーム全体の検証状態

```ts
import { createFormValidationStore } from '@geckou/ui-core'

const store = createFormValidationStore()
store.setValid('startedOn', false)
store.getSnapshot() // { isAllValid: false, invalidNames: ['startedOn'] }
```

| メソッド | 説明 |
|---|---|
| `setValid(name, isValid)` | 入力の状態を登録・更新する |
| `isValid(name)` | 個別の入力が有効か（未登録なら `true`） |
| `remove(name)` | 管理対象から外す |
| `reset()` | すべての状態を破棄する |
| `getSnapshot()` | 現在の状態。**内容が変わらない限り同一参照を返す**ため `useSyncExternalStore` にそのまま渡せる |
| `subscribe(listener)` | 変更通知を購読する。戻り値を呼ぶと解除 |

各フレームワークからは以下でつなぎます。

- Vue: `FormValidationManager`（`@geckou/ui-vue`）
- React: `useFormValidation`（`@geckou/ui-react`）

### スクロールロック

```ts
import { createScrollLock } from '@geckou/ui-core'

const lock = createScrollLock()
lock.toggle(isOpen) // 真偽でロック・解除
lock.release() // アンマウント時
```

モーダル表示中のページ全体のスクロールを止めます。1 コンポーネント 1 ハンドルを持ち、
表示状態を `toggle()` に渡します。モーダルを重ねても解除順で壊れないよう内部でロック数を数え、
最初のロックで元の値を控えて最後の解除で戻します。

**スクロールバー幅を補正します。** バーが常時表示される環境（デスクトップの Windows / Linux 等）では
`overflow: hidden` にした瞬間にバーの幅ぶん内容が横へずれるため、最初のロックで
`window.innerWidth - document.documentElement.clientWidth` を `body` の `padding-right` に足し、
最後の解除で元へ戻します（既存のインライン値があれば `calc()` で加算します）。

利用側の CSS で `html { scrollbar-gutter: stable }` を指定している場合、
この差は 0 になるので補正は入りません。固定配置の要素（追従ヘッダー等）も
ずれないようにしたいときは `scrollbar-gutter` を使うほうが確実です。

SSR（`document` が無い環境）では何もしません。

### フォーカストラップ

```ts
import { handleTabKey, getFocusableElements } from '@geckou/ui-core'

const onKeyDown = (event: KeyboardEvent) => {
  handleTabKey(dialogElement, event, document.activeElement)
}
```

`aria-modal="true"` を出していても、背景を `inert` にしていない限り Tab / Shift+Tab は
ダイアログの外へ抜けます。`handleTabKey()` に `keydown` を渡すと、コンテナ内の
フォーカス可能な要素の端で折り返します（末尾で Tab → 先頭、先頭で Shift+Tab → 末尾）。

| 関数 | 説明 |
|---|---|
| `handleTabKey(container, event, activeElement?)` | Tab / Shift+Tab を端で折り返す。フォーカスを移して既定動作を止めたら `true` を返す。Tab 以外と `container` が無い場合は何もしない |
| `getFocusableElements(container)` | コンテナ内のフォーカス可能な要素を DOM 順（= Tab 順）で返す。`inert` が付いたものは除く |
| `FOCUSABLE_SELECTOR` | 上記で使うセレクタ（`tabindex="-1"` と `disabled` を除く） |

`ModalBox`（Vue / React）はこれを使っています。

### モーダルの重なり順

```ts
import { createModalLayer } from '@geckou/ui-core'

const layer = createModalLayer()
layer.toggle(isOpen, dialogElement) // 表示状態と、判定に使う要素
layer.isTopmost() // キー入力を処理してよいのは true のときだけ
layer.release() // アンマウント時
```

モーダルを重ねたとき、Escape や Tab を処理してよいのは最前面の 1 枚だけです。
`ModalBox` はハンドラを `document` に bubble で登録するため、重なると全部が同じ
イベントを受け取ります。実行順は DOM の深さではなく登録順で決まる（React は
`onClose` の同一性が変わると再登録され、effect は子から先に走る）ので、
順序には頼れません。

判定の決め手は **DOM の包含関係**です。入れ子のモーダルは内側が外側の中に
描画されるので、他のレイヤーを内包しているものは外側だと分かります。
互いに内包しない（入れ子でない）モーダルが並んだときだけ、後から開いたものを
最前面とします。

| メソッド | 説明 |
|---|---|
| `toggle(shouldBeActive, element?)` | 真偽で登録・解除する。`element` は最前面判定に使う要素（ダイアログ本体） |
| `isTopmost()` | このレイヤーが最前面か。登録していなければ `false` |
| `release()` | アンマウント時に呼ぶ。登録中なら解除する |

`ModalBox`（Vue / React）はこれを使っています。

### 定数・型

```ts
import { COLOR, BORDER, MESSAGES, INPUT_BOX_DEFAULT_STYLES } from '@geckou/ui-core'
import type { Validates, Option, StateVariation, DateObject } from '@geckou/ui-core'
```

`MESSAGES` はエラー文言の単一の入口です。Vue / React で文言がずれないよう、必ずここを参照します。

型の一覧は [Vue パッケージの README](../vue/README.md#types) を参照してください。

## 0.4.0 の変更

- `focus-trap` を追加（`handleTabKey` / `getFocusableElements` / `FOCUSABLE_SELECTOR`）。
  React / Vue の `ModalBox` が Tab の循環に使う
- `scroll-lock` がロック時にスクロールバー幅を `padding-right` として補正する。
  スクロールバーが常時表示される環境で、モーダルの開閉のたびにページが横へずれていた。
  `body` の `padding-right` を自分で指定している場合は `calc()` で合成される

## テスト

```bash
yarn workspace @geckou/ui-core test
```

## License

[MIT](../../LICENSE)
