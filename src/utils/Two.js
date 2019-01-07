import Two from 'two.js';

const PI = Math.PI;
const HALF_PI = PI / 2;

const createShape = (shape, props) => {
  const {
    fill = 'transparent',
    fillOpacity = 1,
    opacity = 1,
    rotate = 0,
    stroke = 'transparent',
    strokeWidth = 0,
    translate,
  } = props;

  const {
    top,
    left,
    width,
    height,
  } = shape.getBoundingClientRect();

  const cx = left + (width / 2);
  const cy = top + (height / 2);

  if (translate) {
    shape.center();
    shape.translation.set(cx, cy);
  }

  shape.fill = fill;
  shape.fillOpacity = fillOpacity;
  shape.stroke = stroke;
  shape.linewidth = strokeWidth;
  shape.opacity = opacity;
  shape.rotation = rotate;

  return shape;
};

export const addClassName = (shape, className) => {
  shape.domElement = shape.domElement || document.getElementById(shape.id);
  className.split(' ').forEach((className) => {
    shape.domElement.classList.add(className);
  });
  return shape;
};

export const setAttribute = (shape, attribute, value) => {
  shape.domElement = shape.domElement || document.getElementById(shape.id);
  shape.domElement.setAttribute(attribute, value);
  return shape;
};

export const setClassName = (shape, className) =>
  setAttribute(shape, 'class', className);

export const createArc = (props) => {
  return createShape(
    new Two.Path(arcsToAnchors([props]), false, false, true),
  props);
};

export const createCircle = (props) => {
  return createShape(
    new Two.Circle(props.x, props.y, props.radius),
  props);
};

export const createEllipse = (props) => {
  return createShape(
    new Two.Ellipsie(props.x, props.y, props.width, props.height),
  props);
};

export const createGroup = (props = {}) => {
  const group = new Two.Group();

  if (props.x !== undefined && props.y !== undefined) {
    group.translation.set(props.x, props.y);
  }

  return group;
};

export const createLine = (props) => {
  return createShape(
    new Two.Path(
      props.vertices.map(([x, y]) =>
        new Two.Vector(x, y)
      ),
    false, props.curved),
  props);
};

export const createPolygon = (props) => {
  return createShape(
    new Two.Path(
      props.vertices.map(([x, y]) =>
        new Two.Vector(x, y)
      ),
    true, props.curved),
  props);
};

export const createPolygonArc = (props) => {
  return createShape(
    new Two.Path(arcsToAnchors(props.arcs, true), true, false, true),
  props);
};

export const createText = (text, props) => {
  return createShape(
    new Two.Text(text, props.x, props.y, props),
  props);
};

export const createTriangle = (props) => {
  return createShape(
    new Two.Path([
      new Two.Vector(props.x, props.y - (props.height / 2)),
      new Two.Vector(props.x + (props.width / 2), props.y + (props.height / 2)),
      new Two.Vector(props.x - (props.width / 2), props.y + (props.height / 2)),
    ], true),
  props);
};

const arcsToAnchors = (arcs, closed) => {
  const R = Two.Resolution * 3;
  const anchors = Array
    .from({ length: (R * arcs.length) })
    .map(() => new Two.Anchor());

  for (let i = 0; i < arcs.length; i++) {
    const { a1, a2, cx, cy, radius } = arcs[i];

    for (let j = 0; j < R; j++) {
      const anchorIndex = i * R + j;
      const anchor = anchors[anchorIndex];
      const theta = (j / (R - 1)) * (a2 - a1) + a1;

      if (i === 0 && j === 0) {
        anchor.command = Two.Commands.move;
      } else {
        anchor.command = Two.Commands.curve;
      }

      anchor.x = cx + (radius * Math.cos(theta));
      anchor.y = cy + (radius * Math.sin(theta));

      if (anchor.controls) {
        anchor.controls.left.clear();
        anchor.controls.right.clear();
      }

      if (anchor.command === Two.Commands.curve) {
        const amp = (radius * ((a2 - a1) / R) / PI);

        if (j !== 0) {
          anchor.controls.left.x = amp * Math.cos(theta - HALF_PI);
          anchor.controls.left.y = amp * Math.sin(theta - HALF_PI);
        }

        if (j !== R - 1) {
          anchor.controls.right.x = amp * Math.cos(theta + HALF_PI);
          anchor.controls.right.y = amp * Math.sin(theta + HALF_PI);
        }
      }
    }
  }

  if (closed) {
    anchors[anchors.length - 1].x = anchors[0].x;
    anchors[anchors.length - 1].y = anchors[0].y;
  }

  return anchors;
};

export const onMouseDownGlobal = () => {
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserDrag = 'none';
};

export const onMouseUpGlobal = () => {
  document.body.style.userSelect = null;
  document.body.style.webkitUserDrag = null;
};
