/* eslint-disable @typescript-eslint/camelcase */
import regl, { Framebuffer } from 'regl';
import { mat4, vec3 } from 'gl-matrix';
import orbitCamera, { OrbitCamera } from 'orbit-camera';
import { Geometry } from './getGeometry';
import depthFrag from './shaders/depth.frag';
import depthVert from './shaders/depth.vert';
import normalFrag from './shaders/normal.frag';
import normalVert from './shaders/normal.vert';

const SHADOW_MAP_RESOLUTION = 2048;

interface MeshProps extends Geometry {
  translate: [number, number, number];
}

export default class Renderer {
  aspect: number;
  camera: OrbitCamera;
  regl: regl.Regl;
  frame?: regl.Cancellable;
  projection: mat4;

  geometries: [Geometry | null, number][];
  gridSize: [number, number, number];
  translations: [number, number, number][];

  constructor(canvas: HTMLCanvasElement) {
    this.aspect = 1;
    this.camera = orbitCamera();
    this.projection = mat4.create();

    this.regl = regl({
      canvas: canvas,
      extensions: ['oes_texture_float'],
    });

    this.geometries = [];
    this.gridSize = [0, 0, 0];
    this.translations = [];
  }

  setDimensions(width: number, height: number) {
    this.aspect = width / height;
  }

  setGeometries(geometries: [Geometry | null, number][], gridSize: [number, number, number]) {
    const [x, y] = gridSize;
    const p = 1.5;
    const w = 0.5 + (x + (x * p) - p) * 0.5;
    const h = 0.5 + (y + (y * p) - p) * 0.5;

    this.geometries = geometries;
    this.gridSize = gridSize;
    this.projection = mat4.ortho(mat4.create(),
      w * -1 * this.aspect, w * this.aspect,
      h * -1, h,
      0, 2);

    this.translations = this.geometries.map(([, i]) => {
      const tx = (i % 3) - 1, ty = ~~(i / y) - 1;
      const px = tx * p, py = ty * p;
      return [tx + px, ty + py, 0];
    });

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
    const drawMesh = this.drawMesh();

    this.frame = this.regl.frame(() => {
      this.regl.clear({
        depth: 1,
      });

      drawRoot(() => {
        for (let i = 0; i < this.geometries.length; i++) {
          const geometry = this.geometries[i];
          const translation = this.translations[i];

          if (geometry[0]) {
            drawDepth(() => {
              drawMesh({
                ...geometry[0],
                translate: translation,
              });
            });

            drawNormal(() => {
              drawMesh({
                ...geometry[0],
                translate: translation,
              });
            });
          }
        }
      });
    });
  }

  drawRoot() {
    return this.regl({
      uniforms: {
        uProjection: this.projection,
        uTexelSize: 1 / SHADOW_MAP_RESOLUTION,
        uView: () => this.camera.view(),
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

  drawMesh() {
    return this.regl({
      elements: this.regl.prop<MeshProps, 'elements'>('elements'),
      uniforms: {
        uModel: (_, props: MeshProps) => mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(...props.translate)),
        uLightProjection: this.projection,
        uLightView: (_, props) => mat4.lookAt(mat4.create(), [props.translate[0], props.translate[1], 1], props.translate, [0, 1, 0]),
      },
      attributes: {
        aHeight: this.regl.prop<MeshProps, 'heights'>('heights'),
        aNormal: this.regl.prop<MeshProps, 'normals'>('normals'),
        aPosition: this.regl.prop<MeshProps, 'vertices'>('vertices'),
      },
      cull: {
        enable: true,
      },
    });
  }

  destroy() {
    this.regl.destroy();
  }
}
