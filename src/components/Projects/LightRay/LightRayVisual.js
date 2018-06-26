import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Two from 'two.js';
import getVisibleArea from 'vishull2d';
import { themes, Appear } from 'preshape';

const toLines = ({ vertices }) =>
  vertices.map((vertex, index) => [
    [vertex.x, vertex.y],
    vertices[index + 1]
      ? [vertices[index + 1].x, vertices[index + 1].y]
      : [vertices[0].x, vertices[0].y],
  ]);

const moveEvent = (event) => event.touches ? ({
  clientX: event.touches[0].clientX,
  clientY: event.touches[0].clientY,
  target: event.target,
}) : ({
  clientX: event.clientX,
  clientY: event.clientY,
  target: event.target,
});

export default class LightRayVisual extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    moveLightSource: PropTypes.bool.isRequired,
    shapeCount: PropTypes.number.isRequired,
    shapeSize: PropTypes.number.isRequired,
    theme: PropTypes.string,
    width: PropTypes.number.isRequired,
  };

  componentDidMount() {
    const { height, width } = this.props;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);

    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('touchend', this.handleMouseUp);
    document.body.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    document.addEventListener('touchstart', this.handleMouseDown);

    this.lightX = width / 2;
    this.lightY = height / 2;

    this.two = new Two({
      autostart: true,
      type: 'CanvasRenderer',
      height,
      width,
    }).appendTo(this.container);

    this.setCanvasSize(width, height);
    this.drawShapes();

    this.two.bind('update', () => {
      this.drawLight();
    });
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('touchend', this.handleMouseUp);
    document.body.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchstart', this.handleMouseDown);
  }

  componentDidUpdate(prevProps) {
    const { height, shapeCount, shapeSize, theme, width } = this.props;

    if (height !== prevProps.height || width !== prevProps.width) {
      this.setCanvasSize(width, height);
      this.drawShapes();
      this.drawLight(true);
    } else if (shapeCount !== prevProps.shapeCount || shapeSize !== prevProps.shapeSize || theme !== prevProps.theme) {
      this.drawShapes();
      this.drawLight(true);
    }
  }

  handleMouseDown() {
    this.isMouseDown = true;
  }

  handleMouseUp() {
    this.isMouseDown = false;
  }

  handleMouseMove({ clientX, clientY, target }) {
    if (this.isMouseDown && this.props.moveLightSource) {
      const { left, top } = target.getBoundingClientRect();

      this.lightX = clientX - left;
      this.lightY = clientY - top;
    }
  }

  handleTouchMove(event) {
    if (event.target === this.two.renderer.domElement) {
      event.preventDefault();
    }
  }

  setCanvasSize(width, height) {
    this.two.renderer.setSize(width, height);
    this.two.width = this.two.renderer.width;
    this.two.height = this.two.renderer.height;
  }

  drawLight(force) {
    const { theme } = this.props;

    if (!force && this.lightX === this.lightXPrev && this.lightY === this.lightYPrev) {
      return;
    }

    if (this.lightGroup) {
      this.lightGroup.remove();
    }

    this.lightGroup = this.two.makeGroup();

    const light = new Two.Path(
      getVisibleArea(this.lines, [this.lightX, this.lightY])
        .map(([x, y]) => new Two.Vector(x, y), true)
    );

    light.fill = themes.night.colorTextShade3;
    light.noStroke();

    const circle = new Two.Circle(this.lightX, this.lightY, 10);

    circle.noFill();
    circle.stroke = themes[theme].colorAccentShade2;
    circle.linewidth = 4;

    this.lightGroup.add(light);
    this.lightGroup.add(circle);

    this.lightXPrev = this.lightX;
    this.lightYPrev = this.lightY;
  }

  drawShapes() {
    const { shapeCount, shapeSize, width, height } = this.props;

    if (!shapeCount) {
      return;
    }

    const shapeRadius = shapeSize / 2;
    const cx = width / 2;
    const cy = height / 2;
    const nRows = Math.ceil(Math.sqrt(shapeCount));
    const nCols = Math.ceil(shapeCount / nRows);
    const cPadding = (width - (shapeSize * nCols)) / (nCols * 2);
    const rPadding = (height - (shapeSize * nRows)) / (nRows * 2);
    const oX = ((nCols - 1) * (shapeSize + cPadding)) * -0.5;
    const oY = ((nRows - 1) * (shapeSize + rPadding)) * -0.5;

    if (this.shapeGroup) {
      this.shapeGroup.remove();
    }

    this.shapeGroup = this.two.makeGroup();
    this.lines = [
      [[0, 0], [width, 0]],
      [[width, 0], [width, height]],
      [[width, height], [0, height]],
      [[0, height], [0, 0]],
    ];

    for (let i = 0; i < shapeCount; i++) {
      const r = Math.floor(i / nCols);
      const c = i % nCols;
      const x = (cx + (c * (shapeSize + cPadding))) + oX;
      const y = (cy + (r * (shapeSize + rPadding))) + oY;
      const triangle = new Two.Path([
        new Two.Vector(x, y - shapeRadius),
        new Two.Vector(x + shapeRadius, y + shapeRadius),
        new Two.Vector(x - shapeRadius, y + shapeRadius),
      ], true);

      triangle.fill = themes.night.colorBackgroundShade1;
      triangle.noStroke();
      this.shapeGroup.add(triangle);
      this.lines.push(...toLines(triangle));
    }
  }

  render() {
    return (
      <Appear
          absolute="fullscreen"
          animation="Fade"
          backgroundColor="shade-3"
          onMouseDown={ (e) => this.handleMouseMove(moveEvent(e)) }
          onMouseMove={ (e) => this.handleMouseMove(moveEvent(e)) }
          onTouchMove={ (e) => this.handleMouseMove(moveEvent(e)) }
          onTouchStart={ (e) => this.handleMouseMove(moveEvent(e)) }
          ref={ (container) => this.container = findDOMNode(container) }
          theme="night"
          time="base" />
    );
  }
}
