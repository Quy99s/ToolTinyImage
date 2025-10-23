#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const tinify = require('tinify');
const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');

// Các định dạng ảnh được hỗ trợ
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];

// Đường dẫn file config
const CONFIG_FILE = path.join(__dirname, 'config.json');

// Hàm đọc API key từ các nguồn khác nhau
function getApiKey(providedKey) {
    // 1. Ưu tiên API key được cung cấp trực tiếp
    if (providedKey) {
        return providedKey;
    }
    
    // 2. Đọc từ biến môi trường
    if (process.env.TINIFY_API_KEY) {
        return process.env.TINIFY_API_KEY;
    }
    
    // 3. Đọc từ file config
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            if (config.apiKey) {
                return config.apiKey;
            }
        }
    } catch (error) {
        // Bỏ qua lỗi đọc config
    }
    
    return null;
}

// Hàm lưu API key vào config
function saveApiKey(apiKey) {
    try {
        const config = {
            apiKey: apiKey,
            savedAt: new Date().toISOString()
        };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error(chalk.red('Lỗi lưu config:'), error.message);
        return false;
    }
}

// Hàm hiển thị trạng thái config
function showConfigStatus() {
    console.log(chalk.cyan('📋 TRẠNG THÁI CẤU HÌNH:'));
    
    // Kiểm tra biến môi trường
    if (process.env.TINIFY_API_KEY) {
        console.log(chalk.green('✅ Biến môi trường TINIFY_API_KEY: Đã thiết lập'));
    } else {
        console.log(chalk.yellow('⚠️  Biến môi trường TINIFY_API_KEY: Chưa thiết lập'));
    }
    
    // Kiểm tra file config
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            if (config.apiKey) {
                const maskedKey = config.apiKey.substring(0, 8) + '*'.repeat(config.apiKey.length - 8);
                console.log(chalk.green(`✅ File config: ${maskedKey} (Lưu lúc: ${new Date(config.savedAt).toLocaleString()})`));
            } else {
                console.log(chalk.yellow('⚠️  File config: Tồn tại nhưng không có API key'));
            }
        } catch (error) {
            console.log(chalk.red('❌ File config: Lỗi đọc file'));
        }
    } else {
        console.log(chalk.yellow('⚠️  File config: Chưa tồn tại'));
    }
    
    // Hiển thị thứ tự ưu tiên
    console.log(chalk.white('\n🔄 Thứ tự ưu tiên API key:'));
    console.log(chalk.white('  1. Tham số --key'));
    console.log(chalk.white('  2. Biến môi trường TINIFY_API_KEY'));
    console.log(chalk.white('  3. File config.json'));
}

