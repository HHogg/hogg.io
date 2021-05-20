precision mediump float;

varying float vHeight;
varying vec3 vNormal;
varying vec3 vShadowCoord;

uniform sampler2D uShadowMap;

vec3 lightPosition = vec3(0, 0, 4);

void main () {
  vec2 co = vShadowCoord.xy * 0.5 + 0.5;
  float cosTheta = dot(vNormal, lightPosition);
  float r = step(vShadowCoord.z - 1.0, texture2D(uShadowMap, co).r);
  vec3 nColor = vNormal * 0.5 + 0.5;
  gl_FragColor = vec4(nColor * cosTheta * r, 1.0);
}
