// DOM id / name の重複を避けるための連番。
//
// vue の useId() はアプリ単位でしか一意にならず、同じページに 2 つのアプリを
// マウントすると両方が v-0 から始まって id が衝突する。
// モジュールスコープの連番なら、同じバンドルを共有する限り重複しない。
let sequence = 0

export function nextUniqueId(prefix: string): string {
  sequence += 1

  return `${prefix}_${sequence}`
}
