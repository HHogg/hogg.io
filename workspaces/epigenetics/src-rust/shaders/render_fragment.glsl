#version 300 es
precision highp float;

out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_computeTexture;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Sample from compute texture
  vec4 color = texture(u_computeTexture, uv);

  fragColor = color;
}
