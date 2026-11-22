# 项目导览系统

自动生成分类导览页面的静态网站项目，支持按类别组织HTML文档，自动扫描并按修改时间排序展示。

## 特性

- 📁 基于文件夹的分类组织
- 🔍 实时搜索功能
- 🏷️ 支持标签和元数据
- 📌 文档置顶功能
- ⏰ 按更新时间自动排序
- 🚀 自动部署到 GitHub Pages
- 🎨 响应式深色主题设计

## 目录结构

```
project-root/
├── index.html              # 主导览页
├── config.json             # 网站配置（标题、图标、主题）
├── categories/             # 所有分类存放在这里
│   ├── 物理/
│   │   ├── 牛顿力学.html
│   │   ├── 量子物理.html
│   │   └── 子文件夹/       # 支持子文件夹（会扁平化到父类别下）
│   │       └── 相对论.html
│   ├── 摘抄/
│   │   ├── 文学摘抄.html
│   │   └── 哲学思考.html
│   └── ...
├── build/
│   └── scan.js            # 扫描脚本
├── data.json              # 自动生成的配置文件（不要手动编辑）
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml     # GitHub Actions配置
```

## 配置网站信息

编辑根目录的 `config.json` 来自定义网站外观：

```json
{
  "title": "我的知识库",
  "subtitle": "个人学习笔记与资料整理",
  "favicon": "📚",
  "searchPlaceholder": "搜索项目、标签或描述..."
}
```

修改此文件后，运行 `npm run preview` 或 `npm run deploy` 即可看到效果。

## 快速开始

### 1. 克隆或初始化仓库

```bash
git clone <your-repo-url>
cd <your-repo-name>
npm install
```

### 2. 本地预览

在命令行中运行：

```bash
npm run preview
```

这个命令会：
- 自动扫描所有类别和文档
- 启动本地服务器
- 在浏览器中打开预览（http://localhost:8080）

**提示：** 每次添加或修改文档后，重新运行此命令查看效果。

### 3. 推送到 GitHub

完成内容编辑后，运行：

```bash
npm run deploy
```

这个命令会：
- 自动构建配置文件
- 显示变更的文件列表
- 提示你输入提交信息（可留空使用默认）
- 自动执行 git add、commit 和 push
- 触发 GitHub Actions 自动部署

### 4. 添加新类别

在 `categories/` 目录下创建新文件夹，例如：

```bash
mkdir categories/编程
```

**注意**：类别是单层的，但类别文件夹内可以包含子文件夹来组织HTML文件，所有HTML都会扁平化到该类别下展示。

### 5. 添加新项目

在类别文件夹中创建 HTML 文件。每个 HTML 文件应包含元数据注释：

```html
<!--
title: 文档标题
description: 这是一段简短的描述
tags: 标签1, 标签2, 标签3
date: 2024-03-15
pinned: true
-->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>文档标题</title>
</head>
<body>
  <h1>你的内容</h1>
  <p>这里是正文内容...</p>
</body>
</html>
```

**元数据说明：**
- `title`: 项目标题（必填）
- `description`: 简短描述（可选）
- `tags`: 逗号分隔的标签（可选）
- `date`: 创建日期（可选，不填会使用文件修改时间）
- `pinned`: 是否置顶（可选，设为 `true` 或 `1` 置顶该文档）

### 6. 置顶重要文档

在HTML文件顶部元数据中添加 `pinned: true` 即可将文档置顶：

```html
<!--
title: 重要通知
description: 这是一个重要文档
tags: 重要, 必读
date: 2024-03-20
pinned: true
-->
```

**置顶效果：**
- 置顶文档显示在该类别的最上方
- 带有金色的图钉标记 📌
- 卡片边框带有金色高亮
- 多个置顶文档之间仍按修改时间排序

## 常用命令

### 本地预览
```bash
npm run preview
```
自动构建并在浏览器中打开预览页面（http://localhost:8080）

### 推送部署
```bash
npm run deploy
```
自动构建、提交变更并推送到 GitHub，触发自动部署

### 仅构建
```bash
npm run build
```
只生成 data.json 配置文件，不启动服务器

## 部署配置

### GitHub Pages

#### 首次设置

1. 在 GitHub 仓库设置中启用 Pages:
   - 进入 Settings → Pages
   - Source 选择 "GitHub Actions"

2. 推送代码到 main 分支：

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

或直接使用：

```bash
npm run deploy
```

#### 日常使用

添加或修改内容后，运行：

```bash
npm run deploy
```

GitHub Actions 会自动构建并部署到 Pages。

### Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Pages，点击 "Create a project"
3. 连接你的 GitHub 仓库
4. 构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `/`
   - **Root directory**: `/`
5. 部署

Cloudflare 会自动监听 GitHub 推送并重新部署。

## 典型工作流程

### 日常使用

**方式一：直接推送（推荐）**

```bash
# 1. 编辑或添加 HTML 文件到对应类别文件夹
# 2. 运行部署命令
npm run deploy
# 3. 输入提交信息（或按回车使用默认）
# 4. 等待自动部署完成
```

**方式二：本地预览后推送**

```bash
# 1. 编辑或添加 HTML 文件
# 2. 本地预览效果
npm run preview
# 3. 确认无误后推送
npm run deploy
```

### 项目排序规则

- 每个类别内的项目按**最后修改时间**降序排列（最新的在上）
- **置顶项目**始终显示在该类别最上方
  - 置顶项目之间也按修改时间排序
  - 未置顶项目显示在所有置顶项目之后
- 类别本身也按**该类别中最新项目的时间**排序

### 搜索功能

导览页支持实时搜索：
- 搜索会匹配标题、描述、标签
- 输入时自动过滤显示

## 自定义样式

如需修改导览页外观，编辑 `index.html` 中的 CSS 变量：

```css
:root {
  --surface-0: #05070C;   /* 背景色 */
  --accent: #38BDF8;      /* 强调色 */
  --text-primary: #E5E7EB; /* 主文字颜色 */
  /* ... 其他变量 */
}
```

## 常见问题

**Q: 如何删除类别？**  
A: 直接删除 `categories/` 下对应的文件夹，提交推送即可。

**Q: 为什么我的更新没有显示？**  
A: 检查 GitHub Actions 是否运行成功（Actions 标签页），清除浏览器缓存后刷新。

**Q: 可以在类别下使用子文件夹吗？**  
A: 可以，但子文件夹中的所有HTML会被扁平化展示在父类别下，不会显示为单独的子类别。

## 许可证

MIT
