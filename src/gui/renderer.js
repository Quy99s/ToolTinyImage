const { ipcRenderer } = require('electron');

class TinyImageApp {
    constructor() {
        this.isCompressing = false;
        this.stats = {
            total: 0,
            compressed: 0,
            failed: 0,
            savedBytes: 0
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadSavedApiKey();
    }

    initializeElements() {
        // API Key elements
        this.apiKeyInput = document.getElementById('apiKey');
        this.saveApiKeyBtn = document.getElementById('saveApiKey');
        this.toggleApiKeyBtn = document.getElementById('toggleApiKey');

        // Folder elements
        this.sourceFolderInput = document.getElementById('sourceFolder');
        this.outputFolderInput = document.getElementById('outputFolder');
        this.selectSourceBtn = document.getElementById('selectSource');
        this.selectOutputBtn = document.getElementById('selectOutput');

        // Action buttons
        this.startCompressBtn = document.getElementById('startCompress');
        this.stopCompressBtn = document.getElementById('stopCompress');

        // Progress elements
        this.progressSection = document.getElementById('progressSection');
        this.progressBarFill = document.getElementById('progressBarFill');
        this.progressText = document.getElementById('progressText');
        this.currentFileDiv = document.getElementById('currentFile');

        // Results elements
        this.resultsSection = document.getElementById('resultsSection');
        this.totalImagesSpan = document.getElementById('totalImages');
        this.compressedImagesSpan = document.getElementById('compressedImages');
        this.failedImagesSpan = document.getElementById('failedImages');
        this.savedBytesSpan = document.getElementById('savedBytes');

        // Log elements
        this.logSection = document.getElementById('logSection');
        this.logContainer = document.getElementById('logContainer');
    }

    bindEvents() {
        // API Key events
        this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.toggleApiKeyBtn.addEventListener('click', () => this.toggleApiKeyVisibility());

        // Folder selection events
        this.selectSourceBtn.addEventListener('click', () => this.selectFolder('source'));
        this.selectOutputBtn.addEventListener('click', () => this.selectFolder('output'));

        // Compression events
        this.startCompressBtn.addEventListener('click', () => this.startCompression());
        this.stopCompressBtn.addEventListener('click', () => this.stopCompression());

        // IPC events from main process
        ipcRenderer.on('compression-progress', (event, data) => this.updateProgress(data));
        ipcRenderer.on('file-complete', (event, data) => this.onFileComplete(data));
        ipcRenderer.on('compression-error', (event, data) => this.onCompressionError(data));
    }

    async loadSavedApiKey() {
        try {
            const apiKey = await ipcRenderer.invoke('load-api-key');
            if (apiKey) {
                this.apiKeyInput.value = apiKey;
                this.addLog('✅ Đã tải API Key đã lưu', 'success');
            }
        } catch (error) {
            console.error('Error loading API key:', error);
        }
    }

    async saveApiKey() {
        const apiKey = this.apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Vui lòng nhập API Key!');
            return;
        }

        try {
            const result = await ipcRenderer.invoke('save-api-key', apiKey);
            if (result.success) {
                this.addLog('✅ Đã lưu API Key thành công', 'success');
            } else {
                this.addLog(`❌ Lỗi lưu API Key: ${result.error}`, 'error');
            }
        } catch (error) {
            this.addLog(`❌ Lỗi lưu API Key: ${error.message}`, 'error');
        }
    }

    toggleApiKeyVisibility() {
        const input = this.apiKeyInput;
        if (input.type === 'password') {
            input.type = 'text';
            this.toggleApiKeyBtn.textContent = '🙈';
        } else {
            input.type = 'password';
            this.toggleApiKeyBtn.textContent = '👁️';
        }
    }

