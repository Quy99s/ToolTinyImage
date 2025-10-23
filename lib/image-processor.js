const fs = require('fs-extra');
const path = require('path');
const tinify = require('tinify');
const { EventEmitter } = require('events');

// Các định dạng ảnh được hỗ trợ
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];

class TinyImageProcessor extends EventEmitter {
    constructor(apiKey) {
        super();
        
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
        
        const scanDirectory = async (currentPath, relativePath = '') => {
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
        };
        
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
            throw error;
        }
    }

    // Xử lý nén tất cả ảnh
    async processImages(sourceDir, outputDir) {
        // Kiểm tra thư mục nguồn tồn tại
        if (!await fs.pathExists(sourceDir)) {
            throw new Error(`Thư mục nguồn không tồn tại: ${sourceDir}`);
        }

        // Lấy tất cả file ảnh
        const imageFiles = await this.getAllImageFiles(sourceDir);
        this.stats.total = imageFiles.length;

        if (imageFiles.length === 0) {
            throw new Error('Không tìm thấy file ảnh nào trong thư mục nguồn!');
        }

        // Tạo thư mục đích
        await fs.ensureDir(outputDir);

        // Emit progress ban đầu
        this.emit('progress', { current: 0, total: imageFiles.length });

        let currentIndex = 0;

        for (const imageFile of imageFiles) {
            const outputPath = path.join(outputDir, imageFile.relativePath);
            const outputDirPath = path.dirname(outputPath);

            // Tạo thư mục đích nếu chưa tồn tại
            await fs.ensureDir(outputDirPath);

            try {
                // Nén ảnh
                await this.compressImage(imageFile.fullPath, outputPath);
                
                // Tính toán kích thước đã tiết kiệm
                const originalSize = imageFile.size;
                const compressedSize = (await fs.stat(outputPath)).size;
                const savedBytes = originalSize - compressedSize;
                
                this.stats.compressed++;
                this.stats.savedBytes += savedBytes;
                
                // Emit file complete event
                this.emit('file-complete', {
                    file: imageFile.relativePath,
                    originalSize,
                    compressedSize,
                    saved: savedBytes
                });
                
            } catch (error) {
                this.stats.failed++;
                
                // Emit error event
                this.emit('error', {
                    file: imageFile.relativePath,
                    error: error.message
                });
            }

            currentIndex++;
            
            // Emit progress update
            this.emit('progress', { 
                current: currentIndex, 
                total: imageFiles.length 
            });
        }

        return this.stats;
    }
}

module.exports = TinyImageProcessor;