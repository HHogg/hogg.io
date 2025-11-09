#version 300 es
precision highp float;

out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_compute_texture;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Sample from compute texture
  vec4 color = texture(u_compute_texture, uv);

  fragColor = color + vec4(u_time * 0.0f, 0.0f, 0.0f, 0.0f); // Prevent uniform optimization
}
