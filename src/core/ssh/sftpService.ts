import { SFTPWrapper, Stats } from 'ssh2';
import { SFTPFile } from '../../common/types';

export class SFTP {
  private sftp: SFTPWrapper;

  constructor(sftp: SFTPWrapper) {
    this.sftp = sftp;
  }

  async listDirectory(path: string): Promise<SFTPFile[]> {
    return new Promise((resolve, reject) => {
      this.sftp.readdir(path, (err, items) => {
        if (err) {
          reject(err);
          return;
        }

        const result = items.map((item) => ({
          name: item.filename,
          path: `${path}/${item.filename}`,
          type: this.getFileType(item.attrs),
          size: item.attrs.size,
          permissions: this.formatPermissions(item.attrs.mode),
          modifiedAt: item.attrs.mtime * 1000
        }));

        resolve(result);
      });
    });
  }

  async downloadFile(remotePath: string, localPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sftp.fastGet(remotePath, localPath, {}, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async uploadFile(localPath: string, remotePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sftp.fastPut(localPath, remotePath, {}, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async createDirectory(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sftp.mkdir(path, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async deleteFile(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sftp.unlink(path, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async deleteDirectory(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sftp.rmdir(path, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sftp.rename(oldPath, newPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  async getFileStats(path: string): Promise<SFTPFile> {
    return new Promise((resolve, reject) => {
      this.sftp.stat(path, (err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({
          name: path.split('/').pop() || '',
          path,
          type: this.getFileType(stats),
          size: stats.size,
          permissions: this.formatPermissions(stats.mode),
          modifiedAt: stats.mtime * 1000
        });
      });
    });
  }

  private getFileType(attrs: { mode: number }): SFTPFile['type'] {
    const mode = attrs.mode & 0xF000;
    if (mode === 0x4000) return 'directory';
    if (mode === 0xA000) return 'symlink';
    return 'file';
  }

  private formatPermissions(mode: number): string {
    const permissions = mode & 0o777;
    const octal = permissions.toString(8).padStart(3, '0');
    return octal;
  }

  close(): void {
    this.sftp.end();
  }
}
