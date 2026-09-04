<script setup lang="ts">
/* eslint-disable no-useless-escape -- テンプレートリテラル内の閉じスクリプトタグを打ち消すためのエスケープ */
import CodeBlock from '~demo/components/CodeBlock.vue'
import {
  NPM_CORE_URL,
  NPM_REACT_URL,
  NPM_URL,
  REPOSITORY_URL,
} from '~demo/data/repository'

const PACKAGES = [
  {
    name: '@geckou/ui-core',
    url: NPM_CORE_URL,
    role: '共通ロジック',
    description:
      'バリデーション・日付処理・全角変換・フォーム全体の検証状態。フレームワークに依存しない純粋な TypeScript。',
  },
  {
    name: '@geckou/ui-vue',
    url: NPM_URL,
    role: 'Vue 3',
    description:
      'フォーム / ボタン / 表示・操作 UI と記事一覧 UI。このデモサイトで動いているのはこのパッケージ。',
  },
  {
    name: '@geckou/ui-react',
    url: NPM_REACT_URL,
    role: 'React 19',
    description:
      'フォーム / ボタン / 表示・操作 UI。Next.js 向け。記事一覧は収録していない。',
  },
]

const INSTALL_VUE = `yarn add @geckou/ui-vue`

const INSTALL_REACT = `yarn add @geckou/ui-react`

const PLUGIN_USAGE = `import { createApp } from 'vue'
import GeckouUi from '@geckou/ui-vue'
import App from './App.vue'

createApp(App)
  .use(GeckouUi) // TextBox / StandardList などがグローバル登録される
  .mount('#app')`

const NAMED_USAGE = `<script setup lang="ts">
import { TextBox, StandardList } from '@geckou/ui-vue'
<\/script>`

const VALIDATION_VUE = `<script setup lang="ts">
import { DatePicker, FormValidationManager } from '@geckou/ui-vue'

const manager = new FormValidationManager()
// manager.isAllValid.value でフォーム全体の状態を参照する
<\/script>

<template>
  <DatePicker
    v-model="startedOn"
    name="startedOn"
    :formValidationManager="manager"
    isRequired
  />
  <button :disabled="!manager.isAllValid.value">送信</button>
</template>`

const VALIDATION_REACT = `import { DatePicker, useFormValidation } from '@geckou/ui-react'

function Form() {
  // store を渡さない入力は集計されず、isAllValid が常に true になる
  const { isAllValid, store } = useFormValidation()

  return (
    <form>
      <DatePicker name="startedOn" formValidationStore={store} isRequired />
      <button disabled={!isAllValid}>送信</button>
    </form>
  )
}`

const CSS_VARS = `:root {
  /* 配色（値は geckou.net のブランドカラー） */
  --primary-color: #1c4ac9;  /* 見出し・リンク・フォーカス */
  --main-color   : #1c4ac9;  /* カテゴリラベルなどの塗り */
  --text-color   : #15143a;
  --gray         : #656a7d;  /* 補助テキスト */
  --white        : #fff;     /* 画像上の文字色などに使用 */
  --black-rgb    : 0, 8, 26; /* 影の生成に使用 */
  --border-color : rgba(21, 20, 58, .12);

  /* 余白（--bv を基準値にした 5 段階） */
  --bv           : clamp(.375rem, .144rem + .46vw, .5rem);
  --sp           : var(--bv);
  --sp-min       : calc(var(--sp) / 2);
  --sp-small     : var(--sp);
  --sp-medium    : calc(var(--sp) * 2);
  --sp-large     : calc(var(--sp) * 4);
  --sp-larger    : calc(var(--sp) * 8);

  /* タイポグラフィ */
  --fs-small     : clamp(.75rem, .519rem + .46vw, .875rem);
  --fs-large     : clamp(1rem, .769rem + .46vw, 1.125rem);
}`
</script>

