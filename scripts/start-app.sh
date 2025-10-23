#!/bin/bash

echo "🚀 Tool Tiny Image - GUI App"
echo "============================="
echo ""

# Kiểm tra xem đã cài đặt dependencies chưa
if [ ! -d "node_modules" ]; then
    echo "📦 Cài đặt dependencies..."
    npm install
fi

echo "🖼️  Khởi chạy ứng dụng GUI..."
npm start