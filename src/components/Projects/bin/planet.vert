precision mediump float;

uniform mat4 u_model;
uniform mat4 u_projection;
uniform mat4 u_view;


attribute float a_height;
attribute vec3 a_normal;
attribute vec3 a_position;

varying float fragHeight;
varying vec3 fragNormal;
varying vec3 fragPosition;

void main() {
  fragHeight = a_height;
  fragNormal = a_normal;
  fragPosition = a_position;

  gl_Position = u_projection * u_view * u_model * vec4(a_position, 1);
}
