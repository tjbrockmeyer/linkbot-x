set -e

VERSION=$1
if [[ -z $VERSION ]]; then
    echo "usage: $0 <version>"
    exit 1
fi

if [[ -n "$(git status --porcelain=v1 2>/dev/null)" ]]; then
    echo "there are uncommitted changes - resolve your changes before tagging"
    exit 1
fi

npm test
npm run build

git tag -a "$VERSION" -m "Release version $VERSION"

echo "Tag finished!"
