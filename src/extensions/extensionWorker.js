const { parentPort, workerData } = require('worker_threads');
const { extensionPath, manifest } = workerData;

const api = {
  terminal: {
    createTerminal: async (options) => {
      return { id: `terminal-${Date.now()}` };
    },
    getActiveTerminal: () => null,
    onTerminalCreated: (listener) => ({ dispose: () => {} })
  },
  ssh: {
    createConnection: async (config) => {},
    listConnections: () => [],
    onConnectionStatusChanged: (listener) => ({ dispose: () => {} })
  },
  window: {
    showInformationMessage: async (message) => {},
    showErrorMessage: async (message) => {},
    showOpenDialog: async (options) => []
  },
  files: {
    listDirectory: async (path) => [],
    downloadFile: async (remotePath, localPath) => {},
    uploadFile: async (localPath, remotePath) => {}
  }
};

const context = {
  subscriptions: [],
  workspaceState: {
    get: (key) => undefined,
    update: async (key, value) => {}
  },
  globalState: {
    get: (key) => undefined,
    update: async (key, value) => {}
  }
};

let extensionExports = {};

try {
  const mainPath = require('path').join(extensionPath, manifest.main);
  if (require('fs').existsSync(mainPath)) {
    extensionExports = require(mainPath);
  }
} catch (error) {
  console.error('Failed to load extension main:', error);
}

parentPort.on('message', async (message) => {
  if (message.type === 'request') {
    try {
      const { method, params, id } = message;
      const result = await executeMethod(method, params);
      parentPort.postMessage({ type: 'response', id, result });
    } catch (error) {
      parentPort.postMessage({ type: 'response', id: message.id, error: error.message });
    }
  }
});

async function executeMethod(method, params) {
  const parts = method.split('.');
  let obj = api;
  
  for (let i = 0; i < parts.length - 1; i++) {
    obj = obj[parts[i]];
    if (!obj) throw new Error(`Method not found: ${method}`);
  }
  
  const fn = obj[parts[parts.length - 1]];
  if (typeof fn !== 'function') throw new Error(`Method not found: ${method}`);
  
  return await fn(...params);
}

if (extensionExports.activate) {
  extensionExports.activate(context).then(() => {
    parentPort.postMessage({ type: 'ready' });
  }).catch((error) => {
    console.error('Extension activation failed:', error);
    parentPort.postMessage({ type: 'ready' });
  });
} else {
  parentPort.postMessage({ type: 'ready' });
}
