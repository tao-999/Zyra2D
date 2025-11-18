// src/render/gl/PostProcessEffect.ts

import { ShaderProgram } from './ShaderProgram';

export interface PostProcessEffect {
  /** 初始化时调用：创建 shader / 设置静态 uniform 等 */
  init(gl: WebGLRenderingContext): void;

  /**
   * 每帧调用：
   * - sceneTexture: 场景颜色纹理
   * - time: 运行时间（秒），你可以用来做动画（比如水波）
   * - width / height: 屏幕尺寸
   */
  render(
    gl: WebGLRenderingContext,
    sceneTexture: WebGLTexture,
    time: number,
    width: number,
    height: number
  ): void;
}

/**
 * 一个基础实现：全屏 quad + ShaderProgram
 */
export abstract class FullscreenQuadEffect implements PostProcessEffect {
  protected program!: ShaderProgram;
  protected quadVBO!: WebGLBuffer;

  init(gl: WebGLRenderingContext): void {
    const vertexSrc = `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;
      void main() {
        vTexCoord = aTexCoord;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;
    const fragmentSrc = this.getFragmentShaderSource();
    this.program = new ShaderProgram(gl, vertexSrc, fragmentSrc);

    // 全屏 quad（两个三角形） NDC 坐标 + UV
    const vertices = new Float32Array([
      //  x,   y,   u,  v
      -1, -1, 0, 0,
       1, -1, 1, 0,
       1,  1, 1, 1,
      -1,  1, 0, 1,
    ]);

    const vbo = gl.createBuffer();
    if (!vbo) throw new Error('Failed to create fullscreen quad VBO');
    this.quadVBO = vbo;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  render(
    gl: WebGLRenderingContext,
    sceneTexture: WebGLTexture,
    time: number,
    width: number,
    height: number
  ): void {
    this.program.use();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);

    const aPos = this.program.getAttribLocation('aPosition');
    const aUV = this.program.getAttribLocation('aTexCoord');

    const stride = 4 * 4; // 4 float * 4 bytes

    if (aPos >= 0) {
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0);
    }
    if (aUV >= 0) {
      gl.enableVertexAttribArray(aUV);
      gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, stride, 2 * 4);
    }

    // 绑定场景纹理到 TEXTURE0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    this.program.set1i('uScene', 0);
    this.program.set1f('uTime', time);
    this.program.set2f('uResolution', width, height);

    this.setExtraUniforms(gl, time, width, height);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  /** 子类提供具体 fragment shader 源码 */
  protected abstract getFragmentShaderSource(): string;

  /** 子类可以在这里设置额外 uniform */
  protected setExtraUniforms(
    _gl: WebGLRenderingContext,
    _time: number,
    _width: number,
    _height: number
  ): void {
    // 默认实现不需要用到这些参数
  }  
}

/**
 * 简单的反色效果
 */
export class InvertColorEffect extends FullscreenQuadEffect {
  protected getFragmentShaderSource(): string {
    return `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform sampler2D uScene;
      void main() {
        vec4 c = texture2D(uScene, vTexCoord);
        gl_FragColor = vec4(1.0 - c.rgb, c.a);
      }
    `;
  }
}

/**
 * 灰度效果
 */
export class GrayscaleEffect extends FullscreenQuadEffect {
  protected getFragmentShaderSource(): string {
    return `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform sampler2D uScene;
      void main() {
        vec4 c = texture2D(uScene, vTexCoord);
        float g = dot(c.rgb, vec3(0.299, 0.587, 0.114));
        gl_FragColor = vec4(vec3(g), c.a);
      }
    `;
  }
}

/**
 * 简单水波扭曲效果
 */
export class WaterWaveEffect extends FullscreenQuadEffect {
  protected getFragmentShaderSource(): string {
    return `
      precision mediump float;
      varying vec2 vTexCoord;

      uniform sampler2D uScene;
      uniform float uTime;
      uniform vec2 uResolution;

      void main() {
        // 把 uv 变成 0~1 范围
        vec2 uv = vTexCoord;

        // 简单的 sin 波动
        float wave = sin(uv.y * 20.0 + uTime * 4.0) * 0.01;
        float wave2 = cos(uv.x * 15.0 + uTime * 3.0) * 0.01;

        uv.x += wave;
        uv.y += wave2;

        vec4 c = texture2D(uScene, uv);
        gl_FragColor = c;
      }
    `;
  }
}
