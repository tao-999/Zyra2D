// packages/zryajs/src/index.ts

// ===== 核心循环 & 游戏根类 =====
export * from "./game/GameLoop";
export * from "./game/ZryaGame";

// ===== 世界 & 相机 =====
export * from "./world/World2D";
export * from "./world/CameraComponent";

// ===== 组件体系 =====
export * from "./component/Component";
export * from "./component/PositionComponent";
export * from "./component/SpriteComponent";
export * from "./component/TextComponent";

// ===== 渲染 =====
export * from "./render/Renderer";
export * from "./render/CanvasRenderer";

// ===== 输入 =====
export * from "./input/Pointer";
export * from "./input/Keyboard";
export * from "./input/InputRouter";

// ===== 碰撞 =====
export * from "./collision/Hitbox";
export * from "./collision/CollisionCallbacks";
export * from "./collision/CollisionSystem";

// ===== Overlays =====
export * from "./overlays/OverlayTypes";
export * from "./overlays/OverlayManager";

// ===== Debug =====
export * from "./debug/DebugOverlay";

// ===== Cache =====
export * from "./cache/ResourceCache";

// ===== Events =====
export * from "./events/EventBus";

// ===== Math / Geometry =====
export * from "./math/Vec2";
export * from "./geometry/Rect";

// ===== Timer =====
export * from "./timer/Timer";

// ===== Physics =====
export * from "./physics/PhysicsBody";
export * from "./physics/PhysicsSystem";

// ===== Particles / Parallax / Effects =====
export * from "./particles/ParticleSystem";
export * from "./particles/ParticleEmitterComponent";
export * from "./parallax/ParallaxComponent";
export * from "./effects/Effect";
export * from "./effects/CameraShakeEffect";
export * from "./effects/BlinkEffect";

// ===== Layers / Layout / UI =====
export * from "./layers/LayerManager";
export * from "./layout/LayoutComponent";
export * from "./ui/UiElement";

// ===== Devtools =====
export * from "./devtools/DevtoolsHook";

// ===== Image Composition =====
export * from "./image_composition/ImageComposer";

// ===== Extensions / Experimental / Palette =====
export * from "./extensions/Extension";
export * from "./experimental/ExperimentalFeatureFlag";
export * from "./palette/Palette";

// ===== 版本号 =====
export function zryaJsVersion(): string {
  return "0.1.0";
}
