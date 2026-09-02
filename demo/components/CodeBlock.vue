<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    code: string
    language?: string
  }>(),
  {
    language: 'vue',
  }
)

const copied = ref(false)

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <div :class="$style.wrapper">
    <div :class="$style.head">
      <span :class="$style.language">{{ language }}</span>
      <button type="button" :class="$style.copy" @click="copy">
        {{ copied ? 'コピーしました' : 'コピー' }}
      </button>
    </div>
    <pre :class="$style.pre"><code>{{ code }}</code></pre>
  </div>
</template>

<style lang="scss" module>
.wrapper {
  overflow: hidden;
  border: 1px solid var(--code-border);
  border-radius: var(--radius-size);
  background-color: var(--code-background);
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--code-border);
  background-color: rgba(224, 224, 228, 0.04);
}

.language {
  color: #8a94a6;
  font-size: var(--fs-min);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.copy {
  padding: 0.2rem 0.6rem;
  border: 1px solid var(--code-border);
  border-radius: var(--radius-small);
  background-color: transparent;
  color: #c7d0de;
  font-family: inherit;
  font-size: var(--fs-min);
  letter-spacing: var(--letter-spacing-narrow);
  cursor: pointer;

  &:hover {
    background-color: rgba(224, 224, 228, 0.08);
  }
}

.pre {
  overflow: auto;
  margin: 0;
  padding: 1rem;
  color: var(--code-text);
  font-size: var(--fs-smaller);
  line-height: 1.7;
  tab-size: 2;
}
</style>
