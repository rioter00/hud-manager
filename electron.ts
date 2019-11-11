import { app, BrowserWindow } from "electron";
import path from 'path';
import * as directories from './init/directories';
import init from './server'
import { loadConfig } from './server/api/config';
import url from 'url';

const isDev = process.env.DEV === "true";

let win: BrowserWindow | null;

async function createMainWindow() {
    const server = await init();
    directories.checkDirectories();

    win = new BrowserWindow({
        height: 836,
        minHeight: 600,
        minWidth: 400,
        show: false,
        title: "HUD Manager",
        icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            backgroundThrottling: false,
        },
        width: 1280,
    });

    win.once("ready-to-show", () => {
        if (win) {
            win.show();
        }
    });

    // win.setMenu(null);
    const config = await loadConfig();

    win.setMenuBarVisibility(false);
    const startUrl =`http://localhost:${config.port}/`;
    win.loadURL(`${isDev ? `http://localhost:3000/?port=${config.port || 1337}` : startUrl}`);
    win.on("close", () => {
        server.close();
        //const windows = win.getChildWindows();
        //windows.map(window => window.close());
        win = null;
        app.quit();

    });
}
if (app) {

    app.on("window-all-closed", app.quit);

    app.on("before-quit", () => {
        if (!win) return;
        win.removeAllListeners("close");
        win.close();
    });

    app.on("ready", createMainWindow);
}