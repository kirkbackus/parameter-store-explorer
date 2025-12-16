import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const isDev = !app.isPackaged;
const port = 3000;

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        backgroundColor: '#1e1e1e',
        show: true,
    });

    if (isDev) {
        await mainWindow.loadURL(`http://localhost:${port}`);
        mainWindow.webContents.openDevTools();
    } else {
        await mainWindow.loadURL(`file://${path.join(app.getAppPath(), 'renderer/out/index.html')}`);
    }

    // Force window to be visible and focused
    mainWindow.show();
    mainWindow.focus();
    mainWindow.moveTop();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    await createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers Placeholder
import { loadSharedConfigFiles } from '@aws-sdk/shared-ini-file-loader';
import { SSMClient, GetParametersByPathCommand, GetParameterCommand, PutParameterCommand, DeleteParameterCommand, Parameter, GetParametersByPathCommandOutput } from '@aws-sdk/client-ssm';
import { fromIni } from '@aws-sdk/credential-providers';

// ... (keep existing code)

ipcMain.handle('aws:list-profiles', async () => {
    try {
        const { configFile, credentialsFile } = await loadSharedConfigFiles();
        const profiles = new Set([
            ...Object.keys(configFile),
            ...Object.keys(credentialsFile)
        ]);
        return Array.from(profiles);
    } catch (error) {
        console.error('Error listing profiles:', error);
        return [];
    }
});

ipcMain.handle('aws:list-parameters', async (_, profile: string, searchPath: string = '/', recursive: boolean = true) => {
    try {
        // Basic region detection (fallback to us-east-1)
        const region = 'us-east-1';
        const client = new SSMClient({
            credentials: fromIni({ profile }),
            region
        });

        let allParameters: any[] = [];
        let nextToken: string | undefined = undefined;

        // Fetch all pages of results
        do {
            const command: GetParametersByPathCommand = new GetParametersByPathCommand({
                Path: searchPath,
                Recursive: recursive,
                MaxResults: 10, // AWS SSM max is 10
                NextToken: nextToken,
            });

            const response: GetParametersByPathCommandOutput = await client.send(command);
            if (response.Parameters) {
                allParameters = allParameters.concat(response.Parameters);
            }
            nextToken = response.NextToken;
        } while (nextToken);

        return allParameters;
    } catch (error) {
        console.error('Error listing parameters:', error);
        throw error;
    }
});

ipcMain.handle('aws:get-parameter', async (_, profile: string, name: string, withDecryption: boolean = true) => {
    try {
        const client = new SSMClient({
            credentials: fromIni({ profile }),
            region: 'us-east-1'
        });

        const command = new GetParameterCommand({
            Name: name,
            WithDecryption: withDecryption,
        });

        const response = await client.send(command);
        return response.Parameter;
    } catch (error) {
        console.error('Error getting parameter:', error);
        throw error;
    }
});

ipcMain.handle('aws:put-parameter', async (_, profile: string, name: string, value: string, type: 'String' | 'StringList' | 'SecureString') => {
    try {
        const client = new SSMClient({
            credentials: fromIni({ profile }),
            region: 'us-east-1'
        });

        const command = new PutParameterCommand({
            Name: name,
            Value: value,
            Type: type,
            Overwrite: true,
        });

        await client.send(command);
        return true;
    } catch (error) {
        console.error('Error putting parameter:', error);
        throw error;
    }
});

ipcMain.handle('aws:login-sso', async (_, profile: string) => {
    try {
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);

        console.log(`Running aws sso login --profile ${profile}`);
        await execPromise(`aws sso login --profile ${profile}`);
        return true;
    } catch (error) {
        console.error('Error logging in with SSO:', error);
        throw error;
    }
});

ipcMain.handle('aws:delete-parameter', async (_, profile: string, name: string) => {
    try {
        const client = new SSMClient({
            credentials: fromIni({ profile }),
            region: 'us-east-1'
        });

        const command = new DeleteParameterCommand({
            Name: name,
        });

        await client.send(command);
        return true;
    } catch (error) {
        console.error('Error deleting parameter:', error);
        throw error;
    }
});
