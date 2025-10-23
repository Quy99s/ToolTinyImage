#!/bin/bash

echo "🔧 Tool Tiny Image - Setup Cấu hình"
echo "===================================="
echo ""

# Hàm hiển thị menu
show_menu() {
    echo "Chọn cách thiết lập API Key:"
    echo "1. Lưu vào file config.json (khuyến nghị)"
    echo "2. Thiết lập biến môi trường (.env)"
    echo "3. Kiểm tra cấu hình hiện tại"
    echo "4. Thoát"
    echo ""
}

# Hàm thiết lập config file
setup_config_file() {
    echo "📝 Thiết lập API Key trong file config.json"
    echo ""
    read -p "Nhập API Key TinyPNG: " api_key
    
    if [ -z "$api_key" ]; then
        echo "❌ API Key không được để trống!"
        return 1
    fi
    
    node index.js config --set "$api_key"
    echo ""
    echo "✅ Hoàn tất! Bây giờ bạn có thể chạy:"
    echo "   ./run.sh ./sample-images ./compressed-images"
    echo "   (không cần cung cấp API key)"
}

# Hàm thiết lập biến môi trường
setup_env_file() {
    echo "📝 Thiết lập biến môi trường trong file .env"
    echo ""
    read -p "Nhập API Key TinyPNG: " api_key
    
    if [ -z "$api_key" ]; then
        echo "❌ API Key không được để trống!"
        return 1
    fi
    
    # Tạo file .env
    echo "TINIFY_API_KEY=$api_key" > .env
    echo "✅ Đã tạo file .env với API Key"
    echo ""
    echo "✅ Hoàn tất! Bây giờ bạn có thể chạy:"
    echo "   ./run.sh ./sample-images ./compressed-images"
    echo "   (không cần cung cấp API key)"
}

# Hàm kiểm tra cấu hình
check_config() {
    echo "🔍 Kiểm tra cấu hình hiện tại..."
    echo ""
    node index.js config --check
}

# Main menu loop
while true; do
    show_menu
    read -p "Nhập lựa chọn (1-4): " choice
    echo ""
    
    case $choice in
        1)
            setup_config_file
            echo ""
            ;;
        2)
            setup_env_file
            echo ""
            ;;
        3)
            check_config
            echo ""
            ;;
        4)
            echo "👋 Tạm biệt!"
            exit 0
            ;;
        *)
            echo "❌ Lựa chọn không hợp lệ. Vui lòng chọn 1-4"
            echo ""
            ;;
    esac
done