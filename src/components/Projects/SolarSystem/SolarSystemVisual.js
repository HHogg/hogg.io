import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classnames from 'classnames';
import Two from 'two.js';
import { findDOMNode } from 'react-dom';
import { Appear } from 'preshape';
import { scaleLinear } from 'd3-scale';
import getDayOfYear from 'date-fns/get_day_of_year';
import { objects, objectsMap, orbitingObjects } from './objects';
import { addClassName, createCircle, createGroup } from '../../../utils/Two';

const radii = objects.map(({ radius }) => radius);
const radiusMin = Math.min(...radii);
const radiusMax = Math.max(...radii);

export default class SolarSystemVisual extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    heliocentric: PropTypes.bool.isRequired,
    onDayChange: PropTypes.func.isRequired,
    speed: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  };

  componentDidMount() {
    const { height, width } = this.props;

    this.two = new Two({
      autostart: true,
      type: 'SVGRenderer',
      height,
      width,
    }).appendTo(this.container);

    this.day = getDayOfYear(Date.now());
    this.time = this.day;
    this.init();
    this.two.bind('update', (frameCount, timeDelta) => {
      this.updatePositions(timeDelta / 1000);
    });
  }

  componentDidUpdate(prevProps) {
    const {
      height,
      heliocentric,
      width,
    } = this.props;

    if (height !== prevProps.height ||
        width !== prevProps.width ||
        heliocentric !== prevProps.heliocentric) {
      return this.init();
    }
  }

  init() {
    const { height, width } = this.props;

    this.cx = width / 2;
    this.cy = height / 2;
    this.dim = Math.min(this.cx, this.cy);

    this.scaleRadius = scaleLinear()
      .domain([radiusMin, radiusMax])
      .range([0.5, this.dim / 10]);

    this.setSize(width, height);
    this.setRadii();
    this.setPositions();
    this.drawAll();
  }

  setSize(width, height) {
    this.two.renderer.setSize(width, height);
    this.two.width = this.two.renderer.width;
    this.two.height = this.two.renderer.height;
  }

  setRadii() {
    this.radiiObjects = objects
      .reduce((radii, { name, radius }) => ({
        ...radii,
        [name]: this.scaleRadius(radius),
      }), {});

    this.orbitDistances = objects
      .reduce((dist, { name, orbits }) => ({
        ...dist,
        [name]: ((dist[orbits] || this.dim) - this.radiiObjects[name]) /
          objectsMap[name].orbitingObjects.length,
      }), {});

    this.radiiOrbits = orbitingObjects
      .reduce((radii, { name, orbits }) => ({
        ...radii,
        [name]: this.orbitDistances[orbits] *
          (objectsMap[orbits].orbitingObjects.indexOf(name) + 2),
      }), {});
  }

  setPositions() {
    this.positions = {
      [objectsMap.Sun.name]: {
        x: this.cx,
        y: this.cy,
      },
    };

    orbitingObjects.forEach(({ name, period, orbits }) => {
      const daysRads = (Math.PI * 2) / period;
      const dayRad = this.time * daysRads;

      this.positions[name] = {
        x: this.positions[orbits].x +
          this.radiiOrbits[name] * Math.cos(dayRad),
        y: this.positions[orbits].y +
          this.radiiOrbits[name] * Math.sin(dayRad),
      };
    });
  }

  updatePositions(increment) {
    if (this.shapesObject && this.shapesOrbit) {
      this.time += increment * this.props.speed;
      this.setPositions();

      orbitingObjects.forEach(({ name, orbits }) => {
        if (this.shapesOrbit[name]) {
          this.shapesOrbit[name].translation.set(
             this.positions[orbits].x,
             this.positions[orbits].y,
          );
        }

        if (this.shapesObject[name]) {
          this.shapesObject[name].translation.set(
             this.positions[name].x - this.positions[orbits].x,
             this.positions[name].y - this.positions[orbits].y,
          );
        }
      });
    }

    const timeFloor = Math.floor(this.time);

    if (timeFloor > this.day) {
      this.day = timeFloor;
      this.props.onDayChange(this.day);
    }
  }

  drawAll() {
    this.two.clear();
    this.drawObjects();
  }

  drawObjects() {
    this.shapesOrbit = {};
    this.shapesObject = {};

    objects.forEach(({ name, orbits, type }) => {
      const orbitGroup = createGroup({
        x: orbits ? this.positions[orbits].x : this.positions[name].x,
        y: orbits ? this.positions[orbits].y : this.positions[name].y,
      });

      const shapeOrbit = createCircle({
        radius: orbits ? this.radiiOrbits[name] : 0,
        x: 0,
        y: 0,
      });

      const shapeBody = createCircle({
        radius: this.radiiObjects[name],
        x: orbits ? this.positions[name].x - this.positions[orbits].x : 0,
        y: orbits ? this.positions[name].y - this.positions[orbits].y : 0,
      });

      orbitGroup.add(shapeOrbit);
      orbitGroup.add(shapeBody);

      this.two.add(orbitGroup);
      this.two.update();

      addClassName(shapeBody, classnames(
        'SolarSystem__object',
        `SolarSystem__object--${type}`,
      ));

      addClassName(shapeOrbit, classnames(
        'SolarSystem__orbit-path',
        `SolarSystem__orbit-path--${type}`,
      ));

      this.shapesOrbit[name] = orbitGroup;
      this.shapesObject[name] = shapeBody;
    });
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
