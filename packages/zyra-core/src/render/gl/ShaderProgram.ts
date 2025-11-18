// src/render/gl/ShaderProgram.ts

export class ShaderProgram {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;

  constructor(gl: WebGLRenderingContext, vertexSrc: string, fragmentSrc: string) {
    this.gl = gl;
    this.program = this.createProgram(vertexSrc, fragmentSrc);
  }

  use(): void {
    this.gl.useProgram(this.program);
  }

  getAttribLocation(name: string): number {
    return this.gl.getAttribLocation(this.program, name);
  }

  getUniformLocation(name: string): WebGLUniformLocation | null {
    return this.gl.getUniformLocation(this.program, name);
  }

  // ==== 常用 uniform 封装 ====

  set1i(name: string, v: number): void {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform1i(loc, v);
  }

  set1f(name: string, v: number): void {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform1f(loc, v);
  }

  set2f(name: string, x: number, y: number): void {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform2f(loc, x, y);
  }

  set3f(name: string, x: number, y: number, z: number): void {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform3f(loc, x, y, z);
  }

  set4f(name: string, x: number, y: number, z: number, w: number): void {
    const loc = this.getUniformLocation(name);
    if (loc) this.gl.uniform4f(loc, x, y, z, w);
  }

  get raw(): WebGLProgram {
    return this.program;
  }

  // ==== 内部 ====

  private createProgram(vertexSrc: string, fragmentSrc: string): WebGLProgram {
    const gl = this.gl;

    const vs = this.compileShader(gl.VERTEX_SHADER, vertexSrc);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fragmentSrc);

    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create WebGLProgram');

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error('Program link failed: ' + info);
    }

    return program;
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Shader compile error: ' + info);
    }

    return shader;
  }
}
