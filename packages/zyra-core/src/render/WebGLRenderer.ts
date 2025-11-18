// src/render/WebGLRenderer.ts

import type { Renderer } from './Renderer';
import { SpriteBatch } from './gl/SpriteBatch';
import type { PostProcessEffect } from './gl/PostProcessEffect';
import { ShaderProgram } from './gl/ShaderProgram';

export class WebGLRenderer implements Renderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private batch: SpriteBatch;

  private width = 0;
  private height = 0;

  private clearColor: [number, number, number, number] = [0, 0, 0, 1];

  private whiteTexture: WebGLTexture;
  private textureCache = new WeakMap<HTMLImageElement, WebGLTexture>();

  private textCanvas: HTMLCanvasElement;
  private textCtx: CanvasRenderingContext2D;
  private textTexture: WebGLTexture;

  // 场景 FBO & 颜色纹理
  private sceneFBO: WebGLFramebuffer | null = null;
  private sceneTexture: WebGLTexture | null = null;

  // 后处理效果
  private postEffect: PostProcessEffect | null = null;
  private startTime = performance.now();

  constructor(canvas: HTMLCanvasElement, backgroundColor = '#000000') {
    this.canvas = canvas;

    const gl =
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    this.gl = gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.batch = new SpriteBatch(gl, 5000);

    this.whiteTexture = this.createWhiteTexture();

    this.textCanvas = document.createElement('canvas');
    const ctx = this.textCanvas.getContext('2d');
    if (!ctx) throw new Error('Cannot create 2D context for text');
    this.textCtx = ctx;
    this.textTexture = this.createEmptyTexture();

    this.setClearColor(backgroundColor);
    this.resize(canvas.width, canvas.height);
  }

  clear(): void {
    const gl = this.gl;
    const [r, g, b, a] = this.clearColor;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO);
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  begin(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO);
    const [r, g, b, a] = this.clearColor;
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.batch.begin();
  }

  end(): void {
    const gl = this.gl;
    this.batch.flush();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);

    if (!this.sceneTexture) return;

    const elapsed = (performance.now() - this.startTime) / 1000;

    if (this.postEffect) {
      this.postEffect.render(gl, this.sceneTexture, elapsed, this.width, this.height);
    } else {
      this.blitSceneTexture();
    }
  }

  drawSprite(
    image: HTMLImageElement,
    x: number,
    y: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    originX?: number,
    originY?: number
  ): void {
    if (!image || !image.complete || image.naturalWidth === 0) return;

    const w = image.naturalWidth;
    const h = image.naturalHeight;
    const ox = originX ?? w / 2;
    const oy = originY ?? h / 2;

    const tex = this.getTexture(image);

    this.drawQuadWithParams(
      tex,
      x,
      y,
      w,
      h,
      rotation,
      scaleX,
      scaleY,
      ox,
      oy,
      [1, 1, 1, 1],
      [0, 0, 1, 1]
    );
  }

  drawSpriteRegion(
    image: HTMLImageElement,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    x: number,
    y: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    originX?: number,
    originY?: number
  ): void {
    if (!image || !image.complete || image.naturalWidth === 0) return;

    const imgW = image.naturalWidth;
    const imgH = image.naturalHeight;

    const ox = originX ?? sw / 2;
    const oy = originY ?? sh / 2;

    const u0 = sx / imgW;
    const v0 = sy / imgH;
    const u1 = (sx + sw) / imgW;
    const v1 = (sy + sh) / imgH;

    const tex = this.getTexture(image);

    this.drawQuadWithParams(
      tex,
      x,
      y,
      sw,
      sh,
      rotation,
      scaleX,
      scaleY,
      ox,
      oy,
      [1, 1, 1, 1],
      [u0, v0, u1, v1]
    );
  }

  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: {
      color?: string;
      lineWidth?: number;
      filled?: boolean;
    }
  ): void {
    const colorStr = options?.color ?? '#ff0000';
    const color = this.parseColor(colorStr);
    const filled = options?.filled ?? false;
    const lineWidth = options?.lineWidth ?? 1;

    if (filled) {
      this.drawQuadWithParams(
        this.whiteTexture,
        x,
        y,
        width,
        height,
        0,
        1,
        1,
        0,
        0,
        color,
        [0, 0, 1, 1]
      );
    } else {
      // 上
      this.drawQuadWithParams(
        this.whiteTexture,
        x,
        y,
        width,
        lineWidth,
        0,
        1,
        1,
        0,
        0,
        color,
        [0, 0, 1, 1]
      );
      // 下
      this.drawQuadWithParams(
        this.whiteTexture,
        x,
        y + height - lineWidth,
        width,
        lineWidth,
        0,
        1,
        1,
        0,
        0,
        color,
        [0, 0, 1, 1]
      );
      // 左
      this.drawQuadWithParams(
        this.whiteTexture,
        x,
        y,
        lineWidth,
        height,
        0,
        1,
        1,
        0,
        0,
        color,
        [0, 0, 1, 1]
      );
      // 右
      this.drawQuadWithParams(
        this.whiteTexture,
        x + width - lineWidth,
        y,
        lineWidth,
        height,
        0,
        1,
        1,
        0,
        0,
        color,
        [0, 0, 1, 1]
      );
    }
  }

  drawText(
    text: string,
    x: number,
    y: number,
    options?: {
      font?: string;
      color?: string;
      textAlign?: CanvasTextAlign;
      textBaseline?: CanvasTextBaseline;
      maxWidth?: number;
    }
  ): void {
    if (!text) return;

    const ctx = this.textCtx;
    const canvas = this.textCanvas;

    const font = options?.font ?? '16px sans-serif';
    const color = options?.color ?? '#ffffff';
    const textAlign = options?.textAlign ?? 'left';
    const textBaseline = options?.textBaseline ?? 'top';

    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillStyle = color;

    const metrics = ctx.measureText(text);
    const textWidth = options?.maxWidth
      ? Math.min(metrics.width, options.maxWidth)
      : metrics.width;

    const fontSizeMatch = /(\d+)(px)?/.exec(font);
    const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : 16;
    const textHeight = fontSize * 1.2;

    canvas.width = Math.max(1, Math.ceil(textWidth));
    canvas.height = Math.max(1, Math.ceil(textHeight));

    ctx.font = font;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillStyle = color;

    let drawX = 0;
    if (textAlign === 'center') {
      drawX = canvas.width / 2;
    } else if (textAlign === 'right' || textAlign === 'end') {
      drawX = canvas.width;
    }

    let drawY = 0;
    if (textBaseline === 'middle') {
      drawY = canvas.height / 2;
    } else if (
      textBaseline === 'bottom' ||
      textBaseline === 'alphabetic' ||
      textBaseline === 'ideographic'
    ) {
      drawY = canvas.height;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText(text, drawX, drawY, options?.maxWidth);

    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.textTexture);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      canvas
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    let screenX = x;
    if (textAlign === 'center') {
      screenX = x - canvas.width / 2;
    } else if (textAlign === 'right' || textAlign === 'end') {
      screenX = x - canvas.width;
    }

    let screenY = y;
    if (textBaseline === 'middle') {
      screenY = y - canvas.height / 2;
    } else if (
      textBaseline === 'bottom' ||
      textBaseline === 'alphabetic' ||
      textBaseline === 'ideographic'
    ) {
      screenY = y - canvas.height;
    }

    this.drawQuadWithParams(
      this.textTexture,
      screenX,
      screenY,
      canvas.width,
      canvas.height,
      0,
      1,
      1,
      0,
      0,
      [1, 1, 1, 1],
      [0, 0, 1, 1]
    );
  }

  setClearColor(color: string): void {
    this.clearColor = this.parseColor(color);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;

    this.canvas.width = width;
    this.canvas.height = height;

    this.gl.viewport(0, 0, width, height);

    this.setupSceneFramebuffer();
  }

  /** WebGLRenderer 自己的 API：设置后处理效果 */
  setPostProcessEffect(effect: PostProcessEffect | null): void {
    const gl = this.gl;
    if (effect) {
      effect.init(gl);
    }
    this.postEffect = effect;
  }

  // ============ 场景 FBO & blit ============

  private setupSceneFramebuffer(): void {
    const gl = this.gl;

    if (!this.sceneTexture) {
      this.sceneTexture = gl.createTexture();
    }
    if (!this.sceneFBO) {
      this.sceneFBO = gl.createFramebuffer();
    }
    if (!this.sceneTexture || !this.sceneFBO) {
      throw new Error('Failed to create scene framebuffer');
    }

    gl.bindTexture(gl.TEXTURE_2D, this.sceneTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.width,
      this.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.sceneFBO);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.sceneTexture,
      0
    );

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.error('Framebuffer incomplete:', status.toString(16));
      throw new Error('Scene framebuffer is incomplete');
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /** 没特效时，简单把场景纹理贴回屏幕 */
  private blitSceneTexture(): void {
    const gl = this.gl;
    if (!this.sceneTexture) return;

    const vs = `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;
      void main() {
        vTexCoord = aTexCoord;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;
    const fs = `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform sampler2D uScene;
      void main() {
        gl_FragColor = texture2D(uScene, vTexCoord);
      }
    `;

    const program = new ShaderProgram(gl, vs, fs);
    program.use();

    const vertices = new Float32Array([
      -1, -1, 0, 0,
       1, -1, 1, 0,
       1,  1, 1, 1,
      -1,  1, 0, 1,
    ]);

    const vbo = gl.createBuffer();
    if (!vbo) throw new Error('Failed to create blit VBO');
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPos = program.getAttribLocation('aPosition');
    const aUV = program.getAttribLocation('aTexCoord');
    const stride = 4 * 4;

    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0);

    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, stride, 2 * 4);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneTexture);
    program.set1i('uScene', 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    gl.deleteBuffer(vbo);
  }

  // ============ 通用工具 ============

  private createWhiteTexture(): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture();
    if (!tex) throw new Error('Failed to create white texture');

    gl.bindTexture(gl.TEXTURE_2D, tex);
    const whitePixel = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      whitePixel
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return tex;
  }

  private createEmptyTexture(): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture();
    if (!tex) throw new Error('Failed to create text texture');

    gl.bindTexture(gl.TEXTURE_2D, tex);
    const emptyPixel = new Uint8Array([0, 0, 0, 0]);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      emptyPixel
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return tex;
  }

  private getTexture(image: HTMLImageElement): WebGLTexture {
    const cached = this.textureCache.get(image);
    if (cached) return cached;

    const gl = this.gl;
    const tex = gl.createTexture();
    if (!tex) throw new Error('Failed to create texture');

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.textureCache.set(image, tex);
    return tex;
  }

  private drawQuadWithParams(
    texture: WebGLTexture,
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    originX: number,
    originY: number,
    color: [number, number, number, number],
    uvRect: [number, number, number, number]
  ): void {
    const sx = -originX * scaleX;
    const sy = -originY * scaleY;
    const ex = (width - originX) * scaleX;
    const ey = (height - originY) * scaleY;

    let p0x = sx, p0y = sy;
    let p1x = ex, p1y = sy;
    let p2x = ex, p2y = ey;
    let p3x = sx, p3y = ey;

    if (rotation !== 0) {
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);

      const rp0x = p0x * cos - p0y * sin;
      const rp0y = p0x * sin + p0y * cos;
      const rp1x = p1x * cos - p1y * sin;
      const rp1y = p1x * sin + p1y * cos;
      const rp2x = p2x * cos - p2y * sin;
      const rp2y = p2x * sin + p2y * cos;
      const rp3x = p3x * cos - p3y * sin;
      const rp3y = p3x * sin + p3y * cos;

      p0x = rp0x; p0y = rp0y;
      p1x = rp1x; p1y = rp1y;
      p2x = rp2x; p2y = rp2y;
      p3x = rp3x; p3y = rp3y;
    }

    p0x += x; p0y += y;
    p1x += x; p1y += y;
    p2x += x; p2y += y;
    p3x += x; p3y += y;

    const [p0nx, p0ny] = this.toNDC(p0x, p0y);
    const [p1nx, p1ny] = this.toNDC(p1x, p1y);
    const [p2nx, p2ny] = this.toNDC(p2x, p2y);
    const [p3nx, p3ny] = this.toNDC(p3x, p3y);

    const [u0, v0, u1, v1] = uvRect;

    const positions: [number, number, number, number, number, number, number, number] = [
      p0nx, p0ny,
      p1nx, p1ny,
      p2nx, p2ny,
      p3nx, p3ny,
    ];

    const uvs: [number, number, number, number, number, number, number, number] = [
      u0, v0,
      u1, v0,
      u1, v1,
      u0, v1,
    ];

    this.batch.drawQuad(texture, positions, uvs, color);
  }

  private toNDC(px: number, py: number): [number, number] {
    const nx = (px / this.width) * 2 - 1;
    const ny = 1 - (py / this.height) * 2;
    return [nx, ny];
  }

  private parseColor(color: string): [number, number, number, number] {
    color = color.trim().toLowerCase();

    if (color[0] === '#') {
      const hex = color.slice(1);
      if (hex.length === 3 || hex.length === 4) {
        const r = parseInt(hex[0] + hex[0], 16) / 255;
        const g = parseInt(hex[1] + hex[1], 16) / 255;
        const b = parseInt(hex[2] + hex[2], 16) / 255;
        const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
        return [r, g, b, a];
      } else if (hex.length === 6 || hex.length === 8) {
        const r = parseInt(hex.slice(0, 2), 16) / 255;
        const g = parseInt(hex.slice(2, 4), 16) / 255;
        const b = parseInt(hex.slice(4, 6), 16) / 255;
        const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
        return [r, g, b, a];
      }
    }

    const rgbMatch = color.match(
      /^rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/
    );
    if (rgbMatch) {
      const r = Math.min(255, Math.max(0, parseFloat(rgbMatch[1]))) / 255;
      const g = Math.min(255, Math.max(0, parseFloat(rgbMatch[2]))) / 255;
      const b = Math.min(255, Math.max(0, parseFloat(rgbMatch[3]))) / 255;
      const a =
        rgbMatch[4] !== undefined
          ? Math.min(1, Math.max(0, parseFloat(rgbMatch[4])))
          : 1;
      return [r, g, b, a];
    }

    return [0, 0, 0, 1];
  }
}
