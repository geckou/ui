<script setup lang="ts">
import { ref } from 'vue'
import CodeBlock from '~demo/components/CodeBlock.vue'
import GithubIcon from '~demo/components/GithubIcon.vue'
import { sourceUrl } from '~demo/data/repository'

type Source = {
  label: string
  path: string
}

withDefaults(
  defineProps<{
    id?: string
    title: string
    description?: string
    code?: string
    contained?: boolean
    /** GitHub 上のソースへのリンク */
    sources?: Source[]
  }>(),
  {
    id: undefined,
    description: '',
    code: '',
    contained: false,
    sources: () => [],
  }
)

const isCodeOpen = ref(false)
</script>

<template>
  <section :id="id" :class="$style.section">
    <header :class="$style.header">
      <div :class="$style.headline">
        <h3 :class="$style.title">
          {{ title }}
        </h3>
        <ul v-if="sources.length" :class="$style.sources">
          <li v-for="source in sources" :key="source.path">
            <a
              :class="$style.sourceLink"
              :href="sourceUrl(source.path)"
              target="_blank"
              rel="noopener"
            >
              <GithubIcon :class="$style.sourceIcon" />
              {{ source.label }}
            </a>
          </li>
        </ul>
      </div>
      <p v-if="description" :class="$style.description">
        {{ description }}
      </p>
    </header>

    <div
      :class="[
        'demo-preview',
        $style.preview,
        { [$style.contained]: contained },
      ]"
    >
      <slot />
    </div>

    <div v-if="code">
      <button
        type="button"
        :class="$style.toggle"
        @click="isCodeOpen = !isCodeOpen"
      >
        {{ isCodeOpen ? 'コードを隠す' : 'コードを見る' }}
      </button>
      <CodeBlock v-if="isCodeOpen" :code="code" />
    </div>
  </section>
</template>

<style lang="scss" module>
.section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: var(--sp-large);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-size);
  background-color: var(--surface-color);
  scroll-margin-top: 5rem;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.headline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-small) var(--sp-medium);
}

.sources {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sp-small);
}

.sourceLink {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.6rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  color: var(--gray);
  font-size: var(--fs-min);

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}

.sourceIcon {
  inline-size: 0.8rem;
  block-size: 0.8rem;
  fill: currentColor;
}

.title {
  margin: 0;
  font-size: var(--fs-large);
  font-weight: 500;
  letter-spacing: var(--letter-spacing-normal);
  line-height: var(--line-height-narrow);
}

.description {
  margin: 0;
  color: var(--gray);
  font-size: var(--fs-small);
  line-height: var(--line-height-narrow);
}

.preview {
  padding: var(--sp-large);
  border: 1px solid var(--light-border-color);
  border-radius: var(--radius-size);
  background-color: var(--surface-muted);

  &.contained {
    container-type: inline-size;
  }
}

.toggle {
  margin-bottom: 0.5rem;
  padding: 0.35rem 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background-color: transparent;
  color: var(--text-color);
  font-family: inherit;
  font-size: var(--fs-smaller);
  letter-spacing: var(--letter-spacing-narrow);
  cursor: pointer;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
}
</style>
