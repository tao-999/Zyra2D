import { Component } from '../../core/Component';

/**
 * Motion2D：简单运动学组件
 * - vx, vy: 速度（单位：世界坐标/秒）
 * - ax, ay: 加速度
 * - maxSpeed: 最大速度（0 表示不限）
 * - damping: 阻尼系数（0~1 之间，类似摩擦，按秒衰减）
 */
export class Motion2D extends Component {
  vx = 0;
  vy = 0;
  ax = 0;
  ay = 0;

  maxSpeed = 0;
  damping = 0;
}
