# Gitouch - 更懂你的桌面记忆助手

一款优雅、安全的本地桌面剪贴板和笔记管理工具，帮助你高效管理复制内容和笔记。

## 一句话介绍

一款注重隐私的本地桌面工具，智能管理剪贴板历史和笔记，让你的数字生活更加有序。

## 项目简介

Gitouch（Git + Touch）是一款专为 Windows 用户设计的桌面效率工具。它能够自动记录你的剪贴板历史，支持网页来源标注，同时提供强大的笔记管理功能。所有数据均存储在本地，无需担心隐私泄露。

## 功能特点

### 剪贴板管理
- 自动记录剪贴板历史，支持文本和图片
- 智能去重，避免重复内容
- 支持置顶重要内容
- **网页来源标注**：记录从网页复制的内容来源（标题、URL、域名）

### 笔记管理
- Markdown 格式支持
- 文件夹分类管理
- 快速搜索
- AI 智能总结（需配置 API）

### AI 助手
- 内置 AI 对话功能
- 支持剪贴板内容总结
- 支持笔记内容总结
- Markdown 格式渲染

### 系统集成
- 系统托盘运行
- 开机自启动
- 小窗口/大窗口模式切换
- 全局快捷键支持

## 快速开始

### 安装

1. 从 [Releases](https://github.com/yourusername/gitouch/releases) 下载最新版本的安装包
2. 运行 `Gitouch-Setup-x.x.x.exe`
3. 按照安装向导完成安装

### 从源码运行

```bash
# 克隆项目
git clone https://github.com/yourusername/gitouch.git

# 进入项目目录
cd gitouch

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建应用
npm run build
```

## 使用说明

### 首次使用

1. 启动应用后，应用会最小化到系统托盘
2. 点击托盘图标可打开主界面
3. 按下全局快捷键可快速唤起应用

### 剪贴板记录

- 复制内容后，应用会自动记录
- 在剪贴板列表中查看历史记录
- 点击卡片可查看详情
- 从网页复制的内容会自动标注来源信息

### 笔记管理

1. 切换到"笔记"标签页
2. 创建文件夹整理笔记
3. 使用 Markdown 编辑笔记
4. 右键可对笔记进行AI总结

### AI 配置

1. 点击右上角设置图标
2. 在"AI 配置"中填入 API 地址和密钥
3. 保存后即可使用 AI 功能

## 安全与隐私声明

**隐私优先**：Gitouch 是一款注重隐私的工具，所有数据均存储在本地。

- 所有数据存储在本地，不上传到任何服务器
- 不收集任何用户信息
- 不包含任何追踪代码
- AI 功能仅在使用时传输数据，且仅传输必要内容
- 用户可随时删除所有本地数据

数据存储位置：`%APPDATA%/Gitouch/`

## 技术栈

- **框架**：Electron 33 + React 18 + TypeScript 5
- **构建工具**：Vite 6
- **状态管理**：Zustand
- **数据库**：better-sqlite3
- **样式**：CSS Variables + 原生 CSS
- **图标**：Lucide Icons（内联 SVG）
- **打包工具**：electron-builder

## 项目结构

```
gitouch/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.ts       # 入口文件
│   │   ├── database.ts    # 数据库操作
│   │   ├── clipboard-monitor.ts  # 剪贴板监控
│   │   ├── auto-launch.ts # 开机自启
│   │   └── tray.ts        # 系统托盘
│   ├── preload/           # 预加载脚本
│   │   └── preload.ts
│   ├── renderer/          # React 渲染进程
│   │   ├── components/   # React 组件
│   │   ├── stores/        # Zustand 状态
│   │   ├── utils/         # 工具函数
│   │   └── App.tsx        # 主应用组件
│   └── shared/            # 共享类型
│       └── types.ts
├── dist/                  # 构建输出
├── dist-final/            # 最终打包目录
├── package.json
├── vite.config.ts
├── tsconfig.json
└── electron-builder.yml
```

## Roadmap

### v1.1（规划中）
- [ ] 数据导入/导出功能
- [ ] 剪贴板内容搜索增强
- [ ] 笔记模板支持

### v1.2（规划中）
- [ ] 多语言支持
- [ ] 主题自定义
- [ ] 快捷指令

### 未来计划
- [ ] 跨设备同步（可选，云端加密）
- [ ] 插件系统
- [ ] 浏览器扩展

## FAQ

### Q: 应用在后台运行吗？
A: 是的，应用会最小化到系统托盘，持续监控剪贴板。你可以在设置中关闭开机自启动。

### Q: 我的数据安全吗？
A: 非常安全。所有数据都存储在本地（`%APPDATA%/Gitouch/`），不经过任何服务器。

### Q: 如何禁用剪贴板监控？
A: 在设置中可以关闭剪贴板监控功能。

### Q: 支持 Mac 或 Linux 吗？
A: 目前仅支持 Windows。我们计划在未来版本中增加跨平台支持。

### Q: AI 功能需要付费吗？
A: Gitouch 本身免费。AI 功能需要你自己提供 API（如 OpenAI、Claude 等），费用由 API 提供商收取。

## Contributing

欢迎贡献代码！

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## License

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目主页：https://github.com/yourusername/gitouch
- 问题反馈：https://github.com/yourusername/gitouch/issues

---

Made with care for productivity enthusiasts
