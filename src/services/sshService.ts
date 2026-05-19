import { ipcRenderer } from 'electron';

export interface SSHTestResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
}

export class SSHService {
  async testConnection(config: SSHConfig): Promise<SSHTestResult> {
    return new Promise((resolve) => {
      const channel = `ssh-test-result-${Date.now()}`;
      
      ipcRenderer.send('ssh-test-connection', { config, channel });
      
      const timeout = setTimeout(() => {
        ipcRenderer.removeAllListeners(channel);
        resolve({
          success: false,
          message: '连接超时'
        });
      }, 10000);

      ipcRenderer.once(channel, (_event: any, result: SSHTestResult) => {
        clearTimeout(timeout);
        resolve(result);
      });
    });
  }
}

export const sshService = new SSHService();