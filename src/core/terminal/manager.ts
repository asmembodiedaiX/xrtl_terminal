import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { SSHClient } from '../ssh/client';
import { SSHConfig } from '../../common/types';

export class TerminalManager {
  private terminals: Map<string, Terminal> = new Map();
  private fitAddons: Map<string, FitAddon> = new Map();
  private sshClients: Map<string, SSHClient> = new Map();

  createTerminal(id: string, container: HTMLElement): Terminal {
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4'
      }
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminal.open(container);
    fitAddon.fit();

    this.terminals.set(id, terminal);
    this.fitAddons.set(id, fitAddon);

    return terminal;
  }

  getTerminal(id: string): Terminal | undefined {
    return this.terminals.get(id);
  }

  removeTerminal(id: string): void {
    const terminal = this.terminals.get(id);
    const fitAddon = this.fitAddons.get(id);
    const sshClient = this.sshClients.get(id);

    if (terminal) {
      terminal.dispose();
      this.terminals.delete(id);
    }

    if (fitAddon) {
      this.fitAddons.delete(id);
    }

    if (sshClient) {
      sshClient.disconnect();
      this.sshClients.delete(id);
    }
  }

  resizeTerminal(id: string): void {
    const fitAddon = this.fitAddons.get(id);
    if (fitAddon) {
      fitAddon.fit();
    }
  }

  async connectSSH(id: string, config: SSHConfig): Promise<void> {
    const terminal = this.terminals.get(id);
    if (!terminal) {
      throw new Error('Terminal not found');
    }

    const sshClient = new SSHClient();
    this.sshClients.set(id, sshClient);

    sshClient.on('status', (status) => {
      if (status.status === 'connected') {
        terminal.write(`Connected to ${status.hostname} as ${status.username}\r\n$ `);
      } else if (status.status === 'error') {
        terminal.write(`Error: ${status.error}\r\n$ `);
      }
    });

    await sshClient.connect(config);

    const channel = await sshClient.startShell();

    channel.on('data', (data: Buffer) => {
      terminal.write(data.toString());
    });

    channel.on('close', () => {
      terminal.write('\r\nConnection closed\r\n$ ');
    });

    terminal.onData((data: string) => {
      channel.write(data);
    });
  }

  writeToTerminal(id: string, data: string): void {
    const terminal = this.terminals.get(id);
    if (terminal) {
      terminal.write(data);
    }
  }

  getActiveTerminals(): string[] {
    return Array.from(this.terminals.keys());
  }
}

export const terminalManager = new TerminalManager();
