import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { mat3 } from 'gl-matrix';
import regl from 'regl';
import BezierEasing from 'bezier-easing';
import {
  transitionTimingFunction,
  transitionTimeBase,
  themes,
  Base,
} from 'preshape';
import getTransitionState from './getTransitionState';
import frag from './frag.glsl';
import vert from './vert.glsl';

const ease = new BezierEasing(...transitionTimingFunction);

const hexToVec3 = (hex, int = parseInt(hex.slice(1), 16)) => [
  (int >> 16 & 255) / 255,
  (int >> 8 & 255) / 255,
  (int & 255) / 255,
];

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
    this.setRef = this.setRef.bind(this);
    this.startTime = null;
    this.t = 1;
  }

  componentDidMount() {
    this.regl = regl({
      canvas: this.canvas,
    });

    this.update();
  }

  componentDidUpdate(prevProps) {
    const { height, positions, theme, vectors, width } = this.props;
    const hasHeightChanged = height !== prevProps.height;
    const hasPositionsChanged = positions !== prevProps.positions;
    const hasThemeChanged = theme !== prevProps.theme;
    const hasVectorsChanged = vectors !== prevProps.vectors;
    const hasWidthChanged = width !== prevProps.width;

    if (hasHeightChanged ||
          hasPositionsChanged ||
          hasThemeChanged ||
          hasVectorsChanged ||
          hasWidthChanged) {
      this.update(prevProps.width, prevProps.height);
    }
  }

  setRef(canvas) {
    this.canvas = canvas;
  }

  update(prevWidth, prevHeight) {
    const {
      positions,
      theme,
      width,
      height,
      vectors,
    } = this.props;

    this.tState = getTransitionState({
      cx: width / 2,
      cy: height / 2,
      pColor: hexToVec3(themes[theme].colorAccentShade2),
      positions: positions,
      prev: this.tState,
      t: this.t,
      vColor: hexToVec3(themes.night.colorTextShade3),
      vectors: vectors,
    });

    this.projection = mat3.projection([], width, height);

    this.translate0 = [(prevWidth || width) / 2, (prevHeight || height) / 2];
    this.translate1 = [width / 2, height / 2];

    this.buffers = Object
      .entries(this.tState)
      .reduce((buffers, [key, values]) => ({
        ...buffers,
        [`a_${key}_0`]: this.regl.buffer(values[0]),
        [`a_${key}_1`]: this.regl.buffer(values[1]),
      }), {});

    this.startTransitioning();
  }

  startTransitioning() {
    if (this.frameLoop) {
      this.rendered = true;
      this.startTime = null;
      this.frameLoop.cancel();
    }

    this.frameLoop = this.regl.frame(({ time }) => {
      if (this.startTime === null) {
        this.startTime = time;
      }

      const e = time - this.startTime;

      this.t = ease(e / (transitionTimeBase / 1000));

      this.regl.clear({ depth: 1 });
      this.draw();

      if (e >= (transitionTimeBase / 1000)) {
        this.rendered = true;
        this.startTime = null;
        this.frameLoop.cancel();
        delete this.frameLoop;
      }
    });
  }

  draw() {
    this.regl({
      frag: frag,
      vert: vert,
      count: this.tState.radius[0].length,
      primitive: 'points',
      attributes: this.buffers,
      uniforms: {
        u_projection: this.projection,
        u_t: this.t,
        u_translate_0: this.translate0,
        u_translate_1: this.translate1,
      },
    })();
  }

  render() {
    const { height, width } = this.props;

    return (
      <Base Component="canvas"
          absolute="fullscreen"
          height={ height * 2 }
          innerRef={ this.setRef }
          style={ { height, width } }
          width={ width * 2 } />
    );
  }
}
