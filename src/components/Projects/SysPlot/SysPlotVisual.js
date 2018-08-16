import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Two from 'two.js';
import Tween from '@tweenjs/tween.js';
import BezierEasing from 'bezier-easing';
import {
  transitionTimingFunction,
  transitionTimeBase,
  themes,
  Base,
} from 'preshape';
import { createCircle } from '../../../utils/Two';

const ease = new BezierEasing(...transitionTimingFunction);

export default class SysPlotVisual extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    positions: PropTypes.array,
    theme: PropTypes.string.isRequired,
    vectors: PropTypes.array,
    width: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.shapes = [];
    this.vectors = [];
  }

  componentDidMount() {
    const { height, positions, vectors, width } = this.props;

    this.update = this.update.bind(this);
    this.two = new Two({
      autostart: true,
      height: height,
      type: 'CanvasRenderer',
      width: width,
    }).appendTo(this.container);

    this.vectorGroup = this.two.makeGroup();
    this.shapeGroup = this.two.makeGroup();

    this.two.on('update', this.update);

    this.updateVectorLayer(vectors);
    this.updateShapeLayer(positions);
  }

  componentDidUpdate(prevProps) {
    const { height, positions, theme, vectors, width } = this.props;

    if (height !== prevProps.height || width !== prevProps.width) {
      this.two.renderer.setSize(width, height);
      this.two.width = this.two.renderer.width;
      this.two.height = this.two.renderer.height;
    }

    if (theme !== prevProps.theme || vectors !== prevProps.vectors) {
      this.updateVectorLayer(vectors);
    }

    if (theme !== prevProps.theme || positions !== prevProps.positions) {
      this.updateShapeLayer(positions);
    }
  }

  componentWillUnmount() {
    this.two.off('update', this.update);
  }

  update() {
    Tween.update();
  }

  updateLayer(store, layer, items, attributeGetter) {
    let i = -1;

    while (++i < items.length) {
      const { color, radius, x, y } = attributeGetter(items[i]);
      let shape;

      if (store[i]) {
        shape = store[i];
        shape.fill = color;
        shape.tween = new Tween.Tween({
          radius: shape.radius,
          x: shape.translation.x,
          y: shape.translation.y,
        })
          .to({ radius, x, y }, transitionTimeBase)
          .easing(ease)
          .onUpdate(({ radius, x, y }) => {
            shape.radius = radius;
            shape.translation.x = x;
            shape.translation.y = y;
          })
          .start();
      } else {
        shape = store[i] = createCircle({
          fill: color,
          opacity: 0,
          radius: radius,
          x: x,
          y: y,
        });

        shape.tween = new Tween.Tween(shape)
          .to({ opacity: 1 }, transitionTimeBase)
          .delay(transitionTimeBase)
          .easing(ease)
          .onUpdate(({ opacity }) => shape.opacity = opacity)
          .start();

        layer.add(shape);
      }
    }

    while (i < store.length) {
      Two.Utils.release(store.pop().remove());
    }
  }

  updateVectorLayer(vectors) {
    this.updateLayer(
      this.vectors,
      this.vectorGroup,
      vectors,
      ([x, y]) => ({
        color: themes.night.colorTextShade3,
        radius: 1,
        x: x,
        y: y,
      }));
  }

  updateShapeLayer(shapes) {
    const { theme } = this.props;

    this.updateLayer(
      this.shapes,
      this.shapeGroup,
      shapes,
      ([{ radius }, [ x, y ]]) => ({
        color: themes[theme].colorAccentShade2,
        radius: radius,
        x: x,
        y: y,
      }));
  }

  render() {
    return (
      <Base
          absolute="fullscreen"
          ref={ (container) => this.container = findDOMNode(container) } />
    );
  }
}
