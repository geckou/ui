import { useId } from 'vue'

// DOM id / name の重複を避けるための一意な値。
//
// モジュールスコープの連番だと、サーバーではプロセス内で増え続け、クライアントは
// 1 から始まるため、SSR（Nuxt）で id が一致せず hydration mismatch になる。
// vue の useId() は SSR と client で同じ値を返す。
// 同じページに 2 つのアプリをマウントする場合の衝突は app.config.idPrefix で分ける。
let sequence = 0

/**
 * setup の中から呼ぶこと（useId() が使えるのはコンポーネントのインスタンスがある間だけ）。
 * 外から呼ばれた場合はモジュールスコープの連番へ退避する
 */
export function nextUniqueId(prefix: string): string {
  const id = useId()

  if (id) {
    return `${prefix}_${id}`
  }

  sequence += 1

  return `${prefix}_${sequence}`
}
