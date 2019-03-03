import Vector from './Vector';

const extractClone = (item) => item.clone();
const extractJs = (item) => item.toJs();

const filterZeroZeroVectors = ({ edge }) =>
  !edge.equals(new Vector(0, 0));

const sortVectors = ({ point: v1a }, { point: v2a }) => v1a.distanceDifference(v2a);
const sortLineSegments = (ls1, ls2) =>
  ls1.v1.equalsX(0) && ls1.v2.equalsX(0) && 1 ||
  ls2.v1.equalsX(0) && ls2.v2.equalsX(0) && -1 ||
  ls1.centroid.angleDifference(ls2.centroid);

const getNearestSnapPoint = (point, line) => [
  line.v1,
  line.centroid,
  line.v2,
].sort((a, b) => a.distanceTo(point) - b.distanceTo(point))[0];

export default class Group {
  constructor(items = []) {
    this.add = this.add.bind(this);
    this.addShape = this.addShape.bind(this);
    this.items = Array.isArray(items) ? items : [items];
    this.lineSegments = [];
  }

  get lineSegmentsSorted() {
    return this.lineSegments.sort(sortLineSegments);
  }

  get tail() {
    return this.items[this.items.length - 1];
  }

  add(item, flatten = true) {
    if (item instanceof Group) {
      if (flatten) {
        item.items.forEach(this.addShape);
      } else {
        this.items.push(item);
      }
    } else {
      this.addShape(item);
    }

    return this;
  }

  addLineSegments(lineSegments) {
    this.lineSegments = this.lineSegments.concat(lineSegments);

    return this;
  }

  addShape(shape) {
    const length = this.items.length;
    let isAlreadyIncluded = false;

    for (let i = 0; i < length && !isAlreadyIncluded; i++) {
      isAlreadyIncluded = this.items[i].equals(shape);
    }

    if (!isAlreadyIncluded) {
      this.items.push(shape);
      this.addLineSegments(shape.lineSegments);
      shape.setStage(this.stage);
    }

    return this;
  }

  clone() {
    return new Group(this.items.map(extractClone));
  }

  connectLineSegments() {
    const lss = this.lineSegmentsSorted;
    const length = lss.length;

    this.disconnectedVectorDistanceMax = null;
    this.disconnectedVectorDistanceMin = null;

    for (let i = 0; i < length; i++) {
      for (let j = i + 1; j < length && !lss[i].isConnected; j++) {
        if (!lss[j].connection && lss[i].equals(lss[j])) {
          lss[i].connect(lss[j]);
          lss[j].connect(lss[i]);
        }
      }

      if (!lss[i].isConnected) {
        if (this.disconnectedVectorDistanceMax === null ||
            lss[i].maxDistance > this.disconnectedVectorDistanceMax) {
          this.disconnectedVectorDistanceMax = lss[i].maxDistance;
        }

        if (this.disconnectedVectorDistanceMin === null ||
            lss[i].minDistance < this.disconnectedVectorDistanceMin) {
          this.disconnectedVectorDistanceMin = lss[i].minDistance;
        }
      }
    }

    return this;
  }

  flatten() {
    const items = this.items;
    const l1 = items.length;

    this.items = [];

    for (let i = 0; i < l1; i++) {
      if (items[i] instanceof Group) {
        const l2 = items[i].items.length;

        for (let j = 0; j < l2; j++) {
          this.items.push(items[i].items[j]);
        }
      } else {
        this.items.push(items[i]);
      }
    }

    return this;
  }

  getIntersectingPoints(ls) {
    const lss = this.lineSegments;
    const length = lss.length;
    const ips = [];

    for (let i = 0; i < length; i++) {
      const ip1 = ls.intersects(lss[i]);

      if (ip1) {
        const ip1Snap = getNearestSnapPoint(ip1, lss[i]);
        let ip2;

        for (let j = 0; j < ips.length && !ip2; j++) {
          if (ips[j].point.equals(ip1)) {
            ip2 = ips[j];
          }
        }

        if (ip2) {
          if (lss[i].shape.centroid.distanceDifference(ip2.centroid) > 0) {
            ip2.centroid = lss[i].shape.centroid;
            ip2.edge = ip1Snap;
            ip2.point = ip1;
            ip2.line = lss[i];
          }
        } else {
          ips.push({
            centroid: lss[i].shape.centroid,
            edge: ip1Snap,
            point: ip1,
            line: lss[i],
          });
        }
      }
    }

    return ips
      .sort(sortVectors)
      .filter(filterZeroZeroVectors);
  }

  setStage(stage) {
    if (this.stage === undefined) {
      this.stage = stage;
      this.items.forEach((item) => {
        item.setStage(this.stage);
      });
    }

    return this;
  }

  reflect(a, v = new Vector(0, 0)) {
    return this.transform((item) => item.reflect(a, v));
  }

  rotate(a, v = new Vector(0, 0)) {
    return this.transform((item) => item.rotate(a, v));
  }

  translate(x, y) {
    return this.transform((item) => item.translate(x, y));
  }

  transform(transform) {
    this.items.forEach(transform);
    return this;
  }

  toJs() {
    return this.items
      .map(extractJs)
      .flat();
  }
}
