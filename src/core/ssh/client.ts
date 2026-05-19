import { Client, ClientChannel, ConnectConfig, SFTPWrapper } from 'ssh2';
import { EventEmitter } from 'events';
import { SSHConfig, ConnectionStatus } from '../../common/types';

export class SSHClient extends EventEmitter {
  private client: Client | null = null;
  private sftp: SFTPWrapper | null = null;
  private isConnectedFlag = false;

  async connect(config: SSHConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client();

      this.client.on('ready', () => {
        this.isConnectedFlag = true;
        this.emit('status', {
          sessionId: config.id,
          status: 'connected' as const,
          hostname: config.host,
          username: config.username
        });
        resolve();
      });

      this.client.on('error', (err) => {
        this.isConnectedFlag = false;
        this.emit('status', {
          sessionId: config.id,
          status: 'error' as const,
          error: err.message
        });
        reject(err);
      });

      this.client.on('end', () => {
        this.isConnectedFlag = false;
        this.emit('status', {
          sessionId: config.id,
          status: 'disconnected' as const
        });
      });

      this.client.on('close', () => {
        this.isConnectedFlag = false;
        this.emit('status', {
          sessionId: config.id,
          status: 'disconnected' as const
        });
      });

      const connectConfig: ConnectConfig = {
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        privateKey: config.privateKey,
        passphrase: config.passphrase,
        readyTimeout: config.connectTimeout || 10000,
        keepaliveInterval: config.keepaliveInterval || 30000
      };

      this.emit('status', {
        sessionId: config.id,
        status: 'connecting' as const
      });

      this.client.connect(connectConfig);
    });
  }

  async executeCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('Not connected'));
        return;
      }

      this.client.exec(command, (err, channel) => {
        if (err) {
          reject(err);
          return;
        }

        let output = '';

        channel.on('data', (data: Buffer) => {
          output += data.toString();
        });

        channel.stderr.on('data', (data: Buffer) => {
          output += data.toString();
        });

        channel.on('close', () => {
          resolve(output);
        });
      });
    });
  }

  async startShell(): Promise<ClientChannel> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error('Not connected'));
        return;
      }

      this.client.shell((err, channel) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(channel);
      });
    });
  }

  async getSFTP(): Promise<SFTPWrapper> {
    if (this.sftp) {
      return this.sftp;
    }

    if (!this.client) {
      throw new Error('Not connected');
    }

    return new Promise((resolve, reject) => {
      this.client!.sftp((err, sftp) => {
        if (err) {
          reject(err);
          return;
        }
        this.sftp = sftp;
        resolve(sftp);
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.isConnectedFlag = false;
      if (this.sftp) {
        this.sftp.end();
        this.sftp = null;
      }
      if (this.client) {
        this.client.end();
        this.client = null;
      }
      resolve();
    });
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }
}
