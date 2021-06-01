precision highp float;

varying vec3 vNormal;
varying vec3 vNormalShadow;
varying vec3 vShadowCoord;

uniform float uTexelSize;
uniform vec3 uLightPosition;
uniform sampler2D uShadowMap;

float minBias = 0.01;
float maxBias = 0.03;

float getShadowValue(vec2 pixel, float bias) {
  return step(vShadowCoord.z - bias, texture2D(uShadowMap, pixel).z);
}

float scale(float v, float d1, float d2, float r1, float r2) {
  return r1 + (r2 - r1) * ((v - d1) / (d2 - d1));
}

vec3 getBaseColor() {
  return vNormal * 0.5 + 0.5;
}

vec3 getShadedColor() {
  vec3 color = getBaseColor();
  float lightAmount = 1.0;
  float diffuse = scale(dot(vNormalShadow, uLightPosition), -1.0, 1.0, 0.0, 1.0);

  vec2 coord = vShadowCoord.xy * 0.5 + 0.5;

  if(coord.x >= 0.0 && coord.x <= 1.0 && coord.y >= 0.0 && coord.y <= 1.0) {
    float bias = max(maxBias * dot(vShadowCoord, uLightPosition), minBias);
    float v0 = getShadowValue(coord + uTexelSize * vec2(0.0, 0.0), bias);
    float v1 = getShadowValue(coord + uTexelSize * vec2(1.0, 0.0), bias);
    float v2 = getShadowValue(coord + uTexelSize * vec2(0.0, 1.0), bias);
    float v3 = getShadowValue(coord + uTexelSize * vec2(1.0, 1.0), bias);

    lightAmount = scale((v0 + v1 + v2 + v3) * (1.0 / 4.0), 0.0, 1.0, 0.25, 1.0);
  }

  return (color + diffuse) * diffuse * lightAmount;
}

void main () {
  gl_FragColor = vec4(getShadedColor(), 1.0);
}
