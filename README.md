# XRTL Terminal - SSH 终端应用程序架构设计

## 概述

XRTL Terminal 是一个基于 VSCode 架构风格的现代化 SSH 终端应用程序。采用插件化架构设计，支持多标签页管理、远程服务器连接、文件传输等核心功能。

---

## 架构体系

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        用户界面层 (UI Layer)                        │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐ │
│   │ 主窗口框架   │ │ 标签页管理   │ │         状态栏              │ │
│   └─────────────┘ └─────────────┘ └─────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                        核心服务层 (Core Services)                    │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│   │  SSH Client │ │ 文件传输    │ │ 会话管理    │ │ 配置管理    │ │
│   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                        插件系统层 (Extension System)                 │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│   │ 插件管理器   │ │ 扩展API     │ │ 事件系统    │ │ 生命周期    │ │
│   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                        基础设施层 (Infrastructure)                  │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│   │ 日志系统    │ │ 错误处理    │ │ 国际化      │ │ 性能监控    │ │
│   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 核心组件

### 1. 主窗口框架 (Main Window)

| 组件 | 职责 | 技术实现 |
|------|------|----------|
| `Window` | 主窗口管理、布局控制 | Electron BrowserWindow |
| `MenuBar` | 顶部菜单栏 | Electron Menu |
| `ActivityBar` | 侧边活动栏 | React 组件 |
| `StatusBar` | 底部状态栏 | React 组件 |

### 2. 终端核心 (Terminal Core)

| 组件 | 职责 | 技术实现 |
|------|------|----------|
| `Terminal` | 单个终端会话 | xterm.js |
| `TabManager` | 多标签页管理 | 自定义状态管理 |
| `SplitPane` | 面板分割布局 | React Split Pane |

### 3. SSH 服务 (SSH Service)

| 组件 | 职责 | 技术实现 |
|------|------|----------|
| `SSHClient` | SSH 连接管理 | ssh2 |
| `SFTP` | 文件传输服务 | ssh2-sftp-client |
| `SessionManager` | 会话持久化 | SQLite |
| `ConfigStore` | 连接配置管理 | 本地文件/数据库 |

### 4. 插件系统 (Extension System)

| 组件 | 职责 | 技术实现 |
|------|------|----------|
| `ExtensionHost` | 插件运行沙箱 | Node.js Worker |
| `ExtensionManager` | 插件生命周期管理 | 自定义实现 |
| `ExtensionAPI` | 插件开发接口 | TypeScript 接口 |
| `EventBus` | 全局事件总线 | RxJS |

---

## 目录结构

