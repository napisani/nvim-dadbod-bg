#!/usr/bin/env bash

NPM_BIN=$(which npm)
if [[ ! -x "$NPM_BIN" ]]; then
  echo "npm is not installed - aborting install"
  exit 1
fi

GO_BIN=$(which go)
MAKE_BIN=$(which make)
if [[ -x "$GO_BIN" && -x "${MAKE_BIN}" ]]; then
	echo "Go is installed - building from source"
	make
	exit 0
else
	echo "Go is not installed - downloading binary..."
fi

CURL_BIN=$(which curl)
if [[ ! -x "$CURL_BIN" ]]; then
	echo "curl is not installed - aborting install"
	exit 1
fi

GIT_BIN=$(which git)
if [[ ! -x "$GIT_BIN" ]]; then
	echo "git is not installed - aborting install"
	exit 1
fi

TAG=$(git describe --tags --abbrev=0)

IS_MACOS=$(uname -s | grep -i Darwin)
IS_LINUX=$(uname -s | grep -i Linux)
ARCH=$(uname -m)
echo "Detected OS: $IS_MACOS $IS_LINUX $ARCH"
if [[ -n "$IS_MACOS" || -n "$IS_LINUX" ]] ; then
	echo "Downloading binary for tag $TAG"
	OS="$([[ -n "$IS_MACOS" ]] && printf Darwin || printf Linux)"
	URL="https://github.com/napisani/nvim-dadbod-bg/releases/download/${TAG}/nvim-dadbod-bg_${OS}_${ARCH}"
	curl -L -o nvim-dadbod-bg "$URL"
	chmod +x nvim-dadbod-bg
	echo "Building web app"
	if [[ -x "$MAKE_BIN" ]]; then
		"$MAKE_BIN" buildweb
	else
		cd web || exit 2
		"$NPM_BIN" ci
		"$NPM_BIN" run build
	fi
else
	echo "Unsupported OS"
	exit 1
fi
