// src/render/gl/SpriteBatch.ts

import { ShaderProgram } from './ShaderProgram';

type Color = [number, number, number, number]; // r,g,b,a

/**
 * 一个最小可用的 2D SpriteBatch：
 * - 每个 sprite = 4 个顶点，2 个三角形
 * - 顶点结构：pos(2) + uv(2) + color(4) = 8 float
 * - 按纹理分批：切换纹理前自动 flush
 */
export class SpriteBatch {
  private gl: WebGLRenderingContext;
  private program: ShaderProgram;

  private maxSprites: number;
  private vertexSize = 8; // x, y, u, v, r, g, b, a
  private vertices: Float32Array;
  private indices: Uint16Array;

  private vbo: WebGLBuffer;
  private ibo: WebGLBuffer;

  private aPosition: number;
  private aTexCoord: number;
  private aColor: number;
  private uSampler: WebGLUniformLocation | null;

  private spriteCount = 0;
  private currentTexture: WebGLTexture | null = null;

  constructor(gl: WebGLRenderingContext, maxSprites = 2000) {
    this.gl = gl;
    this.maxSprites = maxSprites;

    this.vertices = new Float32Array(maxSprites * 4 * this.vertexSize);
    this.indices = new Uint16Array(maxSprites * 6);

    this.buildIndexBuffer();

    const vertexSrc = `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      attribute vec4 aColor;

      varying vec2 vTexCoord;
      varying vec4 vColor;

      void main() {
        vTexCoord = aTexCoord;
        vColor = aColor;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentSrc = `
      precision mediump float;

      varying vec2 vTexCoord;
      varying vec4 vColor;

      uniform sampler2D uSampler;

      void main() {
        vec4 texColor = texture2D(uSampler, vTexCoord);
        gl_FragColor = texColor * vColor;
      }
    `;

    this.program = new ShaderProgram(gl, vertexSrc, fragmentSrc);
    this.program.use();

    this.aPosition = this.program.getAttribLocation('aPosition');
    this.aTexCoord = this.program.getAttribLocation('aTexCoord');
    this.aColor = this.program.getAttribLocation('aColor');
    this.uSampler = this.program.getUniformLocation('uSampler');

    const vbo = gl.createBuffer();
    const ibo = gl.createBuffer();
    if (!vbo || !ibo) throw new Error('Failed to create buffers');
    this.vbo = vbo;
    this.ibo = ibo;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(this.aPosition);
    gl.enableVertexAttribArray(this.aTexCoord);
    gl.enableVertexAttribArray(this.aColor);

    const stride = this.vertexSize * 4;

    gl.vertexAttribPointer(this.aPosition, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(this.aTexCoord, 2, gl.FLOAT, false, stride, 2 * 4);
    gl.vertexAttribPointer(this.aColor, 4, gl.FLOAT, false, stride, 4 * 4);

    if (this.uSampler) {
      this.program.set1i('uSampler', 0);
    }
  }

  begin(): void {
    this.spriteCount = 0;
    this.currentTexture = null;
    this.program.use();
  }

  /**
   * 提交一个 quad（已经是 NDC 坐标）
   * positions: [x0,y0, x1,y1, x2,y2, x3,y3]
   * uvs      : [u0,v0, u1,v0, u1,v1, u0,v1]
   */
  drawQuad(
    texture: WebGLTexture,
    positions: [number, number, number, number, number, number, number, number],
    uvs: [number, number, number, number, number, number, number, number],
    color: Color
  ): void {
    // 纹理切换：先 flush 再换
    if (this.currentTexture !== texture) {
      this.flush();
      this.currentTexture = texture;
    }

    if (this.spriteCount >= this.maxSprites) {
      this.flush();
    }

    const base = this.spriteCount * 4 * this.vertexSize;
    const [r, g, b, a] = color;
    const v = this.vertices;

    const [x0, y0, x1, y1, x2, y2, x3, y3] = positions;
    const [u0, v0, u1, v1, u2, v2, u3, v3] = uvs;

    // 顶点 0
    v[base + 0] = x0;
    v[base + 1] = y0;
    v[base + 2] = u0;
    v[base + 3] = v0;
    v[base + 4] = r;
    v[base + 5] = g;
    v[base + 6] = b;
    v[base + 7] = a;

    // 顶点 1
    v[base + 8] = x1;
    v[base + 9] = y1;
    v[base + 10] = u1;
    v[base + 11] = v1;
    v[base + 12] = r;
    v[base + 13] = g;
    v[base + 14] = b;
    v[base + 15] = a;

    // 顶点 2
    v[base + 16] = x2;
    v[base + 17] = y2;
    v[base + 18] = u2;
    v[base + 19] = v2;
    v[base + 20] = r;
    v[base + 21] = g;
    v[base + 22] = b;
    v[base + 23] = a;

    // 顶点 3
    v[base + 24] = x3;
    v[base + 25] = y3;
    v[base + 26] = u3;
    v[base + 27] = v3;
    v[base + 28] = r;
    v[base + 29] = g;
    v[base + 30] = b;
    v[base + 31] = a;

    this.spriteCount++;
  }

  flush(): void {
    const gl = this.gl;
    if (this.spriteCount === 0 || !this.currentTexture) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      0,
      this.vertices.subarray(0, this.spriteCount * 4 * this.vertexSize)
    );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.currentTexture);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.drawElements(
      gl.TRIANGLES,
      this.spriteCount * 6,
      gl.UNSIGNED_SHORT,
      0
    );

    this.spriteCount = 0;
  }

  private buildIndexBuffer(): void {
    for (let i = 0, offset = 0; i < this.maxSprites; i++, offset += 4) {
      const j = i * 6;
      this.indices[j + 0] = offset + 0;
      this.indices[j + 1] = offset + 1;
      this.indices[j + 2] = offset + 2;
      this.indices[j + 3] = offset + 0;
      this.indices[j + 4] = offset + 2;
      this.indices[j + 5] = offset + 3;
    }
  }
}
