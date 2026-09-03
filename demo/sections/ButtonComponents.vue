<script setup lang="ts">
import { ref } from 'vue'
import DemoSection from '~demo/components/DemoSection.vue'
import BasicButton from '@/components/BasicButton.vue'
import TextButton from '@/components/TextButton.vue'
import { componentSource } from '~demo/data/repository'

const isLoading = ref(false)
const lastAction = ref('—')

const submit = () => {
  isLoading.value = true
  window.setTimeout(() => {
    isLoading.value = false
  }, 1200)
}

const CODE = {
  button: `<BasicButton
  buttonType="submit"
  :isLoading="isLoading"
  @click="submit"
>
  送信
</BasicButton>`,
  textButton: `<TextButton
  text="削除"
  variant="caution"
  @click="remove"
/>`,
}
</script>

<template>
  <div :class="$style.page">
    <DemoSection
      id="basicbutton"
      :sources="[
        { label: 'BasicButton', path: componentSource('BasicButton') },
      ]"
      title="BasicButton"
      description="isLoading でスピナー表示に切り替わる（クリックで 1.2 秒間ローディング）。"
      :code="CODE.button"
    >
      <BasicButton buttonType="button" :isLoading="isLoading" @click="submit">
        送信
      </BasicButton>
    </DemoSection>

    <DemoSection
      id="textbutton"
      :sources="[{ label: 'TextButton', path: componentSource('TextButton') }]"
      title="TextButton"
      description="枠のないテキストリンク調のボタン。variant を caution にすると警告色になる。"
      :code="CODE.textButton"
    >
      <div :class="$style.row">
        <TextButton text="編集" @click="lastAction = '編集'" />
        <TextButton
          text="削除"
          variant="caution"
          @click="lastAction = '削除'"
        />
        <TextButton text="無効" isDisabled />
      </div>
      <p :class="$style.note">最後に押したボタン: {{ lastAction }}</p>
    </DemoSection>
  </div>
</template>

<style lang="scss" module>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.note {
  margin: var(--sp-medium) 0 0;
  color: var(--gray);
  font-size: var(--fs-smaller);
}
</style>