class TinyImageTool {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('API Key TinyPNG là bắt buộc!');
        }
        tinify.key = apiKey;
        this.stats = {
            total: 0,
            compressed: 0,
            failed: 0,
            savedBytes: 0
        };
    }

    // Kiểm tra xem file có phải là ảnh được hỗ trợ không
    isImageFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return SUPPORTED_FORMATS.includes(ext);
    }

    // Lấy tất cả file ảnh trong thư mục (bao gồm cả thư mục con)
    async getAllImageFiles(dirPath) {
        const imageFiles = [];
        
        async function scanDirectory(currentPath, relativePath = '') {
            const items = await fs.readdir(currentPath);
            
            for (const item of items) {
                const fullPath = path.join(currentPath, item);
                const relativeFilePath = path.join(relativePath, item);
                const stat = await fs.stat(fullPath);
                
                if (stat.isDirectory()) {
                    // Quét thư mục con
                    await scanDirectory(fullPath, relativeFilePath);
                } else if (stat.isFile()) {
                    // Kiểm tra xem có phải file ảnh không
                    if (this.isImageFile(fullPath)) {
                        imageFiles.push({
                            fullPath,
                            relativePath: relativeFilePath,
                            size: stat.size
                        });
                    }
                }
            }
        }
        
        await scanDirectory(dirPath);
        return imageFiles;
    }

    // Nén một file ảnh
    async compressImage(sourcePath, outputPath) {
        try {
            const source = tinify.fromFile(sourcePath);
            await source.toFile(outputPath);
            return true;
        } catch (error) {
            console.error(chalk.red(`Lỗi nén ảnh ${sourcePath}:`), error.message);
            return false;
        }
    }

    // Xử lý nén tất cả ảnh
    async processImages(sourceDir, outputDir) {
        console.log(chalk.blue('🔍 Đang quét thư mục nguồn...'));
        
        // Kiểm tra thư mục nguồn tồn tại
        if (!await fs.pathExists(sourceDir)) {
            throw new Error(`Thư mục nguồn không tồn tại: ${sourceDir}`);
        }

        // Lấy tất cả file ảnh
        const imageFiles = await this.getAllImageFiles(sourceDir);
        this.stats.total = imageFiles.length;

        if (imageFiles.length === 0) {
            console.log(chalk.yellow('⚠️  Không tìm thấy file ảnh nào trong thư mục nguồn!'));
            return;
        }

        console.log(chalk.green(`📁 Tìm thấy ${imageFiles.length} file ảnh`));
        console.log(chalk.blue('🚀 Bắt đầu quá trình nén ảnh...'));

        // Tạo thư mục đích
        await fs.ensureDir(outputDir);

        const spinner = ora('Đang nén ảnh...').start();

        for (const imageFile of imageFiles) {
            const outputPath = path.join(outputDir, imageFile.relativePath);
            const outputDirPath = path.dirname(outputPath);

            // Tạo thư mục đích nếu chưa tồn tại
            await fs.ensureDir(outputDirPath);

            spinner.text = `Đang nén: ${imageFile.relativePath}`;

            // Nén ảnh
            const success = await this.compressImage(imageFile.fullPath, outputPath);
            
            if (success) {
                this.stats.compressed++;
                
                // Tính toán kích thước đã tiết kiệm
                const originalSize = imageFile.size;
                const compressedSize = (await fs.stat(outputPath)).size;
                this.stats.savedBytes += (originalSize - compressedSize);
                
                spinner.succeed(chalk.green(`✅ ${imageFile.relativePath} - Tiết kiệm: ${this.formatBytes(originalSize - compressedSize)}`));
                spinner = ora('Đang nén ảnh...').start();
            } else {
                this.stats.failed++;
                spinner.fail(chalk.red(`❌ ${imageFile.relativePath} - Nén thất bại`));
                spinner = ora('Đang nén ảnh...').start();
            }
        }

        spinner.stop();
        this.printSummary();
    }

    // Format bytes thành dạng dễ đọc
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // In thống kê tổng kết
    printSummary() {
        console.log(chalk.cyan('\n📊 THỐNG KÊ TỔNG KẾT:'));
        console.log(chalk.white(`• Tổng số ảnh: ${this.stats.total}`));
        console.log(chalk.green(`• Nén thành công: ${this.stats.compressed}`));
        console.log(chalk.red(`• Nén thất bại: ${this.stats.failed}`));
        console.log(chalk.yellow(`• Dung lượng tiết kiệm: ${this.formatBytes(this.stats.savedBytes)}`));
        
        if (this.stats.compressed > 0) {
            const successRate = ((this.stats.compressed / this.stats.total) * 100).toFixed(1);
            console.log(chalk.green(`• Tỷ lệ thành công: ${successRate}%`));
        }
    }
}

// Command line interface
program
    .name('tool-tiny-image')
    .description('Tool nén ảnh bằng TinyPNG với cấu trúc thư mục tương tự')
    .version('1.0.0');

