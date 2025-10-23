const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');

// Import thư viện nén ảnh
const TinyImageProcessor = require('../../lib/image-processor');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        titleBarStyle: 'default',
        show: false
    });

        mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Hiển thị window khi đã load xong
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // DevTools chỉ mở trong môi trường development
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Xử lý chọn thư mục
ipcMain.handle('select-folder', async (event, title) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: title,
        properties: ['openDirectory']
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

// Xử lý lưu/đọc API key
ipcMain.handle('save-api-key', async (event, apiKey) => {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const config = {
            apiKey: apiKey,
            savedAt: new Date().toISOString()
        };
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-api-key', async () => {
    try {
        const configPath = path.join(__dirname, 'config.json');
        if (await fs.pathExists(configPath)) {
            const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
            return config.apiKey || null;
        }
        return null;
    } catch (error) {
        return null;
    }
});

// Xử lý nén ảnh
ipcMain.handle('compress-images', async (event, options) => {
    const { sourceDir, outputDir, apiKey } = options;
    
    try {
        const processor = new TinyImageProcessor(apiKey);
        
        // Lắng nghe sự kiện để gửi progress về renderer
        processor.on('progress', (data) => {
            mainWindow.webContents.send('compression-progress', data);
        });
        
        processor.on('file-complete', (data) => {
            mainWindow.webContents.send('file-complete', data);
        });
        
        processor.on('error', (data) => {
            mainWindow.webContents.send('compression-error', data);
        });
        
        const result = await processor.processImages(sourceDir, outputDir);
        return { success: true, result };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
});