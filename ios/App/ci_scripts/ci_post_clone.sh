#!/bin/zsh
# Xcode Cloud post-clone hook.
#
# Ce script tourne juste apres le clone du repo, avant que Xcode ne resolve
# les dependances SwiftPM et ne lance le build. Plusieurs elements necessaires
# au build iOS sont generes localement et donc volontairement absents de git
# (.gitignore) :
#   - node_modules/@capacitor/filesystem et node_modules/@capacitor/share,
#     references par chemin local dans ios/App/CapApp-SPM/Package.swift
#   - ios/App/App/public (copie du build web `dist/`)
#   - ios/App/App/capacitor.config.json et config.xml
# On les regenere donc ici avant que Xcode Cloud n'en ait besoin.

set -e
set -x

echo "==> ci_post_clone: installation de Node.js si necessaire"
if ! command -v node > /dev/null 2>&1; then
  brew install node
fi

node --version
npm --version

cd "$CI_PRIMARY_REPOSITORY_PATH"

echo "==> ci_post_clone: npm install a la racine du repo"
npm ci || npm install

echo "==> ci_post_clone: build web (vite build -> dist/)"
npm run build

echo "==> ci_post_clone: cap sync ios (copie dist/ + config vers ios/App/App)"
npx cap sync ios

# Xcode Cloud fournit $CI_BUILD_NUMBER (entier croissant a chaque run) —
# on l'utilise comme CFBundleVersion via agvtool plutot que de coder un
# numero en dur dans project.pbxproj, qui finit toujours par retomber
# derriere ce qui a deja ete uploade sur App Store Connect (rejets
# "bundle version must be higher than the previously uploaded version").
# Necessite VERSIONING_SYSTEM = apple-generic sur la target App (deja
# configure). Doc Apple : "Setting the next build number for Xcode
# Cloud builds".
if [ -n "$CI_BUILD_NUMBER" ]; then
  echo "==> ci_post_clone: agvtool new-version -all $CI_BUILD_NUMBER"
  cd "$CI_PRIMARY_REPOSITORY_PATH/ios/App"
  agvtool new-version -all "$CI_BUILD_NUMBER"
else
  echo "==> ci_post_clone: CI_BUILD_NUMBER absent (build hors Xcode Cloud) — CURRENT_PROJECT_VERSION du repo laisse tel quel"
fi

echo "==> ci_post_clone: termine"