    async selectFolder(type) {
        try {
            const title = type === 'source' ? 'Chọn thư mục chứa ảnh gốc' : 'Chọn thư mục lưu ảnh đã nén';
            const folderPath = await ipcRenderer.invoke('select-folder', title);
            
            if (folderPath) {
                if (type === 'source') {
                    this.sourceFolderInput.value = folderPath;
                } else {
                    this.outputFolderInput.value = folderPath;
                }
                this.addLog(`📁 Đã chọn thư mục ${type === 'source' ? 'nguồn' : 'đích'}: ${folderPath}`, 'info');
            }
        } catch (error) {
            this.addLog(`❌ Lỗi chọn thư mục: ${error.message}`, 'error');
        }
    }

    async startCompression() {
        // Validate inputs
        const apiKey = this.apiKeyInput.value.trim();
        const sourceDir = this.sourceFolderInput.value.trim();
        const outputDir = this.outputFolderInput.value.trim();

        if (!apiKey) {
            alert('Vui lòng nhập API Key!');
            return;
        }

        if (!sourceDir) {
            alert('Vui lòng chọn thư mục nguồn!');
            return;
        }

        if (!outputDir) {
            alert('Vui lòng chọn thư mục đích!');
            return;
        }

        // Reset stats
        this.stats = { total: 0, compressed: 0, failed: 0, savedBytes: 0 };
        this.updateUI('compressing');

        try {
            this.addLog('🚀 Bắt đầu quá trình nén ảnh...', 'info');
            
            const result = await ipcRenderer.invoke('compress-images', {
                sourceDir,
                outputDir,
                apiKey
            });

            if (result.success) {
                this.addLog('✅ Hoàn thành quá trình nén ảnh!', 'success');
                this.updateUI('completed');
            } else {
                this.addLog(`❌ Lỗi nén ảnh: ${result.error}`, 'error');
                this.updateUI('idle');
            }

        } catch (error) {
            this.addLog(`❌ Lỗi: ${error.message}`, 'error');
            this.updateUI('idle');
        }
    }

    stopCompression() {
        // TODO: Implement stop functionality
        this.addLog('⏹️ Đã dừng quá trình nén', 'info');
        this.updateUI('idle');
    }

    updateProgress(data) {
        const { current, total } = data;
        const percentage = Math.round((current / total) * 100);
        
        this.progressBarFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${percentage}% (${current}/${total})`;
        this.stats.total = total;
    }

    onFileComplete(data) {
        const { file, originalSize, compressedSize, saved } = data;
        this.stats.compressed++;
        this.stats.savedBytes += saved;
        
        this.currentFileDiv.textContent = `✅ Đã nén: ${file}`;
        this.addLog(`✅ ${file} - Tiết kiệm: ${this.formatBytes(saved)}`, 'success');
        this.updateResults();
    }

    onCompressionError(data) {
        const { file, error } = data;
        this.stats.failed++;
        
        this.addLog(`❌ ${file} - Lỗi: ${error}`, 'error');
        this.updateResults();
    }

    updateResults() {
        this.totalImagesSpan.textContent = this.stats.total;
        this.compressedImagesSpan.textContent = this.stats.compressed;
        this.failedImagesSpan.textContent = this.stats.failed;
        this.savedBytesSpan.textContent = this.formatBytes(this.stats.savedBytes);
    }

    updateUI(state) {
        switch (state) {
            case 'compressing':
                this.isCompressing = true;
                this.startCompressBtn.style.display = 'none';
                this.stopCompressBtn.style.display = 'inline-block';
                this.progressSection.style.display = 'block';
                this.resultsSection.style.display = 'block';
                this.logSection.style.display = 'block';
                break;
                
            case 'completed':
            case 'idle':
                this.isCompressing = false;
                this.startCompressBtn.style.display = 'inline-block';
                this.stopCompressBtn.style.display = 'none';
                if (state === 'completed') {
                    this.progressBarFill.style.width = '100%';
                    this.progressText.textContent = '100% - Hoàn thành!';
                    this.currentFileDiv.textContent = '🎉 Đã hoàn thành tất cả!';
                }
                break;
        }
    }

    addLog(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        this.logContainer.appendChild(logEntry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TinyImageApp();
});