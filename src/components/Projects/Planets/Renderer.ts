/* eslint-disable @typescript-eslint/camelcase */
import regl, { Framebuffer } from 'regl';
import { vec2, mat4, vec3 } from 'gl-matrix';
import orbitCamera, { OrbitCamera } from 'orbit-camera';
import getGeometry, { GeometryRaw } from './getGeometry/getGeometry';
import depthFrag from './shaders/depth.frag';
import depthVert from './shaders/depth.vert';
import pointFrag from './shaders/point.frag';
import pointVert from './shaders/point.vert';
import normalFrag from './shaders/normal.frag';
import normalVert from './shaders/normal.vert';
import { ConfigDrawMode } from './Planets';

const SHADOW_MAP_RESOLUTION = 1024 * 4;

const onMouseDownGlobal = () => {
  document.body.style.userSelect = 'none';
};

const onMouseUpGlobal = () => {
  document.body.style.userSelect = '';
};

const uLightPosition = vec3.fromValues(-1, 1, -1);

export default class Renderer {
  aspect: number;
  camera: OrbitCamera;
  drawMode: ConfigDrawMode;
  regl: regl.Regl;
  frame?: regl.Cancellable;
  projection: mat4;

  keyDown: string;
  pointerIsDown: boolean;
  pointerPrevX: number;
  pointerPrevY: number;

  geometries: GeometryRaw[];


  constructor(canvas: HTMLCanvasElement) {
    this.aspect = 1;
    this.projection = mat4.create();

    this.regl = regl({
      canvas: canvas,
      extensions: ['oes_texture_float'],
    });

    this.drawMode = 'faces';
    this.keyDown = '';
    this.pointerIsDown = false;
    this.pointerPrevX = 0;
    this.pointerPrevY = 0;

    this.geometries = getGeometry();

    this.camera = orbitCamera(uLightPosition);

    this.addEventListeners();
  }

