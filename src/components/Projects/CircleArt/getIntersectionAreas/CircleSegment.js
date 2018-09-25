import BitSet from 'bitset';

const TWO_PI = 2 * Math.PI;

export default class CircleSegment {
  constructor(vector1, vector2, circle) {
    this.start = vector1;
    this.end = vector2;
    this.circle = circle;

    this.a1 = this.start.getAngle(this.circle);
    this.a2 = this.end.getAngle(this.circle);

    if (this.a1 > this.a2) this.a1 -= TWO_PI;

    this.a3 = this.a1 + (0.5 * (this.a2 - this.a1));

    this.mx = this.circle.x + this.circle.radius * Math.cos(this.a3);
    this.my = this.circle.y + this.circle.radius * Math.sin(this.a3);
  }

  set n(n) {
    this._n = n;
    this.bitset = new BitSet();
    this.bitset.set(n);
  }

  get n() {
    return this._n;
  }

  toObject() {
    return {
      n: this.n,
      mx: this.mx,
      my: this.my,
    };
  }
}
