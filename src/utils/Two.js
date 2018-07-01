import Two from 'two.js';

const createShape = (shape, props) => {
  const {
    fill,
    stroke,
    strokeWidth,
  } = props;

  shape.fill = fill || 'transparent';
  shape.stroke = stroke || 'transparent';
  shape.linewidth = strokeWidth || 0;

  return shape;
};

export const addClassName = (shape, className) => {
  shape.domElement = document.getElementById(shape.id);
  className.split(' ').forEach((className) => {
    shape.domElement.classList.add(className);
  });
};

export const createGroup = (props) => {
  const group = new Two.Group();
  group.translation.set(props.x, props.y);
  return group;
};

export const createCircle = (props) => {
  return createShape(
    new Two.Circle(props.x, props.y, props.radius)
  , props);
};

export const createEllipse = (props) => {
  return createShape(
    new Two.Ellipsie(props.x, props.y, props.width, props.height)
  , props);
};