  addEventListeners() {
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  removeEventListeners() {
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }

  handleMouseDown(event: MouseEvent) {
    onMouseDownGlobal();
    this.pointerIsDown = true;
    this.pointerPrevX = event.clientX;
    this.pointerPrevY = event.clientY;
  }

  handleMouseMove(event: MouseEvent) {
    if (this.pointerIsDown) {
      switch (this.keyDown) {
        case 'Alt': this.handleZoom(event); break;
        case 'Meta': this.handlePan(event); break;
        case '': this.handleRotate(event); break;
      }

      this.pointerPrevX = event.clientX;
      this.pointerPrevY = event.clientY;
    }
  }

  handleMouseUp() {
    onMouseUpGlobal();
    this.pointerIsDown = false;
  }

  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Alt': this.keyDown = 'Alt'; break;
      case 'Meta': this.keyDown = 'Meta'; break;
    }
  }

  handleKeyUp() {
    this.keyDown = '';
  }

  handleRotate(event: MouseEvent) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.rotate(
      vec2.fromValues((event.clientX - (w * 0.5)) / (w * 0.5), (event.clientY - (h * 0.5)) / (h * 0.5)),
      vec2.fromValues((this.pointerPrevX - (w * 0.5)) / (w * 0.5), (this.pointerPrevY - (h * 0.5)) / (h * 0.5)));

  }

  handlePan(event: MouseEvent) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.pan(vec2.fromValues(
      500 * (event.clientX - this.pointerPrevX) / w,
      500 * (event.clientY - this.pointerPrevY) / h,
    ));
  }

  handleZoom(event: MouseEvent) {
    this.camera.zoom(
      ((event.clientX - this.pointerPrevX) + (event.clientY - this.pointerPrevY)) * 0.1,
    );
  }

  setDimensions(width: number, height: number) {
    this.aspect = width / height;
    this.projection = mat4.ortho(mat4.create(),
      -2 * this.aspect, 2 * this.aspect,
      -2, 2,
      -5, 5);

    this.draw();
  }

  setDrawMode(drawMode: ConfigDrawMode) {
    this.drawMode = drawMode;
    this.draw();
  }

  draw() {
    const buffer = this.regl.framebuffer({
      depth: true,
      color: this.regl.texture({
        width: SHADOW_MAP_RESOLUTION,
        height: SHADOW_MAP_RESOLUTION,
        wrap: 'clamp',
        type: 'float',
      }),
    });

    if (this.frame) {
      this.frame.cancel();
    }

    const drawRoot = this.drawRoot();
    const drawDepth = this.drawDepth(buffer);
    const drawNormal = this.drawNormal(buffer);

    const drawLines = this.drawLines();
    const drawPoints = this.drawPoints();
    const drawFaces = this.drawFaces();

    this.frame = this.regl.frame(() => {
      const drawMeshes = ()  => {
        this.regl.clear({
          depth: 1,
        });

        for (const geometry of this.geometries) {
          if (!geometry.elements || this.drawMode === 'points') {
            drawPoints(geometry);
          } else if (this.drawMode === 'lines') {
            drawLines(geometry);
          } else if (this.drawMode === 'faces') {
            drawFaces(geometry);
          }
        }
      };

      drawRoot(() => {
        drawDepth(drawMeshes);
        drawNormal(drawMeshes);
      });
    });
  }

  drawRoot() {
    return this.regl({
      uniforms: {
        uLightPosition: uLightPosition,
        uLightProjection: this.projection,
        uLightView: () => mat4.lookAt(mat4.create(), uLightPosition, [0, 0, 0], [0, 1, 0]),
        uProjection: this.projection,
        uTexelSize: 1 / SHADOW_MAP_RESOLUTION,
        uView:  mat4.lookAt(mat4.create(), vec3.add(vec3.create(), uLightPosition, vec3.fromValues(-0.25, -0.2, 0)), [0, 0, 0], [0, 1, 0]),
        // uTween: ({ tick }) => Math.sin(tick * 0.01),
        // uView: () => this.camera.view(),
      },
    });
  }

  drawDepth(framebuffer: Framebuffer) {
    return this.regl({
      frag: depthFrag,
      vert: depthVert,
      framebuffer: framebuffer,
    });
  }

  drawNormal(framebuffer: Framebuffer) {
    return this.regl({
      frag: normalFrag,
      vert: normalVert,
      uniforms: {
        uShadowMap: framebuffer,
      },
    });
  }

  drawFaces() {
    return this.regl({
      elements: this.regl.prop<GeometryRaw, 'elements'>('elements'),
      uniforms: {
        uModel: ({ tick }) => mat4.fromRotation(mat4.create(), 0.01 * tick, [0.33, 0.66, 1]),
        // uModel: () => mat4.create(),
        uTick: ({ tick }) => tick,
      },
      attributes: {
        aNormal: this.regl.prop<GeometryRaw, 'normals'>('normals'),
        aPosition: this.regl.prop<GeometryRaw, 'vertices'>('vertices'),
      },
      cull: {
        enable: true,
      },
    });
  }

  drawLines() {
    return this.regl({
      primitive: 'lines',
      elements: this.regl.prop<GeometryRaw, 'elements'>('elements'),
      uniforms: {
        uModel: ({ tick }) => mat4.fromRotation(mat4.create(), 0.01 * tick, [0.33, 0.66, 1]),
      },
      attributes: {
        aPosition: this.regl.prop<GeometryRaw, 'vertices'>('vertices'),
      },
      frag: pointFrag,
      vert: pointVert,
    });
  }

  drawPoints() {
    return this.regl({
      primitive: 'points',
      elements: this.regl.prop<GeometryRaw, 'elements'>('elements'),
      uniforms: {
        uModel: ({ tick }) => mat4.fromRotation(mat4.create(), 0.01 * tick, [0.33, 0.66, 1]),
      },
      attributes: {
        aPosition: this.regl.prop<GeometryRaw, 'vertices'>('vertices'),
      },
      frag: pointFrag,
      vert: pointVert,
    });
  }


  destroy() {
    this.regl.destroy();

    this.removeEventListeners();
  }
}
