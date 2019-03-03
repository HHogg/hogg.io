import LineSegment from './LineSegment';
import Vector from './Vector';

const mean = (values) => values.reduce((n, v) => n + v, 0) / values.length;

const callReset = (ls) => ls.reset();

const extractClone = (vector) => vector.clone();
const extractDistanceTo = (vector) => vector.distanceTo();
const extractJs = (vector) => vector.toJs();

const sortLineSegments = (ls1, ls2) =>
  ls1.v1.equalsX(0) && ls1.v2.equalsX(0) && 1 ||
  ls2.v1.equalsX(0) && ls2.v2.equalsX(0) && -1 ||
  ls1.centroid.angleDifference(ls2.centroid);

export default class Shape {
  constructor(sides, vectors = []) {
    this.angle = (Math.PI * 2) / sides;
    this.sides = sides;
    this.vectors = vectors;
  }

  get centroid() {
    if (this._centroid === undefined) {
      this._centroid = new Vector(
        mean(this.vectors.map(({ x }) => x)),
        mean(this.vectors.map(({ y }) => y)),
      );
    }

    return this._centroid;
  }

  get distances() {
    if (this._distances === undefined) {
      this._distances = this.vectors.map(extractDistanceTo);
    }

    return this._distances;
  }

  get lineSegments() {
    if (this._lineSegments === undefined) {
      this._lineSegments = this.vectors.map((vector, i) =>
        new LineSegment(vector, this.vectors[i + 1] || this.vectors[0], this));
    }

    return this._lineSegments;
  }

  get lineSegmentsSorted() {
    return this.lineSegments
      .sort(sortLineSegments);
  }

  get maxDistance() {
    if (this._maxDistance === undefined) {
      this._maxDistance = Math.max(...this.distances);
    }

    return this._maxDistance;
  }

  get minDistance() {
    if (this._minDistance === undefined) {
      this._minDistance = Math.min(...this.distances);
    }

    return this._minDistance;
  }

  clone() {
    return new Shape(this.sides, this.vectors.map(extractClone));
  }

  equals(s) {
    return this.centroid.equals(s.centroid);
  }

  fromLineSegment(lineSegment) {
    const v1 = lineSegment.v2.clone();
    const v2 = lineSegment.v1.clone();
    const length = lineSegment.length;
    let a = v1.angleTo(v2) + this.angle;

    this.vectors = [v1, v2];

    for (let i = this.vectors.length; i < this.sides; i++, a += this.angle) {
      this.vectors.push(new Vector(
        Math.cos(a) * length,
        Math.sin(a) * length,
      ).add(this.vectors[i - 1]));
    }

    return this;
  }

  fromRadius(r, v = new Vector(0, 0)) {
    this.vectors = [];

    for (let i = 0; i < this.sides; i++) {
      this.vectors.push(new Vector(
        Math.cos(this.angle * i) * r,
        Math.sin(this.angle * i) * r,
      ).add(v));
    }

    return this;
  }

  reflect(a, v) {
    return this.transform((vector) => vector.reflect(a, v));
  }

  rotate(a, v) {
    return this.transform((vector) => vector.rotate(a, v));
  }

  setStage(stage) {
    if (this.stage === undefined) {
      this.stage = stage;
    }

    return this;
  }

  translate(x, y) {
    return this.transform((vector) => vector.translate(x, y));
  }

  transform(fn) {
    this._centroid = undefined;
    this._distances = undefined;
    this._maxDistance = undefined;
    this._minDistance = undefined;
    this.vectors.forEach(fn);
    this.lineSegments.forEach(callReset);
    return this;
  }

  toJs() {
    return {
      stage: this.stage,
      disconnected: this.lineSegments.some(({ isConnected }) => !isConnected),
      vectors: this.vectors.map(extractJs),
    };
  }
}
