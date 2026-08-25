<script setup lang="ts">
/* eslint-disable no-useless-escape -- テンプレートリテラル内の閉じスクリプトタグを打ち消すためのエスケープ */
import type { ListSettings } from '@/types'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import CodeBlock from '~demo/components/CodeBlock.vue'
import GithubIcon from '~demo/components/GithubIcon.vue'
import { listSource, sourceUrl } from '~demo/data/repository'
import LabeledCheckbox from '@/components/LabeledCheckbox.vue'
import SelectBox from '@/components/SelectBox.vue'
import { ARTICLES, ARTICLES_WITHOUT_IMAGE, CATEGORIES } from '~demo/data/articles'
import StandardList from '@/components/ArticleList/List/Standard.vue'
import RoundedList from '@/components/ArticleList/List/Rounded.vue'
import ArtisticList from '@/components/ArticleList/List/Artistic.vue'
import TileList from '@/components/ArticleList/List/Tile.vue'
import SimpleList from '@/components/ArticleList/List/Simple.vue'
import RowList from '@/components/ArticleList/List/Row.vue'
import NewsList from '@/components/ArticleList/List/News.vue'
import EntertainmentList from '@/components/ArticleList/List/Entertainment.vue'
import GalleryList from '@/components/ArticleList/List/Gallery.vue'
import GridList from '@/components/ArticleList/List/Grid.vue'

type ListDefinition = {
  key: string
  name: string
  component: unknown
  description: string
  needsColumnNumber?: boolean
}

const LISTS: ListDefinition[] = [
  { key: 'standard', name: 'StandardList', component: StandardList, description: 'サムネイル・見出し・抜粋・メタ情報を揃えた標準レイアウト。' },
  { key: 'rounded', name: 'RoundedList', component: RoundedList, description: '角丸のカードで柔らかい印象に。ブログや読み物向け。' },
  { key: 'artistic', name: 'ArtisticList', component: ArtisticList, description: '画像を大きく見せる構成。ビジュアル主体のメディア向け。' },
  { key: 'tile', name: 'TileList', component: TileList, description: '画像の上にテキストを重ねるタイル型。' },
  { key: 'simple', name: 'SimpleList', component: SimpleList, description: '装飾を抑えた最小構成。サイドバーや関連記事に。' },
  { key: 'row', name: 'RowList', component: RowList, description: '横並びの 1 行レイアウト。検索結果や一覧ページ向け。' },
  { key: 'news', name: 'NewsList', component: NewsList, description: '日付とカテゴリを前面に出したニュース向け。' },
  { key: 'entertainment', name: 'EntertainmentList', component: EntertainmentList, description: '賑やかな見せ方。エンタメ・キャンペーン系に。' },
  { key: 'gallery', name: 'GalleryList', component: GalleryList, description: '画像を敷き詰めるギャラリー表示。' },
  { key: 'grid', name: 'GridList', component: GridList, description: 'カードごとに大きさと向きが変わるグリッド。columnNumber が必須。', needsColumnNumber: true },
]

const LIGHT_COLORS = {
  '--base-color'   : '#ffffff',
  '--main-color'   : '#1c4ac9',
  '--sub-color'    : '#e7ecfb',
  '--primary-color': '#1c4ac9',
  '--text-color'   : '#15143a',
}

const DARK_COLORS = {
  '--base-color'   : '#111729',
  '--main-color'   : '#1c4ac9',
  '--sub-color'    : '#1d2740',
  '--primary-color': '#5b84ff',
  '--text-color'   : '#e0e0e4',
}

const COLOR_LABELS: Record<keyof typeof LIGHT_COLORS, string> = {
  '--base-color'   : '背景',
  '--main-color'   : 'メイン',
  '--sub-color'    : 'サブ',
  '--primary-color': '見出し / リンク',
  '--text-color'   : 'テキスト',
}

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

const isControlsOpen = ref(true)
const theme = ref('standard')
const columnNumber = ref('3')
const isEnabledPickUp = ref(true)
const useAuthor = ref(true)
const useCategory = ref(true)
const useTag = ref(true)
const hasImage = ref(true)
const colors = reactive({ ...LIGHT_COLORS })

const THEME_OPTIONS = LISTS.map(list => ({ label: list.name, value: list.key }))
const COLUMN_OPTIONS = [
  { label: '2 カラム', value: '2' },
  { label: '3 カラム', value: '3' },
  { label: '4 カラム', value: '4' },
]

const currentList = computed(() => LISTS.find(list => list.key === theme.value) ?? LISTS[0])
const articles = computed(() => hasImage.value ? ARTICLES : ARTICLES_WITHOUT_IMAGE)

const settings = computed<ListSettings>(() => ({
  domainToUse: 'example.com',
  postConfig : {
    article_page_path: '/article/',
    query_key_name   : 'article',
    useAuthor        : useAuthor.value,
    useCategory      : useCategory.value,
    useTag           : useTag.value,
  },
  isEnabledPickUp: isEnabledPickUp.value,
}))

const resetColors = () => Object.assign(colors, prefersDark() ? DARK_COLORS : LIGHT_COLORS)

