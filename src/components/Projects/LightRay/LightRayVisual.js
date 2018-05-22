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

  handleMouseDown(e) {
    this.isMouseDown = true;
    this.handleMouseMove(e);
  }

  handleMouseUp() {
    this.isMouseDown = false;
  }

  handleMouseMove(e) {
    if (this.isMouseDown && this.props.moveLightSource) {
      this.lightX = e.clientX - this.containerX;
      this.lightY = e.clientY - this.containerY;
    }
  }

  setCanvasSize(width, height) {
    const { top, left } = this.container.getBoundingClientRect();

    this.two.renderer.setSize(width, height);
    this.two.width = this.two.renderer.width;
    this.two.height = this.two.renderer.height;
    this.containerY = top;
    this.containerX = left;
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
          onMouseDown={ (e) => this.handleMouseDown(e) }
          onMouseMove={ (e) => this.handleMouseMove(e) }
          onMouseUp={ (e) => this.handleMouseUp(e) }
          ref={ (container) => this.container = findDOMNode(container) }
          theme="night"
          time="slow" />
    );
  }
}
