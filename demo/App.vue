<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import GeckouLogo from '~demo/components/GeckouLogo.vue'
import GithubIcon from '~demo/components/GithubIcon.vue'
import StarField from '~demo/components/StarField.vue'
import GettingStarted from '~demo/sections/GettingStarted.vue'
import FormComponents from '~demo/sections/FormComponents.vue'
import ButtonComponents from '~demo/sections/ButtonComponents.vue'
import DisplayComponents from '~demo/sections/DisplayComponents.vue'
import ArticleLists from '~demo/sections/ArticleLists.vue'

const PAGES = [
  {
    key: 'getting-started',
    label: 'はじめに',
    component: GettingStarted,
    links: [],
  },
  {
    key: 'form',
    label: 'フォーム UI',
    component: FormComponents,
    links: [
      { hash: 'textbox', label: 'TextBox' },
      { hash: 'textarea', label: 'TextArea' },
      { hash: 'selectbox', label: 'SelectBox' },
      { hash: 'checkbox', label: 'CheckBox 系' },
      { hash: 'checkboxes', label: 'CheckBoxes' },
      { hash: 'radiobuttons', label: 'RadioButtons' },
      { hash: 'togglebutton', label: 'ToggleButton' },
      { hash: 'labeledfieldset', label: 'LabeledFieldset' },
      { hash: 'datepicker', label: 'DatePicker' },
      { hash: 'daterangepicker', label: 'DateRangePicker' },
      { hash: 'dateselector', label: 'DateSelector' },
      { hash: 'errormessage', label: 'ErrorMessage' },
    ],
  },
  {
    key: 'button',
    label: 'ボタン',
    component: ButtonComponents,
    links: [
      { hash: 'basicbutton', label: 'BasicButton' },
      { hash: 'textbutton', label: 'TextButton' },
    ],
  },
  {
    key: 'display',
    label: '表示・操作 UI',
    component: DisplayComponents,
    links: [
      { hash: 'tabui', label: 'TabUI' },
      { hash: 'slidedownui', label: 'SlideDownUi' },
      { hash: 'dropdownui', label: 'DropdownUi' },
      { hash: 'modalbox', label: 'ModalBox' },
      { hash: 'loadingspinner', label: 'LoadingSpinner' },
    ],
  },
  {
    key: 'article-list',
    label: '記事一覧 UI',
    component: ArticleLists,
    links: [
      { hash: 'standard', label: 'StandardList' },
      { hash: 'rounded', label: 'RoundedList' },
      { hash: 'artistic', label: 'ArtisticList' },
      { hash: 'tile', label: 'TileList' },
      { hash: 'simple', label: 'SimpleList' },
      { hash: 'row', label: 'RowList' },
      { hash: 'news', label: 'NewsList' },
      { hash: 'entertainment', label: 'EntertainmentList' },
      { hash: 'gallery', label: 'GalleryList' },
      { hash: 'grid', label: 'GridList' },
    ],
  },
]

