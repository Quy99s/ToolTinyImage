# 🖼️ Tool Tiny Image - Nén ảnh với TinyPNG

Tool tự động nén tất cả ảnh trong thư mục bằng TinyPNG API, giữ nguyên cấu trúc thư mục để review.

**✨ FINDER READY**: Double-click để chạy trực tiếp từ Finder, không cần VS Code!

## ✨ Tính năng

- 🖼️ Hỗ trợ các định dạng: JPG, JPEG, PNG, WebP
- 📁 Giữ nguyên cấu trúc thư mục gốc
- 🔄 Xử lý đệ quy tất cả thư mục con
- 📊 Hiển thị thống kê chi tiết và progress bar
- 💾 Tính toán dung lượng tiết kiệm real-time
- 🎨 **MỚI**: Giao diện GUI đẹp mắt và dễ sử dụng
- ⚙️ **MỚI**: Quản lý API Key thông minh
- 🚀 **MỚI**: Chạy như ứng dụng desktop (double-click)

## 🚀 Cài đặt nhanh

```bash
# Clone hoặc tải về project
cd ToolTinyImage

# Cài đặt dependencies
npm install

# Chạy ứng dụng GUI
./start-app.sh
# hoặc
npm start
```

## 🖥️ Sử dụng GUI App (Khuyến nghị)

### Chạy ứng dụng:
```bash
./start-app.sh
```

### Giao diện thân thiện:
1. **🔑 Nhập API Key**: Paste API Key và click "Lưu"
2. **📁 Chọn thư mục nguồn**: Click button để chọn thư mục chứa ảnh
3. **📁 Chọn thư mục đích**: Click button để chọn nơi lưu ảnh đã nén
4. **🚀 Bắt đầu nén**: Click "Bắt đầu nén ảnh"
5. **📊 Theo dõi**: Xem progress bar, thống kê real-time và log chi tiết

### Build thành ứng dụng standalone:
```bash
# Build cho hệ điều hành hiện tại
./build-app.sh

# Hoặc build cụ thể:
npm run build-mac    # macOS
npm run build-win    # Windows  
npm run build        # Linux
```

Sau khi build, file ứng dụng sẽ có trong thư mục `dist/`:
- **macOS**: `Tool Tiny Image.app`
- **Windows**: `Tool Tiny Image.exe`
- **Linux**: `Tool Tiny Image.AppImage`

## 🔑 Quản lý API Key

### Lấy API Key TinyPNG
1. Truy cập: https://tinypng.com/developers
2. Đăng ký tài khoản miễn phí
3. Lấy API Key (500 ảnh miễn phí mỗi tháng)

### Thiết lập API Key

#### Cách 1: Trong GUI App
- Nhập API Key vào ô đầu tiên
- Click "Lưu" để lưu vĩnh viễn

#### Cách 2: Setup script (cho CLI)
```bash
./setup.sh
```

#### Cách 3: Command line
```bash
# Lưu API Key
node index.js config --set YOUR_API_KEY

# Kiểm tra config
node index.js config --check
```

## 💻 Command Line Interface (CLI)

### Chạy nhanh (sau khi setup API Key)
```bash
./quick-run.sh <thư_mục_nguồn> <thư_mục_đích>
```

### Chạy với API Key được cung cấp
```bash
./run.sh <thư_mục_nguồn> <thư_mục_đích> <api_key>
```

### Command đầy đủ
```bash
node index.js compress --source <thư_mục_nguồn> --output <thư_mục_đích> [--key <api_key>]
```

## 📂 Cấu trúc thư mục

Tool sẽ giữ nguyên cấu trúc thư mục gốc:

```
Thư mục nguồn:
├── photo1.jpg
├── photo2.png
└── subfolder/
    ├── photo3.jpg
    └── nested/
        └── photo4.png

Thư mục đích (sau khi nén):
├── photo1.jpg          (đã nén)
├── photo2.png          (đã nén)
└── subfolder/
    ├── photo3.jpg      (đã nén)
    └── nested/
        └── photo4.png  (đã nén)
```

## 📊 Thông tin hiển thị

### GUI App:
- 📈 Progress bar real-time
- 📊 Thống kê: tổng ảnh, đã nén, thất bại, dung lượng tiết kiệm
- 📝 Log chi tiết từng file
- ✅ Kết quả tổng kết đẹp mắt

### CLI:
- ✅ Tiến trình nén từng ảnh
- 📈 Dung lượng tiết kiệm cho mỗi ảnh
- 📊 Thống kê tổng kết cuối cùng

## 🛠️ Scripts có sẵn

### GUI Scripts:
- `./start-app.sh` - Chạy ứng dụng GUI
- `./build-app.sh` - Build thành ứng dụng standalone

### CLI Scripts:
- `./setup.sh` - Thiết lập API Key lần đầu
- `./quick-run.sh` - Chạy nhanh với config đã lưu
- `./run.sh` - Chạy với API Key được cung cấp
- `./create-sample.js` - Tạo thư mục mẫu để test

## ⚠️ Lưu ý

- Cần kết nối internet để sử dụng TinyPNG API
- API miễn phí giới hạn 500 ảnh/tháng
- Tool chỉ xử lý các file ảnh được hỗ trợ (JPG, JPEG, PNG, WebP)
- Thư mục đích sẽ được tạo tự động nếu chưa tồn tại
- File `config.json` và `.env` sẽ được git ignore để bảo mật

## 🎯 So sánh GUI vs CLI

| Tính năng | GUI App | CLI |
|-----------|---------|-----|
| Dễ sử dụng | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Giao diện | Đẹp, trực quan | Text-based |
| Progress tracking | Real-time với bar | Text progress |
| Chọn thư mục | Click button | Nhập đường dẫn |
| Thống kê | Real-time, đầy đủ | Cuối quá trình |
| Phù hợp cho | Người dùng thông thường | Developer, automation |

## 📝 License

MIT License