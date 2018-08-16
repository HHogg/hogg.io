import Area from './Area';
import Circle from './Circle';
import Vector from './Vector';
import getIntersectionCirclePoints from './getIntersectionCirclePoints';

const getVectors = (circles) => {
  const vectors = [];

  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      const iCircle = circles[i];
      const jCircle = circles[j];

      getIntersectionCirclePoints(iCircle, jCircle).forEach((point) => {
        const vector = new Vector(point, iCircle, jCircle, vectors.length);

        iCircle.addVector(vector);
        jCircle.addVector(vector);
        vectors.push(vector);
      });
    }
  }

  return vectors;
};

const mergeBitsets = (a, b) => a.bitset.or(b.bitset).toString();

const getAreas = (A, circles, history, areas = [], arcs = [], intersections = {}) => {
  const BC = arcs[arcs.length - 1];
  const C = BC ? BC.end : A;

  C.getConnections().forEach((CD) => {
    if (BC) {
      if (BC.circle === CD.circle) return;
      if (history[mergeBitsets(BC, CD)]) return;

      for (const [n, isInside] of Object.entries(intersections)) {
        if (CD.circle.n !== +n && isInside !== circles[n].isPointWithinCircle(CD.mx, CD.my)) {
          return;
        }
      }
    }

    const cCircle = C.getOtherCircle(CD.circle);
    const dCircle = CD.end.getOtherCircle(CD.circle);
    const nextArcs = [...arcs, CD];
    const nextIntersections = {
      ...intersections,
      [cCircle.n]: cCircle.isPointWithinCircle(CD.mx, CD.my),
      [dCircle.n]: dCircle.isPointWithinCircle(CD.mx, CD.my),
    };

    if (A === CD.end) {
      areas.push(new Area(nextArcs));
      nextArcs.forEach((arc, i) => {
        history[mergeBitsets(arc, nextArcs[i + 1] || nextArcs[0])] = true;
      });
    } else {
      getAreas(A, circles, history, areas, nextArcs, nextIntersections);
    }
  });

  return areas;
};

export default (shapes) => {
  const history = {};
  const circles = shapes.map((shape, n) => new Circle(shape, n));
  const vectors = getVectors(circles);
  const areas = [...circles];

  let n = vectors.length;
  circles.forEach(({ segments }) => {
    segments.forEach((segment) => {
      segment.n = n++;
    });
  });

  vectors.forEach((A) =>
    areas.push(...getAreas(A, circles, history))
  );

  return {
    areas: areas.map((area) => area.toObject())
      .filter(({ arcs }) => !arcs || !arcs.every(({ convex }) => !convex))
      .sort((a, b) => b.area - a.area),
    circles: circles.map((circle) => circle.toObject()),
    vectors: vectors.map((vector) => vector.toObject()),
  };
};
