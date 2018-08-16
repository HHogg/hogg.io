import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';
import Two from 'two.js';
import {
  Base,
  Button,
  Buttons,
  CheckBox,
  Flex,
  Icon,
  Toolbar,
  ToolbarAction,
  ToolbarActionGroup,
} from 'preshape';
import atan2 from './utilsMath/atan2';
import debugAreas from './utilsDebug/debugAreas';
import debugCircles from './utilsDebug/debugCircles';
import debugVectors from './utilsDebug/debugVectors';
import getIntersectionAreas from './getIntersectionAreas/getIntersectionAreas';
import isPointOverCircleEdge from './utilsMath/isPointOverCircleEdge';
import isPointWithinCircle from './utilsMath/isPointWithinCircle';
import isPointWithinIntersection from './utilsMath/isPointWithinIntersection';
import sortCirclesByAreaDescending from './utilsMath/sortCirclesByAreaDescending';
import { toAbsoluteFromRelativeIntersection, toAbsoluteFromRelativeShape } from './utilsMath/toAbsoluteFromRelative';
import { toRelativeFromAbsoluteIntersection, toRelativeFromAbsoluteShape } from './utilsMath/toRelativeFromAbsolute';
import moveEvent from '../../../utils/moveEvent';
import {
  createCircle,
  createPolygonArc,
  onMouseDownGlobal,
  onMouseUpGlobal,
  setAttribute,
  setClassName,
} from '../../../utils/Two';

const COPY_OFFSET = 25;
const TOLERANCE_CREATE_SHAPE = 3;
const TOLERANCE_SELECT_SHAPE = 3;

const MODE_DRAW = 'draw';
const MODE_FILL = 'fill';
const MODE_VIEW = 'view';

const CURSOR_DEFAULT = 'default';
const CURSOR_DRAW = 'crosshair';
const CURSOR_FILL = 'pointer';
const CURSOR_MOVE = 'move';
const CURSOR_RESIZE_T_B = 'ns-resize';
const CURSOR_RESIZE_BL_TR = 'nesw-resize';
const CURSOR_RESIZE_L_R = 'ew-resize';
const CURSOR_RESIZE_BR_TL = 'nwse-resize';

const getCursor = (px, py, cx, cy) => {
  const a = atan2(px, py, cx, cy) * 180 / Math.PI;

  if (a > 247.5 && a < 292.5) return CURSOR_RESIZE_T_B;
  if (a > 292.5 && a < 337.5) return CURSOR_RESIZE_BL_TR;
  if (a > 337.5 || a < 22.5) return CURSOR_RESIZE_L_R;
  if (a > 22.5 && a < 67.5) return CURSOR_RESIZE_BR_TL;
  if (a > 67.5 && a < 112.5) return CURSOR_RESIZE_T_B;
  if (a > 112.5 && a < 157.5) return CURSOR_RESIZE_BL_TR;
  if (a > 157.5 && a < 202.5) return CURSOR_RESIZE_L_R;
  if (a > 202.5 && a < 247.5) return CURSOR_RESIZE_BR_TL;

  return CURSOR_DRAW;
};

const getMode = (data) => data.intersections.length ? MODE_VIEW : MODE_DRAW;

const getIntersectionClassName = ({ filled, underlay }) =>
  classnames('CircleArt__intersection', {
    'CircleArt__intersection--filled': filled,
    'CircleArt__intersection--unfilled': !filled,
    'CircleArt__intersection--underlay': underlay,
  });

const getShapeClassName = () => 'CircleArt__shape';

