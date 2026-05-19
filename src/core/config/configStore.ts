import * as fs from 'fs';
import * as path from 'path';
import { SSHConfig, TerminalSession } from '../../common/types';

const CONFIG_DIR = path.join(process.env.APPDATA || process.env.HOME || '/', '.xrtl-terminal');
const SSH_CONFIG_FILE = path.join(CONFIG_DIR, 'ssh-configs.json');
const SESSION_FILE = path.join(CONFIG_DIR, 'sessions.json');

export class ConfigStore {
  private sshConfigs: SSHConfig[] = [];
  private sessions: TerminalSession[] = [];

  constructor() {
    this.ensureConfigDir();
    this.loadConfigs();
    this.loadSessions();
  }

  private ensureConfigDir(): void {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
  }

  private loadConfigs(): void {
    try {
      if (fs.existsSync(SSH_CONFIG_FILE)) {
        const data = fs.readFileSync(SSH_CONFIG_FILE, 'utf-8');
        this.sshConfigs = JSON.parse(data);
      }
    } catch {
      this.sshConfigs = [];
    }
  }

  private saveConfigs(): void {
    fs.writeFileSync(SSH_CONFIG_FILE, JSON.stringify(this.sshConfigs, null, 2));
  }

  private loadSessions(): void {
    try {
      if (fs.existsSync(SESSION_FILE)) {
        const data = fs.readFileSync(SESSION_FILE, 'utf-8');
        this.sessions = JSON.parse(data);
      }
    } catch {
      this.sessions = [];
    }
  }

  private saveSessions(): void {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(this.sessions, null, 2));
  }

  getSSHConfigs(): SSHConfig[] {
    return [...this.sshConfigs];
  }

  getSSHConfig(id: string): SSHConfig | undefined {
    return this.sshConfigs.find(c => c.id === id);
  }

  addSSHConfig(config: Omit<SSHConfig, 'id'>): SSHConfig {
    const newConfig: SSHConfig = {
      ...config,
      id: `config-${Date.now()}`
    };
    this.sshConfigs.push(newConfig);
    this.saveConfigs();
    return newConfig;
  }

  updateSSHConfig(id: string, updates: Partial<SSHConfig>): void {
    const index = this.sshConfigs.findIndex(c => c.id === id);
    if (index !== -1) {
      this.sshConfigs[index] = { ...this.sshConfigs[index], ...updates };
      this.saveConfigs();
    }
  }

  deleteSSHConfig(id: string): void {
    this.sshConfigs = this.sshConfigs.filter(c => c.id !== id);
    this.saveConfigs();
  }

  getSessions(): TerminalSession[] {
    return [...this.sessions];
  }

  getSession(id: string): TerminalSession | undefined {
    return this.sessions.find(s => s.id === id);
  }

  addSession(session: Omit<TerminalSession, 'id' | 'createdAt' | 'lastUsedAt'>): TerminalSession {
    const now = Date.now();
    const newSession: TerminalSession = {
      ...session,
      id: `session-${now}`,
      createdAt: now,
      lastUsedAt: now
    };
    this.sessions.push(newSession);
    this.saveSessions();
    return newSession;
  }

  updateSession(id: string, updates: Partial<TerminalSession>): void {
    const index = this.sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      this.sessions[index] = { ...this.sessions[index], ...updates, lastUsedAt: Date.now() };
      this.saveSessions();
    }
  }

  deleteSession(id: string): void {
    this.sessions = this.sessions.filter(s => s.id !== id);
    this.saveSessions();
  }
}

export const configStore = new ConfigStore();
