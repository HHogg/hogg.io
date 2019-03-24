import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Two from 'two.js';
import {
  borderSizeX1Px,
  sizeX1Px,
  sizeX2Px,
  themes,
  Alert,
  Appear,
  Base,
  Flex,
  Text,
} from 'preshape';
import {
  createArc,
  createCircle,
  createGroup,
  createLine,
  createPolygon,
} from '../../../utils/Two';
import GenerateTilingWorker from './generateTiling/toShapes.worker';
import { POINT_CENTROID, POINT_EDGE, TRANSFORM_MIRROR, TRANSFORM_ROTATION } from './generateTiling/toEntities';

const ANIMATE_INTERVAL = 500;

const DEG_90 = Math.PI * 0.5;
const DEG_180 = Math.PI;
const DEG_360 = Math.PI * 2;

const TRANSFORM_MIRROR_CENTER_COLOR = '#00FFFF';
const TRANSFORM_MIRROR_POINT_COLOR = '#00FF00';
const TRANSFORM_ROTATION_POINT_COLOR = '#0000FF';
const TRANSFORM_ROTATION_CENTER_COLOR = '#FF0000';

export default class TilingRenderer extends Component {
  static propTypes = {
    animate: PropTypes.bool,
    colorScale: PropTypes.func.isRequired,
    configuration: PropTypes.shape({
      a: PropTypes.string,
      b: PropTypes.string.isRequired,
    }).isRequired,
    devmode: PropTypes.bool,
    disableColoring: PropTypes.bool,
    disableRepeating: PropTypes.bool,
    fadeConnectedShapes: PropTypes.bool,
    height: PropTypes.number.isRequired,
    maxRepeat: PropTypes.number,
    showAxis: PropTypes.bool,
    showConfiguration: PropTypes.bool,
    showTransforms: PropTypes.bool,
    size: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  };

