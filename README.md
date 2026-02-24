# Swiss Tech Precision - 光刻效果预览系统

一个光效仓库和光效展示合并的网页，用于展示光刻效果的交互式多视角查看器。

## 功能特性

- 🎬 多视角视频拖拽式预览（正视图、背视图、左视图、右视图、俯视图、仰视图）
- 🎨 三层光效合成（云膜底层 + 内容中层 + Overlay 光效顶层）
- 🖼️ 整体平面图双模式切换（效果图 ↔ 灰度图，长按预览）
- 📱 响应式设计，支持移动端触控与手势缩放
- ✨ 视差背景与 3D 倾斜效果
- 💡 智能视频防黑屏（Seek 锁 + readyState 保护）

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (Canvas API)
- **后端**: Node.js + Express
- **文件上传**: Multer

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动服务器

```bash
npm start
# 或者
node server.js
```

服务器将在 `http://localhost:3000` 启动。

### 使用 start.bat (Windows)

双击 `start.bat` 文件即可自动启动服务器。

## 目录结构

```
yunmo/
├── public/              # 静态资源
│   ├── index.html      # 主查看器页面
│   └── project_A/      # 项目资源文件
│       └── v1/         # 当前版本资源
│           ├── effect_overview_front.mp4  # 正视图
│           ├── effect_overview_back.mp4   # 背视图
│           ├── effect_overview_left.mp4   # 左视图
│           ├── effect_overview_right.mp4  # 右视图
│           ├── effect_overview_top.mp4    # 俯视图
│           ├── Overlay.mp4               # 光效叠加层
│           ├── xgt/xgt.png              # 效果图（整体平面图）
│           └── hdt/hdt.png              # 灰度图（整体平面图）
├── server.js           # Express 服务器
├── package.json        # 项目配置
└── start.bat          # Windows 启动脚本
```

## 更新日志

### 2026-02-24
- 删除版本检测与版本切换模块，固定使用单版本（v1）
- 历史版本按钮替换为右下角浮动切换按钮（FAB 模式）
- 修复视频拖动黑屏/闪烁问题（seeking 期间跳过 clearRect，加 readyState 保护）
- 整体平面图独立缩放/平移状态（进入时重置居中）
- 整体平面图切换改为长按预览灰度图、松开还原，前三视图保持点击切换

### 2026-01-30
- 迁移至 MP4 视频拖拽预览（替代图像序列）
- 引入三层合成渲染（云膜 + 内容 + Overlay）
- 整体平面图新增效果图 / 灰度图双模式

## License

MIT