/** サイドバーのレイアウト名リンク（#/article-list#gallery）でテーマを切り替える */
const applyHash = () => {
  const anchor = window.location.hash.split('#')[2] ?? ''
  if (LISTS.some(list => list.key === anchor)) theme.value = anchor
}

onMounted(() => {
  resetColors()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', resetColors)
  window.addEventListener('hashchange', applyHash)
  applyHash()
})

onUnmounted(() => {
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', resetColors)
  window.removeEventListener('hashchange', applyHash)
})

const SETUP_CODE = computed(() => `<script setup lang="ts">
import type { Category, ListSettings } from '@geckou/ui-vue'
import { ref, onMounted } from 'vue'
import { ${currentList.value.name} } from '@geckou/ui-vue'

const settings: ListSettings = {
  domainToUse: 'example.com',
  postConfig : {
    article_page_path: '/article/',
    query_key_name   : 'article',
    useAuthor        : ${useAuthor.value},
    useCategory      : ${useCategory.value},
    useTag           : ${useTag.value},
  },
  isEnabledPickUp: ${isEnabledPickUp.value},
}

const categories: Category[] = [
  { id: '1', name: 'デザイン' },
  { id: '2', name: 'エンジニアリング' },
]

const articles = ref<any[]>([])

onMounted(async () => {
  // WordPress REST API のレスポンス（_embed 付き）をそのまま渡せる
  const res = await fetch('https://example.com/wp-json/wp/v2/posts?_embed')
  articles.value = await res.json()
})
<\/script>

<template>
  <${currentList.value.name}
    :articles="articles"
    :categories="categories"
    :settings="settings"${currentList.value.needsColumnNumber ? `\n    :columnNumber="${columnNumber.value}"` : ''}
  />
<\/template>

<style>
/* 一覧を置く要素のカラーとコンテナクエリの基準 */
.article-list-area {
  container-type : inline-size;
${Object.entries(colors).map(([key, value]) => `  ${key.padEnd(15)}: ${value};`).join('\n')}
}
<\/style>`)
</script>

<template>
  <div :class="$style.page">
    <section :class="$style.intro">
      <h3 :class="$style.introTitle">
        記事一覧プレイグラウンド
      </h3>
      <p :class="$style.introText">
        WordPress REST API（<code>?_embed</code> 付き）のレスポンス配列をそのまま <code>articles</code> に渡すだけで一覧が組み上がります。
        レイアウト・表示項目・配色を切り替えると、下のプレビューとコードがその場で更新されます（データはモックです）。
      </p>
    </section>

    <section :class="['demo-preview', $style.controls]">
      <button
        type="button"
        :class="$style.controlsToggle"
        :aria-expanded="isControlsOpen"
        @click="isControlsOpen = !isControlsOpen"
      >
        <span>表示オプション</span>
        <span :class="[$style.toggleArrow, { [$style.opened]: isControlsOpen }]">▾</span>
      </button>

      <div :class="[$style.controlsBody, { [$style.opened]: isControlsOpen }]">
        <div :class="$style.controlsInner">
          <div :class="$style.controlRow">
            <label :class="$style.field">
              <span :class="$style.fieldLabel">レイアウト</span>
              <SelectBox
                v-model="theme"
                name="listTheme"
                :options="THEME_OPTIONS"
                canOmitSelect
              />
            </label>
            <label :class="$style.field">
              <span :class="$style.fieldLabel">カラム数（GridList のみ）</span>
              <SelectBox
                v-model="columnNumber"
                name="columnNumber"
                :options="COLUMN_OPTIONS"
                canOmitSelect
              />
            </label>
          </div>

          <div :class="$style.controlRow">
            <LabeledCheckbox
              v-model="isEnabledPickUp"
              name="pickup"
              label="ピックアップ表示"
            />
            <LabeledCheckbox
              v-model="useAuthor"
              name="author"
              label="著者"
            />
            <LabeledCheckbox
              v-model="useCategory"
              name="category"
              label="カテゴリ"
            />
            <LabeledCheckbox
              v-model="useTag"
              name="tag"
              label="タグ"
            />
            <LabeledCheckbox
              v-model="hasImage"
              name="image"
              label="アイキャッチあり"
            />
          </div>

          <div :class="$style.controlRow">
            <div
              v-for="(value, key) in colors"
              :key="key"
              :class="$style.colorField"
            >
              <input
                v-model="colors[key]"
                type="color"
                :class="$style.colorInput"
              >
              <span :class="$style.fieldLabel">{{ COLOR_LABELS[key] }}</span>
            </div>
            <button
              type="button"
              :class="$style.reset"
              @click="resetColors"
            >
              配色をリセット
            </button>
          </div>
        </div>
      </div>
    </section>

    <section :class="$style.previewBlock">
      <header :class="$style.previewHeader">
        <div :class="$style.previewHeadline">
          <h3 :class="$style.previewTitle">
            {{ currentList.name }}
          </h3>
          <a
            :class="$style.sourceLink"
            :href="sourceUrl(listSource(currentList.name.replace('List', '')))"
            target="_blank"
            rel="noopener"
          >
            <GithubIcon :class="$style.sourceIcon" />
            {{ currentList.name }} のソース
          </a>
        </div>
        <p :class="$style.previewDescription">
          {{ currentList.description }}
        </p>
      </header>
      <div
        :class="$style.preview"
        :style="colors"
      >
        <component
          :is="currentList.component"
          :articles="articles"
          :categories="CATEGORIES"
          :settings="settings"
          v-bind="currentList.needsColumnNumber ? { columnNumber: Number(columnNumber) } : {}"
        />
      </div>
    </section>

    <section :class="$style.codeBlock">
      <h3 :class="$style.previewTitle">
        この設定のコード
      </h3>
      <CodeBlock :code="SETUP_CODE" />
    </section>
  </div>
