import mean from 'lodash.mean';

export default class Area {
  constructor(arcs) {
    this.arcs = arcs;

    this.cx = mean(arcs.map(({ mx }) => mx));
    this.cy = mean(arcs.map(({ my }) => my));
  }

  get area() {
    let areaPolygon = 0;
    let areaSegment = 0;

    for (let i = 0; i < this.arcs.length; i++) {
      const a = this.arcs[i];
      const b = this.arcs[i + 1] || this.arcs[0];

      areaSegment += a.area * ((a.isConvex(this.arcs) ? 1 : -1));
      areaPolygon += (a.start.x * b.start.y) - (a.start.y * b.start.x);
    }

    return Math.abs(areaPolygon / 2) + areaSegment;
  }

  toObject() {
    return {
      arcs: this.arcs.map((arc) => arc.toObject(this.arcs)),
      area: this.area,
      cx: this.cx,
      cy: this.cy,
    };
  }
}