  static defaultProps = {
    planeRotation: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      shapes: [],
      stages: 0,
      transforms: [],
    };
  }

  componentDidMount() {
    const { height, width } = this.props;

    this.two = new Two({
      autostart: true,
      height: height,
      type: 'SVGRenderer',
      width: width,
    }).appendTo(this.container);

    this.worker = new GenerateTilingWorker();
    this.worker.onmessage = ({ data }) => {
      this.setState(data, () => {
        this.two.clear();
        this.draw();
      });
    };

    this.init();
  }

  componentDidUpdate(prevProps) {
    const {
      animate,
      configuration,
      disableColoring,
      disableRepeating,
      fadeConnectedShapes,
      height,
      maxRepeat,
      showAxis,
      showTransforms,
      size,
      width,
    } = this.props;

    const hasAnimateChange = animate !== prevProps.animate;
    const hasConfigChanged = configuration.b !== prevProps.configuration.b;
    const hasDisableColoringChanged = disableColoring !== prevProps.disableColoring;
    const hasDisableRepeatingChanged = disableRepeating !== prevProps.disableRepeating;
    const hasDimensionsChanged = height !== prevProps.height || width !== prevProps.width;
    const hasFadeConnectedShapesChanged = fadeConnectedShapes !== prevProps.fadeConnectedShapes;
    const hasMaxRepeatChanged = maxRepeat !== prevProps.maxRepeat;
    const hasShowAxisChanged = showAxis !== prevProps.showAxis;
    const hasShowTransformsChanged = showTransforms !== prevProps.showTransforms;
    const hasSizeChanged = size !== prevProps.size;

    if (hasConfigChanged || hasDimensionsChanged || hasDisableRepeatingChanged || hasMaxRepeatChanged || hasSizeChanged) {
      this.init();
    } else if (hasAnimateChange || hasDisableColoringChanged || hasFadeConnectedShapesChanged) {
      this.draw();
    }

    if (hasShowAxisChanged) {
      if (showAxis) {
        this.drawAxis();
      } else {
        this.removeAxis();
      }
    }

    if (hasShowTransformsChanged) {
      if (showTransforms) {
        this.drawTransforms();
      } else {
        this.removeTransforms();
      }
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  init() {
    const { height, width } = this.props;

    this.two.renderer.setSize(width, height);
    this.two.width = this.two.renderer.width;
    this.two.height = this.two.renderer.height;

    this.getShapes();
  }

  getShapes() {
    const { configuration, disableRepeating, height, maxRepeat, size, width } = this.props;
    const { b } = configuration;

    this.worker.postMessage({
      config: b,
      disableRepeating: disableRepeating,
      height: height,
      maxRepeat: maxRepeat,
      size: size,
      width: width,
    });
  }

  draw() {
    const { animate, showAxis, showTransforms } = this.props;
    const { stages } = this.state;

    if (this.interval) {
      window.clearInterval(this.interval);
    }

    if (animate) {
      this.toStage = -1;
      this.interval = window.setInterval(() => {
        this.drawShapes((++this.toStage % (stages + 2)) - 1);

        if (showAxis) this.drawAxis();
        if (showTransforms) this.drawTransforms();
      }, ANIMATE_INTERVAL);
    } else {
      this.drawShapes();

      if (showAxis) this.drawAxis();
      if (showTransforms) this.drawTransforms();
    }
  }

  drawShapes(toStage = null) {
    const { colorScale, disableColoring, fadeConnectedShapes, height, width } = this.props;
    const { shapes, stages } = this.state;

    if (this.groupShapes) {
      this.groupShapes.remove();
    }

    this.two.add(this.groupShapes = createGroup({
      x: width / 2,
      y: height / 2,
    }));

    for (const shape of shapes) {
      if (toStage === null || shape.stage <= toStage) {
        this.groupShapes.add(createPolygon({
          fill: disableColoring
            ? 'transparent'
            : colorScale(1 - (shape.stage / stages)),
          opacity: (!fadeConnectedShapes || shape.disconnected) ? 1 : 0.1,
          stroke: themes.day.colorTextShade1,
          strokeWidth: borderSizeX1Px,
          vertices: shape.vectors,
        }));
      }
    }
  }

  drawAxis() {
    const { height, width } = this.props;

    this.removeAxis();
    this.two.add(this.groupAxis = createGroup());

    this.groupAxis.add(createLine({
      stroke: themes.day.colorAccentShade1,
      strokeWidth: borderSizeX1Px,
      vertices: [
        [(width / 2) + (borderSizeX1Px / 2), 0],
        [(width / 2) + (borderSizeX1Px / 2), height],
      ],
    }));

    this.groupAxis.add(createLine({
      stroke: themes.day.colorAccentShade1,
      strokeWidth: borderSizeX1Px,
      vertices: [
        [0, (height / 2) + (borderSizeX1Px / 2)],
        [width, (height / 2) + (borderSizeX1Px / 2)],
      ],
    }));
  }

  removeAxis() {
    if (this.groupAxis) {
      this.groupAxis.remove();
    }
  }

  drawTransforms() {
    const { height, width } = this.props;
    const { transforms } = this.state;

    this.removeTransforms();
    this.two.add(this.groupTransforms = createGroup({
      x: width / 2,
      y: height / 2,
    }));

    for (const transform of transforms) {
      switch (transform.action) {
        case TRANSFORM_MIRROR:
          transform.pointType
            ? this.drawTransformMirrorPoint(transform)
            : this.drawTransformMirrorCenter(transform);
          break;
        case TRANSFORM_ROTATION:
          transform.pointType
            ? this.drawTransformRotationPoint(transform)
            : this.drawTransformRotationCenter(transform);
      }
    }
  }

  drawTransformMirrorPoint({ actionAngle, point, pointType }) {
    if (!point) return;

    const { height, width } = this.props;
    const hypot = Math.hypot(height, width);
    let px, py, lx1, ly1, lx2, ly2;

    if (pointType === POINT_CENTROID && point.centroid) {
      const [ x, y ] = point.centroid;

      px = x;
      py = y;
      lx1 = (Math.cos(actionAngle - DEG_180) * hypot) + x;
      ly1 = (Math.sin(actionAngle - DEG_180) * hypot) + y;
      lx2 = (Math.cos(actionAngle) * hypot) + x;
      ly2 = (Math.sin(actionAngle) * hypot) + y;
    }

    if (pointType === POINT_EDGE && point.line) {
      const { centroid: [ x, y ], v1, v2, v1AngleToV2 } = point.line;

      px = x;
      py = y;
      lx1 = (Math.cos(v1AngleToV2 - DEG_180) * hypot) + v1[0];
      ly1 = (Math.sin(v1AngleToV2 - DEG_180) * hypot) + v1[1];
      lx2 = (Math.cos(v1AngleToV2) * hypot) + v2[0];
      ly2 = (Math.sin(v1AngleToV2) * hypot) + v2[1];
    }

    this.groupTransforms.add(createLine({
      stroke: TRANSFORM_MIRROR_POINT_COLOR,
      strokeWidth: borderSizeX1Px,
      vertices: [[lx1, ly1], [lx2, ly2]],
    }));

    this.groupTransforms.add(createCircle({
      fill: TRANSFORM_MIRROR_POINT_COLOR,
      radius: sizeX1Px,
      x: px,
      y: py,
    }));
  }

  drawTransformMirrorCenter({ actionAngle }) {
    const { height, width } = this.props;
    const hypot = Math.hypot(height, width);

    if (!actionAngle) {
      return;
    }

    while (actionAngle <= DEG_360) {
      this.groupTransforms.add(createLine({
        stroke: TRANSFORM_MIRROR_CENTER_COLOR,
        strokeWidth: borderSizeX1Px,
        vertices: [[0, 0], [
          Math.cos(actionAngle - DEG_90) * hypot,
          Math.sin(actionAngle - DEG_90) * hypot,
        ]],
      }));

      actionAngle *= 2;
    }
  }

  drawTransformRotationPoint({ point, pointType }) {
    if (!point) return;

    const [ x, y, pointAngle ] = pointType === POINT_EDGE ? point.edge : point.centroid;

    this.groupTransforms.add(createCircle({
      fill: TRANSFORM_ROTATION_POINT_COLOR,
      radius: sizeX1Px,
      x: x,
      y: y,
    }));

    this.groupTransforms.add(createLine({
      stroke: TRANSFORM_ROTATION_POINT_COLOR,
      strokeWidth: borderSizeX1Px,
      vertices: [[0, 0], [x * 2, y * 2]],
    }));

    this.drawArrowArc(TRANSFORM_ROTATION_POINT_COLOR,
      pointAngle + DEG_180, pointAngle + DEG_360,
      x, y, Math.hypot(x, y));
  }

  drawTransformRotationCenter({ actionAngle }) {
    const { height, width } = this.props;
    const hypot = Math.hypot(height, width);
    const radius = Math.min(height, width) / 2;
    let angle = actionAngle;

    if (!actionAngle) {
      return;
    }

    while (angle <= DEG_360) {
      this.groupTransforms.add(createLine({
        stroke: TRANSFORM_ROTATION_CENTER_COLOR,
        strokeWidth: borderSizeX1Px,
        vertices: [[0, 0], [
          Math.cos(angle - DEG_90) * hypot,
          Math.sin(angle - DEG_90) * hypot,
        ]],
      }));

      this.drawArrowArc(TRANSFORM_ROTATION_CENTER_COLOR,
        angle, Math.min(angle * 2, actionAngle + DEG_360),
        0, 0, radius);

      angle *= 2;
    }
  }

  drawArrowArc(stroke, a1, a2, cx, cy, radius) {
    const anglePadding = Math.PI / (radius / 6);
    const angleStart = a1 + anglePadding - DEG_90;
    const angleEnd = a2 - anglePadding - DEG_90;
    const arrowSize = sizeX2Px;
    const arcRadius = radius - (arrowSize * 2);

    this.groupTransforms.add(createArc({
      stroke: stroke,
      strokeWidth: borderSizeX1Px,
      a1: angleStart,
      a2: angleEnd,
      cx: cx,
      cy: cy,
      radius: arcRadius,
    }));

    this.groupTransforms.add(createLine({
      stroke: stroke,
      strokeWidth: borderSizeX1Px,
      vertices: [[
        cx + Math.cos(angleEnd - (anglePadding / 2)) * (arcRadius - arrowSize),
        cy + Math.sin(angleEnd - (anglePadding / 2)) * (arcRadius - arrowSize),
      ], [
        cx + Math.cos(angleEnd) * arcRadius,
        cy + Math.sin(angleEnd) * arcRadius,
      ], [
        cx + Math.cos(angleEnd - (anglePadding / 2)) * (arcRadius + arrowSize),
        cy + Math.sin(angleEnd - (anglePadding / 2)) * (arcRadius + arrowSize),
      ]],
    }));
  }

  removeTransforms() {
    if (this.groupTransforms) {
      this.groupTransforms.remove();
    }
  }

  render() {
    const { configuration, devmode, showConfiguration } = this.props;
    const { error } = this.state;
    const { a, b } = configuration;

    return (
      <Appear Component={ Flex }
          alignChildren="end"
          animation="Fade"
          className="Tiling"
          color
          direction="horizontal"
          grow
          padding="x2"
          time="base">
        <Base
            absolute="fullscreen"
            ref={ (container) => this.container = findDOMNode(container) } />

        { showConfiguration && (
          <Flex container grow initial="none">
            { a && <Text align="end" ellipsis size="x1" strong>{ a }</Text> }
            { b && <Text align="end" ellipsis size="x1" strong>{ b }</Text> }
          </Flex>
        ) }

        { devmode && (
          <Flex
              absolute="fullscreen"
              alignChildrenVertical="end"
              direction="vertical"
              padding="x2">
            <Appear animation="FadeSlideUp" visible={ !!error }>
              <Alert color="negative" padding="x2" style="solid">
                { error && (
                  <Text size="x1">
                    <Text inline strong>
                      <Text backgroundColor color="negative" inline paddingHorizontal="x1">ERROR</Text> { error.type }:
                    </Text> { error.message }
                  </Text>
                ) }
              </Alert>
            </Appear>
          </Flex>
        ) }
      </Appear>
    );
  }
}
