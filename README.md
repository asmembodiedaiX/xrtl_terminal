# XRTL Terminal

一个基于 Electron 的现代化 SSH 终端应用，提供专业的远程服务器管理体验。

## ✨ 功能特性

- **SSH 连接管理**：支持密码认证和密钥认证，方便管理多个服务器连接
- **多会话终端**：支持同时打开多个 SSH 会话，通过标签页切换
- **主题切换**：支持深色、浅色、蓝色、护眼绿等多种主题
- **终端自定义**：支持 JetBrains Mono 字体，支持 Ctrl+滚轮缩放
- **拖拽调整布局**：可通过拖拽分割线调整侧边栏宽度
- **状态指示**：连接状态实时显示，成功连接显示呼吸绿色圆点
- **自定义对话框**：删除、重命名等操作使用统一风格的对话框
- **SFTP 文件传输**：支持上传、下载文件，断点续传，进度显示
- **目录浏览**：支持在应用内浏览远程服务器文件系统
- **专业提示符**：显示用户名、主机名和当前路径的彩色提示符

## 🛠️ 技术栈

- **框架**: Electron 31.7.7
- **前端**: React 18 + TypeScript
- **状态管理**: Zustand
- **终端模拟**: xterm.js
- **SSH 客户端**: ssh2
- **样式**: CSS-in-JS
- **构建工具**: Webpack
- **打包工具**: electron-builder

## 📁 项目结构

```
xrtl_terminal/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts             # 主入口，窗口创建和 IPC 处理
│   │   └── configStore.ts       # 配置存储管理（SQLite + keytar）
│   ├── renderer/                # 渲染进程（React）
│   │   ├── components/          # UI 组件
│   │   │   ├── Header.tsx       # 顶部导航栏
│   │   │   ├── Sidebar.tsx      # 左侧服务器列表
│   │   │   ├── TerminalPanel.tsx # 终端面板和多会话管理
│   │   │   ├── SSHConfigDialog.tsx  # SSH 配置对话框
│   │   │   ├── ThemeSwitcher.tsx    # 主题切换器
│   │   │   └── ...              # 其他组件（对话框、菜单等）
│   │   ├── stores/              # Zustand 状态管理
│   │   │   └── terminalStore.ts # 终端会话状态
│   │   ├── styles/              # 样式和主题
│   │   │   ├── theme.ts         # 主题配置
│   │   │   └── ThemeContext.tsx # 主题上下文
│   │   ├── App.tsx              # 根组件
│   │   └── index.tsx            # 渲染入口
│   ├── services/                # 业务服务
│   │   └── sshService.ts        # SSH 连接测试服务
│   ├── core/                    # 核心模块
│   │   ├── ssh/                 # SSH 客户端核心
│   │   ├── terminal/            # 终端管理
│   │   └── config/              # 配置管理
│   └── common/                  # 公共类型定义
├── resources/                   # 资源文件
│   ├── fonts/                   # JetBrains Mono 字体
│   └── icons/                   # 应用图标（logo.ico, logo.png）
├── extensions/                  # 扩展系统
├── webpack.main.config.js       # 主进程 Webpack 配置
├── webpack.renderer.config.js   # 渲染进程 Webpack 配置
└── package.json                 # 项目依赖和构建配置
```

## 🏗️ 架构设计

### 主进程架构（Main Process）

主进程负责：
- **窗口管理**：创建和管理 BrowserWindow，处理窗口事件
- **IPC 通信**：处理渲染进程发送的 SSH、SFTP 请求
- **配置存储**：使用 SQLite 存储配置，keytar 存储敏感密码
- **系统集成**：系统托盘、菜单栏、任务栏集成

```
src/main/index.ts
├── 应用启动初始化
│   ├── app.setName('XRTL Terminal')
│   ├── app.setAppUserModelId('com.xrtl.terminal')
│   └── 性能优化：禁用不必要的 Chromium 功能
├── 窗口创建 (createWindow)
│   ├── 窗口配置（尺寸、图标、frame、背景色）
│   ├── 开发/生产模式路由
│   └── ready-to-show 事件显示窗口
└── IPC 处理器
    ├── ssh-connect: SSH 连接管理
    ├── ssh-disconnect: 断开连接
    ├── sftp-list/sftp-upload/sftp-download: SFTP 操作
    ├── save-ssh-config/load-ssh-configs/delete-ssh-config: 配置管理
    └── ssh-test-connection: 连接测试
```

### 渲染进程架构（Renderer Process）

渲染进程负责：
- **UI 渲染**：React 组件构建用户界面
- **状态管理**：Zustand 管理终端会话状态
- **主题系统**：支持多主题切换
- **用户交互**：处理用户输入和操作

### 配置数据流

```
用户操作 → React Component → IPC 调用 → Main Process → SSH2/SFTP
                                                    ↓
                                            SQLite (配置存储)
                                            Keytar (密码存储)
```

## � 配置说明

### 构建配置（package.json）

```json
{
  "build": {
    "appId": "com.xrtl.terminal",
    "productName": "XRTL Terminal",
    "asar": true,
    "compression": "maximum",
    "win": {
      "icon": "resources/icons/logo.ico",
      "target": ["portable", "nsis"]
    },
    "nsis": {
      "oneClick": false,
      "artifactName": "${productName} Setup ${version} Installer.exe"
    }
  }
}
```

