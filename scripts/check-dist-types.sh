#!/usr/bin/env bash
# ビルド後の .d.ts が、tarball に含まれないパス（packages/core/src）を参照していないか検査する。
#
# tsconfig の paths（@geckou/ui-core → ../core/src/index.ts）を vite-plugin-dts が
# 相対パスへ書き換えるため、設定を戻すと dist/**/*.d.ts が
# `from '../../../core/src/index.ts'` を含むようになる。
# files: ["dist"] なので tarball に core のソースは入らず、利用側で型が any になる。
# 型チェックにもテストにも引っかからないので、ここで機械的に落とす。
set -euo pipefail

cd "$(dirname "$0")/.."

status=0

for dir in packages/*/dist; do
  [ -d "$dir" ] || continue

  if hits=$(grep -rn --include='*.d.ts' "core/src" "$dir" 2>/dev/null); then
    echo "❌ $dir の型定義がパッケージ外の core/src を参照しています:"
    echo "$hits"
    status=1
  fi
done

if [ "$status" -eq 0 ]; then
  echo "✅ dist の型定義に core/src への参照はありません"
fi

exit "$status"
