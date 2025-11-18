# 🌌 Zyra2D — High-Performance 2D Game Engine for JavaScript

**Zyra2D** 是一款现代化、开箱即用、专为 Web 设计的高性能 2D 游戏引擎。  
核心目标是 **轻量、快速、易用、可扩展**，同时拥有专业级别的 ECS + WebGL2 渲染架构。

- GitHub 项目名：**Zyra2D**
- npm 包名：**zyrajs**

---

# ✨ 特性愿景

- 🔥 **高性能渲染管线**（WebGL2 + 批处理）
- 🧬 **现代 ECS 架构**（Entity / Component / System）
- 🧱 **模块化设计**（Renderer / Assets / Input / Physics 等）
- 🎮 **开箱即用 API**
- 🧩 **插件体系**（动画、粒子、TileMap、UI）
- 🧰 **DevTools + Inspector**
- 🚀 **未来支持可视化编辑器 Zyra Studio**

---

# 📁 项目结构（骨架）

```
Zyra2D/
├─ packages/
│  ├─ zyra-core/              # 核心引擎：Engine + ECS + Canvas2D 占位渲染器
│  │  ├─ src/
│  │  │  ├─ core/             # Engine、World、Entity、System、Time
│  │  │  ├─ ecs/              # ECS：组件 + 系统（Transform / Sprite）
│  │  │  ├─ render/           # Renderer 接口 + CanvasRenderer 实现
│  │  │  ├─ assets/           # 资源加载（Image / JSON）
│  │  │  ├─ input/            # 键盘、鼠标、触摸输入
│  │  │  └─ index.ts          # 对外统一导出
│  │  └─ package.json
│  │
│  ├─ zyra-renderer-gl/       # WebGL2 渲染管线（v0.2 实现）
│  │  ├─ src/
│  │  └─ package.json
│  │
│  ├─ zyra-plugins/           # 额外插件：动画、粒子、TileMap（后续）
│  │  └─ package.json
│  │
│  └─ zyra-ui/                # UI 系统（文本、按钮、布局）
│     └─ package.json
│
├─ examples/
│  ├─ basic-demo/
│  │  ├─ index.html           # 简单示例：加载图片 + 渲染 sprite
│  │  ├─ main.ts
│  │  └─ vite.config.ts
│  │
│  └─ platformer-demo/        # 平台跳跃示例（未来）
│
├─ tsconfig.json
├─ package.json               # pnpm workspace 根配置
├─ pnpm-workspace.yaml
└─ README.md                  # 本文档
```

---

# 🧱 v0.1 架构说明（快速综述）

Zyra2D 的核心分为四大块：

### 1. **Engine Core**
- 游戏主循环（RAF + delta time）
- 场景管理（Scene，可后续拓展）
- 时间系统
- 全局上下文（EngineContext）

### 2. **ECS（Entity / Component / System）**
- 轻量 ECS 基础实现
- Transform、Sprite 等基础组件
- RenderSystem、MovementSystem 等系统

### 3. **Renderer（渲染）**
- Renderer 抽象接口  
- Canvas2DRenderer（v0.1 占位）
- WebGL2Renderer2D（v0.2）

### 4. **Assets + Input**
- 资源加载：Image、JSON
- 输入系统：Keyboard、Mouse、Touch

---

# 🗺️ Roadmap（工程 TODO 清单）

以下是 Zyra2D 的正式开发路线。按阶段完成即可形成一个可用的引擎体系。

---

## ✅ **v0.1 — 核心骨架搭建（当前阶段）**

### 🏗️ 项目基础
- [ ] 初始化 pnpm monorepo（packages + examples）
- [ ] `zyra-core` 创建并配置 TypeScript
- [ ] examples/basic-demo 能展示 1 个 sprite
- [ ] 基础构建脚本（build / dev / watch）

### 🧠 Engine Core
- [ ] Game Loop（requestAnimationFrame）
- [ ] 时间系统（deltaTime、elapsed）
- [ ] Engine 类（管理 world、renderer）
- [ ] Scene 设计（先单场景）

### 🧬 ECS
- [ ] Entity（唯一 ID + component 容器）
- [ ] Component 抽象基类
- [ ] System 抽象基类
- [ ] World（管理 entities + systems）

### 📦 组件
- [ ] Transform（x, y, rotation, scale）
- [ ] Sprite（texture / image）

### 🎨 Renderer（先 Canvas2D）
- [ ] Renderer 接口定义
- [ ] Canvas2DRenderer（clear/begin/drawSprite/end）
- [ ] RenderSystem（遍历实体并绘制）

### 🎮 Demo（最小功能验证）
- [ ] 加载图片
- [ ] 创建 1 个 entity 加 Sprite + Transform
- [ ] 屏幕中渲染出来
- [ ] 加简单移动逻辑（左右来回）

---

## 🚀 **v0.2 — 高性能 WebGL2 渲染管线**

- [ ] WebGL2Renderer2D 基础类
- [ ] Shader 管理 & 程序编译
- [ ] Quad 顶点缓冲
- [ ] Texture2D 封装
- [ ] SpriteBatch 批渲染
- [ ] Camera2D（视图矩阵）
- [ ] 性能统计（FPS、draw calls）

---

## 🎮 **v0.3 — 游戏性功能扩展**

### 输入系统
- [ ] Keyboard 输入
- [ ] Mouse 输入
- [ ] Touch 输入
- [ ] Input API 设计：`input.isKeyDown()`

### 动画
- [ ] Animation 组件
- [ ] FrameAnimation 支持
- [ ] AnimationSystem

### 物理（基础）
- [ ] Collider2D（AABB）
- [ ] 碰撞检测
- [ ] 简易 RigidBody2D
- [ ] PhysicsSystem（运动学）

---

## 🌐 **v0.4 — 资源管线 & TileMap**

- [ ] AssetManager（统一加载）
- [ ] 资源 manifest（preload 支持）
- [ ] TileSheet 渲染
- [ ] Tiled 地图 JSON 支持

---

## 🧰 **v0.5 — 开发体验提升**

- [ ] Entity Inspector（调试用）
- [ ] Debug 绘制（DrawBox、DrawGrid）
- [ ] create-zyra-game 脚手架
- [ ] 官方平台跳跃 DEMO

---

## 🪐 **v1.0 — 高级系统 / 插件生态**

- [ ] 粒子系统（CPU/GPU）
- [ ] UI 系统（文本、按钮、布局）
- [ ] 音效系统（Audio Manager）
- [ ] 可视化编辑器 Zyra Studio
- [ ] 插件生态正式开放

---