export default class CircleArtVisual extends Component {
  static propTypes = {
    canSave: PropTypes.bool.isRequired,
    data: PropTypes.shape({
      intersections: PropTypes.array.isRequired,
      ratio: PropTypes.number,
      shapes: PropTypes.array.isRequired,
    }).isRequired,
    height: PropTypes.number.isRequired,
    onClear: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      debug: false,
      mode: getMode(props.data),
      toolbarHeight: null,
      toolbarWidth: null,
      toolbarX: null,
      toolbarY: null,
    };
  }

  componentDidMount() {
    const { mode } = this.state;
    const { data, height, width } = this.props;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);

    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('touchend', this.handleMouseUp);
    document.body.addEventListener('touchmove', this.handleTouchMove, { passive: false });

    this.two = new Two({
      autostart: true,
      height: height,
      type: 'SVGRenderer',
      width: width,
    }).appendTo(this.container);

    this.initCanvas(data);
    this.initData(data);
    this.initMode(mode);
  }

  componentDidUpdate(prevProps) {
    const { data, height, width } = this.props;
    const hasDataChanged = data !== prevProps.data;
    const hasDimensionsChanged = width !== prevProps.width || height !== prevProps.height;
    const mode = getMode(data);

    if (hasDimensionsChanged) {
      this.initCanvas(data);
    }

    if (hasDataChanged) {
      this.setState({ mode });
      this.initData(data);
      this.initMode(mode);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('touchend', this.handleMouseUp);
    document.body.removeEventListener('touchmove', this.handleTouchMove);
  }

  initCanvas(data) {
    const { height, width } = this.props;
    const { ratio = width / height } = data;

    this.cx = width / 2;
    this.cy = height / 2;

    this.scaledHeight = width > height ? height : (width / ratio);
    this.scaledWidth = width > height ? (height * ratio) : width;

    this.two.renderer.setSize(width, height);
    this.two.width = this.two.renderer.width;
    this.two.height = this.two.renderer.height;
    this.two.clear();
  }

  initData({ intersections, shapes }) {
    this.intersections = intersections.map((intersection) => toAbsoluteFromRelativeIntersection(this.cx, this.cy, this.scaledWidth, this.scaledHeight, intersection));
    this.shapes = shapes.map((shape) => toAbsoluteFromRelativeShape(this.cx, this.cy, this.scaledWidth, this.scaledHeight, shape));
  }

  initMode(mode) {
    switch (mode) {
      case MODE_DRAW: return this.initModeDraw();
      case MODE_FILL: return this.initModeFill();
      case MODE_VIEW: return this.initModeView();
    }
  }

  initModeDraw() {
    this.intersections = [];
    this.removeLayers();
    this.drawShapes();
  }

  initModeFill() {
    const { debug } = this.state;

    this.removeLayers();
    this.drawIntersections({ debug });
  }

  initModeView() {
    this.removeLayers();
    this.drawIntersections({ animate: true });
  }

  drawShapes() {
    this.layerShapes = this.two.makeGroup();

    this.shapes.forEach((shape) => {
      this.layerShapes.add(
        shape.path = createCircle({
          radius: shape.radius,
          x: shape.x,
          y: shape.y,
        })
      );
    });

    this.two.update();

    this.shapes.forEach(({ path }) => {
      setClassName(path, getShapeClassName());
    });
  }

  drawIntersections({ animate, debug } = {}) {
    const { areas, circles, vectors } = getIntersectionAreas(this.shapes);

    if (!this.intersections.length) {
      this.intersections = areas;
    }

    this.layerIntersections = this.two.makeGroup();

    this.intersections.forEach((intersection) => {
      this.layerIntersections.add(
        intersection.path = intersection.arcs
          ? createPolygonArc({ arcs: intersection.arcs })
          : createCircle({ radius: intersection.radius, x: intersection.x, y: intersection.y })
      );
    });

    this.two.update();

    this.intersections.forEach(({ filled, path, underlay }, index) => {
      setClassName(path, getIntersectionClassName({ filled, underlay }));

      if (animate) {
        setAttribute(path, 'style', [
          `animation-delay: ${400 + (index * 25)}ms`,
          `stroke-dasharray: ${path.domElement.getTotalLength()}`,
          `stroke-dashoffset: ${path.domElement.getTotalLength()}`,
        ].join('; '));
      }
    });

    if (debug) {
      this.drawDebug(areas, circles, vectors);
    }
  }

  drawDebug(areas, circles, vectors) {
    /* eslint-disable no-console */
    console.info(`Areas: ${areas.length}`);
    console.info(`Cirlces: ${circles.length}`);
    console.info(`Vectors: ${vectors.length}`);
    console.info(areas);
    console.info(circles);
    console.info(vectors);
    /* eslint-enable no-console */

    this.layerDebug = this.two.makeGroup();
    this.layerDebug.add(...debugAreas(areas));
    this.layerDebug.add(...debugCircles(circles));
    this.layerDebug.add(...debugVectors(vectors));
  }

  removeLayers() {
    if (this.layerShapes) this.layerShapes.remove();
    if (this.layerIntersections) this.layerIntersections.remove();
    if (this.layerDebug) this.layerDebug.remove();
  }

  getRelativeData({ height, width }) {
    return {
      intersections: this.intersections.map((intersection) =>
        toRelativeFromAbsoluteIntersection(width, height, intersection)),
      ratio: width / height,
      shapes: this.shapes.map((shape) =>
        toRelativeFromAbsoluteShape(width, height, shape)),
    };
  }

  getRelativeCoordinates(x, y) {
    const { left, top } = this.container.getBoundingClientRect();

    return {
      containerX: left,
      containerY: top,
      x: x - left,
      y: y - top,
    };
  }

  getShapeAtCoordinates(x, y, padding) {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const { x: cx, y: cy, radius } = this.shapes[i];

      if (isPointWithinCircle(x, y, cx, cy, radius, padding)) {
        return this.shapes[i];
      }
    }

    return null;
  }

  getIntersectionAtCoordinates(x, y) {
    for (let i = this.intersections.length - 1; i >= 0; i--) {
      if (isPointWithinIntersection(x, y, this.intersections[i])) {
        return this.intersections[i];
      }
    }
  }

  handleMouseDown({ clientX, clientY }) {
    const { mode } = this.state;
    const { x, y } = this.getRelativeCoordinates(clientX, clientY);
    const shape = this.preActiveShape;

    this.isMouseDown = true;
    onMouseDownGlobal();

    if (mode === MODE_DRAW) {
      this.startX = x;
      this.startY = y;
      this.isResizing = shape && isPointOverCircleEdge(x, y, shape.x, shape.y, shape.radius, TOLERANCE_SELECT_SHAPE);
      this.selectShape(shape);
    }
  }

  handleMouseUp({ clientX, clientY, target }) {
    onMouseUpGlobal();

    if (this.isResizing || this.isMoving) {
      this.shapes.sort(sortCirclesByAreaDescending);
    }

    this.isMouseDown = false;
    this.isMoving = false;
    this.isResizing = false;

    if (!this.container.contains(target)) {
      return this.hideToolbar();
    }

    const { containerX, containerY } = this.getRelativeCoordinates(clientX, clientY);
    const { mode } = this.state;

    if (mode === MODE_DRAW) {
      if (this.activeShape) {
        this.showToolbar(containerX, containerY);
        this.selectShape(this.activeShape);
      } else {
        this.hideToolbar();
      }
    }

    if (mode === MODE_FILL) {
      this.selectIntersection(this.preActiveIntersection);
    }
  }

  handleMouseMove(event) {
    if (this.isMouseDown) {
      return this.handleMouseDrag(event);
    }

    const { mode } = this.state;
    const { clientX, clientY } = event;
    const { x, y } = this.getRelativeCoordinates(clientX, clientY);

    if (mode === MODE_DRAW) {
      const shape = this.preActiveShape = this.getShapeAtCoordinates(x, y, TOLERANCE_SELECT_SHAPE);

      if (shape) {
        if (isPointOverCircleEdge(x, y, shape.x, shape.y, shape.radius, TOLERANCE_SELECT_SHAPE)) {
          this.setCursor(getCursor(x, y, shape.x, shape.y));
        } else {
          this.setCursor(CURSOR_MOVE);
        }
      } else {
        this.setCursor(CURSOR_DRAW);
      }
    }

    if (mode === MODE_FILL) {
      const intersection = this.preActiveIntersection = this.getIntersectionAtCoordinates(x, y);

      if (intersection) {
        this.setCursor(CURSOR_FILL);
      } else {
        this.setCursor(CURSOR_DEFAULT);
      }
    }
  }

  handleMouseDrag(event) {
    const { mode } = this.state;
    const { clientX, clientY } = event;
    const { x, y } = this.getRelativeCoordinates(clientX, clientY);

    if (mode === MODE_DRAW) {
      const deltaX = x - this.startX;
      const deltaY = y - this.startY;

      if (this.activeShape) {
        this.hideToolbar();

        if (this.isResizing) {
          this.resizeShape(x, y);
        } else {
          this.isMoving = true;
          this.moveShape(deltaX, deltaY);
        }
      } else if (Math.hypot(deltaX, deltaY) > TOLERANCE_CREATE_SHAPE) {
        this.addShape(x, y);
        this.isResizing = true;
      }
    }
  }

  handleTouchMove(event) {
    if (event.target === this.two.renderer.domElement) {
      event.preventDefault();
    }
  }

  handleSave() {
    this.props.onSave(this.getRelativeData(this.props));
  }

  handleSetMode(mode) {
    this.setState({ mode });
    this.initMode(mode);
    this.hideToolbar();
  }

  setCursor(cursor) {
    this.container.style.cursor = cursor;
  }

  selectShape(shape) {
    this.activeShape = shape;
    this.activeShapeProps = shape && {
      radius: shape.radius,
      x: shape.x,
      y: shape.y,
    };

    return shape;
  }

  selectIntersection(intersection) {
    if (intersection) {
      intersection.filled = !intersection.filled;
      setClassName(intersection.path, getIntersectionClassName({
        filled: intersection.filled,
        underlay: intersection.underlay,
      }));
    }
  }

  showToolbar(offsetX, offsetY) {
    const { radius, x, y } = this.activeShape;

    this.setState({
      toolbarTargetBox: {
        height: radius * 2,
        width: radius * 2,
        x: (x + offsetX) - radius,
        y: (y + offsetY) - radius,
      },
    });
  }

  hideToolbar() {
    this.setState({
      toolbarTargetBox: null,
    });
  }

  addShape(x, y, radius = TOLERANCE_CREATE_SHAPE) {
    const path = createCircle({ radius, x, y });
    this.layerShapes.add(path);
    this.two.update();
    setClassName(path, getShapeClassName());
    this.shapes.push(this.selectShape({ path, radius, x, y }));
  }

  copyShape() {
    this.addShape(
      this.activeShape.x + COPY_OFFSET,
      this.activeShape.y + COPY_OFFSET,
      this.activeShape.radius
    );
  }

  removeShape() {
    this.shapes = this.shapes.filter((shape) => shape !== this.activeShape);
    this.activeShape.path.remove();
    this.activeShape = null;
    this.hideToolbar();
  }

  moveShape(deltaX, deltaY) {
    this.activeShape.x = this.activeShapeProps.x + deltaX;
    this.activeShape.y = this.activeShapeProps.y + deltaY;
    this.activeShape.path.translation.set(this.activeShape.x, this.activeShape.y);
  }

  resizeShape(x, y) {
    const deltaX = x - this.activeShape.x;
    const deltaY = y - this.activeShape.y;
    const radius = Math.hypot(deltaX, deltaY);
    this.activeShape.radius = radius;
    this.activeShape.path.radius = radius;
  }

  render() {
    const { debug, mode, toolbarTargetBox } = this.state;
    const { canSave, onClear } = this.props;
    const classes = classnames('CircleArt__visual', `CircleArt__visual--mode-${mode}`);

    return (
      <Fragment>
        <Toolbar targetBox={ toolbarTargetBox } visible={ !!toolbarTargetBox }>
          <ToolbarActionGroup>
            <ToolbarAction onClick={ () => this.copyShape() }>
              <Icon name="Copy" size="1rem" />
            </ToolbarAction>
          </ToolbarActionGroup>

          <ToolbarActionGroup>
            <ToolbarAction
                color="negative"
                onClick={ () => this.removeShape() }>
              <Icon name="Delete" size="1rem" />
            </ToolbarAction>
          </ToolbarActionGroup>
        </Toolbar>

        <Base
            absolute="fullscreen"
            backgroundColor="shade-2"
            className={ classes }
            onMouseDown={ (e) => this.handleMouseDown(moveEvent(e)) }
            // onMouseMove={ (e) => this.handleMouseMove(moveEvent(e)) }
            onTouchMove={ (e) => this.handleMouseMove(moveEvent(e)) }
            onTouchStart={ (e) => this.handleMouseDown(moveEvent(e)) }
            ref={ (container) => this.container = findDOMNode(container) } />

        <Base absolute="bottom" padding="x4">
          <Flex alignChildrenHorizontal="between" direction="horizontal">
            <Flex direction="horizontal" gutter="x2">
              <Flex>
                <Button color="negative" onClick={ () => onClear() }>
                  <Flex
                      alignChildrenVertical="middle"
                      direction="horizontal"
                      gutter="x1">
                    <Flex><Icon name="File" size="1rem" /></Flex>
                    <Flex>Clear</Flex>
                  </Flex>
                </Button>
              </Flex>

              <Flex>
                <Button
                    color="positive"
                    disabled={ !canSave }
                    onClick={ () => this.handleSave() }>
                  <Flex
                      alignChildrenVertical="middle"
                      direction="horizontal"
                      gutter="x1">
                    <Flex><Icon name="Save" size="1rem" /></Flex>
                    <Flex>Save</Flex>
                  </Flex>
                </Button>
              </Flex>

              { process.env.NODE_ENV === 'development' && (
                <Flex>
                  <CheckBox
                      checked={ debug }
                      label="Debug"
                      margin="x2"
                      onChange={ () => this.setState({ debug: !debug }) } />
                </Flex>
              ) }
            </Flex>

            <Flex>
              <Buttons>
                <Button
                    active={ mode === MODE_DRAW }
                    onClick={ () => this.handleSetMode(MODE_DRAW) }>
                  <Flex
                      alignChildrenVertical="middle"
                      direction="horizontal"
                      gutter="x1">
                    <Flex><Icon name="Pencil" size="1rem" /></Flex>
                    <Flex>Draw</Flex>
                  </Flex>
                </Button>
                <Button
                    active={ mode === MODE_FILL }
                    onClick={ () => this.handleSetMode(MODE_FILL) }>
                  <Flex
                      alignChildrenVertical="middle"
                      direction="horizontal"
                      gutter="x1">
                    <Flex><Icon name="Water" size="1rem" /></Flex>
                    <Flex>Fill</Flex>
                  </Flex>
                </Button>
                <Button
                    active={ mode === MODE_VIEW }
                    onClick={ () => this.handleSetMode(MODE_VIEW) }>
                  <Flex
                      alignChildrenVertical="middle"
                      direction="horizontal"
                      gutter="x1">
                    <Flex><Icon name="Eye" size="1rem" /></Flex>
                    <Flex>View</Flex>
                  </Flex>
                </Button>
              </Buttons>
            </Flex>
          </Flex>
        </Base>
      </Fragment>
    );
  }
}
