import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Two from 'two.js';
import Tween from '@tweenjs/tween.js';
import random from 'lodash.random';
import BezierEasing from 'bezier-easing';
import {
  colorPositiveShade1,
  colorPositiveShade3,
  transitionTimeSlow,
  transitionTimeFast,
  transitionTimingFunction,
  themes,
  Base,
  Flex,
  Text,
} from 'preshape';
import { onCompleteAll } from '../../../utils/Tween';
import './LockPickVisual.css';

const ease = new BezierEasing(...transitionTimingFunction);

const radian = (d) => d * (Math.PI / 180);

const getAngleCenter = (angle) => random(
  -(MAX_ANGLE_RANGE / 2) + (angle / 2),
  (MAX_ANGLE_RANGE / 2) - (angle / 2),
);

const ONE_DEGREE = radian(1);
const NINETY_DEGREES = radian(90);
const LOCK_SCALE = 3;
const MAX_ANGLE_RANGE = radian(180);

export default class LockPickVisual extends Component {
  static propTypes = {
    bobbyPins: PropTypes.number.isRequired,
    debug: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    level: PropTypes.number.isRequired,
    onFailedPick: PropTypes.func.isRequired,
    onSuccessfulPick: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.angleRange = MAX_ANGLE_RANGE;
    this.angleCenter = getAngleCenter(this.angelRange);
    this.speed = 0;
  }

  componentDidMount() {
    const { height, width } = this.props;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    this.two = new Two({
      autostart: true,
      type: 'SVGRenderer',
      height,
      width,
    }).appendTo(this.container);

    this.addEventListener();
    this.setCanvasSize(width, height);

    this.draw();

    this.two.bind('update', () => {
      Tween.update();
    });
  }

  componentDidUpdate(prevProps) {
    const { debug, height, level, width } = this.props;

    if (height !== prevProps.height || width !== prevProps.width) {
      this.setCanvasSize(width, height);
      this.draw();
    }

    if (level !== prevProps.level) {
      this.angleRange = (MAX_ANGLE_RANGE / level);
      this.angleCenter = getAngleCenter(this.angleRange);

      if (debug) {
        this.drawPickArea();
      }
    }

    if (debug !== prevProps.debug) {
      if (debug) {
        this.drawPickArea();
      } else {
        this.pickArea.remove();
      }
    }
  }

  componentWillUnmount() {
    this.removeEventListener();
  }

  addEventListener() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  removeEventListener() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  setCanvasSize(width, height) {
    this.two.renderer.setSize(width, height);
    this.two.width = this.two.renderer.width;
    this.two.height = this.two.renderer.height;
  }

  handleKeyDown(event) {
    switch (event.key) {
      case 'ArrowUp': return this.handleArrowUpDown();
      case 'ArrowRight': return this.handleArrowRightDown();
      case 'ArrowLeft': return this.handleArrowLeftDown();
    }
  }

  handleKeyUp(event) {
    switch (event.key) {
      case 'ArrowUp': return this.handleArrowUpUp();
      default: this.speed = 0;
    }
  }

  handleArrowRightDown() {
    const { rotation } = this.pin;

    if (this.isPicking || this.isResetting) return;

    this.speed += ONE_DEGREE;

    if (rotation + this.speed > MAX_ANGLE_RANGE * 0.5) {
      this.rotatePin(MAX_ANGLE_RANGE * 0.5).start();
    } else {
      this.rotatePin(rotation + this.speed).start();
    }
  }

  handleArrowLeftDown() {
    const { rotation } = this.pin;

    if (this.isPicking || this.isResetting) return;

    this.speed += ONE_DEGREE;

    if (rotation - this.speed < MAX_ANGLE_RANGE * -0.5) {
      this.rotatePin(MAX_ANGLE_RANGE * -0.5).start();
    } else {
      this.rotatePin(rotation - this.speed).start();
    }
  }

  handleArrowUpDown() {
    const { onFailedPick, onSuccessfulPick } = this.props;
    const dist = Math.abs(this.pin.rotation - this.angleCenter);
    const maxRotation = Math.min(NINETY_DEGREES, Math.max(0, NINETY_DEGREES - (dist - (this.angleRange / 2))));

    if (this.isPicking || this.isResetting) {
      return;
    }

    this.isPicking = true;
    this.rotateLock(maxRotation).onComplete(() => {
      this.isResetting = true;

      onCompleteAll([
        maxRotation >= NINETY_DEGREES
          ? this.rotateLock(NINETY_DEGREES + (ONE_DEGREE * 22.5), true).delay(200)
          : this.shakeLock(),
      ]).then(() => {
        onCompleteAll([
          maxRotation >= NINETY_DEGREES && this.rotatePin(0),
          this.rotateLock(0, true),
        ]).then(() => {
          this.isResetting = false;
          if (maxRotation < NINETY_DEGREES) {
            onFailedPick();
          } else {
            onSuccessfulPick();
          }
        });
      });
    }).start();
  }

