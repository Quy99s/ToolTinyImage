#!/bin/bash

echo "🔧 Tool Tiny Image - Sửa quyền thư mục"
echo "====================================="
echo ""

# Đường dẫn thư mục project
PROJECT_DIR="/Users/quy99/Desktop/MyFolder/Extention/ToolTinyImage"

echo "📁 Thư mục project: $PROJECT_DIR"
echo ""

# Kiểm tra thư mục tồn tại
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Thư mục không tồn tại!"
    exit 1
fi

echo "🔍 Kiểm tra quyền hiện tại..."
ls -la "$PROJECT_DIR"
echo ""

# Sửa quyền thư mục và file
echo "🔧 Đang sửa quyền thư mục và file..."

# Cấp quyền cho thư mục
chmod -R 755 "$PROJECT_DIR"

# Cấp quyền đặc biệt cho các script
chmod +x "$PROJECT_DIR"/*.sh 2>/dev/null || true
chmod +x "$PROJECT_DIR"/*.command 2>/dev/null || true
chmod +x "$PROJECT_DIR/Tool Tiny Image.app/Contents/MacOS/Tool Tiny Image" 2>/dev/null || true

# Cấp quyền write cho user
chown -R $(whoami) "$PROJECT_DIR" 2>/dev/null || true

echo "✅ Đã sửa quyền thành công!"
echo ""

echo "🔍 Quyền sau khi sửa:"
ls -la "$PROJECT_DIR" | head -10
echo ""

# Thử chạy npm để kiểm tra
echo "🧪 Test chạy npm..."
cd "$PROJECT_DIR"
npm --version && echo "✅ npm hoạt động bình thường" || echo "❌ npm vẫn có vấn đề"

echo ""
echo "🎉 Hoàn thành! Bây giờ hãy thử double-click file .app hoặc .command"