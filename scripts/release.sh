#!/usr/bin/env bash
# 指定パッケージのバージョンを上げてタグを push し、publish ワークフローを起動する。
#   yarn release <core|vue|react> [patch|minor|major|<version>]
#
# タグは <パッケージのディレクトリ名>@<バージョン> 形式（例: vue@0.3.0）。
# publish ワークフローはこのタグから対象パッケージを判別する。
set -euo pipefail

PACKAGE="${1:-}"
BUMP="${2:-patch}"

if [ -z "$PACKAGE" ]; then
  echo "パッケージを指定してください: yarn release <core|vue|react> [patch|minor|major|<version>]" >&2
  exit 1
fi

PACKAGE_DIR="packages/$PACKAGE"

if [ ! -f "$PACKAGE_DIR/package.json" ]; then
  echo "$PACKAGE_DIR が存在しません。" >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "コミットされていない変更があります。先にコミットしてください。" >&2
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "production" ]; then
  echo "production ブランチで実行してください（現在: $BRANCH）" >&2
  exit 1
fi

git pull --rebase origin production

case "$BUMP" in
  patch|minor|major) (cd "$PACKAGE_DIR" && yarn version "--$BUMP" --no-git-tag-version) ;;
  *)                 (cd "$PACKAGE_DIR" && yarn version --new-version "$BUMP" --no-git-tag-version) ;;
esac

VERSION="$(node -p "require('./$PACKAGE_DIR/package.json').version")"
NAME="$(node -p "require('./$PACKAGE_DIR/package.json').name")"
TAG="$PACKAGE@$VERSION"

git add "$PACKAGE_DIR/package.json"
git commit -m "chore(release): $NAME v$VERSION"
git tag "$TAG"

git push origin production
# タグは 1 本ずつ push する（4 本以上まとめると GitHub がワークフローを起動しない）
git push origin "$TAG"

echo "$TAG を push しました。publish ワークフロー: https://github.com/geckou/ui/actions/workflows/publish.yml"
