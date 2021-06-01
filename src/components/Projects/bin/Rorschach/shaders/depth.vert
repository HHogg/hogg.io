precision mediump float;

varying float vDepth;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

attribute vec3 aPosition;

void main() {
  gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
  vDepth = gl_Position.z;
}
