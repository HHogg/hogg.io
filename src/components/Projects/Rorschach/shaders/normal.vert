precision mediump float;

varying float vHeight;
varying vec3 vNormal;
varying vec3 vShadowCoord;

uniform mat4 uLightProjection;
uniform mat4 uLightView;
uniform mat4 uProjection;
uniform mat4 uModel;
uniform mat4 uView;

attribute float aHeight;
attribute vec3 aNormal;
attribute vec3 aPosition;

void main() {
  vHeight = aHeight;
  vNormal = aNormal;
  vShadowCoord = (uLightProjection * uLightView * uModel * vec4(aPosition, 1.0)).xyz;

  gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}