```
xrtl-terminal/
├── .vscode/                    # VSCode 配置
├── build/                      # 构建产物
├── src/
│   ├── main/                   # 主进程代码 (Electron)
│   │   ├── index.ts            # 入口文件
│   │   ├── window.ts           # 窗口管理
│   │   └── menu.ts             # 菜单配置
│   ├── renderer/               # 渲染进程代码 (React)
│   │   ├── components/         # UI 组件
│   │   │   ├── Terminal/       # 终端组件
│   │   │   ├── TabBar/         # 标签栏组件
│   │   │   ├── Sidebar/        # 侧边栏组件
│   │   │   └── StatusBar/      # 状态栏组件
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── stores/             # 状态管理
│   │   ├── App.tsx             # 主应用组件
│   │   └── index.tsx           # 渲染入口
│   ├── core/                   # 核心服务
│   │   ├── ssh/                # SSH 相关服务
│   │   │   ├── client.ts       # SSH 客户端
│   │   │   ├── sftp.ts         # SFTP 服务
│   │   │   └── session.ts      # 会话管理
│   │   ├── terminal/           # 终端核心
│   │   │   ├── manager.ts      # 终端管理器
│   │   │   └── parser.ts       # 终端输出解析
│   │   ├── config/             # 配置管理
│   │   └── logger/             # 日志系统
│   ├── extensions/             # 插件系统
│   │   ├── host.ts             # 插件宿主
│   │   ├── manager.ts          # 插件管理器
│   │   └── api/                # 插件 API 定义
│   └── common/                 # 公共模块
│       ├── types/              # 类型定义
│       ├── utils/              # 工具函数
│       └── constants/          # 常量定义
├── extensions/                 # 内置插件目录
│   └── built-in/               # 内置插件
├── test/                       # 测试文件
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

---

## 技术栈

| 层次 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Electron | ^30.0.0 | 桌面应用框架 |
| UI | React | ^18.0.0 | UI 组件库 |
| 状态管理 | Zustand | ^4.5.0 | 轻量级状态管理 |
| 终端 | xterm.js | ^5.0.0 | 终端渲染引擎 |
| SSH | ssh2 | ^1.15.0 | SSH 客户端库 |
| SFTP | ssh2-sftp-client | ^9.0.0 | SFTP 客户端 |
| 数据库 | SQLite3 | ^5.0.0 | 会话持久化 |
| 构建 | Webpack | ^5.0.0 | 模块打包工具 |
| 语言 | TypeScript | ^5.0.0 | 类型安全 |

---

## 核心功能模块

### 1. 终端会话管理

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 多标签页 | 支持多个终端会话同时打开 | P0 |
| 标签切换 | 快速切换不同终端会话 | P0 |
| 会话重连 | 断开后自动重连 | P1 |
| 会话保存 | 持久化会话配置 | P1 |

### 2. SSH 连接

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 密码认证 | 支持密码登录 | P0 |
| 密钥认证 | 支持 SSH 密钥登录 | P0 |
| 代理支持 | 支持 SOCKS/HTTP 代理 | P2 |
| 端口转发 | 本地端口转发 | P2 |

### 3. 文件传输

| 功能 | 描述 | 优先级 |
|------|------|--------|
| SFTP 浏览 | 远程文件系统浏览 | P1 |
| 文件上传 | 本地文件上传到远程 | P1 |
| 文件下载 | 远程文件下载到本地 | P1 |
| 文件管理 | 创建/删除/重命名文件 | P1 |

### 4. 插件系统

| 功能 | 描述 | 优先级 |
|------|------|--------|
| 插件安装 | 从市场安装插件 | P2 |
| 插件开发 | 提供插件 API | P2 |
| 插件管理 | 启用/禁用/卸载插件 | P2 |

---

## 插件 API 设计

### 核心接口

```typescript
// 终端相关 API
interface ITerminalAPI {
  createTerminal(options: TerminalOptions): Terminal;
  getActiveTerminal(): Terminal | undefined;
  onTerminalCreated(listener: (terminal: Terminal) => void): Disposable;
}

// SSH 相关 API
interface ISSHAPI {
  createConnection(config: SSHConfig): Promise<SSHConnection>;
  listConnections(): SSHConnection[];
  onConnectionStatusChanged(listener: (status: ConnectionStatus) => void): Disposable;
}

// 窗口相关 API
interface IWindowAPI {
  showInformationMessage(message: string): Promise<void>;
  showErrorMessage(message: string): Promise<void>;
  showOpenDialog(options: OpenDialogOptions): Promise<string[] | undefined>;
}
```

---

## 数据流设计

### 连接建立流程

```
用户输入连接配置
       │
       ▼
┌──────────────────┐
│ ConfigStore      │ 验证配置
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ SSHClient        │ 建立连接
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ SessionManager   │ 保存会话
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Terminal         │ 创建终端视图
└──────────────────┘
```

### 终端输出流程

```
SSH Server
    │
    ▼
┌──────────────────┐
│ SSHClient        │ 接收数据
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ TerminalParser   │ 解析 ANSI 转义
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ xterm.js         │ 渲染到 UI
└──────────────────┘
```

---

## 安全性考虑

| 安全特性 | 实现方式 |
|----------|----------|
| 密码加密 | 使用 AES-256 加密存储 |
| 密钥保护 | 使用系统密钥链存储敏感信息 |
| 连接验证 | 验证服务器主机密钥 |
| 会话隔离 | 每个会话独立进程 |
| 权限控制 | 插件沙箱隔离 |

---

## 性能优化

| 优化策略 | 说明 |
|----------|------|
| 虚拟滚动 | 大量输出时使用虚拟滚动 |
| 懒加载 | 按需加载插件和组件 |
| 连接池 | 复用 SSH 连接 |
| 缓存机制 | 缓存远程文件列表 |

---

## 开发路线图

| 阶段 | 目标 | 时间 |
|------|------|------|
| Phase 1 | 基础终端功能 + SSH 连接 | 4 周 |
| Phase 2 | 多标签页 + 文件传输 | 3 周 |
| Phase 3 | 插件系统 + 配置管理 | 4 周 |
| Phase 4 | 高级功能 + 性能优化 | 3 周 |

---

## 启动项目

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm run test
```

---

## 贡献指南

请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何贡献代码。

---

## 许可证

MIT License