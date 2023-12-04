precision mediump float;

uniform float u_device_pixel_ratio;
uniform float u_rotation_theta;
uniform float u_transition_time;
uniform mat3 u_projection;

attribute vec2 a_point_a;
attribute vec2 a_point_b;
attribute vec3 a_color;

varying vec3 v_color;

void main() {
  // Interpolate between the starting point and the destination point
  vec2 point = mix(a_point_a, a_point_b, u_transition_time);

  // Rotate the point around the origin
  float c = cos(u_rotation_theta);
  float s = sin(u_rotation_theta);
  mat2 rotation = mat2(c, s, -s, c);

  point = rotation * point;

  // Apply the projection matrix
  point = (u_projection * vec3(point, 0.0)).xy;

  // Set the point size and position
  gl_PointSize = 2.0 * u_device_pixel_ratio;
  gl_Position = vec4(vec3(point, 0.0), 1.0);

  // Pass the color to the fragment shader
  v_color = a_color;
}