<template>
  <div :class="$style.page">
    <section :class="$style.hero">
      <p :class="$style.eyebrow">Geckou UI</p>
      <h2 :class="$style.title">同じロジックを、Vue と React で</h2>
      <p :class="$style.lead">
        入力フォーム系のコンポーネントと、WordPress REST API
        の記事データをそのまま渡せる記事一覧コンポーネント（10 レイアウト）。
        バリデーションや日付処理は共通の core パッケージが持つため、Vue 版と
        React 版で挙動が食い違いません。
      </p>
      <div :class="$style.heroLinks">
        <a
          :class="$style.heroLink"
          :href="REPOSITORY_URL"
          target="_blank"
          rel="noopener"
        >
          github.com/geckou/ui
        </a>
        <a
          :class="$style.heroLink"
          :href="NPM_URL"
          target="_blank"
          rel="noopener"
        >
          npm: @geckou/ui-vue
        </a>
      </div>
    </section>

    <section :class="$style.block">
      <h3 :class="$style.heading">パッケージ構成</h3>
      <p :class="$style.text">
        3 つのパッケージに分かれています。 フレームワークに依存しないロジックを
        <code>@geckou/ui-core</code> に集約し、 Vue 版と React
        版はどちらもそれを使います。 同じバグを 2
        箇所で直す必要がなくなり、片方だけ修正が漏れることもありません。
      </p>
      <div :class="$style.cards">
        <article
          v-for="packageInfo in PACKAGES"
          :key="packageInfo.name"
          :class="$style.card"
        >
          <h4 :class="$style.cardTitle">
            <a :href="packageInfo.url" target="_blank" rel="noopener">{{
              packageInfo.name
            }}</a>
          </h4>
          <p :class="$style.cardRole">
            {{ packageInfo.role }}
          </p>
          <p :class="$style.cardText">
            {{ packageInfo.description }}
          </p>
        </article>
      </div>
    </section>

    <section :class="$style.block">
      <h3 :class="$style.heading">インストール</h3>
      <p :class="$style.text">
        Vue 3 のプロジェクトに追加してください。Vue
        本体は同梱していないので、プロジェクト側の Vue（3.5
        以上）がそのまま使われます。
      </p>
      <CodeBlock :code="INSTALL_VUE" language="bash" />
      <p :class="$style.text">
        React（Next.js）の場合はこちら。0.2.0 からビルド済みの
        <code>dist</code> を配布しているので、<code>next.config.ts</code> の
        <code>transpilePackages</code> への追加は要りません。
      </p>
      <CodeBlock :code="INSTALL_REACT" language="bash" />
    </section>

    <section :class="$style.block">
      <h3 :class="$style.heading">使い方</h3>
      <p :class="$style.text">
        プラグインとして一括登録するか、必要なコンポーネントだけ名前付きインポートします。
      </p>
      <CodeBlock :code="PLUGIN_USAGE" language="ts" />
      <CodeBlock :code="NAMED_USAGE" />
    </section>

    <section :class="$style.block">
      <h3 :class="$style.heading">フォーム全体の検証状態</h3>
      <p :class="$style.text">
        各入力の検証結果をまとめて追跡し、すべて有効になるまで送信ボタンを無効にできます。
        Vue は <code>FormValidationManager</code>、React は
        <code>useFormValidation</code> を使いますが、 中身はどちらも core
        の同じストアです。
      </p>
      <CodeBlock :code="VALIDATION_VUE" />
      <CodeBlock :code="VALIDATION_REACT" language="tsx" />
    </section>

    <section :class="$style.block">
      <h3 :class="$style.heading">スタイルの前提</h3>
      <p :class="$style.text">
        各コンポーネントは CSS カスタムプロパティで配色と余白を受け取ります。
        アプリ側のグローバル CSS
        で以下の変数を定義すれば、そのままプロダクトのトーンに馴染みます。
        下の値は geckou.net
        のブランドカラーに合わせたもので、このデモサイト自体も同じトークンで組んでいます
        （OS の配色設定に応じてライト / ダークが切り替わります）。
      </p>
      <CodeBlock :code="CSS_VARS" language="css" />
    </section>

    <section :class="$style.block">
      <h3 :class="$style.heading">収録コンポーネント</h3>
      <div :class="$style.cards">
        <article :class="$style.card">
          <h4 :class="$style.cardTitle">Form</h4>
          <p :class="$style.cardRole">Vue / React 共通</p>
          <p :class="$style.cardText">
            TextBox / TextArea / SelectBox / CheckBox / CheckBoxes /
            LabeledCheckbox / RadioButtons / ToggleButton / BasicButton /
            LabeledFieldset / TabUI ほか
          </p>
        </article>
        <article :class="$style.card">
          <h4 :class="$style.cardTitle">Date</h4>
          <p :class="$style.cardRole">Vue / React 共通</p>
          <p :class="$style.cardText">
            DatePicker / DateRangePicker / DateSelector
          </p>
        </article>
        <article :class="$style.card">
          <h4 :class="$style.cardTitle">Article List</h4>
          <p :class="$style.cardRole">Vue のみ</p>
          <p :class="$style.cardText">
            StandardList / RoundedList / ArtisticList / TileList / SimpleList /
            RowList / NewsList / EntertainmentList / GalleryList / GridList
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<style lang="scss" module>
.page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: var(--sp-max) var(--sp-large);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-size);
  background: linear-gradient(135deg, #15143a, #1c4ac9 140%);
  color: #e0e0e4;
}

