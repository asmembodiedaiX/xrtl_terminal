export interface SSHConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  connectTimeout?: number;
  keepaliveInterval?: number;
}

export interface TerminalSession {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting';
  type: 'local' | 'ssh';
  sshConfigId?: string;
  createdAt: number;
  lastUsedAt: number;
}

export interface SFTPFile {
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size: number;
  permissions: string;
  modifiedAt: number;
}

export interface ConnectionStatus {
  sessionId: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  error?: string;
  hostname?: string;
  username?: string;
}

export interface TerminalOutput {
  sessionId: string;
  data: string;
  timestamp: number;
  type: 'stdout' | 'stderr';
}

export type ExtensionType = 'theme' | 'language' | 'feature';

export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  type: ExtensionType;
  main: string;
  contributes: ExtensionContributes;
}

export interface ExtensionContributes {
  commands?: ExtensionCommand[];
  menus?: ExtensionMenu[];
}

export interface ExtensionCommand {
  command: string;
  title: string;
  icon?: string;
}

export interface ExtensionMenu {
  id: string;
  label: string;
  command?: string;
  submenu?: ExtensionMenu[];
}