</template>

<style lang="scss" module>
.page {
  display       : flex;
  flex-direction: column;
  gap           : var(--sp-large);
}

.intro,
.previewBlock,
.codeBlock {
  display         : flex;
  flex-direction  : column;
  gap             : var(--sp-medium);
  padding         : var(--sp-large);
  border          : 1px solid var(--border-color);
  border-radius   : var(--radius-size);
  background-color: var(--surface-color);
}

.introTitle,
.previewTitle {
  margin        : 0;
  font-size     : var(--fs-large);
  font-weight   : 500;
  letter-spacing: var(--letter-spacing-normal);
}

.introText,
.previewDescription {
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

.controls {
  position        : sticky;
  top             : calc(var(--global-header-height) + var(--sp-small));
  z-index         : 10;
  display         : flex;
  flex-direction  : column;
  gap             : var(--sp-medium);
  padding         : var(--sp-large);
  border          : 1px solid var(--border-color);
  border-radius   : var(--radius-size);
  background-color: color-mix(in srgb, var(--base-color) 92%, transparent);
  backdrop-filter : blur(8px);
}

.controlsToggle {
  display        : flex;
  align-items    : center;
  justify-content: space-between;
  gap            : var(--sp-small);
  inline-size    : 100%;
  padding        : 0;
  border         : none;
  background-color: transparent;
  color          : var(--gray);
  font-family    : inherit;
  font-size      : var(--fs-min);
  letter-spacing : var(--letter-spacing-normal);
  cursor         : pointer;

  &:hover {
    color: var(--primary-color);
  }
}

.toggleArrow {
  transition: rotate var(--transition-duration) ease-out;

  &.opened {
    rotate: 180deg;
  }
}

.controlsBody {
  display              : grid;
  grid-template-rows   : 0fr;
  transition           : grid-template-rows var(--transition-duration) ease-out;

  &.opened {
    grid-template-rows: 1fr;
  }
}

.controlsInner {
  display       : flex;
  flex-direction: column;
  gap           : var(--sp-medium);
  overflow      : hidden;
  min-height    : 0;
}

.previewHeadline {
  display        : flex;
  align-items    : center;
  justify-content: space-between;
  flex-wrap      : wrap;
  gap            : var(--sp-small);
}

.sourceLink {
  display      : inline-flex;
  align-items  : center;
  gap          : .3rem;
  padding      : .15rem .6rem;
  border       : 1px solid var(--border-color);
  border-radius: 999px;
  color        : var(--gray);
  font-size    : var(--fs-min);

  &:hover {
    border-color: var(--primary-color);
    color       : var(--primary-color);
  }
}

.sourceIcon {
  inline-size: .8rem;
  block-size : .8rem;
  fill       : currentColor;
}

.controlRow {
  display    : flex;
  align-items: flex-end;
  flex-wrap  : wrap;
  gap        : var(--sp-medium) var(--sp-large);
}

.field {
  display       : flex;
  flex-direction: column;
  gap           : var(--sp-min);
  min-width     : 14rem;
}

.fieldLabel {
  color         : var(--gray);
  font-size     : var(--fs-min);
  letter-spacing: var(--letter-spacing-normal);
  white-space   : nowrap;
}

.colorField {
  display    : flex;
  align-items: center;
  gap        : var(--sp-small);
}

.colorInput {
  inline-size  : 2.25rem;
  block-size   : 1.75rem;
  padding      : 0;
  border       : 1px solid var(--border-color);
  border-radius: var(--radius-small);
  background   : none;
  cursor       : pointer;
}

.reset {
  margin-inline-start: auto;
  padding            : .35rem .9rem;
  border             : 1px solid var(--border-color);
  border-radius      : 999px;
  background-color   : transparent;
  color              : var(--text-color);
  font-family        : inherit;
  font-size          : var(--fs-smaller);
  letter-spacing     : var(--letter-spacing-narrow);
  cursor             : pointer;

  &:hover {
    border-color: var(--primary-color);
    color       : var(--primary-color);
  }
}

.previewHeader {
  display       : flex;
  flex-direction: column;
  gap           : var(--sp-min);
}

.preview {
  container-type  : inline-size;
  padding         : var(--sp-large);
  border          : 1px solid var(--light-border-color);
  border-radius   : var(--radius-size);
  background-color: var(--base-color);
  color           : var(--text-color);
}
</style>
