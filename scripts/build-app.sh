#!/bin/bash

echo "📦 Tool Tiny Image - Build App"
echo "==============================="
echo ""

# Kiểm tra hệ điều hành
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    CYGWIN*)    MACHINE=Cygwin;;
    MINGW*)     MACHINE=MinGw;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "🖥️  Hệ điều hành: $MACHINE"
echo ""

# Build app tương ứng với hệ điều hành
if [ "$MACHINE" = "Mac" ]; then
    echo "🍎 Building cho macOS..."
    npm run build-mac
elif [ "$MACHINE" = "Linux" ]; then
    echo "🐧 Building cho Linux..."
    npm run build
else
    echo "🪟 Building cho Windows..."
    npm run build-win
fi

echo ""
echo "✅ Build hoàn thành! Check thư mục 'dist' để tìm file cài đặt."