precision mediump float;

uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;

attribute vec3 aPosition;

void main () {
  vec4 position = uProjection * uView * uModel * vec4(aPosition, 1.0);

  gl_PointSize = 4.0;
  gl_Position = position;
}
