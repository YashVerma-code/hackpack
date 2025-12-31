import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync, spawn } from 'child_process';
import os from 'os';

// constants inspired by node-cloudflared
const CLOUDFLARED_VERSION = "2024.12.2";
const RELEASE_BASE = "https://github.com/cloudflare/cloudflared/releases/";
const BIN_DIR = path.join(os.homedir(), '.hackpack', 'bin');
const BIN_PATH = path.join(BIN_DIR, os.platform() === 'win32' ? 'cloudflared.exe' : 'cloudflared');

const URLS = {
    linux: {
        arm64: "cloudflared-linux-arm64",
        arm: "cloudflared-linux-arm",
        x64: "cloudflared-linux-amd64",
        ia32: "cloudflared-linux-386",
    },
    darwin: {
        arm64: "cloudflared-darwin-arm64.tgz",
        x64: "cloudflared-darwin-amd64.tgz",
    },
    win32: {
        x64: "cloudflared-windows-amd64.exe",
        ia32: "cloudflared-windows-386.exe",
    }
};

function getBinaryPath() {
    if (fs.existsSync(BIN_PATH)) {
        return BIN_PATH;
    }

    try {
        const platform = os.platform();
        const command = platform === 'win32' ? 'where cloudflared' : 'which cloudflared';
        
        const output = execSync(command, { stdio: [] }).toString().trim();
        
        if (output) {
            return output.split(/\r?\n/)[0].trim();
        }
    } catch (e) {
        // not found globally / BIN_PATH
    }

    return null;
}

async function installBinary() {
    const platform = os.platform();
    const arch = os.arch();

    if (!URLS[platform] || !URLS[platform][arch]) {
        throw new Error(`Unsupported platform/architecture: ${platform} ${arch}`);
    }

    const fileName = URLS[platform][arch];
    const downloadUrl = `${RELEASE_BASE}download/${CLOUDFLARED_VERSION}/${fileName}`;

    if (!fs.existsSync(BIN_DIR)) {
        fs.mkdirSync(BIN_DIR, { recursive: true });
    }

    console.log(`Installing cloudflared v${CLOUDFLARED_VERSION} for your system...`);
    
    return new Promise((resolve, reject) => {
        const tempPath = platform === 'darwin' ? `${BIN_PATH}.tgz` : BIN_PATH;
        const file = fs.createWriteStream(tempPath);
        
        const request = https.get(downloadUrl, (res) => {
            // handle redirects (GitHub uses them for releases)
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                https.get(res.headers.location, (redirRes) => redirRes.pipe(file));
            } else {
                res.pipe(file);
            }

            file.on('finish', () => {
                file.close();
                if (platform === 'darwin') {
                    // Extract tgz for macOS
                    execSync(`tar -xzf ${path.basename(tempPath)}`, { cwd: BIN_DIR });
                    fs.unlinkSync(tempPath);
                    const extracted = path.join(BIN_DIR, 'cloudflared');
                    if (extracted !== BIN_PATH) fs.renameSync(extracted, BIN_PATH);
                }
                if (platform !== 'win32') fs.chmodSync(BIN_PATH, '755');
                resolve(BIN_PATH);
            });
        });
        request.on('error', (err) => {
            fs.unlink(tempPath, () => reject(err));
        });
    });
}

export async function startTunnel(localUrl) {
    let binPath = getBinaryPath();
    if (!binPath) {
        binPath = await installBinary();
    }
    return new Promise((resolve, reject) => {
        // cloudflared tunnel --url <url> uses Quick Tunnels
       const command = `"${binPath}" tunnel --url ${localUrl}`;
       const tunnel = spawn(command, { shell: true });
        let urlFound = false;

        tunnel.stderr.on('data', (data) => {
            const output = data.toString();
            const urlMatch = output.match(/https:\/\/([a-z0-9-]+)\.trycloudflare\.com/);
            
            if (urlMatch && !urlFound) {
                urlFound = true;
                resolve({ url: urlMatch[0], process: tunnel });
            }
        });

        tunnel.on('error', reject);
        
        // Safety timeout
        setTimeout(() => {
            if (!urlFound) {
                tunnel.kill();
                reject(new Error("Timeout: Failed to establish tunnel connection."));
            }
        }, 200000);
    });
}