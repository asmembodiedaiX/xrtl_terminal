import { Worker } from 'worker_threads';
import * as path from 'path';
import { ExtensionManifest } from '../common/types';
import { IExtensionAPI, IExtensionContext } from './api';

export class ExtensionHost {
  private worker?: Worker;
  private messageQueue: Array<{ id: number; resolve: (value: unknown) => void; reject: (error: Error) => void }> = [];
  private nextMessageId = 0;

  constructor(private manifest: ExtensionManifest) {}

  async start(api: IExtensionAPI): Promise<void> {
    return new Promise((resolve, reject) => {
      const extensionPath = this.getExtensionPath();
      
      this.worker = new Worker(path.join(__dirname, 'extensionWorker.js'), {
        workerData: {
          extensionPath,
          manifest: this.manifest
        }
      });

      this.worker.on('message', (message) => {
        if (message.type === 'ready') {
          resolve();
        } else if (message.type === 'response') {
          const pending = this.messageQueue.find(m => m.id === message.id);
          if (pending) {
            if (message.error) {
              pending.reject(new Error(message.error));
            } else {
              pending.resolve(message.result);
            }
            this.messageQueue = this.messageQueue.filter(m => m.id !== message.id);
          }
        }
      });

      this.worker.on('error', (error) => {
        reject(error);
      });

      this.worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Extension worker exited with code ${code}`));
        }
      });
    });
  }

  async sendRequest(method: string, params: unknown[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = this.nextMessageId++;
      this.messageQueue.push({ id, resolve, reject });
      
      this.worker?.postMessage({
        type: 'request',
        id,
        method,
        params
      });
    });
  }

  stop(): void {
    this.worker?.terminate();
  }

  private getExtensionPath(): string {
    const builtinPath = path.join(__dirname, '../../extensions/built-in', this.manifest.name);
    if (require('fs').existsSync(builtinPath)) {
      return builtinPath;
    }

    const userPath = path.join(process.env.APPDATA || process.env.HOME || '/', '.xrtl-terminal/extensions', this.manifest.name);
    return userPath;
  }
}
