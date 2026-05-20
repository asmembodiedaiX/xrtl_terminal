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

## 🛠️ 技术栈

- **框架**: Electron 28
- **前端**: React 18 + TypeScript
- **状态管理**: Zustand
- **终端模拟**: xterm.js
- **SSH 客户端**: ssh2
- **样式**: CSS-in-JS
- **构建工具**: Webpack

## 📁 项目结构

```
xrtl_terminal/
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts             # 主入口，窗口创建和 IPC 处理
│   │   └── configStore.ts       # 配置存储管理
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
│   └── icons/                   # 应用图标
├── extensions/                  # 扩展系统
├── webpack.main.config.js       # 主进程 Webpack 配置
├── webpack.renderer.config.js   # 渲染进程 Webpack 配置
└── package.json                 # 项目依赖
```

## 🚀 快速开始

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
npm run package
```

## 📖 使用说明

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

## 🔧 配置说明

服务器配置文件存储在用户主目录下的 `.xrtl_terminal/config.json` 文件中。密码使用系统密钥链安全存储。

## 📝 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**XRTL Terminal** - 专业的 SSH 终端管理工具