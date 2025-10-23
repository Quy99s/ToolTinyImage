#!/usr/bin/env node

const { program } = require('commander');
const ImageProcessor = require('./lib/image-processor');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const ora = require('ora');

program
    .name('tiny-image')
    .description('🖼️ Tool nén ảnh với TinyPNG API')
    .version('1.0.0');

program
    .command('compress')
    .description('Nén ảnh trong thư mục')
    .requiredOption('-s, --source <folder>', 'Thư mục chứa ảnh nguồn')
    .requiredOption('-o, --output <folder>', 'Thư mục lưu ảnh đã nén')
    .option('-k, --key <apikey>', 'TinyPNG API key')
    .action(async (options) => {
        try {
            const { source, output, key } = options;
            
            // Kiểm tra thư mục nguồn
            if (!await fs.pathExists(source)) {
                console.error(chalk.red('❌ Thư mục nguồn không tồn tại!'));
                process.exit(1);
            }
            
            // Lấy API key
            let apiKey = key;
            if (!apiKey) {
                const configPath = path.join(__dirname, '.env');
                if (await fs.pathExists(configPath)) {
                    const config = await fs.readFile(configPath, 'utf8');
                    const match = config.match(/TINYPNG_API_KEY=(.+)/);
                    if (match) {
                        apiKey = match[1].trim();
                    }
                }
            }
            
            if (!apiKey) {
                console.error(chalk.red('❌ Vui lòng cung cấp TinyPNG API key!'));
                console.log(chalk.yellow('Sử dụng: --key <api_key> hoặc tạo file .env'));
                process.exit(1);
            }
            
            console.log(chalk.blue('🖼️ Tool Tiny Image - CLI Mode'));
            console.log(chalk.blue('================================'));
            console.log(chalk.green(`📁 Nguồn: ${source}`));
            console.log(chalk.green(`📁 Đích: ${output}`));
            console.log('');
            
            const spinner = ora('Đang quét ảnh...').start();
            
            const processor = new ImageProcessor(apiKey);
            
            processor.on('progress', (data) => {
                spinner.text = `Đang nén: ${data.currentFile} (${data.processed}/${data.total})`;
            });
            
            processor.on('complete', (stats) => {
                spinner.succeed('Hoàn thành!');
                console.log('');
                console.log(chalk.green('📊 Thống kê:'));
                console.log(chalk.white(`   Tổng ảnh: ${stats.totalImages}`));
                console.log(chalk.white(`   Thành công: ${stats.successful}`));
                console.log(chalk.white(`   Thất bại: ${stats.failed}`));
                console.log(chalk.white(`   Dung lượng gốc: ${(stats.originalSize / 1024 / 1024).toFixed(2)} MB`));
                console.log(chalk.white(`   Dung lượng nén: ${(stats.compressedSize / 1024 / 1024).toFixed(2)} MB`));
                console.log(chalk.white(`   Tiết kiệm: ${stats.savedPercentage.toFixed(1)}%`));
            });
            
            processor.on('error', (error) => {
                spinner.fail(`Lỗi: ${error}`);
                process.exit(1);
            });
            
            await processor.processFolder(source, output);
            
        } catch (error) {
            console.error(chalk.red(`❌ Lỗi: ${error.message}`));
            process.exit(1);
        }
    });

program
    .command('config')
    .description('Quản lý cấu hình API key')
    .option('--set <apikey>', 'Lưu API key')
    .option('--show', 'Hiển thị API key hiện tại')
    .action(async (options) => {
        const configPath = path.join(__dirname, '.env');
        
        if (options.set) {
            await fs.writeFile(configPath, `TINYPNG_API_KEY=${options.set}\n`);
            console.log(chalk.green('✅ API key đã được lưu!'));
        } else if (options.show) {
            if (await fs.pathExists(configPath)) {
                const config = await fs.readFile(configPath, 'utf8');
                const match = config.match(/TINYPNG_API_KEY=(.+)/);
                if (match) {
                    const key = match[1].trim();
                    console.log(chalk.blue(`🔑 API Key: ${key.substring(0, 10)}...`));
                } else {
                    console.log(chalk.yellow('⚠️ API key không tìm thấy'));
                }
            } else {
                console.log(chalk.yellow('⚠️ File cấu hình không tồn tại'));
            }
        } else {
            console.log(chalk.yellow('Sử dụng --set <key> để lưu hoặc --show để xem'));
        }
    });

if (process.argv.length === 2) {
    program.help();
}

program.parse();