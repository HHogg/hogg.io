import atan2 from '../utilsMath/atan2';

export default class Vector {
  constructor([x, y], circle1, circle2, n) {
    this.n = n;
    this.x = x;
    this.y = y;

    this.circle1 = circle1;
    this.circle2 = circle2;

    this.angle1 = atan2(x, y, circle1.x, circle1.y);
    this.angle2 = atan2(x, y, circle2.x, circle2.y);
  }

  getAngle(circle) {
    if (this.circle1 === circle) return this.angle1;
    if (this.circle2 === circle) return this.angle2;

    return null;
  }

  getConnections() {
    return [
      ...this.circle1.getConnections(this),
      ...this.circle2.getConnections(this),
    ];
  }

  getOtherCircle(circle) {
    return this.circle1 === circle ? this.circle2 : this.circle1;
  }

  toObject() {
    return {
      n: this.n,
      x: this.x,
      y: this.y,
    };
  }
}
