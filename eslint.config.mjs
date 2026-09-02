// demo/ のための設定。packages/* はそれぞれの eslint.config.mjs を持ち、
// yarn workspaces run lint で実行される（プリセットは重ねて使えないため、
// 対象ごとに設定を分ける）
import vue from '@geckou/eslint-config/vue'

export default vue
