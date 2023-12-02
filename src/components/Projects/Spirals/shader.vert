precision mediump float;

uniform mat3 u_projection;
uniform float u_device_pixel_ratio;
uniform float u_t;

attribute vec3 a_vector_0;
attribute vec3 a_vector_1;

void main () {
  vec3 vector = mix(a_vector_0, a_vector_1, u_t);
  vec3 position = vec3(vec2(vector), 0);

  gl_PointSize = vector[2] * 2.0 * u_device_pixel_ratio;
  gl_Position = vec4(u_projection * position, 1);
}
