precision highp float;

varying vec3 vNormal;
varying vec3 vNormalShadow;
varying vec3 vShadowCoord;

uniform float uTick;
uniform mat4 uLightProjection;
uniform mat4 uLightView;
uniform mat4 uProjection;
uniform mat4 uModel;
uniform mat4 uView;

attribute vec3 aNormal;
attribute vec3 aPosition;

void main() {
  vNormal = aNormal;
  vNormalShadow = (uLightProjection * uLightView * uModel * vec4(aNormal, 1.0)).xyz;
  vShadowCoord = (uLightProjection * uLightView * uModel * vec4(aPosition, 1.0)).xyz;

  gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}
