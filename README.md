# Geckou UI

Geckou が自社の制作案件で使う UI コンポーネント集。
**ロジックをフレームワーク非依存の core に集約し、Vue と React が同じ core を使う**構成になっている。

**デモサイト（Vue）: https://ui.geckou.net/**

## パッケージ

| パッケージ | 内容 | npm |
|---|---|---|
| [`@geckou/ui-core`](packages/core) | フレームワーク非依存のロジック（バリデーション・日付処理・状態管理・型・配色） | [![npm](https://img.shields.io/npm/v/@geckou/ui-core?color=1c4ac9)](https://www.npmjs.com/package/@geckou/ui-core) |
| [`@geckou/ui-vue`](packages/vue) | Vue 3 用コンポーネント。フォーム系 + 記事一覧（10 レイアウト） | [![npm](https://img.shields.io/npm/v/@geckou/ui-vue?color=1c4ac9)](https://www.npmjs.com/package/@geckou/ui-vue) |
| [`@geckou/ui-react`](packages/react) | React 19 / Next.js 用コンポーネント。フォーム系 | [![npm](https://img.shields.io/npm/v/@geckou/ui-react?color=1c4ac9)](https://www.npmjs.com/package/@geckou/ui-react) |

記事一覧（ArticleList）は Vue のみに収録している。

## なぜ core を分けているか

Vue 版と React 版で同じコンポーネントを別々に実装していた時期に、
**同じバグが両方に存在し、片方だけ直って、もう片方に残る**という事故が起きた。

- 数値 `0` が必須エラーになる（`!value` 判定）
- `g` / `y` フラグ付き RegExp で `lastIndex` が変異し判定が不安定になる
- 日付が `toISOString()` でタイムゾーン分ずれる

いずれもフレームワークに依存しない純粋なロジックだったため、
`@geckou/ui-core` に集約してテストを付けた。以後、この種の修正は一度で両方に効く。

## インストール

### Vue

```bash
yarn add @geckou/ui-vue
```

### React（Next.js）

```bash
yarn add @geckou/ui-react
```

ソースをそのまま配布しているため、`next.config.ts` の `transpilePackages` に
`'@geckou/ui-react'` を追加する。詳細は [パッケージの README](packages/react)。

### core を単体で使う

コンポーネントを使わず、バリデーションや日付処理だけ使いたい場合。

```bash
yarn add @geckou/ui-core
```

## このパッケージについて

Geckou が自社の制作案件で使うために開発しているコンポーネント集です。どなたでも自由に使えますが、次の点をご理解のうえでご利用ください。

- バグ報告・要望は歓迎しますが、**対応や後方互換は保証しません**
- 自社案件の都合で API や見た目が変わることがあります。バージョンは当面 `0.x` のままです
- Pull Request は歓迎しますが、方針に合わない場合はマージしないことがあります。手早く直したいときは fork してお使いください
- MIT License（"AS IS"）で提供しています

## Design tokens

各コンポーネントは配色・余白・タイポグラフィを CSS カスタムプロパティで受け取ります。
アプリ側のグローバル CSS で定義してください（未定義でも動作しますが、色や余白が効きません）。

以下は [geckou.net](https://geckou.net/) のブランドカラーに合わせた例で、デモサイトも同じトークンで組んでいます。

```css
:root {
  /* 配色 */
  --primary-color: #1c4ac9;  /* 見出し・リンク・フォーカス */
  --main-color   : #1c4ac9;  /* カテゴリラベルなどの塗り */
  --link-color   : #1c4ac9;
  --checked-color: #1c4ac9;  /* チェックボックス・ラジオの選択色 */
  --text-color   : #15143a;
  --gray         : #656a7d;  /* 補助テキスト */
  --white        : #fff;     /* 画像上の文字色などに使用 */
  --black-rgb    : 0, 8, 26; /* 影の生成に使用 */
  --border-color : rgba(21, 20, 58, .12);
  --light-border-color: rgba(21, 20, 58, .08);
  --disable-text-color: #656a7d;

  /* 余白（--bv を基準値にした 5 段階） */
  --bv       : clamp(.375rem, .144rem + .46vw, .5rem);
  --sp       : var(--bv);
  --sp-min   : calc(var(--sp) / 2);
  --sp-small : var(--sp);
  --sp-medium: calc(var(--sp) * 2);
  --sp-large : calc(var(--sp) * 4);
  --sp-larger: calc(var(--sp) * 8);

  /* タイポグラフィ */
  --fs-small: clamp(.75rem, .519rem + .46vw, .875rem);
  --fs-large: clamp(1rem, .769rem + .46vw, 1.125rem);

  /* アイコン・角丸・アニメーション */
  --icon-small        : calc(var(--bv) * 2);
  --icon-medium       : calc(var(--bv) * 3);
  --radius-size       : 4px;
  --radius-small      : 4px;
  --animation-duration: .3s;
}
```

| 変数 | 用途 |
|------|------|
| `--primary-color` / `--main-color` / `--link-color` | ブランドカラー。見出し、リンク、カテゴリラベルの塗り |
| `--text-color` / `--gray` / `--disable-text-color` | 本文・補助テキスト・非活性テキスト |
| `--white` / `--black-rgb` | 画像上の文字色、影の生成 |
| `--border-color` / `--light-border-color` | 枠線 |
| `--bv` と `--sp-*` | 余白の基準値と段階 |
| `--fs-small` / `--fs-large` | 小さめ・大きめの文字サイズ |

記事一覧コンポーネントはコンテナクエリでレイアウトを切り替えるため、
親要素に `container-type: inline-size` を指定してください。

フォーム系コンポーネントは、個別に `cssStyle` prop（`InputBoxStyleForEachStatus` など）を渡すと
状態ごとの配色を上書きできます。詳細は下の Types を参照してください。

デモサイトは geckou.net のトンマナ（ダークネイビー `#15143a` 系、ブルー `#1c4ac9`、Zen Kaku Gothic Antique、
`--bv` 起点のクランプスケール）に揃えており、OS の配色設定に応じてライト / ダークが切り替わります。

## Development

```bash
yarn install
yarn dev          # Vue のデモサイトを起動（http://localhost:5555/）
yarn test         # 全パッケージのテスト
yarn type-check   # 全パッケージの型チェック
yarn lint         # ESLint（.ts / .tsx / .vue）
yarn build        # 各パッケージの配布物を生成
yarn build:demo   # デモサイトを demo-dist に出力
```

デモサイトは `production` への push で GitHub Pages に自動デプロイされます（`.github/workflows/deploy-demo.yml`）。

### Release

パッケージ単位でリリースします。タグは `<ディレクトリ名>@<バージョン>` 形式です。

```bash
yarn release core          # @geckou/ui-core をパッチ更新
```

```bash
yarn release vue minor     # @geckou/ui-vue をマイナー更新
```

```bash
yarn release react 1.0.0   # バージョンを直接指定
```

バージョンを上げてコミットし、タグを push すると `.github/workflows/publish.yml` が
タグから対象パッケージを判別して npm に publish します。

未コミットの変更がある場合と `production` 以外のブランチでは中断します。
タグは 1 本ずつ push します（4 本以上をまとめて push すると GitHub がワークフローを起動しないため）。

## License

[MIT](LICENSE)
