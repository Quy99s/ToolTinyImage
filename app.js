#!/usr/bin/env node

// Kiểm tra nếu đang chạy như CLI thì chuyển về Electron
if (require.main === module) {
    const { spawn } = require('child_process');
    const path = require('path');
    
    // Chạy Electron với file này
    const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
    const electronProcess = spawn(electronPath, [__dirname], {
        stdio: 'inherit',
        detached: false
    });
    
    electronProcess.on('close', (code) => {
        process.exit(code);
    });
    
    return;
}

const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const ImageProcessor = require('./lib/image-processor');

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

let mainWindow;
let imageProcessor;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: process.platform === 'darwin' ? undefined : path.join(__dirname, 'assets/icon.png'),
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        show: false
    });

    mainWindow.loadFile(path.join(__dirname, 'src/gui/index.html'));

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Focus window on macOS
        if (process.platform === 'darwin') {
            app.focus();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (imageProcessor) {
            imageProcessor = null;
        }
    });

    // Tắt menu bar trên Windows/Linux
    if (process.platform !== 'darwin') {
        mainWindow.setMenuBarVisibility(false);
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

// IPC Handlers
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    
    return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('compress-images', async (event, { sourceFolder, outputFolder, apiKey }) => {
    try {
        imageProcessor = new ImageProcessor(apiKey);
        
        // Forward events to renderer
        imageProcessor.on('progress', (data) => {
            event.sender.send('compression-progress', data);
        });
        
        imageProcessor.on('complete', (stats) => {
            event.sender.send('compression-complete', stats);
        });
        
        imageProcessor.on('error', (error) => {
            event.sender.send('compression-error', error);
        });
        
        await imageProcessor.processFolder(sourceFolder, outputFolder);
        
    } catch (error) {
        event.sender.send('compression-error', error.message);
    }
});

// Handle macOS app termination
app.on('before-quit', () => {
    if (imageProcessor) {
        imageProcessor = null;
    }
});