import { mat4, quat, vec2, vec3 } from 'gl-matrix';

declare module 'orbit-camera' {
  export class OrbitCamera {
    constructor(rotation: quat, center: vec3, distance: number);
    lookAt(eye?: vec3, target?: vec3, up?: vec3): void;
    pan(dpan: vec2): void;
    rotate(da: vec2, db: vec2): void;
    view(out?: mat4): mat4;
    zoom(d: number): void;
  }

  export default function (eye?: vec3, target?: vec3, up?: vec3): OrbitCamera;
}
