#!/bin/bash

# Màu sắc
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Lấy thư mục script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Header
echo ""
echo -e "${BLUE}╔══════════════════════════════════╗${NC}"
echo -e "${BLUE}║        🖼️  TOOL TINY IMAGE       ║${NC}"
echo -e "${BLUE}║         Finder Ready v2.0        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════╝${NC}"
echo ""

# Setup PATH
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:$PATH"

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js không tìm thấy!${NC}"
    echo "Vui lòng cài đặt Node.js từ: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js:${NC} $(node --version)"
echo -e "${GREEN}✅ Electron:${NC} $(./node_modules/.bin/electron --version 2>/dev/null || echo 'Chưa cài')"
echo ""

# Cài đặt dependencies nếu cần
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Cài đặt dependencies...${NC}"
    npm install --silent
fi

# Khởi chạy app
echo -e "${BLUE}🚀 Khởi chạy Tool Tiny Image...${NC}"
echo ""

# Sử dụng npm start thay vì node app.js
npm start

echo ""
echo -e "${YELLOW}Nhấn Enter để thoát...${NC}"
read -r