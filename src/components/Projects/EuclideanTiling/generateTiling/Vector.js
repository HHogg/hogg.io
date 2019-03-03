const ANGLE_PRECISION = 0.001;
const VECTOR_PRECISION = 1;
const DEG_360 = Math.PI * 2;

export default class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  get angle() {
    if (this._angle === undefined) {
      const a1 = Math.atan2(this.y, this.x) + (Math.PI / 2);
      const a2 = (a1 < 0) ? (a1 + Math.PI * 2) : a1;
      const da = a2 - DEG_360;

      return this._angle = da > -ANGLE_PRECISION &&
        da < ANGLE_PRECISION ? 0 : a2;
    }

    return this._angle;
  }

  add(v) {
    return this.translate(v.x, v.y);
  }

  angleDifference(v) {
    const da = this.angle - v.angle;
    return da > -ANGLE_PRECISION && da < -ANGLE_PRECISION ? 0 : da;
  }

  angleTo(v) {
    return Math.atan2(v.y - this.y, v.x - this.x);
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  distanceDifference(v) {
    const d = this.distanceTo() - v.distanceTo();
    return d > -VECTOR_PRECISION && d < VECTOR_PRECISION ? 0 : d;
  }

  distanceTo(v = new Vector(0, 0)) {
    return Math.hypot(v.x - this.x, v.y - this.y);
  }

  divide(v) {
    return new Vector((this.x + v.x) / 2, (this.y + v.y) / 2);
  }

  equals(v) {
    return this.equalsX(v.x) && this.equalsY(v.y);
  }

  equalsX(x) {
    const dx = this.x - x;
    return dx > -VECTOR_PRECISION && dx < VECTOR_PRECISION;
  }

  equalsY(y) {
    const dy = this.y - y;
    return dy > -VECTOR_PRECISION && dy < VECTOR_PRECISION;
  }

  reflect(lineSegment) {
    const x1 = lineSegment.v1.x;
    const y1 = lineSegment.v1.y;
    const x2 = lineSegment.v2.x;
    const y2 = lineSegment.v2.y;
    const x = this.x;
    const y = this.y;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const a = (dx * dx - dy * dy) / (dx * dx + dy * dy);
    const b = 2 * dx * dy / (dx * dx + dy * dy);

    this.x = a * (x - x1) + b * (y - y1) + x1;
    this.y = b * (x - x1) - a * (y - y1) + y1;

    return this;
  }

  rotate(a, v = new Vector(0, 0)) {
    const x = this.x;
    const y = this.y;
    const cos = Math.cos(a);
    const sin = Math.sin(a);

    this.x = (cos * (x - v.x)) - (sin * (y - v.y)) + v.x;
    this.y = (cos * (y - v.y)) + (sin * (x - v.x)) + v.y;

    return this;
  }

  translate(x, y) {
    this.x += x;
    this.y += y;

    return this;
  }

  toJs() {
    return [
      this.x,
      this.y,
      this.angle,
    ];
  }
}
