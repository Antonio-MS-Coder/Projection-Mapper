import { mat3, mat4, vec2, vec3 } from 'gl-matrix';
import { Geometry, Layer, GlobalSettings, QuadPoint, Vec2 } from '@shared/types';
import { calculateHomography } from '../utils/homography';

export class ProjectionEngine {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram | null = null;
  private textures: Map<string, WebGLTexture> = new Map();
  private videos: Map<string, HTMLVideoElement> = new Map();
  private framebuffer: WebGLFramebuffer | null = null;
  private renderTexture: WebGLTexture | null = null;

  // Shader sources
  private vertexShaderSource = `#version 300 es
    precision highp float;

    in vec2 a_position;
    in vec2 a_texCoord;

    uniform mat3 u_homography;
    uniform mat4 u_transform;

    out vec2 v_texCoord;

    void main() {
      vec3 transformed = u_homography * vec3(a_position, 1.0);
      transformed.xy /= transformed.z;

      gl_Position = u_transform * vec4(transformed.xy, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  private fragmentShaderSource = `#version 300 es
    precision highp float;

    in vec2 v_texCoord;

    uniform sampler2D u_texture;
    uniform float u_opacity;
    uniform vec3 u_tint;
    uniform float u_intensity;
    uniform int u_blendMode;

    out vec4 fragColor;

    vec4 applyBlendMode(vec4 src, vec4 dst, int mode) {
      if (mode == 1) { // add
        return src + dst;
      } else if (mode == 2) { // multiply
        return src * dst;
      } else if (mode == 3) { // screen
        return vec4(1.0) - (vec4(1.0) - src) * (vec4(1.0) - dst);
      }
      return src; // normal
    }

    void main() {
      vec4 color = texture(u_texture, v_texCoord);
      color.rgb *= u_tint * u_intensity;
      color.a *= u_opacity;

      fragColor = color;
    }
  `;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });

    if (!gl) {
      throw new Error('WebGL2 not supported');
    }

    this.gl = gl;
    this.initializeGL();
  }

  private initializeGL() {
    const gl = this.gl;

    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Create shader program
    this.program = this.createShaderProgram(
      this.vertexShaderSource,
      this.fragmentShaderSource
    );

    // Create framebuffer for offscreen rendering
    this.framebuffer = gl.createFramebuffer();
    this.renderTexture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, this.renderTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.canvas.width,
      this.canvas.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.renderTexture,
      0
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private createShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
    const gl = this.gl;

    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    if (!program) throw new Error('Failed to create shader program');

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw new Error('Failed to link shader program: ' + info);
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
      throw new Error('Failed to compile shader: ' + info);
    }

    return shader;
  }


  public loadImage(id: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';

      image.onload = () => {
        const gl = this.gl;
        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Generate mipmaps for better quality
        if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
          gl.generateMipmap(gl.TEXTURE_2D);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        this.textures.set(id, texture!);
        resolve();
      };

      image.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };

      image.src = src;
    });
  }

  public loadVideo(id: string, src: string): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true; // Required for autoplay

      video.onloadeddata = () => {
        const gl = this.gl;
        const texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        this.textures.set(id, texture!);
        this.videos.set(id, video);

        resolve(video);
      };

      video.onerror = () => {
        reject(new Error(`Failed to load video: ${src}`));
      };

      video.src = src;
    });
  }

  public updateVideoTexture(id: string) {
    const video = this.videos.get(id);
    const texture = this.textures.get(id);

    if (!video || !texture || video.readyState < 2) return;

    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
  }

  private isPowerOf2(value: number): boolean {
    return (value & (value - 1)) === 0;
  }

  public render(
    layers: Layer[],
    geometries: Geometry[],
    globalSettings: GlobalSettings
  ) {
    const gl = this.gl;

    // Clear canvas
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (!this.program) return;

    gl.useProgram(this.program);

    // Setup vertex buffer for a quad
    const positions = new Float32Array([
      -1, -1,
       1, -1,
       1,  1,
      -1,  1,
    ]);

    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      1, 0,
      0, 0,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    // Get attribute and uniform locations
    const aPosition = gl.getAttribLocation(this.program, 'a_position');
    const aTexCoord = gl.getAttribLocation(this.program, 'a_texCoord');
    const uHomography = gl.getUniformLocation(this.program, 'u_homography');
    const uTransform = gl.getUniformLocation(this.program, 'u_transform');
    const uTexture = gl.getUniformLocation(this.program, 'u_texture');
    const uOpacity = gl.getUniformLocation(this.program, 'u_opacity');
    const uTint = gl.getUniformLocation(this.program, 'u_tint');
    const uIntensity = gl.getUniformLocation(this.program, 'u_intensity');
    const uBlendMode = gl.getUniformLocation(this.program, 'u_blendMode');

    // Enable attributes
    gl.enableVertexAttribArray(aPosition);
    gl.enableVertexAttribArray(aTexCoord);

    // Render each layer
    for (const layer of layers) {
      if (!layer.visible) continue;

      const geometry = geometries.find(g => g.id === layer.geometryId);
      if (!geometry || !geometry.visible) continue;

      // Update video texture if needed
      if (layer.type === 'video') {
        this.updateVideoTexture(layer.id);
      }

      const texture = this.textures.get(layer.id);
      if (!texture) continue;

      // Bind position buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      // Bind texcoord buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

      // Calculate and set homography
      const srcPoints: Vec2[] = [
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: 1 },
      ];

      const dstPoints = geometry.points.map(p => p.position);
      const homography = calculateHomography(srcPoints, dstPoints);
      gl.uniformMatrix3fv(uHomography, false, homography);

      // Set transform matrix
      const transform = mat4.create();
      mat4.translate(transform, transform, [
        layer.transform.position.x,
        layer.transform.position.y,
        layer.transform.position.z,
      ]);
      mat4.rotateZ(transform, transform, layer.transform.rotation.z);
      mat4.scale(transform, transform, [
        layer.transform.scale.x,
        layer.transform.scale.y,
        layer.transform.scale.z,
      ]);
      gl.uniformMatrix4fv(uTransform, false, transform);

      // Set uniforms
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uTexture, 0);

      gl.uniform1f(uOpacity, layer.opacity);
      gl.uniform3f(uTint, globalSettings.tint.r, globalSettings.tint.g, globalSettings.tint.b);
      gl.uniform1f(uIntensity, globalSettings.intensity);

      const blendModeMap = { normal: 0, add: 1, multiply: 2, screen: 3 };
      gl.uniform1i(uBlendMode, blendModeMap[layer.blendMode]);

      // Draw
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    // Cleanup
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(texCoordBuffer);
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);

    // Recreate render texture with new size
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.renderTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
  }

  public destroy() {
    const gl = this.gl;

    // Clean up textures
    this.textures.forEach(texture => gl.deleteTexture(texture));
    this.textures.clear();

    // Clean up videos
    this.videos.forEach(video => {
      video.pause();
      video.src = '';
    });
    this.videos.clear();

    // Clean up framebuffer
    if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer);
    if (this.renderTexture) gl.deleteTexture(this.renderTexture);

    // Clean up program
    if (this.program) gl.deleteProgram(this.program);
  }
}