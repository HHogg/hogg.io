precision highp float;

varying vec3 vPosition;

uniform mat4 uModel;
uniform mat4 uLightView;
uniform mat4 uLightProjection;

attribute vec3 aPosition;

void main() {
  gl_Position = uLightProjection * uLightView * uModel * vec4(aPosition, 1.0);
  vPosition = gl_Position.xyz;
}
