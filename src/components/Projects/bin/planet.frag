precision mediump float;

varying float fragHeight;
varying vec3 fragNormal;
varying vec3 fragPosition;

vec3 positionLight = vec3(1.0, 1.0, -1.0);

vec3 colorAmbient = vec3(0.0, 0.0, 0.0);
vec3 colorDiffuse = vec3(1.0, 1.0, 1.0);
vec3 colorSpecular = vec3(1.0, 1.0, 1.0);

vec3 colorSea0 = vec3(0.8901, 0.9803, 0.9882);
vec3 colorSea1 = vec3(0.2, 0.6039, 0.9411);

vec3 colorLand0 = vec3(0.9725, 0.9764, 0.9803);
vec3 colorLand1 = vec3(0.1254, 0.7882, 0.5921);

vec3 getColor() {
  if (fragHeight >= 0.0) {
    return colorLand1;
  }

  return colorSea1;
}

void main() {
  vec3 color = getColor();

  float kAmbient = 1.0;
  float kDiffuse = 1.0;
  float kSpecular = fragHeight >= 0.0 ? 0.0 : 1.0;
  float kSpecularShiny = 80.0;

  vec3 light = normalize(positionLight);

  float luminosity = max(dot(fragNormal, light), 0.0);
  float specular = 0.0;

  if (luminosity > 0.0) {
    float angleSpecular = max(dot(reflect(-light, fragNormal), normalize(-fragPosition)), 0.0);
    specular = pow(angleSpecular, kSpecularShiny);
  }

  gl_FragColor = vec4(color, 1.0) *
    vec4(kAmbient * colorAmbient +
         kDiffuse * luminosity * colorDiffuse +
         kSpecular * specular * colorSpecular, 1.0);
}
