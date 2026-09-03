<script setup lang="ts">
import FolderIcon from '@/components/Icon/Folder.vue'
import TagIcon from '@/components/Icon/Tag.vue'

const props = withDefaults(
  defineProps<{
    metadata: string[]
    icon?: {
      name?: 'FolderIcon' | 'TagIcon' | null
      color?: string
      size?: 'small' | 'medium'
    }
    label?: {
      backgroundColor?: string
      color?: string
      fontSize?: string
      fontWeight?: string
      shape?: 'square' | 'rounded'
    }
    delimiter?: string
  }>(),
  {
    icon: () => ({
      name: null,
      color: 'var(--disable-text-color)',
      size: 'medium',
    }),
    label: () => ({
      backgroundColor: 'transparent',
      color: 'var(--text-color)',
      fontSize: 'var(--fs-small)',
      fontWeight: 'normal',
      shape: 'square',
    }),
    delimiter: '',
  }
)

const iconName = props.icon.name === 'FolderIcon' ? FolderIcon : TagIcon
</script>

<template>
  <div
    v-if="metadata.length"
    :class="$style.metadata_list"
    :style="{ '--icon-color': icon.color }"
  >
    <component
      :is="iconName"
      v-if="icon.name"
      :class="$style.icon"
      :style="{
        '--icon-color': icon.color,
        '--icon-size':
          icon.size === 'small'
            ? 'var(--small-icon-size, 0.9375rem)'
            : 'var(--medium-icon-size, 1.125rem)',
      }"
    />
    <ul :class="$style.list">
      <li
        v-for="item in metadata"
        :key="item"
        :class="[
          $style.list_item,
          $style[label.shape ?? 'square'],
          { [$style.delimiter]: delimiter },
        ]"
        :style="{
          '--label-padding':
            !label.backgroundColor || label.backgroundColor === 'transparent'
              ? '0px'
              : 'var(--sp-min) var(--sp-small)',
          '--label-background-color': label.backgroundColor ?? 'transparent',
          '--label-color': label.color ?? 'var(--text-color)',
          '--label-font-size': label.fontSize ?? 'var(--fs-small)',
          '--label-font-weight': label.fontWeight ?? 'normal',
        }"
        :data-delimiter="delimiter"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.metadata_list {
  --icon-color: var(--disable-text-color);
  display: flex;
  align-items: center;
  gap: var(--sp-small);
}

.icon {
  flex: 0 0 var(--icon-size);
  @include icon($size: var(--icon-size), $color: var(--icon-color));
}

.list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-small) var(--sp-medium);

  .list_item {
    line-height: 1;
    background-color: var(--label-background-color);
    padding: var(--label-padding);
    color: var(--label-color);
    font-size: var(--label-font-size);
    font-weight: var(--label-font-weight);

    &.rounded {
      border-radius: calc(var(--bv) / 2);
    }

    &.delimiter {
      &:not(:last-child) {
        &::after {
          content: attr(data-delimiter);
          margin-inline-start: var(--sp-medium);
        }
      }
    }
  }
}
</style>
