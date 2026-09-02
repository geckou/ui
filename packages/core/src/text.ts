const FULL_WIDTH_ALPHANUMERIC = /[Ａ-Ｚａ-ｚ０-９]/g

/** 全角の英数字を半角へ変換する。全角以外の文字はそのまま残す */
export function convertFullWidthToHalfWidth(value: string): string {
  return value.replace(FULL_WIDTH_ALPHANUMERIC, (character) =>
    String.fromCharCode(character.charCodeAt(0) - 0xfee0)
  )
}