### 主进程配置（src/main/index.ts）

- **app.setName()**: 设置应用显示名称
- **app.setAppUserModelId()**: 设置 Windows 应用标识符，解决任务栏显示问题
- **app.commandLine.appendSwitch()**: Chromium 启动参数优化

### 开发服务器配置

- **端口**: 3001（避免端口冲突）
- **热模块替换**: HMR 启用

### 性能优化配置

#### Electron Builder 优化
- `asar`: 启用 asar 压缩减少 IO 开销
- `compression: "maximum"`: 最大压缩率
- `asarUnpack`: 解压原生模块（.node, .dll）

#### Webpack 优化
- `TerserPlugin`: 生产环境代码压缩，移除 console 和 debugger
- `DefinePlugin`: 环境变量定义
- 代码分割和懒加载

#### 启动性能优化
- 延迟加载 SSH2 和配置存储模块
- 简化窗口显示逻辑
- 移除不必要的超时和重试机制
- Chromium 命令行优化：
  - `--disable-features=OutOfBlinkCors`
  - `--disable-renderer-backgrounding`
  - `--force-gpu-rasterization`
  - `--enable-features=VaapiVideoDecoder`

### SSH 配置存储

- **配置文件**: `~/.xrtl_terminal/config.json`
- **密码存储**: 系统密钥链（keytar）
- **数据结构**:
  ```typescript
  interface SSHConfig {
    id: string;
    name: string;
    host: string;
    port: number;
    username: string;
    password?: string; // 存储在 keytar 中
  }
  ```

### PS1 提示符配置

默认 PS1 配置（可在设置中自定义）：
```bash
\[\e[32m\][\u@\h\[\e[0m\]:\[\e[34m\]\w\[\e[32m\]]\[\e[0m\]#
```

显示效果：`[root@hostname:~]#`

配色方案：
- 用户名/提示符：`绿色 (32)`
- 路径：`蓝色 (34)`
- 重置：`\e[0m`

## �🚀 快速开始

### 环境要求

- Node.js 18+
- npm 9+
- Windows 10/11

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 打包应用

```bash
npm run package    # 打包到 dist 目录（不压缩）
npm run dist       # 打包并压缩为可分发文件
```

## � 打包输出

构建完成后，dist 目录包含：

- `XRTL_Terminal 1.0.0.exe` - 便携版（Portable）
- `XRTL_Terminal Setup 1.0.0 Installer.exe` - NSIS 安装程序

**建议使用 NSIS 安装程序版本**，可正确设置：
- Windows 开始菜单快捷方式
- 桌面快捷方式
- 任务栏图标和名称
- 系统卸载程序

## �📖 使用说明

### 新建连接

1. 点击左侧侧边栏的 `+` 按钮或右键菜单选择"新建连接"
2. 在配置对话框中填写服务器信息：
   - **名称**: 连接的显示名称
   - **主机**: 服务器 IP 或域名
   - **端口**: SSH 端口（默认 22）
   - **用户名**: 登录用户名
   - **密码**: 登录密码（可选）
3. 点击"测试连接"验证配置是否正确
4. 点击"保存"完成配置

### 连接服务器

- **双击**服务器列表中的条目即可连接
- 连接成功后，状态圆点会变成绿色并显示呼吸效果

### SFTP 文件传输

1. 连接成功后，点击工具栏的"传输文件"按钮
2. 选择本地文件和远程目标路径
3. 支持断点续传，进度实时显示
4. 可通过"下载"按钮从远程下载文件到本地

### 目录浏览

1. 点击工具栏的"浏览目录"按钮
2. 在弹出的对话框中输入远程目录路径
3. 支持创建目录、删除文件等操作

### 多会话管理

- 每个连接会打开一个新的终端标签页
- 点击标签页切换会话
- 点击标签页右侧的 `×` 关闭会话

### 主题切换

点击顶部导航栏的主题按钮，选择喜欢的主题颜色。

### 终端快捷键

- `Ctrl + 滚轮`: 调整字体大小
- `Ctrl + C`: 中断当前命令
- `Ctrl + D`: 关闭终端会话

## � 故障排除

### 任务栏显示 "Electreecon" 或 "Electron"

**解决方案**：
1. 使用 NSIS 安装程序版本安装
2. 或清除 Windows 图标缓存：
   ```cmd
   taskkill /f /im explorer.exe
   del %localappdata%\IconCache.db /a
   start explorer.exe
   ```

### 开发模式端口占用

如果端口 3001 被占用，修改 `webpack.renderer.config.js` 中的端口号，并同步更新 `src/main/index.ts` 中的 `localhost:PORT`。

### 启动速度慢

已启用多项优化：
- asar 压缩
- Terser 代码压缩
- 延迟加载模块
- 禁用不必要的 Chromium 功能

如仍慢，可尝试：
1. 使用安装程序版本（已优化）
2. 检查杀毒软件是否拦截

## 📝 版本历史

### v1.0.0
- 初始版本
- SSH 连接管理
- 多会话终端
- SFTP 文件传输
- 多主题支持
- 性能优化

## 📝 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**XRTL Terminal** - 专业的 SSH 终端管理工具
