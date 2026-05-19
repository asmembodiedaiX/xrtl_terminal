import * as fs from 'fs';
import * as path from 'path';
import { EventEmitter } from 'events';
import { ExtensionManifest, ExtensionType } from '../common/types';
import { IExtensionContext, IExtensionAPI } from './api';

export class ExtensionManager extends EventEmitter {
  private extensions: Map<string, ExtensionInstance> = new Map();
  private extensionHosts: Map<string, ExtensionHost> = new Map();

  async loadExtensions(): Promise<void> {
    const builtinExtensions = await this.loadBuiltinExtensions();
    const userExtensions = await this.loadUserExtensions();

    for (const ext of [...builtinExtensions, ...userExtensions]) {
      await this.loadExtension(ext);
    }
  }

  private async loadBuiltinExtensions(): Promise<string[]> {
    const builtinDir = path.join(__dirname, '../../extensions/built-in');
    if (!fs.existsSync(builtinDir)) {
      return [];
    }

    return fs.readdirSync(builtinDir).filter(name => 
      fs.statSync(path.join(builtinDir, name)).isDirectory()
    );
  }

  private async loadUserExtensions(): Promise<string[]> {
    const userDir = path.join(process.env.APPDATA || process.env.HOME || '/', '.xrtl-terminal/extensions');
    if (!fs.existsSync(userDir)) {
      return [];
    }

    return fs.readdirSync(userDir).filter(name => 
      fs.statSync(path.join(userDir, name)).isDirectory()
    );
  }

  private async loadExtension(name: string): Promise<void> {
    try {
      const manifest = await this.loadManifest(name);
      if (!manifest) return;

      const host = new ExtensionHost(manifest);
      this.extensionHosts.set(name, host);

      const context: IExtensionContext = {
        subscriptions: [],
        workspaceState: {
          get: (key: string) => undefined,
          update: async (key: string, value: unknown) => {}
        },
        globalState: {
          get: (key: string) => undefined,
          update: async (key: string, value: unknown) => {}
        }
      };

      await host.activate(context);
      this.extensions.set(name, { manifest, host });

      this.emit('extensionLoaded', name);
    } catch (error) {
      console.error(`Failed to load extension ${name}:`, error);
    }
  }

  private async loadManifest(name: string): Promise<ExtensionManifest | null> {
    const builtinPath = path.join(__dirname, '../../extensions/built-in', name, 'package.json');
    const userPath = path.join(process.env.APPDATA || process.env.HOME || '/', '.xrtl-terminal/extensions', name, 'package.json');

    let manifestPath: string;
    if (fs.existsSync(builtinPath)) {
      manifestPath = builtinPath;
    } else if (fs.existsSync(userPath)) {
      manifestPath = userPath;
    } else {
      return null;
    }

    const data = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(data);
  }

  getExtension(name: string): ExtensionInstance | undefined {
    return this.extensions.get(name);
  }

  getAllExtensions(): ExtensionInstance[] {
    return Array.from(this.extensions.values());
  }

  getExtensionsByType(type: ExtensionType): ExtensionInstance[] {
    return Array.from(this.extensions.values()).filter(e => e.manifest.type === type);
  }

  async unloadExtension(name: string): Promise<void> {
    const instance = this.extensions.get(name);
    if (instance) {
      await instance.host.deactivate();
      this.extensions.delete(name);
      this.extensionHosts.delete(name);
      this.emit('extensionUnloaded', name);
    }
  }

  async unloadAll(): Promise<void> {
    for (const name of this.extensions.keys()) {
      await this.unloadExtension(name);
    }
  }
}

interface ExtensionInstance {
  manifest: ExtensionManifest;
  host: ExtensionHost;
}

class ExtensionHost {
  private activated = false;

  constructor(private manifest: ExtensionManifest) {}

  async activate(context: IExtensionContext): Promise<void> {
    if (this.activated) return;

    const mainPath = path.join(
      __dirname, 
      '../../extensions/built-in', 
      this.manifest.name, 
      this.manifest.main
    );

    if (fs.existsSync(mainPath)) {
      const module = await import(mainPath);
      if (module.activate) {
        await module.activate(context);
      }
    }

    this.activated = true;
  }

  async deactivate(): Promise<void> {
    if (!this.activated) return;
    this.activated = false;
  }
}

export const extensionManager = new ExtensionManager();
