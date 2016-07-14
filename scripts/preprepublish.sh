#!/bin/bash

if [[ -z $(git status -uno --porcelain) ]]; then
  VERSION="$(npm view redux-observable version)";
  read -p "Enter the new version number: (currently ${VERSION}) " BUMP;
  VERSION="$(npm version $BUMP --no-git-tag-version)";
  conventional-changelog -p angular -i CHANGELOG.md -s;
  git diff package.json CHANGELOG.md;
  read -p "Look good? (y/n) " CONDITION;
  if [ "$CONDITION" == "y" ]; then
    git add package.json CHANGELOG.md;
    git commit -m "chore(publish): ${VERSION}";
    git tag "${VERSION}";
    git push origin "${VERSION}";
  else
    git checkout -f package.json CHANGELOG.md;
    echo "Cancelled publish by your request!";
    exit 1;
  fi
else
  echo "You cannot publish with uncommited changes";
  exit 1;
fi
