<script setup lang="ts">
/* eslint-disable no-useless-escape -- テンプレートリテラル内の閉じスクリプトタグを打ち消すためのエスケープ */
import CodeBlock from '~demo/components/CodeBlock.vue'
import { NPM_URL, REPOSITORY_URL } from '~demo/data/repository'

const INSTALL = `yarn add @geckou/ui-vue
# もしくは
npm install @geckou/ui-vue`

const PLUGIN_USAGE = `import { createApp } from 'vue'
import GeckouUi from '@geckou/ui-vue'
import App from './App.vue'

createApp(App)
  .use(GeckouUi) // TextBox / StandardList などがグローバル登録される
  .mount('#app')`

const NAMED_USAGE = `<script setup lang="ts">
import { TextBox, StandardList } from '@geckou/ui-vue'
<\/script>`

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
      <p :class="$style.eyebrow">
        @geckou/ui-vue
      </p>
      <h2 :class="$style.title">
        フォーム UI と記事一覧 UI を、ひとつのパッケージで
      </h2>
      <p :class="$style.lead">
        入力フォーム系のコンポーネントと、WordPress REST API の記事データをそのまま渡せる記事一覧コンポーネント（10 レイアウト）を収録しています。
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
      <h3 :class="$style.heading">
        インストール
      </h3>
      <p :class="$style.text">
        npm で配布しています（<a
          :href="NPM_URL"
          target="_blank"
          rel="noopener"
        >@geckou/ui-vue</a>）。Vue 3 のプロジェクトに追加してください。Vue 本体は同梱していないので、プロジェクト側の Vue（3.0 以上）がそのまま使われます。
      </p>
      <CodeBlock
        :code="INSTALL"
        language="bash"
      />
    </section>

    <section :class="$style.block">
      <h3 :class="$style.heading">
        使い方
      </h3>
      <p :class="$style.text">
        プラグインとして一括登録するか、必要なコンポーネントだけ名前付きインポートします。
      </p>
      <CodeBlock
        :code="PLUGIN_USAGE"
        language="ts"
      />
      <CodeBlock :code="NAMED_USAGE" />
    </section>

    <section :class="$style.block">
      <h3 :class="$style.heading">
        スタイルの前提
      </h3>
      <p :class="$style.text">
        各コンポーネントは CSS カスタムプロパティで配色と余白を受け取ります。
        アプリ側のグローバル CSS で以下の変数を定義すれば、そのままプロダクトのトーンに馴染みます。
        下の値は geckou.net のブランドカラーに合わせたもので、このデモサイト自体も同じトークンで組んでいます
        （OS の配色設定に応じてライト / ダークが切り替わります）。
      </p>
      <CodeBlock
        :code="CSS_VARS"
        language="css"
      />
    </section>

    <section :class="$style.block">
      <h3 :class="$style.heading">
        収録コンポーネント
      </h3>
      <div :class="$style.cards">
        <article :class="$style.card">
          <h4 :class="$style.cardTitle">
            Form
          </h4>
          <p :class="$style.cardText">
            TextBox / TextArea / SelectBox / CheckBox / CheckBoxes / LabeledCheckbox /
            RadioButtons / ToggleButton / BasicButton / LabeledFieldset / TabUI ほか
          </p>
        </article>
        <article :class="$style.card">
          <h4 :class="$style.cardTitle">
            Article List
          </h4>
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
  display       : flex;
  flex-direction: column;
  gap           : 2rem;
}

.hero {
  display       : flex;
  flex-direction: column;
  align-items   : flex-start;
  padding      : var(--sp-max) var(--sp-large);
  border       : 1px solid var(--border-color);
  border-radius: var(--radius-size);
  background   : linear-gradient(135deg, #15143a, #1c4ac9 140%);
  color        : #e0e0e4;
}

.eyebrow {
  margin        : 0 0 var(--sp-medium);
  font-size     : var(--fs-min);
  letter-spacing: var(--letter-spacing-normal);
  opacity       : .75;
}

.title {
  margin        : 0 0 var(--sp-medium);
  font-size     : var(--fs-max);
  font-weight   : 500;
  letter-spacing: var(--letter-spacing-normal);
  line-height   : var(--line-height-narrow);
}

.lead {
  max-width  : 46rem;
  margin     : 0;
  font-size  : var(--fs-small);
  line-height: var(--line-height-normal);
  opacity    : .88;

  code {
    padding         : .1em .4em;
    border-radius   : 4px;
    background-color: rgba(255, 255, 255, .18);
  }
}

.heroLinks {
  display           : flex;
  flex-wrap         : wrap;
  gap               : var(--sp-small);
  margin-block-start: var(--sp-large);
}

.heroLink {
  align-self     : flex-start;
  padding        : .4rem 1rem;
  border         : 1px solid rgba(224, 224, 228, .4);
  border-radius  : 999px;
  color          : #e0e0e4;
  font-size      : var(--fs-smaller);
  letter-spacing : var(--letter-spacing-narrow);

  &:hover {
    background-color: rgba(224, 224, 228, .12);
  }
}

.block {
  display         : flex;
  flex-direction  : column;
  gap             : .75rem;
  padding         : var(--sp-large);
  border          : 1px solid var(--border-color);
  border-radius   : var(--radius-size);
  background-color: var(--surface-color);
}

.heading {
  margin        : 0;
  font-size     : var(--fs-large);
  font-weight   : 500;
  letter-spacing: var(--letter-spacing-normal);
}

.text {
  margin     : 0;
  color      : var(--gray);
  font-size  : var(--fs-small);
  line-height: var(--line-height-normal);

  code {
    padding         : .1em .4em;
    border-radius   : var(--radius-small);
    background-color: var(--sub-color);
    color           : var(--primary-color);
  }
}

.cards {
  display              : grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap                  : 1rem;
}

.card {
  padding         : var(--sp-large);
  border          : 1px solid var(--light-border-color);
  border-radius   : var(--radius-size);
  background-color: var(--surface-muted);
}

.cardTitle {
  margin        : 0 0 var(--sp-small);
  color         : var(--primary-color);
  font-size     : var(--fs-medium);
  font-weight   : 500;
  letter-spacing: var(--letter-spacing-normal);
}

.cardText {
  margin    : 0;
  color     : var(--gray);
  font-size : var(--fs-smaller);
  line-height: var(--line-height-narrow);
  word-break: break-word;
}
</style>
