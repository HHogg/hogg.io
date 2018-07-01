import Two from 'two.js';

export default class Draw {
  constructor(element, width, height, update = () => {}) {
    this.two = new Two({
      autostart: true,
      type: 'SVGRenderer',
      height,
      width,
    }).appendTo(element);

    this.layers = {};
    this.setSize(width, height);
    this.two.bind('update', update);
  }

  setSize(width, height) {
    this.two.renderer.setSize(width, height);
    this.two.width = this.two.renderer.width;
    this.two.height = this.two.renderer.height;
  }

  clear() {
    this.two.clear();
    this.layers = {};
  }

  clearLayer(layer) {
    this.layer(layer).remove();
    this.layers[layer] = null;
  }

  layer(name) {
    return this.layers[name] || (this.layers[name] = this.two.makeGroup());
  }

  create(shape, props) {
    const {
      className,
      fill,
      layer,
      stroke,
      strokeWidth,
    } = props;

    shape.fill = fill || 'transparent';
    shape.stroke = stroke || 'transparent';
    shape.linewidth = strokeWidth || 0;

    this.add(layer, shape);

    shape.domElement = document.getElementById(shape.id);

    this.addClassName(shape, className);
    this.addInteractivity(shape, props);

    return shape;
  }

  circle(props) {
    return this.create(
      new Two.Circle(props.x, props.y, props.radius),
    props);
  }

  ellipse(props) {
    return this.create(
      new Two.Ellipse(props.x, props.y, props.width, props.height),
    props);
  }

  line(props) {
    return this.create(
      new Two.Path(props.points.map(([x, y]) =>
        new Two.Vector(x, y)
      ), false, (props.curved || false), false),
    props);
  }

  add(layer, shape) {
    if (layer) {
      this.layer(layer).add(shape);
    } else {
      this.two.add(shape);
    }

    this.two.update();
  }

  addClassName(shape, className) {
    if (this.two.type === 'SVGRenderer' && className) {
      className.split(' ').forEach((className) => {
        shape.domElement.classList.add(className);
      });
    }
  }

  addInteractivity(shape, { onClick, onMouseEnter, onMouseLeave }) {
    if (this.two.type === 'SVGRenderer') {
      if (onClick) {
        shape.domElement.addEventListener('click', onClick);
        shape.domElement.addEventListener('touchstart', onClick);
      }

      if (onMouseEnter) {
        shape.domElement.addEventListener('mouseenter', onMouseEnter);
        shape.domElement.addEventListener('touchstart', onMouseEnter);
      }

      if (onMouseLeave) {
        shape.domElement.addEventListener('mouseleave', onMouseLeave);
      }
    }
  }
}
