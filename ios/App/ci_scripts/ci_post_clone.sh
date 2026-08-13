#!/bin/zsh
# Xcode Cloud post-clone hook.
# Ce script tourne juste après le clone du repo, avant que Xcode ne resolve
# les dependances SwiftPM. Le package local CapApp-SPM/Package.swift pointe
# vers node_modules/@capacitor/filesystem et node_modules/@capacitor/share
# (chemins locaux, generes par `npx cap sync ios`) -- mais node_modules n'est
# pas versionne dans git, donc sur une machine Xcode Cloud fraiche ce dossier
# n'existe pas encore. On installe donc les dependances npm ici avant que la
# resolution SwiftPM ne s'execute.

set -e
set -x

echo "==> ci_post_clone: installation de Node.js si necessaire"
if ! command -v node > /dev/null 2>&1; then
  brew install node
fi

node --version
npm --version

echo "==> ci_post_clone: npm install a la racine du repo"
cd "$CI_PRIMARY_REPOSITORY_PATH"
npm ci || npm install

echo "==> ci_post_clone: termine"
