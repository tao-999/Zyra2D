import {
  ZryaGame,
  CanvasRenderer,
  Hitbox,
  TextComponent,
  CameraShakeEffect,
  ParticleEmitterComponent,
  SimpleParticleEmitter,
} from "zryajs";
import type { Renderer } from "zryajs";
import { PositionComponent } from "zryajs";

// ========== 简单按键状态 ==========

const keys = new Set<string>();

window.addEventListener("keydown", (e) => {
  keys.add(e.code);
});

window.addEventListener("keyup", (e) => {
  keys.delete(e.code);
});

// ========== 小工具：画矩形组件基类 ==========

class RectLike extends PositionComponent {
  color = "#ffffff";

  override render(renderer: Renderer): void {
    const anyRenderer: any = renderer as any;
    const ctx: CanvasRenderingContext2D | undefined = anyRenderer.ctx;
    if (!ctx) return;

    ctx.save();

    ctx.translate(this.x, this.y);
    if (this.angle !== 0) ctx.rotate(this.angle);
    if (this.scaleX !== 1 || this.scaleY !== 1) {
      ctx.scale(this.scaleX, this.scaleY);
    }

    const w = this.width;
    const h = this.height;
    const ax = this.anchorX;
    const ay = this.anchorY;

    ctx.fillStyle = this.color;
    ctx.fillRect(-w * ax, -h * ay, w, h);

    ctx.restore();
  }
}

// ========== 玩家 & 陨石 ==========

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const FLOOR_Y = 380;

// 玩家：蓝色小方块，继承 Hitbox 用引擎碰撞系统
class Player extends Hitbox {
  speed = 360;

  constructor() {
    super(
      {
        type: "aabb",
        offsetX: -16,
        offsetY: -16,
        width: 32,
        height: 32,
      },
      {
        layer: 0,
        mask: 1 << 1, // 只和 layer 1 的陨石碰撞
      }
    );

    this.width = 32;
    this.height = 32;
    this.anchorX = 0.5;
    this.anchorY = 0.5;

    this.x = CANVAS_WIDTH / 2;
    this.y = FLOOR_Y - 16;
  }

  override update(dt: number): void {
    let dir = 0;
    if (keys.has("ArrowLeft") || keys.has("KeyA")) dir -= 1;
    if (keys.has("ArrowRight") || keys.has("KeyD")) dir += 1;

    if (dir !== 0) {
      this.x += dir * this.speed * dt;
    }

    // 边界限制
    const margin = 24;
    if (this.x < margin) this.x = margin;
    if (this.x > CANVAS_WIDTH - margin) this.x = CANVAS_WIDTH - margin;
  }

  override render(renderer: Renderer): void {
    const anyRenderer: any = renderer as any;
    const ctx: CanvasRenderingContext2D | undefined = anyRenderer.ctx;
    if (!ctx) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    const w = this.width;
    const h = this.height;
    ctx.fillStyle = "#40c4ff";
    ctx.fillRect(-w * this.anchorX, -h * this.anchorY, w, h);
    ctx.restore();
  }
}

// 陨石：红色小方块，从上往下掉
class Meteor extends Hitbox {
  vy: number;

  constructor(x: number, speed: number) {
    super(
      {
        type: "aabb",
        offsetX: -14,
        offsetY: -14,
        width: 28,
        height: 28,
      },
      {
        layer: 1,
        mask: 1 << 0, // 只和玩家 layer0 碰撞
      }
    );

    this.width = 28;
    this.height = 28;
    this.anchorX = 0.5;
    this.anchorY = 0.5;

    this.x = x;
    this.y = -30;
    this.vy = speed;
  }

  override update(dt: number): void {
    this.y += this.vy * dt;

    // 掉出屏幕就删掉
    if (this.y - 40 > CANVAS_HEIGHT) {
      this.removeFromParent();
    }
  }

  override render(renderer: Renderer): void {
    const anyRenderer: any = renderer as any;
    const ctx: CanvasRenderingContext2D | undefined = anyRenderer.ctx;
    if (!ctx) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    const w = this.width;
    const h = this.height;
    ctx.fillStyle = "#ff5252";
    ctx.fillRect(-w * this.anchorX, -h * this.anchorY, w, h);
    ctx.restore();
  }
}

// 地面：使用带噪音的颜色纹理
class Ground extends RectLike {
  private pattern: CanvasPattern | null = null;

