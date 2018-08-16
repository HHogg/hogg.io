const TWO_PI = 2 * Math.PI;

export default class Arc {
  constructor(segment, direction) {
    this.direction = direction;
    this.bitset = segment.bitset;
    this.circle = segment.circle;
    this.mx = segment.mx;
    this.my = segment.my;

    this.start = direction === 1 ? segment.start : segment.end;
    this.end = direction === 1 ? segment.end : segment.start;

    this.a1 = this.start.getAngle(this.circle);
    this.a2 = this.end.getAngle(this.circle);

    if (this.direction === 1 && this.a1 > this.a2) this.a1 -= TWO_PI;
    if (this.direction === -1 && this.a2 > this.a1) this.a2 -= TWO_PI;
  }

  get area() {
    const ø = Math.abs(this.a2 - this.a1);
    const R = this.circle.radius;
    const s = R * ø;
    const r = R * Math.cos(0.5 * ø);
    const a = 2 * Math.sqrt((R ** 2) - (r ** 2));

    return 0.5 * ((R * s) - (a * r));
  }

  isConvex(arcs) {
    return arcs.every((arc) => arc.circle === this.circle ||
      this.circle.isPointWithinCircle(arc.mx, arc.my));
  }

  toObject(arcs) {
    return {
      a1: this.a1,
      a2: this.a2,
      area: this.area,
      convex: this.isConvex(arcs),
      cx: this.circle.x,
      cy: this.circle.y,
      mx: this.mx,
      my: this.my,
      n1: this.start.n,
      n2: this.end.n,
      radius: this.circle.radius,
    };
  }
}
