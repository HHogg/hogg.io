import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Two from 'two.js';
import {
  borderSizeX1Px,
  borderSizeX2Px,
  themes,
  Appear,
} from 'preshape';
import {
  addClassName,
  createCircle,
  createLine,
  createText,
  createTriangle,
} from '../../../utils/Two';

const ANGLE_INC = 0.05;
const TOP = 'Top';
const RIGHT = 'Right';
const BOTTOM = 'Bottom';
const LEFT = 'Left';
const COSINE = 'Cos';
const SINE = 'Sin';

export default class CoSineVisual extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    theme: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.shapes = {};
    this.angle = 0;
  }

  componentDidMount() {
    const { height, width } = this.props;

    this.update = this.update.bind(this);
    this.two = new Two({
      autostart: true,
      height: height,
      type: 'SVGRenderer',
      width: width,
    }).appendTo(this.container);

    this.init();

    this.two.on('update', this.update);
  }

  componentDidUpdate() {
    this.init();
  }

  componentWillUnmount() {
    this.two.off('update', this.update);
  }

  init() {
    const { height, width } = this.props;

    this.cx = width / 2;
    this.cy = height / 2;
    this.r = width / 12;
    this.p = this.r / 2;
    this.two.renderer.setSize(width, height);
    this.two.width = this.two.renderer.width;
    this.two.height = this.two.renderer.height;

    this.two.clear();
    this.drawCenter();
    this.drawAngleLine();
    this.drawCurveAxis(TOP);
    this.drawCurveAxis(RIGHT);
    this.drawCurveAxis(BOTTOM);
    this.drawCurveAxis(LEFT);
    this.drawCurveTrack(COSINE);
    this.drawCurveTrack(SINE);
    this.drawCurve(TOP, COSINE);
    this.drawCurve(RIGHT, SINE);
    this.drawCurve(BOTTOM, COSINE);
    this.drawCurve(LEFT, SINE);
  }

  drawCenter() {
    const { theme } = this.props;

    this.two.add(
      createCircle({
        radius: this.r,
        stroke: themes[theme].colorTextShade1,
        strokeWidth: borderSizeX2Px,
        x: this.cx,
        y: this.cy,
      })
    );
  }

  drawAngleLine() {
    const { theme } = this.props;
    const [x, y] = this.getEndXY();

    this.two.add(this.shapes.line =
      createLine({
        stroke: themes[theme].colorTextShade1,
        strokeWidth: borderSizeX1Px,
        vertices: [[this.cx, this.cy], [x, y]],
      })
    );

    this.two.add(
      createCircle({
        fill: themes[theme].colorTextShade1,
        radius: Math.max(2, this.r / 20),
        x: this.cx,
        y: this.cy,
      }));

    this.two.add(this.shapes.lineEndPoint =
      createCircle({
        fill: themes[theme].colorTextShade1,
        radius: Math.max(2, this.r / 20),
        x: x,
        y: y,
      }));
  }

  drawCurveAxis(direction) {
    const { cx, cy, r, p } = this;
    const { height, theme, width } = this.props;
    let x1, y1
      , x2, y2
      , x3, y3
      , x4, y4
      , tx, ty, tr
      , l, lx, ly, lr;

    switch (direction) {
      case TOP:
        x1 = cx - r;
        x2 = tx = x1 + (r * 2);
        x3 = x4 = cx;
        y1 = y2 = y3 = ty = cy - r - p;
        y4 = 0;
        tr = Math.PI / 2;
        break;
      case RIGHT:
        x1 = x2 = x3 = tx = lx = cx + r + p;
        x4 = width;
        y1 = ty = cy - r;
        y2 = y1 + (r * 2);
        y3 = y4 = cy;
        tr = 0;
        ly = ty - p;
        l = 'y = sin(Ø)';
        lr = Math.PI * 1.5;
        break;
      case BOTTOM:
        x1 = cx - r;
        x2 = tx = x1 + (r * 2);
        x3 = x4 = cx;
        y1 = y2 = y3 = ty = ly = cy + r + p;
        y4 = height;
        tr = Math.PI / 2;
        lx = tx + p;
        l = 'x = cos(Ø)';
        lr = 0;
        break;
      case LEFT:
        x1 = x2 = x3 = tx = cx - r - p;
        x4 = 0;
        y1 = ty = cy - r;
        y2 = y1 + (r * 2);
        y3 = y4 = cy;
        tr = 0;
        break;
    }

    this.two.add(
      createLine({
        stroke: themes[theme].colorTextShade3,
        strokeWidth: borderSizeX1Px,
        vertices: [[x1, y1], [x2, y2]],
      })
    );

    this.two.add(
      createTriangle({
        fill: themes[theme].colorTextShade3,
        height: borderSizeX1Px * 7,
        rotate: tr,
        translate: true,
        width: borderSizeX1Px * 7,
        x: tx,
        y: ty,
      })
    );

    if (l) {
      this.two.add(
        createText(l, {
          alignment: 'left',
          fill: themes[theme].colorTextShade3,
          family: 'script',
          rotate: lr,
          style: 'italic',
          x: lx,
          y: ly,
        })
      );
    }

    this.two.add(
      createLine({
        stroke: themes[theme].colorTextShade3,
        strokeWidth: borderSizeX1Px,
        vertices: [[x3, y3], [x4, y4]],
      })
    );
  }

  drawCurveTrack(equation) {
    const { theme } = this.props;
    const { cx, cy, r, p } = this;
    const { x, y } = this.getEndXY();
    let x1, y1, x2, y2;

    switch (equation) {
      case COSINE:
        x1 = x2 = x;
        y1 = cy - r - p;
        y2 = cy + r + p;
        break;
      case SINE:
        x1 = cx - r - p;
        x2 = cx + r + p;
        y1 = y2 = y;
        break;
    }

    this.two.add(this.shapes[`curveTrack${equation}`] =
      createLine({
        stroke: themes[theme].colorTextShade3,
        strokeWidth: borderSizeX1Px,
        vertices: [[x1, y1], [x2, y2]],
      })
    );

    this.two.update();

    addClassName(this.shapes[`curveTrack${equation}`], 'CoSine__track');
  }

  drawCurve(direction, equation) {
    const { height, theme, width } = this.props;
    const { cx, cy, r, p } = this;
    const minAngle = this.angle;
    const maxAngle = this.angle + (Math.PI * 2);
    const vertices = [];
    let next, x1, y1, x2, y2;
    let angle = minAngle - ANGLE_INC;

    switch (direction) {
      case TOP:
        y1 = 0;
        y2 = cy - r - p;
        break;
      case RIGHT:
        x1 = cx + r + p;
        x2 = width;
        break;
      case BOTTOM:
        y1 = cy + r + p;
        y2 = height;
        break;
      case LEFT:
        x1 = 0;
        x2 = cx - r - p;
        break;
    }

    switch (equation) {
      case COSINE:
        next = () => [
          cx + Math.cos(angle) * r,
          y1 + (((angle - minAngle) / (maxAngle - minAngle)) * (y2 - y1)),
        ];
        break;
      case SINE:
        next = () => [
          x1 + (((angle - minAngle) / (maxAngle - minAngle)) * (x2 - x1)),
          cy + Math.sin(angle) * r,
        ];
    }

    while (angle <= maxAngle) {
      vertices.push(next(angle += ANGLE_INC));
    }

    if (this.shapes[`curve${direction}`]) {
      this.shapes[`curve${direction}`].remove();
    }

    this.two.add(this.shapes[`curve${direction}`] =
      createLine({
        stroke: themes[theme].colorTextShade1,
        strokeWidth: borderSizeX2Px,
        vertices: vertices,
      })
    );
  }

  getEndXY() {
    return [
      this.cx + (Math.cos(this.angle) * this.r),
      this.cy + (Math.sin(this.angle) * this.r),
    ];
  }

  update() {
    const [x, y] = this.getEndXY();

    this.shapes.line.vertices[1].set(x, y);
    this.shapes.lineEndPoint.translation.set(x, y);
    this.shapes[`curveTrack${COSINE}`].translation.x = x;
    this.shapes[`curveTrack${SINE}`].translation.y = y;
    this.drawCurve(TOP, COSINE);
    this.drawCurve(RIGHT, SINE);
    this.drawCurve(BOTTOM, COSINE);
    this.drawCurve(LEFT, SINE);

    this.angle += ANGLE_INC;
  }

  render() {
    return (
      <Appear
          absolute="fullscreen"
          animation="Fade"
          ref={ (container) => this.container = findDOMNode(container) }
          time="base" />
    );
  }
}
