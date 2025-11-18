import { Component } from '../../core/Component';

/**
 * Motion2D：简单运动学组件
 * - vx, vy: 速度（单位：世界坐标/秒）
 * - ax, ay: 加速度
 * - maxSpeed: 最大速度（0 表示不限）
 * - damping: 阻尼系数（0~1 之间，按秒衰减，整体乘系数）
 * - friction: 水平摩擦（单位近似为 像素/秒²，让 vx 逐渐衰减到 0）
 */
export class Motion2D extends Component {
  vx = 0;
  vy = 0;
  ax = 0;
    ay = 0;

    maxSpeed = 0;
    damping = 0;

    /**
     * 水平摩擦力大小：
     *  - 0 表示无摩擦
     *  - 数值越大，松开按键后减速越快
     *  典型区间可以先试 200 ~ 1500 之间
     */
    friction = 0;
  }
  