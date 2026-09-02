import type { Ref } from 'vue'
import { onMounted, onBeforeUnmount } from 'vue'

/**
 * 要素の外側が押されたときに handler を呼ぶ。
 *
 * 以前は `v-click-outside` ディレクティブを前提にしていたが、`app.directive()` の
 * 登録がどこにも無く、単体 import でも `install` 経由でも解決できずに
 * 「Failed to resolve directive」で黙って無効化されていた。
 * 利用側の登録に依存しないよう、コンポーネントから直接呼ぶ形にしている。
 *
 * React 版（DropdownUi.tsx）と揃えて pointerdown を使う。click だと
 * 押した位置と離した位置がまたぐ操作で閉じない。
 */
export function useClickOutside(
  target: Ref<HTMLElement | null>,
  handler: () => void
) {
  const handlePointerDown = (event: PointerEvent) => {
    const element = target.value

    if (element && !element.contains(event.target as Node)) {
      handler()
    }
  }

  onMounted(() => document.addEventListener('pointerdown', handlePointerDown))
  onBeforeUnmount(() =>
    document.removeEventListener('pointerdown', handlePointerDown)
  )
}