  handleArrowUpUp() {
    this.isPicking = false;

    if (!this.isResetting) {
      this.rotateLock(0, true).start();
    }
  }

  rotatePin(rotation) {
    if (this.pinRotation) {
      this.pinRotation.stop();
    }

    return this.pinRotation = new Tween.Tween(this.pin)
      .to({ rotation }, transitionTimeFast)
      .easing(Tween.Easing.Linear.None);
  }

  rotateLock(rotation, fixed) {
    const speed = fixed ? transitionTimeSlow :
      ((rotation - this.lock.rotation) / NINETY_DEGREES) *
        (transitionTimeSlow / NINETY_DEGREES);

    if (this.lockRotation) {
      this.lockRotation.stop();
    }

    return this.lockRotation = new Tween.Tween(this.lock)
      .to({ rotation }, speed)
      .easing(Tween.Easing.Linear.None);
  }

  shiftLock(x) {
    return new Tween.Tween(this.lock.translation)
      .to({ x }, transitionTimeFast / 4)
      .easing(ease);
  }

  shakeLock(n = 3) {
    return this.shiftLock('+5')
      .chain(this.shiftLock('-10')
        .chain(this.shiftLock('+5')
          .chain(n ? this.shakeLock(--n) : new Tween.Tween())));
  }

  getLockDimensions() {
    const { height, width } = this.props;
    const cx = width / 2;
    const cy = height / 2;
    const radius = (cx > cy ? cy : cx) / LOCK_SCALE;

    return { cx, cy, radius };
  }

  draw() {
    const { debug } = this.props;
    const { cx, cy, radius } = this.getLockDimensions();

    this.two.clear();
    this.drawLock({ cx, cy, radius });
    this.drawPin({ cx, cy, radius });

    if (debug) {
      this.drawPickArea({ cx, cy, radius });
    }
  }

  drawLock({ cx, cy, radius }) {
    const lockOuter = new Two.Circle(0, 0, radius);
    const lockInner = new Two.Circle(0, 0, radius * 0.80);
    const lockShadow = new Two.Circle(0, 0, radius * 0.32);
    const lockHole = new Two.Rectangle(0, 0, radius * 0.24, radius * 0.80);
    const lockRotation = this.lock ? this.lock.rotation : 0;

    lockOuter.fill = themes.day.colorTextShade3;
    lockInner.fill = themes.day.colorTextShade3;
    lockShadow.fill = themes.day.colorTextShade2;
    lockHole.fill = themes.day.colorTextShade1;

    lockOuter.stroke = themes.day.colorBackgroundShade3;
    lockInner.stroke = themes.day.colorTextShade1;
    lockOuter.linewidth = 2;
    lockInner.linewidth = radius * 0.10;

    lockShadow.noStroke();
    lockHole.noStroke();

    this.lock = this.two.makeGroup();
    this.lock.translation.set(cx, cy);
    this.lock.rotation = lockRotation;
    this.lock.add(lockOuter);
    this.lock.add(lockInner);
    this.lock.add(lockShadow);
    this.lock.add(lockHole);
  }

  drawPin({ cx, cy, radius } = this.getLockDimensions()) {
    const height = cy * 0.75;
    const width = radius * 0.06;
    const pin = new Two.Rectangle(0, height * -0.5, width, height);
    const pinRotation = this.pin ? this.pin.rotation : 0;

    pin.fill = themes.day.colorBackgroundShade3;
    pin.noStroke();

    this.pin = this.two.makeGroup();
    this.pin.translation.set(cx, cy);
    this.pin.rotation = pinRotation;
    this.pin.add(pin);
  }

  drawPickArea({ cx, cy, radius } = this.getLockDimensions()) {
    const pickArea = new Two.ArcSegment(cx, cy, 0, radius * 1.5,
      this.angleCenter - (this.angleRange * 0.5) - NINETY_DEGREES,
      this.angleCenter + (this.angleRange * 0.5) - NINETY_DEGREES);

    if (this.pickArea) {
      this.pickArea.remove();
    }

    pickArea.fill = colorPositiveShade1;
    pickArea.stroke = colorPositiveShade3;
    pickArea.linewidth = 2;
    pickArea.opacity = 0.2;

    this.pickArea = this.two.makeGroup();
    this.pickArea.add(pickArea);
  }

  render() {
    const { bobbyPins, level } = this.props;

    return (
      <Flex absolute="fullscreen" className="LockPickVisual" direction="vertical">
        <Flex container grow>
          <Base
              absolute="fullscreen"
              ref={ (container) => this.container = findDOMNode(container) } />
        </Flex>

        <Flex padding="x6">
          <Text align="middle" size="heading">
            <Text inline strong>Level: </Text> { level }
          </Text>

          <Text align="middle">
            { bobbyPins } Bobby Pin{ bobbyPins.length ? 's' : '' } Remaining
          </Text>
        </Flex>
      </Flex>
    );
  }
}