.eyebrow {
  margin: 0 0 var(--sp-medium);
  font-size: var(--fs-min);
  letter-spacing: var(--letter-spacing-normal);
  opacity: 0.75;
}

.title {
  margin: 0 0 var(--sp-medium);
  font-size: var(--fs-max);
  font-weight: 500;
  letter-spacing: var(--letter-spacing-normal);
  line-height: var(--line-height-narrow);
}

.lead {
  max-width: 46rem;
  margin: 0;
  font-size: var(--fs-small);
  line-height: var(--line-height-normal);
  opacity: 0.88;

  code {
    padding: 0.1em 0.4em;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.18);
  }
}

.heroLinks {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-small);
  margin-block-start: var(--sp-large);
}

.heroLink {
  align-self: flex-start;
  padding: 0.4rem 1rem;
  border: 1px solid rgba(224, 224, 228, 0.4);
  border-radius: 999px;
  color: #e0e0e4;
  font-size: var(--fs-smaller);
  letter-spacing: var(--letter-spacing-narrow);

  &:hover {
    background-color: rgba(224, 224, 228, 0.12);
  }
}

.block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: var(--sp-large);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-size);
  background-color: var(--surface-color);
}

.heading {
  margin: 0;
  font-size: var(--fs-large);
  font-weight: 500;
  letter-spacing: var(--letter-spacing-normal);
}

.text {
  margin: 0;
  color: var(--gray);
  font-size: var(--fs-small);
  line-height: var(--line-height-normal);

  code {
    padding: 0.1em 0.4em;
    border-radius: var(--radius-small);
    background-color: var(--sub-color);
    color: var(--primary-color);
  }
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}

.card {
  padding: var(--sp-large);
  border: 1px solid var(--light-border-color);
  border-radius: var(--radius-size);
  background-color: var(--surface-muted);
}

.cardTitle {
  margin: 0 0 var(--sp-small);
  color: var(--primary-color);
  font-size: var(--fs-medium);
  font-weight: 500;
  letter-spacing: var(--letter-spacing-normal);
}

.cardRole {
  margin: 0 0 var(--sp-small);
  font-size: var(--fs-min);
  letter-spacing: var(--letter-spacing-normal);
  color: var(--primary-color);
}

.cardTitle a {
  color: inherit;
  text-decoration: none;
}

.cardTitle a:hover {
  color: var(--primary-color);
}

.text code {
  padding: 0 0.25em;
  border-radius: var(--radius-small);
  background-color: rgba(var(--black-rgb), 0.06);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
}

.cardText {
  margin: 0;
  color: var(--gray);
  font-size: var(--fs-smaller);
  line-height: var(--line-height-narrow);
  word-break: break-word;
}
</style>
