# ZryaJS – 2D 游戏引擎核心文档（v0.1.0）

ZryaJS 是一个极简、可扩展、类 Flame 风格的 2D 游戏引擎，基于 Canvas2D 渲染，包含：

- 世界/相机/组件体系
- 精灵渲染 & 文本渲染
- 输入系统（Pointer / Keyboard）
- 粒子系统
- 特效系统（抖屏、闪烁）
- 物理引擎（基础）
- 碰撞系统（AABB）
- Overlay 层
- Layout/UI
- LayerManager
- 资源缓存（ResourceCache）
- 事件系统（EventBus）
- Timer/Vec2/Rect 等工具类
- Devtools hook
- ImageComposition 工具
- 扩展/实验特性系统

---

# 目录
1. [初始化游戏](#初始化游戏)
2. [世界 & 相机](#世界--相机)
3. [组件体系 Component](#组件体系-component)
4. [SpriteComponent 精灵](#spritecomponent-精灵)
5. [TextComponent 文本](#textcomponent-文本)
6. [输入系统](#输入系统)
7. [碰撞系统](#碰撞系统)
8. [物理系统](#物理系统)
9. [Overlay 系统](#overlay-系统)
10. [粒子系统](#粒子系统)
11. [Parallax 视差背景](#parallax-视差背景)
12. [特效系统](#特效系统)
13. [LayerManager 图层](#layermanager-图层)
14. [UI / Layout](#ui--layout)
15. [ResourceCache 缓存](#resourcecache-缓存)
16. [EventBus 事件系统](#eventbus-事件系统)
17. [Timer 定时器](#timer-定时器)
18. [Math / Rect](#math--rect)
19. [Devtools Hook](#devtools-hook)
20. [Image Composer](#image-composer)
21. [Extensions / Experimental](#extensions--experimental)
22. [完整 Demo](#完整-demo)

---

# 初始化游戏

```ts
import { ZryaGame, CanvasRenderer } from "zryajs";

const canvas = document.querySelector("canvas")!;
const renderer = new CanvasRenderer(canvas);

const game = new ZryaGame(renderer);
game.start();
```

---

# 世界 & 相机

## World2D

世界是组件树的根。

```ts
game.world.root.add(new Player());
```

## CameraComponent

用来平移/缩放/旋转世界。

```ts
import { CameraComponent } from "zryajs";

const camera = new CameraComponent();
camera.x = 200;
camera.y = 150;
camera.zoom = 1.2;

game.world.camera = camera;
```

---

# 组件体系 Component

所有东西都是 Component。

```ts
import { Component } from "zryajs";

class MyObject extends Component {
  update(dt: number) {
    console.log("每帧更新", dt);
  }
}
```

生命周期：

- `onLoad()`
- `onMount()`
- `onRemove()`

树结构：

```ts
const parent = new Component();
const child = new Component();
parent.add(child);
```

---

# SpriteComponent 精灵

支持图片、canvas、ImageBitmap、video。

```ts
import { SpriteComponent } from "zryajs";

const sprite = new SpriteComponent();
sprite.texture = { image: myImage };
sprite.x = 100;
sprite.y = 200;

game.world.root.add(sprite);
```

裁剪：

```ts
sprite.texture = {
  image: sheet,
  sx: 32, sy: 0, sw: 32, sh: 32
};
```

---

# TextComponent 文本

```ts
import { TextComponent } from "zryajs";

const txt = new TextComponent("Hello World", {
  fontSize: 20,
  color: "#ff0",
  align: "center"
});
txt.x = 300;
txt.y = 80;

game.world.root.add(txt);
```

---

# 输入系统

## Pointer（鼠标/触摸）

```ts
import { Pointer } from "zryajs";

game.pointer.onDown = (p) => console.log("点击", p.x, p.y);
```

## Keyboard

```ts
game.keyboard.onKeyDown = (key) => {
  if (key === "Space") console.log("Jump!");
};
```

---

# 碰撞系统

## Hitbox（AABB）

```ts
import { Hitbox } from "zryajs";

class Block extends Hitbox {
  constructor() {
    super({
      type: "aabb",
      offsetX: 0,
      offsetY: 0,
      width: 40,
      height: 40
    });
  }

  onCollisionStart(other) {
    console.log("撞到了：", other);
  }
}
```

挂载后自动参与碰撞检测。

## CollisionSystem

ZryaGame 自动包含：

```ts
game.collisionSystem.step(world);
```

无需手动调用。

---

# 物理系统

基础物理支持：

- 重力
- 速度/加速度
- 阻尼
- 简易地面检测

```ts
import { PhysicsBody } from "zryajs";

class Player extends PhysicsBody {
  constructor() {
    super();
    this.gravity = 1000;
  }

  update(dt) {
    if (game.keyboard.isDown("Space") && this.onGround)
      this.velocityY = -400;
  }
}
```

---

# Overlay 系统

显示 UI 层、暂停菜单等。

```ts
import { OverlayManager } from "zryajs";

game.overlays.show("pauseMenu");
game.overlays.hide("pauseMenu");
```

---

# 粒子系统

两部分：

- `ParticleSystem`
- `ParticleEmitterComponent`

## 使用粒子发射器

```ts
import { ParticleEmitterComponent } from "zryajs";

const emitter = new ParticleEmitterComponent({
  rate: 20,
  life: [0.3, 0.6],
  speed: [50, 120],
  angle: [0, Math.PI * 2],
  color: "orange"
});

emitter.x = 200;
emitter.y = 300;

game.world.root.add(emitter);
```

---

# Parallax 视差背景

```ts
import { ParallaxComponent } from "zryajs";

const layer = new ParallaxComponent({
  image: bgImage,
  factorX: 0.5,
  factorY: 0
});

game.world.root.add(layer);
```

---

# 特效系统

所有特效由 `EffectManager` 调用。

## CameraShake

```ts
import { CameraShakeEffect } from "zryajs";

game.effects.add(new CameraShakeEffect({
  duration: 0.3,
  strength: 8
}));
```

## BlinkEffect（闪烁）

```ts
import { BlinkEffect } from "zryajs";

game.effects.add(new BlinkEffect(player, {
  duration: 0.2
}));
```

---

# LayerManager 图层

允许按渲染顺序分层。

```ts
import { LayerManager } from "zryajs";

game.layers.add("bg");
game.layers.add("game");
game.layers.add("ui");
```

---

# UI / Layout

## LayoutComponent

自动对子组件定位。

```ts
import { LayoutComponent } from "zryajs";

const layout = new LayoutComponent("horizontal", 10);

layout.add(new TextComponent("A"));
layout.add(new TextComponent("B"));

game.world.root.add(layout);
```

## UiElement

基础 UI 元素（大小、布局、anchor）。

---

# ResourceCache 缓存

```ts
import { ResourceCache } from "zryajs";

const images = new ResourceCache<string, HTMLImageElement>(async (url) => {
  const img = new Image();
  img.src = url;
  await img.decode();
  return img;
});

const playerImg = await images.getOrLoad("/player.png");
```

---

# EventBus 事件系统

```ts
import { EventBus } from "zryajs";

const bus = new EventBus();

bus.on("damage", (v) => console.log("Damage:", v));
bus.emit("damage", 10);
```

---

# Timer 定时器

```ts
import { Timer } from "zryajs";

const timer = new Timer(1.0, () => console.log("1 秒到了"));
timer.repeat = true;

game.timers.add(timer);
```

---

# Math / Rect / Vec2

```ts
import { Vec2, Rect } from "zryajs";

const v = new Vec2(10, 5).normalized();
const r = new Rect(0, 0, 100, 50);
```

---

# Devtools Hook

允许外部调试器挂载游戏状态。

```ts
import { DevtoolsHook } from "zryajs";

DevtoolsHook.expose(game);
```

---

# Image Composer

将多个 sprite 合成一张图。

```ts
import { ImageComposer } from "zryajs";

const out = await ImageComposer.compose([
  { image: img1, x: 0,   y: 0 },
  { image: img2, x: 100, y: 50 }
]);
```

---

# Extensions / Experimental

```ts
import { ExperimentalFeatureFlag } from "zryajs";

ExperimentalFeatureFlag.enable("fast-collision");
```

---

# 完整 Demo

```ts
import {
  ZryaGame, CanvasRenderer,
  SpriteComponent, TextComponent,
  CameraComponent, PhysicsBody,
  ParticleEmitterComponent, CameraShakeEffect
} from "zryajs";

const canvas = document.querySelector("canvas")!;
const game = new ZryaGame(new CanvasRenderer(canvas));

// 玩家
class Player extends PhysicsBody {
  constructor() {
    super();
    this.gravity = 1400;
    this.width = 40;
    this.height = 40;
  }
  update(dt) {
    if (game.keyboard.isDown("ArrowLeft")) this.velocityX -= 600 * dt;
    if (game.keyboard.isDown("ArrowRight")) this.velocityX += 600 * dt;

    if (game.keyboard.isDown("Space") && this.onGround)
      this.velocityY = -600;

    if (Math.abs(this.velocityX) > 300) {
      game.effects.add(new CameraShakeEffect({ duration: 0.1, strength: 4 }));
    }
  }
}

// 地板
class Ground extends PhysicsBody {
  constructor() {
    super();
    this.static = true;
    this.width = 600;
    this.height = 30;
  }
}

const camera = new CameraComponent();
game.world.camera = camera;

// 添加对象
const player = new Player();
player.x = 200;
player.y = 100;

const ground = new Ground();
ground.x = 300;
ground.y = 350;

game.world.root.add(ground);
game.world.root.add(player);

// 跟随
camera.follow(player);

game.start();
```

---

# 版本号

```ts
import { zryaJsVersion } from "zryajs";

console.log(zryaJsVersion());
```
