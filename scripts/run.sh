#!/bin/bash

# Script để chạy tool TinyImage một cách dễ dàng

echo "🖼️  Tool Tiny Image - Nén ảnh bằng TinyPNG"
echo "========================================="
echo ""

# Kiểm tra xem có tham số không
if [ $# -eq 0 ]; then
    echo "Cách sử dụng:"
    echo "  ./run.sh <thư_mục_nguồn> <thư_mục_đích> <api_key>"
    echo ""
    echo "Ví dụ:"
    echo "  ./run.sh ./sample-images ./compressed-images YOUR_API_KEY"
    echo ""
    echo "💡 Lấy API Key miễn phí tại: https://tinypng.com/developers"
    exit 1
fi

# Kiểm tra số lượng tham số
if [ $# -ne 3 ]; then
    echo "❌ Vui lòng cung cấp đủ 3 tham số: <thư_mục_nguồn> <thư_mục_đích> <api_key>"
    exit 1
fi

SOURCE_DIR=$1
OUTPUT_DIR=$2
API_KEY=$3

# Chạy tool
node index.js compress --source "$SOURCE_DIR" --output "$OUTPUT_DIR" --key "$API_KEY"