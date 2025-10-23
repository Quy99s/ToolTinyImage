#!/bin/bash

echo "🛠️  Tool Tiny Image - Thiết lập để chạy từ Finder"
echo "================================================="
echo ""

# Lấy thư mục hiện tại
CURRENT_DIR=$(pwd)

echo "📁 Thư mục hiện tại: $CURRENT_DIR"
echo ""

# Cấp quyền thực thi cho tất cả script cần thiết
echo "⚙️  Đang cấp quyền thực thi cho các script..."

chmod +x "Chạy Tool Tiny Image.command"
chmod +x "Mở App.command"
chmod +x "start-app.sh"
chmod +x "Tool Tiny Image.app/Contents/MacOS/Tool Tiny Image"

echo "✅ Đã cấp quyền thực thi"
echo ""

# Kiểm tra Node.js
echo "🔍 Kiểm tra môi trường..."
if command -v node &> /dev/null; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js chưa được cài đặt"
    echo "   Vui lòng cài đặt từ: https://nodejs.org"
    echo ""
fi

if command -v npm &> /dev/null; then
    echo "✅ npm: $(npm --version)"
else
    echo "❌ npm chưa được cài đặt"
    echo ""
fi

echo ""
echo "🎉 Thiết lập hoàn thành!"
echo ""
echo "📋 Bây giờ bạn có thể:"
echo ""
echo "1️⃣  Double-click file: 📁 Tool Tiny Image.app"
echo "2️⃣  Double-click file: 📄 Chạy Tool Tiny Image.command"  
echo "3️⃣  Double-click file: 📄 Mở App.command"
echo ""
echo "💡 Khuyến nghị: Sử dụng file .app để có trải nghiệm tốt nhất!"
echo ""
echo "📖 Đọc thêm hướng dẫn chi tiết tại: HUONG-DAN-CHAY-TU-FINDER.md"