  constructor() {
    super();
    this.width = CANVAS_WIDTH * 0.8;
    this.height = 20;
    this.anchorX = 0.5;
    this.anchorY = 0.5;
    this.x = CANVAS_WIDTH / 2;
    this.y = FLOOR_Y;
    this.color = "#546e7a"; // 基础颜色
  }

  private ensurePattern(ctx: CanvasRenderingContext2D) {
    if (this.pattern) return;

    // 固定尺寸的小纹理块，循环平铺
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const c = canvas.getContext("2d");
    if (!c) return;

    // 填基础色
    c.fillStyle = this.color;
    c.fillRect(0, 0, size, size);

    const { r, g, b } = parseHex(this.color);

    // 画一些随机噪点（亮一点 / 暗一点的点）
    const count = 800;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const shade = (Math.random() - 0.5) * 60; // -30 ~ +30 亮度偏移

      const rr = clamp(r + shade, 0, 255);
      const gg = clamp(g + shade, 0, 255);
      const bb = clamp(b + shade, 0, 255);
      const alpha = 0.2 + Math.random() * 0.3;

      c.fillStyle = `rgba(${rr},${gg},${bb},${alpha})`;
      const w = 2 + Math.random() * 3;
      const h = 2 + Math.random() * 3;
      c.fillRect(x, y, w, h);
    }

    this.pattern = ctx.createPattern(canvas, "repeat");
  }

  override render(renderer: Renderer): void {
    const anyRenderer: any = renderer as any;
    const ctx: CanvasRenderingContext2D | undefined = anyRenderer.ctx;
    if (!ctx) return;

    this.ensurePattern(ctx);
    if (!this.pattern) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const w = this.width;
    const h = this.height;
    const ax = this.anchorX;
    const ay = this.anchorY;

    ctx.fillStyle = this.pattern;
    ctx.fillRect(-w * ax, -h * ay, w, h);

    ctx.restore();
  }
}

// ===== 小工具：解析十六进制颜色 & clamp =====

function parseHex(hex: string): { r: number; g: number; b: number } {
  let s = hex.trim().toLowerCase();
  if (s.startsWith("#")) s = s.slice(1);
  if (s.length === 3) {
    s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  }
  if (s.length !== 6) {
    return { r: 84, g: 110, b: 122 }; // 兜底用原本的 #546e7a
  }
  const n = parseInt(s, 16);
  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff,
  };
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

// ========== 游戏本体 ==========

type GameState = "playing" | "gameOver";

class MeteorDodgeGame extends ZryaGame {
  player!: Player;
  ground!: Ground;
  fireTrail!: ParticleEmitterComponent;
  scoreText!: TextComponent;
  tipText!: TextComponent;

  state: GameState = "playing";
  score = 0;
  spawnTimer = 0;
  spawnInterval = 1.0; // 初始每秒一个陨石

  // ===== 火花相关状态 =====
  private lastPlayerX = 0;
  private readonly moveSparkThreshold = 40; // 速度阈值（像素/秒）
  private readonly movingSpawnRate = 160;   // 移动时火花喷射速率

  constructor(canvas: HTMLCanvasElement) {
    super(new CanvasRenderer(canvas));
  }

