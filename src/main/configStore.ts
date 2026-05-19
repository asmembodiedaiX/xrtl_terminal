import * as fs from 'fs';
import * as path from 'path';
import keytar from 'keytar';

export interface SSHConfig {
  id: string;
  name: string;
  host: string;
  user: string;
  port: number;
  authMethod: 'password' | 'privateKey' | 'agent' | 'none';
  colorTag: string;
  environment: string;
  remarks: string;
  mfaEnabled: boolean;
  password?: string;
}

const SERVICE_NAME = 'XRTL Terminal';
const CONFIG_DIR_NAME = '.xrtl_terminal';
const CONFIG_FILE_NAME = 'config.json';

function getConfigDir(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '/';
  return path.join(homeDir, CONFIG_DIR_NAME);
}

function getConfigFilePath(): string {
  return path.join(getConfigDir(), CONFIG_FILE_NAME);
}

export async function saveSSHConfig(config: SSHConfig): Promise<void> {
  const configDir = getConfigDir();
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const existingConfigs = await loadAllSSHConfigs();
  const configToSave = { ...config };
  
  if (config.password) {
    const accountId = `${config.id}-password`;
    await keytar.setPassword(SERVICE_NAME, accountId, config.password);
    delete configToSave.password;
  }

  const index = existingConfigs.findIndex(c => c.id === config.id);
  if (index !== -1) {
    existingConfigs[index] = configToSave;
  } else {
    existingConfigs.push(configToSave);
  }

  fs.writeFileSync(getConfigFilePath(), JSON.stringify(existingConfigs, null, 2));
}

export async function loadAllSSHConfigs(): Promise<SSHConfig[]> {
  const configPath = getConfigFilePath();
  if (!fs.existsSync(configPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const configs = JSON.parse(content) as SSHConfig[];
    
    for (const config of configs) {
      const accountId = `${config.id}-password`;
      const password = await keytar.getPassword(SERVICE_NAME, accountId);
      if (password) {
        config.password = password;
      }
    }

    return configs;
  } catch {
    return [];
  }
}

export async function deleteSSHConfig(id: string): Promise<void> {
  const existingConfigs = await loadAllSSHConfigs();
  const filtered = existingConfigs.filter(c => c.id !== id);
  fs.writeFileSync(getConfigFilePath(), JSON.stringify(filtered, null, 2));
  
  const accountId = `${id}-password`;
  await keytar.deletePassword(SERVICE_NAME, accountId);
}

export async function updateSSHConfigPassword(id: string, newPassword: string): Promise<void> {
  const accountId = `${id}-password`;
  if (newPassword) {
    await keytar.setPassword(SERVICE_NAME, accountId, newPassword);
  } else {
    await keytar.deletePassword(SERVICE_NAME, accountId);
  }
}