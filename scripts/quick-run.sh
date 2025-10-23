#!/bin/bash

# Script chạy nhanh tool TinyImage với config đã lưu

echo "🖼️  Tool Tiny Image - Chạy Nhanh"
echo "==============================="
echo ""

# Kiểm tra tham số
if [ $# -eq 0 ]; then
    echo "Cách sử dụng:"
    echo "  ./quick-run.sh <thư_mục_nguồn> <thư_mục_đích>"
    echo ""
    echo "Ví dụ:"
    echo "  ./quick-run.sh ./sample-images ./compressed-images"
    echo ""
    echo "💡 Script này sử dụng API Key đã được lưu trong config hoặc .env"
    exit 1
fi

if [ $# -ne 2 ]; then
    echo "❌ Vui lòng cung cấp đủ 2 tham số: <thư_mục_nguồn> <thư_mục_đích>"
    exit 1
fi

SOURCE_DIR=$1
OUTPUT_DIR=$2

# Kiểm tra xem có API key được thiết lập không
echo "🔍 Kiểm tra cấu hình API Key..."
node index.js config --get > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Chưa thiết lập API Key!"
    echo ""
    echo "Vui lòng chạy setup trước:"
    echo "  ./setup.sh"
    echo ""
    echo "Hoặc sử dụng:"
    echo "  ./run.sh \"$SOURCE_DIR\" \"$OUTPUT_DIR\" YOUR_API_KEY"
    exit 1
fi

echo "✅ Đã tìm thấy API Key"
echo ""

# Chạy tool mà không cần API key
node index.js compress --source "$SOURCE_DIR" --output "$OUTPUT_DIR"