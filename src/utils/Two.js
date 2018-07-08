import Two from 'two.js';

const createShape = (shape, props) => {
  const {
    fill = 'transparent',
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
  shape.stroke = stroke;
  shape.linewidth = strokeWidth;
  shape.opacity = opacity;
  shape.rotation = rotate;

  return shape;
};

export const addClassName = (shape, className) => {
  shape.domElement = document.getElementById(shape.id);
  className.split(' ').forEach((className) => {
    shape.domElement.classList.add(className);
  });
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

export const createGroup = (props) => {
  const group = new Two.Group();
  group.translation.set(props.x, props.y);
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
