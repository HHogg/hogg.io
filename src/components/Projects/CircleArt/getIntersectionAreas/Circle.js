import floor from 'lodash.floor';
import getCircleArea from '../utilsMath/getCircleArea';
import isPointWithinCircle from '../utilsMath/isPointWithinCircle';
import Arc from './Arc';
import CircleSegment from './CircleSegment';

const precise = (n) => floor(n, 5);

export default class Circle {
  constructor(shape, n) {
    this.vectors = [];
    this.segments = [];

    this.n = n;
    this.x = precise(shape.x);
    this.y = precise(shape.y);
    this.radius = precise(shape.radius);
    this.area = getCircleArea(shape);
  }

  addVector(vector) {
    if (!this.vectors.some((v) => vector === v)) {
      this.vectors.push(vector);
      this.vectors.sort((a, b) => a.getAngle(this) - b.getAngle(this));
      this.segments = this.vectors.map((vector, i) =>
        new CircleSegment(vector, this.vectors[i + 1] || this.vectors[0], this)
      );
    }
  }

  getConnections(vector) {
    const i = this.segments.findIndex(({ start }) => start === vector);

    return [
      new Arc(this.segments[i ? i - 1 : this.segments.length - 1], -1),
      new Arc(this.segments[i], 1),
    ];
  }

  isPointWithinCircle(x, y) {
    return isPointWithinCircle(x, y, this.x, this.y, this.radius);
  }

  toObject() {
    return {
      area: this.area,
      n: this.n,
      radius: this.radius,
      segments: this.segments.map((segment) => segment.toObject()),
      underlay: this.segments.length > 0,
      x: this.x,
      y: this.y,
    };
  }
}
