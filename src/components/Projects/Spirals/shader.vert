precision mediump float;

uniform mat3 u_projection;
uniform float u_t;

attribute vec3 a_vector_0;
attribute vec3 a_vector_1;

varying vec4 fragColor;

void main () {
  vec3 vector = mix(a_vector_0, a_vector_1, u_t);
  vec3 position = vec3(vec2(vector), 0);

  fragColor = vec4(1, 1, 1, 1);

  gl_PointSize = vector[2];
  gl_Position = vec4(u_projection * position, 1);
}
