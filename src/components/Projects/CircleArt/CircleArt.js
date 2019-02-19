import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { Base, Bounds, Code, Flex, Link, Responsive, Text } from 'preshape';
import FileSaver from 'file-saver';
import fscreen from 'fscreen';
import { widthSmall, widthMedium } from '../../Root';
import CircleArtVisual from './CircleArtVisual';
import Fox from './configurations/Fox';
import Project from '../../Project/Project';
import Showcase from './Showcase';
import ShowcaseItem from './ShowcaseItem';
import SVGImage from '../../SVGImage/SVGImage';
import configurations from './configurations';
import './CircleArt.css';

export default class CircleArt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: Fox,
      isInFullscreen: false,
    };
  }

  handleLoadConfig(data) {
    this.setState({ data });
  }

  handleOnClear() {
    this.setState({
      data: {
        intersections: [],
        shapes: [],
      },
    });
  }

  handleOnFullscreen() {
    if (fscreen.fullscreenElement) {
      fscreen.exitFullscreen();
      this.setState({ isInFullscreen: false });
    } else {
      fscreen.requestFullscreen(this.fullscreenContainer);
      this.setState({ isInFullscreen: true });
    }
  }

  handleOnSave(data) {
    this.setState({ data }, () => {
      FileSaver.saveAs(
        new Blob([JSON.stringify(data, null, 2)], { type: 'text/json;charset=utf-8' }),
        `CircleArt-export_${Date.now()}.json`);
    });
  }

  handleOnChange(data) {
    this.setState({ data });
  }

  render() {
    const { data, isInFullscreen } = this.state;

    return (
      <Project { ...this.props } gap="x10" maxWidth={ widthMedium }>
        <Flex gap="x8" grow>
          <Bounds
              Component={ Flex }
              direction="vertical"
              grow
              height="100%"
              id="CircleArtBoundary"
              minHeight="37.5rem"
              ref={ (el) => this.fullscreenContainer = findDOMNode(el) }
              theme="day"
              width="100%">
            { ({ width, height }) => (
              width !== undefined && height !== undefined && (
                <CircleArtVisual
                    data={ data }
                    height={ height }
                    isInFullscreen={ isInFullscreen }
                    onChange={ (data) => this.handleOnChange(data) }
                    onClear={ () => this.handleOnClear() }
                    onFullscreen={ () => this.handleOnFullscreen() }
                    onSave={ (data) => this.handleOnSave(data) }
                    width={ width } />
              )
            ) }
          </Bounds>
        </Flex>

        <Flex>
          <Base margin="x4">
            <Text margin="x2" size="x3">Showcase</Text>
            <Text color="shade-3" margin="x2">
              Built something nice? Send up
              a <Link href="https://github.com/HHogg/hogg.io">pull request</Link> with
              your saved configuration, and add it below.
            </Text>
          </Base>

          <Responsive queries={ [widthSmall, widthMedium] }>
            { (match) => (
              <Showcase
                  columnCount={ match({
                    [widthMedium]: '4',
                    [widthSmall]: '3',
                  }) || '2' }>
                { configurations.map(({ author, config, name, svg }) =>
                  <ShowcaseItem
                      author={ author }
                      key={ name }
                      name={ name }
                      onClick={ () => this.handleLoadConfig(config) }
                      svg={ svg } />
                ) }
              </Showcase>
            ) }
          </Responsive>
        </Flex>


        <Flex>
          <Text heading margin="x4" size="x5">Identifying the areas of intersecting circles</Text>

          <Text margin="x4">
            Calculating these regions can be solved completely geometrically,
            by iterating through all of theme circles, and calculating
            the results of combinations by intersecting and subtracting from
            one another. However, this can be done iteratively with little geometry
            and a simple algorithm.
          </Text>
        </Flex>

        <Flex>
          <Text heading margin="x4" size="x3">The points of intersection and arcs</Text>

          <Text margin="x4">
            One of the few geomtric steps of this algorithm is to calculate
            the point of intersection of every pair of intersecting circles. This
            is already a <Link href="http://mathworld.wolfram.com/Circle-CircleIntersection.html" underline>well solved problem</Link>.
            With the intersection points calculated and reference to the intersecting
            circles, we are able to create a set of arcs that make up the circles.
          </Text>

          <Text margin="x4">
            For each of these arcs we should then <Link href="http://mathworld.wolfram.com/Mid-ArcPoints.html" underline>calculate the midpoint</Link> and
            assign it an identifier, for example and incrementing numerical value.
          </Text>
        </Flex>

        <Flex>
          <SVGImage
              margin="x4"
              maxWidth="28rem"
              svg={ require('./CircleArt-1.svg') } />

          <Text maxWidth="36rem">
            Arrangement of three intersecting circles. Circles labelled <Code>cⁿ</Code>,
            the points of intersection labelled <Code>vⁿ</Code> and arcs
            labelled <Code>aⁿ</Code>.
          </Text>
        </Flex>

        <Flex>
          <Text margin="x4">
            The above data set, provides us with a way to navigate from point to
            point and start to create a path, of arcs, that define the intersecting
            regions. We can then use a set of three conditions that will all us to
            form only the valid regions and also ensure that the algorithm is as
            efficient as possible by not unnecessarily traversing* arcs that will
            lead to an invalid region.
          </Text>
        </Flex>

        <Flex>
          <Text heading margin="x4" size="x3">The conditions for a valid region</Text>
        </Flex>

        <Flex>
          <Text margin="x4" strong>
            1. An arc cannot be a continuation of the previously traversed arc
          </Text>

          <Text margin="x4">
            A continuation of arcs means traversing around the same circle twice.
            This implies either traversing back to the previous vector or
            traversing across the intersection of another region, and thus
            forming an invalid region.
          </Text>
        </Flex>

        <Flex>
          <SVGImage
              margin="x4"
              maxWidth="28rem"
              svg={ require('./CircleArt-2.svg') } />

          <Text maxWidth="36rem">
            For example, using the same arrangement of circles displayed above,
            taking the arc <Code>a2</Code> (traversing
            from <Code>v1</Code> to <Code>v4</Code>) the connecting arcs
            are <Code>a2</Code>, <Code>a3</Code>, <Code>a10</Code> and <Code>a11</Code>. This
            condition allows us to exclude arcs <Code>a2</Code> and <Code>a3</Code>.
          </Text>
        </Flex>

        <Flex>
          <Text margin="x4" strong>
            2. The same two arcs cannot have been traversed before
          </Text>

          <Text margin="x4">
            Intersecting regions consist of 2 or more arcs, and each intersecting
            region can be identified as unique from as few as 2 of it’s arcs,
            in other words no 2 arcs can be traversed, in any direction, twice.
            Each arc can be identified by the assigned numerical value (from the
            initialisation phase), and can be represented in binary form as a
            Bitset. Each valid traversal of an intersecting region can then be
            stored in a map as a bitwise OR of the two Bitsets. This is then used
            to exit early out of traversals that have been traversed before.
          </Text>
        </Flex>

        <Flex>
          <SVGImage
              margin="x4"
              maxWidth="28rem"
              svg={ require('./CircleArt-3.svg') } />

          <Text maxWidth="36rem">
            For example, taking a traversal from <Code>v1</Code> to <Code>v4</Code> to <Code>v5</Code> across
            segments <Code>a2</Code> and <Code>a10</Code>, would give us a Bitset
            of ‘<Code>10000000100</Code>` which is the bitwise OR of ‘<Code>100</Code>` (4)
            and ‘<Code>10000000000</Code>` (10). With this Bitset stored, in a later
            traversal, starting from <Code>v5</Code> to <Code>v4</Code>, across
            segment <Code>a10</Code>. The next connecting segments are
            again <Code>a2</Code>, <Code>a3</Code>, <Code>a10</Code> and <Code>a11</Code>.
            This condition allows us to exclude the segment <Code>a2</Code>, because even
            though the traversal of <Code>v5</Code> to <Code>v4</Code> to v<Code>1</Code> is
            different to the original traversal of <Code>v1</Code> to <Code>v4</Code> to <Code>v5</Code>,
            the Bitsets remain the same.
          </Text>
        </Flex>

        <Flex>
          <Text margin="x4" strong>
            3. The midpoint of an arc must exist inside or outside of the
            non-intersecting circles of the endpoints of all previously traversed arcs
          </Text>

          <Text margin="x4">
            Each traversable arc has 3 related circles. 1 is the circle belonging
            to the circumference that is being traversed and the 2 other circles
            that formed the 2 endpoints of the arc. Note that this is not the
            case of 2 intersecting circles, these 3 related circles would only
            reference 2 circles but the relationships still apply.
          </Text>

          <Text margin="x4">
            For every valid arc traversal, the midpoints of the arcs can be used
            to determine the space to which all subsequent midpoints must all exist
            inside. If the midpoint lies inside the area of either of the
            non-intersecting circles then all future arc midpoints must also exist
            inside the area of that circle. Likewise, if the midpoint lies outside
            the area of either of the non-intersecting circles then all future arc
            midpoints must also exist outside the area of that circle.
          </Text>
        </Flex>

        <Flex>
          <SVGImage
              margin="x4"
              maxWidth="28rem"
              svg={ require('./CircleArt-4.svg') } />

          <Text margin="x4" maxWidth="36rem">
            For example, again using the arrangement of circles from above. A traversal
            of <Code>v1</Code> to <Code>v4</Code> along <Code>a2</Code>, we can say
            that the midpoint of <Code>a2</Code> exists within the circles
            of <Code>c2</Code> and outside the circle <Code>c3</Code>.
            From <Code>v4</Code>, the connecting arcs
            are <Code>a2</Code>, <Code>a3</Code>, <Code>a10</Code> and <Code>a11</Code>.
            The first condition rules out <Code>a3</Code> and <Code>a2</Code>, from
            there we can choose either <Code>a10</Code> or <Code>a11</Code>. Both
            of the midpoints for these arcs validate this condition, because they
            are both inside the circle of <Code>c2</Code> and are outside or traversing
            the circumference of <Code>c3</Code>. For this example let us
            use <Code>a11</Code> which is traversal to <Code>v6</Code>.
            From <Code>v6</Code> the next connecting arcs
            are <Code>a6</Code>, <Code>a7</Code>, <Code>a11</Code> and <Code>a12</Code>.
            The first condition again rules out <Code>a11</Code> and <Code>a12</Code>.
            Using this condition, we can rule out <Code>a7</Code> because the midpoint
            exists outside the circle of <Code>c3</Code>. Leaving us with
            only <Code>a6</Code> as a valid traversal, and for this specific example
            this happens to connect us back to <Code>v1</Code> our starting vector,
            and thus completing a valid region.
          </Text>
        </Flex>

        <Flex>
          <Text emphasis size="x1">
            * A ‘traversal’ is defined starting from a single intersecting point,
            vⁿ, navigating to another connecting point along an arc.
            The traversal ends when it reaches the traversals starting point
            forming a valid region.
          </Text>
        </Flex>
      </Project>
    );
  }
}
