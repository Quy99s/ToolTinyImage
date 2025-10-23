# 🖼️ Tool Tiny Image v2.0

Tool nén ảnh chuyên nghiệp với TinyPNG API - Cấu trúc gọn gàng, dễ sử dụng

## ✨ Tính năng chính

- 🎯 Nén tất cả ảnh (JPG, PNG, WebP) tự động
- 📁 Giữ nguyên cấu trúc thư mục gốc
- 📊 Thống kê chi tiết: % nén, dung lượng tiết kiệm
- 🖥️ GUI đẹp mắt + CLI mạnh mẽ
- 🚀 Chạy trực tiếp từ Finder (double-click)
- 🔑 Quản lý API key thông minh

## 🚀 Cách sử dụng nhanh

### 1. Từ Finder (Khuyến nghị)
```bash
# Double-click file này:
start.command
```

### 2. Từ Terminal
```bash
# GUI mode
npm start

# CLI mode
npm run cli
```

## 🗂️ Cấu trúc Project

```
ToolTinyImage/
├── 🚀 start.command           # Launcher chính
├── 🏗️ Tool Tiny Image.app     # macOS app bundle
├── 📱 app.js                  # Helper launcher
├── 💻 cli.js                  # CLI interface
├── 📁 src/
│   ├── gui/                   # GUI components
│   │   ├── main.js           # Electron main
│   │   ├── index.html        # UI
│   │   ├── renderer.js       # Frontend
│   │   └── style.css         # Styling
│   └── cli/                  # CLI (future)
├── 📚 lib/
│   └── image-processor.js    # Core engine
├── 🛠️ scripts/              # Helper scripts
└── 📄 package.json          # Config
```

## 🔧 Setup lần đầu

1. **Cài dependencies**
   ```bash
   npm install
   ```

2. **Lấy TinyPNG API Key**
   - Đăng ký: https://tinypng.com/developers
   - Free: 500 ảnh/tháng

3. **Cấp quyền** (macOS)
   ```bash
   chmod +x start.command
   ```

## 📱 Giao diện GUI

- **API Key**: Nhập + lưu tự động
- **Folder Selection**: Chọn thư mục nguồn/đích
- **Real-time Progress**: Thanh tiến trình + stats
- **Detailed Logs**: Theo dõi từng file

## 💻 CLI Commands

```bash
# Nén ảnh với options
node cli.js compress -s ./images -o ./compressed -k YOUR_API_KEY

# Lưu API key
node cli.js config --set YOUR_API_KEY

# Xem API key
node cli.js config --show
```

## 🎯 Ví dụ Output

```
Original/
├── photos/image1.jpg (2MB)
└── docs/logo.png (500KB)

↓ Compressed ↓

Original_compressed_20241023/  
├── photos/image1.jpg (800KB) ⬇️ 60%
└── docs/logo.png (200KB) ⬇️ 60%

📊 Tiết kiệm: 1.3MB (59.1%)
```

## 🛠️ Troubleshooting

### Lỗi Node.js không tìm thấy
```bash
# Kiểm tra PATH
echo $PATH

# Cài Node.js từ: https://nodejs.org/
```

### Permission denied
```bash
chmod +x start.command
chmod +x "Tool Tiny Image.app/Contents/MacOS/Tool Tiny Image"
```

### EPERM errors
- ✅ **Đã fix**: Dùng npm start thay vì direct Electron

## 📈 Performance

- **Tốc độ**: 2-3 ảnh/giây
- **Formats**: JPG, PNG, WebP
- **Max size**: 5MB/ảnh
- **Limit**: 500 ảnh/tháng (free)

## 🎯 Quick Commands

```bash
# Test nhanh
./start.command

# Build app
npm run build-mac

# CLI help
node cli.js --help
```

---
*Made with ❤️ - Clean & Simple Image Compression*