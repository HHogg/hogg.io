#version 300 es
precision highp float;

out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_previous_texture;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;

  // Sample previous frame
  vec4 previous = texture(u_previous_texture, uv);

  // Calculate normalized coordinates (matching CPU version)
  float fx = gl_FragCoord.x / u_resolution.x;
  float fy = gl_FragCoord.y / u_resolution.y;

  // Match the CPU computation exactly
  float angle = sin(fx * 6.28318530718f + u_time * 0.5f); // 2*PI = 6.28318530718
  float dist = sqrt((fx - 0.5f) * (fx - 0.5f) + (fy - 0.5f) * (fy - 0.5f));

  // RGBA values (matching CPU version)
  // Calculate new values based on position and time
  float r = angle * 0.5f + 0.5f;
  float g = sin(dist * 2.0f + u_time * 0.3f) * 0.5f + 0.5f;
  float b = sin(fx + fy + u_time * 0.2f) * 0.5f + 0.5f;
  float a = 1.0f;

  // Output the gradient directly
  // Add previous * 0.0 to prevent shader compiler from optimizing away the uniform
  vec4 gradient = vec4(r, g, b, a);
  fragColor = gradient + previous * 0.0f;
}
