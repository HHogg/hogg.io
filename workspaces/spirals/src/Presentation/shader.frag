precision mediump float;

varying vec3 v_color;

void main () {
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;

  if (dot(cxy, cxy) > 1.0) {
    discard;
  }

  gl_FragColor = vec4(v_color, 1);
}
