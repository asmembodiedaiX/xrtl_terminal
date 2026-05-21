import { Terminal } from '@xterm/xterm';
import { SSHConfig, TerminalSession, SFTPFile } from '../../common/types';

export interface ITerminalAPI {
  createTerminal(options: TerminalOptions): Promise<Terminal>;
  getActiveTerminal(): Terminal | undefined;
  onTerminalCreated(listener: (terminal: Terminal) => void): IDisposable;
}

export interface TerminalOptions {
  id?: string;
  name?: string;
  columns?: number;
  rows?: number;
}

export interface ISSHAPI {
  createConnection(config: SSHConfig): Promise<void>;
  listConnections(): TerminalSession[];
  onConnectionStatusChanged(listener: (status: ConnectionStatus) => void): IDisposable;
}

export interface ConnectionStatus {
  sessionId: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  error?: string;
}

export interface IWindowAPI {
  showInformationMessage(message: string): Promise<void>;
  showErrorMessage(message: string): Promise<void>;
  showOpenDialog(options: OpenDialogOptions): Promise<string[] | undefined>;
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: FileFilter[];
  properties?: string[];
}

export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface IFilesAPI {
  listDirectory(path: string): Promise<SFTPFile[]>;
  downloadFile(remotePath: string, localPath: string): Promise<void>;
  uploadFile(localPath: string, remotePath: string): Promise<void>;
}

export interface IDisposable {
  dispose(): void;
}

export interface IExtensionContext {
  subscriptions: IDisposable[];
  workspaceState: IWorkspaceState;
  globalState: IGlobalState;
}

export interface IWorkspaceState {
  get<T>(key: string): T | undefined;
  update(key: string, value: unknown): Promise<void>;
}

export interface IGlobalState {
  get<T>(key: string): T | undefined;
  update(key: string, value: unknown): Promise<void>;
}

export interface IExtensionAPI {
  terminal: ITerminalAPI;
  ssh: ISSHAPI;
  window: IWindowAPI;
  files: IFilesAPI;
}