program
    .command('compress')
    .description('Nén tất cả ảnh trong thư mục')
    .option('-s, --source <path>', 'Thư mục chứa ảnh nguồn')
    .option('-o, --output <path>', 'Thư mục đích để lưu ảnh đã nén')
    .option('-k, --key <apikey>', 'API Key của TinyPNG')
    .action(async (options) => {
        try {
            // Kiểm tra các tham số bắt buộc
            if (!options.source) {
                console.error(chalk.red('❌ Vui lòng cung cấp thư mục nguồn với --source'));
                process.exit(1);
            }
            
            if (!options.output) {
                console.error(chalk.red('❌ Vui lòng cung cấp thư mục đích với --output'));
                process.exit(1);
            }
            
            // Lấy API key từ các nguồn khác nhau
            const apiKey = getApiKey(options.key);
            
            if (!apiKey) {
                console.error(chalk.red('❌ Không tìm thấy API Key TinyPNG!'));
                console.log(chalk.yellow('💡 Bạn có thể:'));
                console.log(chalk.white('   • Sử dụng --key YOUR_API_KEY'));
                console.log(chalk.white('   • Thiết lập biến môi trường: export TINIFY_API_KEY=YOUR_API_KEY'));
                console.log(chalk.white('   • Lưu vào config: node index.js config --set YOUR_API_KEY'));
                console.log(chalk.yellow('   • Lấy API Key miễn phí tại: https://tinypng.com/developers'));
                process.exit(1);
            }

            // Chuyển đổi đường dẫn tương đối thành tuyệt đối
            const sourceDir = path.resolve(options.source);
            const outputDir = path.resolve(options.output);

            console.log(chalk.cyan('🎯 THÔNG TIN NÉN ẢNH:'));
            console.log(chalk.white(`• Thư mục nguồn: ${sourceDir}`));
            console.log(chalk.white(`• Thư mục đích: ${outputDir}`));
            console.log(chalk.white(`• API Key: ${'*'.repeat(apiKey.length)}`));

            // Khởi tạo tool và bắt đầu quá trình nén
            const tool = new TinyImageTool(apiKey);
            await tool.processImages(sourceDir, outputDir);

        } catch (error) {
            console.error(chalk.red('💥 Lỗi:'), error.message);
            process.exit(1);
        }
    });

// Command để quản lý config
program
    .command('config')
    .description('Quản lý cấu hình API Key')
    .option('-s, --set <apikey>', 'Lưu API Key vào config')
    .option('-g, --get', 'Hiển thị API Key hiện tại (được che)')
    .option('-c, --check', 'Kiểm tra trạng thái cấu hình')
    .option('-r, --remove', 'Xóa API Key khỏi config')
    .action(async (options) => {
        try {
            if (options.set) {
                // Lưu API Key
                if (saveApiKey(options.set)) {
                    console.log(chalk.green('✅ Đã lưu API Key vào config thành công!'));
                    console.log(chalk.yellow('💡 Bây giờ bạn có thể chạy lệnh nén mà không cần --key'));
                } else {
                    console.error(chalk.red('❌ Lỗi lưu API Key'));
                    process.exit(1);
                }
            } else if (options.get) {
                // Hiển thị API Key hiện tại
                const apiKey = getApiKey();
                if (apiKey) {
                    const maskedKey = apiKey.substring(0, 8) + '*'.repeat(apiKey.length - 8);
                    console.log(chalk.green(`🔑 API Key hiện tại: ${maskedKey}`));
                } else {
                    console.log(chalk.yellow('⚠️  Chưa có API Key nào được thiết lập'));
                }
            } else if (options.remove) {
                // Xóa config
                if (fs.existsSync(CONFIG_FILE)) {
                    fs.unlinkSync(CONFIG_FILE);
                    console.log(chalk.green('✅ Đã xóa API Key khỏi config'));
                } else {
                    console.log(chalk.yellow('⚠️  File config không tồn tại'));
                }
            } else {
                // Mặc định hiển thị trạng thái
                showConfigStatus();
            }
        } catch (error) {
            console.error(chalk.red('💥 Lỗi:'), error.message);
            process.exit(1);
        }
    });

// Parse command line arguments
program.parse();