  override onLoad(): void {
    // 地面 + 玩家
    this.ground = new Ground();
    this.world.root.add(this.ground);

    this.player = new Player();
    this.world.root.add(this.player);

    // 玩家脚下的火花粒子（默认 spawnRate 先设为 0，靠移动时再打开）
    const emitter = new SimpleParticleEmitter({
      spawnRate: 0,              // 重要：默认不喷
      lifetime: 0.4,
      speedMin: 40,
      speedMax: 140,
      direction: -Math.PI / 2,
      spread: Math.PI / 1.5,
      gravity: 260,
      sizeStart: 3,
      sizeEnd: 0,
      colorStart: "#ffdd55",
      colorEnd: "#ff5500",
    });

    this.fireTrail = new ParticleEmitterComponent(emitter);
    this.fireTrail.x = this.player.x;
    this.fireTrail.y = FLOOR_Y;
    this.world.root.add(this.fireTrail);

    // 分数文本
    this.scoreText = new TextComponent("Score: 0.0", {
      fontSize: 14,
      color: "#ffffff",
      align: "left",
      maxWidth: 300,
    });
    this.scoreText.x = 10;
    this.scoreText.y = 20;
    this.scoreText.anchorX = 0;
    this.scoreText.anchorY = 0;
    this.world.root.add(this.scoreText);

    // 提示文本
    this.tipText = new TextComponent("Avoid the meteors!", {
      fontSize: 14,
      color: "#cccccc",
      align: "center",
      maxWidth: 400,
    });
    this.tipText.x = CANVAS_WIDTH / 2;
    this.tipText.y = 40;
    this.tipText.anchorX = 0.5;
    this.tipText.anchorY = 0.5;
    this.world.root.add(this.tipText);

    // 玩家被砸中时触发
    this.player.onCollisionStart = () => {
      this.onPlayerHit();
    };

    // 相机就固定不动，直接看整个画布
    this.camera.viewportWidth = CANVAS_WIDTH;
    this.camera.viewportHeight = CANVAS_HEIGHT;
    this.camera.x = CANVAS_WIDTH / 2;
    this.camera.y = CANVAS_HEIGHT / 2;

    // 记录初始位置，用来算“近似速度”
    this.lastPlayerX = this.player.x;
  }

  override onUpdate(dt: number): void {
    // 火花跟随玩家脚底
    this.fireTrail.x = this.player.x;
    this.fireTrail.y = FLOOR_Y;

    // ===== 根据移动速度控制火花喷射 =====
    const emitter = this.fireTrail.emitter as SimpleParticleEmitter;
    if (dt > 0) {
      const vxApprox = (this.player.x - this.lastPlayerX) / dt;
      const speed = Math.abs(vxApprox);

      // 只要水平移动速度超过阈值，就认为是“摩擦”，开始喷火花
      if (speed > this.moveSparkThreshold && this.state === "playing") {
        emitter.spawnRate = this.movingSpawnRate;
      } else {
        emitter.spawnRate = 0;
      }
    }
    this.lastPlayerX = this.player.x;
    // =============================

    if (this.state === "playing") {
      // 计分：坚持时间越久，分越高
      this.score += dt;
      this.scoreText.setText(`Score: ${this.score.toFixed(1)}`);

      // 陨石生成
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer -= this.spawnInterval;
        this.spawnMeteor();

        // 难度逐渐增加：生成间隔越来越短
        this.spawnInterval = Math.max(0.35, this.spawnInterval * 0.97);
      }
    } else if (this.state === "gameOver") {
      // 按 R 重开
      if (keys.has("KeyR")) {
        this.resetGame();
      }
    }
  }

  private spawnMeteor(): void {
    const margin = 40;
    const x =
      margin + Math.random() * (CANVAS_WIDTH - margin * 2);
    const speed = 160 + Math.random() * 180;
    const meteor = new Meteor(x, speed);
    this.world.root.add(meteor);
  }

  private onPlayerHit(): void {
    if (this.state !== "playing") return;

    this.state = "gameOver";
    this.tipText.setText("Game Over - Press R to Restart");

    // 抖屏一下
    this.effects.add(
      new CameraShakeEffect(this.camera, {
        duration: 0.3,
        amplitude: 10,
      })
    );

    // 被砸中就停止火花
    const emitter = this.fireTrail.emitter as SimpleParticleEmitter;
    emitter.spawnRate = 0;
  }

  private resetGame(): void {
    this.state = "playing";
    this.score = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 1.0;
    this.scoreText.setText("Score: 0.0");
    this.tipText.setText("Avoid the meteors!");

    // 重置玩家位置
    this.player.x = CANVAS_WIDTH / 2;
    this.player.y = FLOOR_Y - 16;

    // 清理场上的陨石
    const children = this.world.root.children.slice();
    for (const c of children) {
      if (c instanceof Meteor) {
        c.removeFromParent();
      }
    }

    // 重置火花状态
    const emitter = this.fireTrail.emitter as SimpleParticleEmitter;
    emitter.spawnRate = 0;
    this.lastPlayerX = this.player.x;
  }
}


// ========== 启动游戏 ==========

function main() {
  const canvas = document.getElementById("game") as HTMLCanvasElement | null;
  if (!canvas) {
    console.error("canvas#game not found");
    return;
  }

  const game = new MeteorDodgeGame(canvas);
  game.start().catch((err) => {
    console.error("game start failed:", err);
  });
}

main();