const parseHash = () => {
  const [page, anchor] = window.location.hash.replace(/^#\/?/, '').split('#')
  return {
    page: PAGES.some((item) => item.key === page) ? page : PAGES[0].key,
    anchor: anchor ?? '',
  }
}

const currentPage = ref(parseHash().page)
const isNavOpen = ref(false)

const currentDefinition = computed(
  () => PAGES.find((page) => page.key === currentPage.value) ?? PAGES[0]
)

const scrollToAnchor = (anchor: string) => {
  if (!anchor) {
    window.scrollTo({ top: 0 })
    return
  }

  window.requestAnimationFrame(() => {
    document
      .getElementById(anchor)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const applyHash = () => {
  const { page, anchor } = parseHash()
  currentPage.value = page
  scrollToAnchor(anchor)
}

const navigate = (pageKey: string, anchor = '') => {
  isNavOpen.value = false
  window.location.hash = anchor ? `#/${pageKey}#${anchor}` : `#/${pageKey}`
  if (currentPage.value === pageKey) {
    scrollToAnchor(anchor)
  }
}

onMounted(() => {
  window.addEventListener('hashchange', applyHash)
  applyHash()
})

onUnmounted(() => window.removeEventListener('hashchange', applyHash))
</script>

<template>
  <div :class="$style.layout">
    <StarField />

    <header :class="$style.header">
      <a :class="$style.brand" href="#/getting-started">
        <GeckouLogo :class="$style.brandMark" />
        <span>
          <strong :class="$style.brandName">Geckou UI</strong>
          <span :class="$style.brandSub"
            >@geckou/ui-vue コンポーネントカタログ（core / vue / react）</span
          >
        </span>
      </a>
      <nav :class="$style.headerNav">
        <a
          :class="$style.githubLink"
          href="https://github.com/geckou/ui"
          target="_blank"
          rel="noopener"
        >
          <GithubIcon :class="$style.githubIcon" />
          GitHub
        </a>
        <button
          type="button"
          :class="$style.navToggle"
          :aria-expanded="isNavOpen"
          :aria-label="isNavOpen ? 'メニューを閉じる' : 'メニューを開く'"
          @click="isNavOpen = !isNavOpen"
        >
          <svg
            viewBox="0 0 24 24"
            :class="$style.navToggleIcon"
            aria-hidden="true"
          >
            <path
              v-if="isNavOpen"
              d="M6.4 4.99 19.01 17.6l-1.41 1.41L4.99 6.4z M17.6 4.99 4.99 17.6l1.41 1.41L19.01 6.4z"
            />
            <path v-else d="M3 5h18v2H3zM3 11h18v2H3zM3 17h18v2H3z" />
          </svg>
        </button>
      </nav>
    </header>

    <div :class="$style.body">
      <aside :class="[$style.sidebar, { [$style.open]: isNavOpen }]">
        <nav :class="$style.nav">
          <div v-for="page in PAGES" :key="page.key" :class="$style.navGroup">
            <button
              type="button"
              :class="[
                $style.navPage,
                { [$style.current]: page.key === currentPage },
              ]"
              @click="navigate(page.key)"
            >
              {{ page.label }}
            </button>
            <ul
              v-if="page.key === currentPage && page.links.length"
              :class="$style.navList"
            >
              <li v-for="link in page.links" :key="link.hash">
                <button
                  type="button"
                  :class="$style.navLink"
                  @click="navigate(page.key, link.hash)"
                >
                  {{ link.label }}
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      <main :class="$style.main">
        <component :is="currentDefinition.component" />
        <footer :class="$style.footer">
          <p>© Geckou — MIT License</p>
        </footer>
      </main>
    </div>
  </div>
</template>

<style lang="scss" module>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header,
.body {
  position: relative;
  z-index: 1;
}

.header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: var(--sp-medium) var(--sp-large);
  border-bottom: 1px solid var(--border-color);
  background-color: color-mix(in srgb, var(--base-color) 88%, transparent);
  backdrop-filter: blur(8px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text-color);
}

.brandMark {
  color: var(--gk-blue);
}

@media (prefers-color-scheme: dark) {
  .brandMark {
    color: var(--gk-white);
  }
}

.brandName {
  display: block;
  font-size: var(--fs-medium);
  font-weight: 500;
  letter-spacing: var(--letter-spacing-normal);
  line-height: var(--line-height-tight);
}

.brandSub {
  display: block;
  color: var(--gray);
  font-size: var(--fs-min);
  line-height: var(--line-height-narrow);
}

.headerNav {
  display: flex;
  align-items: center;
  gap: var(--sp-small);
  margin-left: auto;
  font-size: var(--fs-small);
  letter-spacing: var(--letter-spacing-normal);
}

.githubLink {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  color: var(--text-color);

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

.githubIcon {
  inline-size: 1rem;
  block-size: 1rem;
  fill: currentColor;
}

.navToggle {
  display: none;
  align-items: center;
  justify-content: center;
  inline-size: 2.25rem;
  block-size: 2.25rem;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  background-color: transparent;
  color: var(--text-color);
  cursor: pointer;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

.navToggleIcon {
  inline-size: 1.1rem;
  block-size: 1.1rem;
  fill: currentColor;
}

.body {
  display: flex;
  flex: 1;
  align-items: flex-start;
}

.sidebar {
  position: sticky;
  top: 4rem;
  flex: 0 0 var(--sidebar-width);
  width: var(--sidebar-width);
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
  padding: 1.5rem 1rem;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.navGroup {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.navPage {
  padding: 0.4rem 0.6rem;
  border: none;
  border-radius: var(--radius-size);
  background-color: transparent;
  color: var(--text-color);
  font-family: inherit;
  font-size: var(--fs-small);
  font-weight: 500;
  letter-spacing: var(--letter-spacing-normal);
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: var(--sub-color);
  }

  &.current {
    background-color: var(--gk-blue);
    color: #fff;
  }
}

.navList {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding-left: 0.5rem;
}

.navLink {
  width: 100%;
  padding: 0.2rem 0.5rem;
  border: none;
  border-left: 2px solid var(--border-color);
  border-radius: 0;
  background-color: transparent;
  color: var(--gray);
  font-family: inherit;
  font-size: var(--fs-smaller);
  letter-spacing: var(--letter-spacing-narrow);
  text-align: left;
  cursor: pointer;

  &:hover {
    border-left-color: var(--primary-color);
    color: var(--primary-color);
  }
}

.main {
  flex: 1;
  min-width: 0;
  max-width: 72rem;
  padding: var(--sp-large) var(--sp-large) var(--sp-max);
}

.footer {
  margin-top: var(--sp-larger);
  color: var(--gray);
  font-size: var(--fs-min);
  letter-spacing: var(--letter-spacing-normal);
  text-align: center;
}

@media (max-width: 900px) {
  .navToggle {
    display: inline-flex;
  }

  .sidebar {
    display: none;

    &.open {
      display: block;
      position: fixed;
      top: 3.5rem;
      left: 0;
      z-index: 40;
      width: min(80vw, 20rem);
      height: calc(100vh - 3.5rem);
      border-right: 1px solid var(--border-color);
      background-color: var(--base-color);
    }
  }

  .main {
    padding: 1rem 1rem 3rem;
  }
}
</style>
