<script setup lang="ts">
import { ref } from 'vue'
import DemoSection from '~demo/components/DemoSection.vue'
import BasicButton from '@/components/BasicButton.vue'
import TabUI from '@/components/TabUI.vue'
import SlideDownUi from '@/components/SlideDownUi.vue'
import DropdownUi from '@/components/DropdownUi.vue'
import ModalBox from '@/components/ModalBox.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { componentSource } from '~demo/data/repository'

const isModalShown = ref(false)

const CODE = {
  tab: `<TabUI
  :tabs="[
    { key: 'tabA', label: '概要' },
    { key: 'tabB', label: '仕様' },
  ]"
>
  <template #tabAContents>...</template>
  <template #tabBContents>...</template>
</TabUI>`,
  slideDown: `<SlideDownUi>
  <template #trigger>配送について</template>
  <p>ご注文から 3 営業日以内に発送します。</p>
</SlideDownUi>`,
  dropdown: `<DropdownUi contentAlignment="left" contentsWidth="16rem">
  <template #trigger>メニュー</template>
  <template #contents>
    <ul><li>プロフィール</li><li>設定</li></ul>
  </template>
</DropdownUi>`,
  modal: `<ModalBox
  :isShown="isModalShown"
  size="small"
  @closeModal="isModalShown = false"
>
  <template #header><h4>確認</h4></template>
  <p>この内容で送信します。</p>
</ModalBox>`,
  spinner: `<!-- LoadingSpinner はサイズを持たないので親で指定する -->
<span style="display: block; inline-size: 2rem; fill: var(--primary-color);">
  <LoadingSpinner />
</span>`,
}
</script>

<template>
  <div :class="$style.page">
    <DemoSection
      id="tabui"
      :sources="[{ label: 'TabUI', path: componentSource('TabUI') }]"
      title="TabUI"
      description="tabs の key に対応する #<key>Contents スロットに中身を書く。タブリストにフォーカスがあるとき、左右キーで移動できる。"
      :code="CODE.tab"
    >
      <TabUI
        :tabs="[
          { key: 'tabA', label: '概要' },
          { key: 'tabB', label: '仕様' },
        ]"
      >
        <template #tabAContents>
          <p :class="$style.plain">
            タブの見出しは tabs の label、中身は #&lt;key&gt;Contents
            スロットで差し込む。
          </p>
        </template>
        <template #tabBContents>
          <dl :class="$style.state">
            <div>
              <dt>role</dt>
              <dd>tablist / tab / tabpanel</dd>
            </div>
            <div>
              <dt>キーボード操作</dt>
              <dd>← → で移動（端で反対側へ回る）</dd>
            </div>
            <div>
              <dt>初期表示</dt>
              <dd>initialIndex（範囲外なら先頭）</dd>
            </div>
          </dl>
        </template>
      </TabUI>
    </DemoSection>

    <DemoSection
      id="slidedownui"
      :sources="[
        { label: 'SlideDownUi', path: componentSource('SlideDownUi') },
      ]"
      title="SlideDownUi"
      description="アコーディオン。summary スロットが見出し、デフォルトスロットが中身。"
      :code="CODE.slideDown"
    >
      <div :class="$style.narrow">
        <SlideDownUi>
          <template #trigger> 配送について </template>
          <p :class="$style.plain">
            ご注文から 3
            営業日以内に発送します。離島の場合は追加で日数をいただきます。
          </p>
        </SlideDownUi>
      </div>
    </DemoSection>

    <DemoSection
      id="dropdownui"
      :sources="[{ label: 'DropdownUi', path: componentSource('DropdownUi') }]"
      title="DropdownUi"
      description="トリガーをクリックすると中身を表示する。contentAlignment で表示位置を調整。"
      :code="CODE.dropdown"
    >
      <DropdownUi contentAlignment="left" contentsWidth="16rem">
        <template #trigger> メニュー </template>
        <template #contents>
          <ul :class="$style.menu">
            <li>プロフィール</li>
            <li>設定</li>
            <li>ログアウト</li>
          </ul>
        </template>
      </DropdownUi>
    </DemoSection>

    <DemoSection
      id="modalbox"
      :sources="[{ label: 'ModalBox', path: componentSource('ModalBox') }]"
      title="ModalBox"
      description="isShown で表示を制御し、closeModal イベントで閉じる。表示中は背面のスクロールをロック。"
      :code="CODE.modal"
    >
      <BasicButton buttonType="button" @click="isModalShown = true">
        モーダルを開く
      </BasicButton>
      <ModalBox
        :isShown="isModalShown"
        size="small"
        @closeModal="isModalShown = false"
      >
        <template #header>
          <h4 :class="$style.modalHeading">確認</h4>
        </template>
        <p :class="$style.plain">この内容で送信します。よろしいですか？</p>
        <template #footer>
          <BasicButton buttonType="button" @click="isModalShown = false">
            閉じる
          </BasicButton>
        </template>
      </ModalBox>
    </DemoSection>

    <DemoSection
      id="loadingspinner"
      :sources="[
        { label: 'LoadingSpinner', path: componentSource('LoadingSpinner') },
      ]"
      title="LoadingSpinner"
      description="サイズを持たない SVG なので、親要素で大きさと色（fill）を指定する。"
      :code="CODE.spinner"
    >
      <span :class="$style.spinner">
        <LoadingSpinner />
      </span>
    </DemoSection>
  </div>
</template>

<style lang="scss" module>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.narrow {
  max-width: 28rem;
}

.plain {
  margin: 0;
  font-size: var(--fs-small);
}

.state {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
  font-size: var(--fs-small);

  > div {
    display: grid;
    grid-template-columns: 10rem 1fr;
    gap: 0.5rem;
  }

  dt {
    color: var(--gray);
  }

  dd {
    margin: 0;
    word-break: break-word;
  }
}

.menu {
  padding: 0.5rem 0;

  > li {
    padding: 0.4rem 0.75rem;
    cursor: pointer;

    &:hover {
      background-color: var(--sub-color);
    }
  }
}

.modalHeading {
  margin: 0;
  font-size: 1rem;
}

.spinner {
  display: block;
  inline-size: 2rem;
  block-size: 2rem;
  fill: var(--primary-color);
}
</style>
