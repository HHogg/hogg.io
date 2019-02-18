precision mediump float;

uniform float u_t;
uniform vec2 u_translate_0;
uniform vec2 u_translate_1;
uniform mat3 u_projection;

attribute float a_color_a_0;
attribute float a_color_a_1;
attribute float a_color_b_0;
attribute float a_color_b_1;
attribute float a_color_g_0;
attribute float a_color_g_1;
attribute float a_color_r_0;
attribute float a_color_r_1;
attribute float a_radius_0;
attribute float a_radius_1;
attribute float a_x_0;
attribute float a_x_1;
attribute float a_y_0;
attribute float a_y_1;

varying vec4 fragColor;

void main () {
  float colorA = mix(a_color_a_0, a_color_a_1, u_t);
  float colorB = mix(a_color_b_0, a_color_b_1, u_t);
  float colorG = mix(a_color_g_0, a_color_g_1, u_t);
  float colorR = mix(a_color_r_0, a_color_r_1, u_t);

  float r = mix(a_radius_0, a_radius_1, u_t);
  float x = mix(a_x_0, a_x_1, u_t);
  float y = mix(a_y_0, a_y_1, u_t);

  vec3 translate = vec3(mix(u_translate_0, u_translate_1, u_t), 0);
  vec3 position = vec3(x, y, 0);

  fragColor = vec4(colorR, colorG, colorB, colorA);

  gl_PointSize = r * 4.0;
  gl_Position = vec4(u_projection * (position - translate), 1);
}
