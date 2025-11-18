// src/index.ts（或者你项目的主入口）

// ==============================
// Core
// ==============================
export * from './core/Engine';
export * from './core/World';
export * from './core/Entity';
export * from './core/Component';
export * from './core/System';
export * from './core/Time';
export * from './core/EventBus';
export * from './core/Logger';

// ==============================
// ECS Components
// ==============================
export * from './ecs/components/Transform';
export * from './ecs/components/Sprite';
export * from './ecs/components/Motion2D';
export * from './ecs/components/ColliderAABB';
export * from './ecs/components/Tag';
export * from './ecs/components/Text2D';
export * from './ecs/components/Animator2D';
export * from './ecs/components/TileMap2D';
export * from './ecs/components/PhysicsBody2D';
export * from './ecs/components/ParticleEmitter2D';

// ==============================
// ECS Systems
// ==============================
export * from './ecs/systems/MotionSystem';
export * from './ecs/systems/CollisionSystem2D';
export * from './ecs/systems/PhysicsSystem2D';
export * from './ecs/systems/RenderSystem';
export * from './ecs/systems/AnimationSystem2D';
export * from './ecs/systems/TextRenderSystem';
export * from './ecs/systems/DebugDrawSystem';
export * from './ecs/systems/TileMapRenderSystem';
export * from './ecs/systems/CameraFollowSystem';
export * from './ecs/systems/DebugOverlaySystem';
export * from './ecs/systems/ParticleSystem2D';

// ==============================
// TileMap / Particles Utils
// ==============================
export * from './ecs/utils/TileMapColliders';
export * from './ecs/utils/ParticlePresets2D';

// ==============================
// Renderer
// ==============================
export * from './render/Renderer';          // 包含 Renderer 接口 + BlendMode
export * from './render/Canvas2DRenderer';
export * from './render/WebGLRenderer';     //  WebGL 渲染器
export * from './render/Camera2D';

// （如果将来你想让外部自定义后处理，可以额外导出这些）
// export * from './render/gl/SpriteBatch';
// export * from './render/gl/PostProcessEffect';

// ==============================
// Assets / Input / Audio
// ==============================
export * from './assets/AssetManager';
export * from './input/Input';
export * from './audio/AudioManager';
