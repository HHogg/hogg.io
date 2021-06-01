precision mediump float;

varying float vDepth;

void main () {
  gl_FragColor = vec4(vec3(vDepth), 1.0);
}
