import {
  ArticleCallout,
  ArticleFig,
  ArticleFigCodeBlock,
  ArticleFigLink,
  ArticleFigs,
  ArticlePage,
  ProjectPageLink,
} from '@hogg/common';
import { Annotation, TilingRenderer, meta as tilingsMeta } from '@hogg/tilings';
import {
  ArticleSection,
  ArticleHeading,
  ArticleParagraph,
  BulletPoints,
  BulletPoint,
  Text,
  Code,
  Link,
} from 'preshape';

type Props = {};

const tilingRendererOptions = {
  expansionPhases: 1,
  showAnnotations: {
    [Annotation.AxisOrigin]: false,
    [Annotation.Transform]: true,
    [Annotation.VertexType]: false,
  },
};

const Article = ({}: Props) => {
  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Introduction</ArticleHeading>

        <ArticleParagraph>
          While working on my <ProjectPageLink project={tilingsMeta} /> project,
          I wanted to draw some annotations for representing geometric
          reflection transforms (
          <ArticleFigLink fig="reflective-tiling-transformation" />
          ). I thought "I want the reflection line to extend across the whole
          render area" - and that sent me on a little journey to figure out how.
          Writing this article is my way of remembering what I learned.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            id="reflective-tiling-transformation"
            description="Live rendered example of an annotated reflective transform"
          >
            <TilingRenderer
              height="300px"
              notation="12-4-3,6/m30/m(c4)"
              options={tilingRendererOptions}
            />
          </ArticleFig>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Terminology</ArticleHeading>

        <ArticleParagraph>
          Before we get to the maths, let's learn some concepts. Here's a quick
          glossary of some things we'll be using:
        </ArticleParagraph>

        <ArticleParagraph tag="div">
          <BulletPoints>
            <BulletPoint>
              <Text strong>Line segment</Text>: When we say 'a line' this
              actually refers to a line that goes on forever in both directions.
              A line segment is a line that has a start and an end point.
            </BulletPoint>

            <BulletPoint>
              <Text strong>slope</Text>: The slope of a line is the ratio of the
              vertical change (<Code>y2 - y1</Code>) to the horizontal change (
              <Code>x2 - x1</Code>). It's the gradient of the line and we'll
              refer to this below with the letter <Code>m</Code>. There's 2
              things to note about the slope. When a line is completely
              horizontal the slope is <Code>0</Code>, and when a line is
              completely vertical the slope is <Code>Infinity</Code>.
            </BulletPoint>

            <BulletPoint>
              <Text strong>y-intercept</Text>: This is the point where a line
              crosses the y-axis or in other words it's the value of{' '}
              <Code>y</Code> when <Code>x == 0</Code> and we'll refer to it with
              the letter <Code>b</Code>.
            </BulletPoint>
          </BulletPoints>
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Line intersection</ArticleHeading>

        <ArticleParagraph>
          In this section, we're going to look at finding the intersection of 2
          lines first. The information we'll be working with is the endpoints of
          2 line segments.
        </ArticleParagraph>

        <ArticleParagraph
          alignChildren="middle"
          flex="vertical"
          paddingVertical="x12"
        >
          <Code size="x5">y = m * x + b</Code>
        </ArticleParagraph>

        <ArticleParagraph>
          This equation is a useful one to remember. Given an <Code>x</Code>{' '}
          value, the slope and y-intercept we can find any <Code>y</Code> value
          on a line. We can also rearrange this equation to find the{' '}
          <Code>x</Code> value given a <Code>y</Code> value (
          <ArticleFigLink fig="line-components" />
          ).
        </ArticleParagraph>

        <ArticleParagraph>
          It's useful to also take the time to understand what this equation is
          doing. <Code>m</Code> represents the rate of change, it's simply a
          scalar value that for every 1 unit of <Code>x</Code> changes, how many
          units of <Code>y</Code> change. However, this assumes that the line is
          flat. The <Code>b</Code> part of the equation is the offset of the
          line from the origin.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="line-components"
            description="The components of the equation for a line, in Rust"
            language="rust"
          >
            {`
// slope
let m = (y2 - y1) / (x2 - x1);

// y-intercept
let b = y1 - m * x1;

// function to find x given y
let x = |y: f64| (y - b) / m;

// function to find y given x
let y = |x: f64| m * x + b;
            `}
          </ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          To find the intersection of 2 lines we need to find the <Code>x</Code>{' '}
          and <Code>y</Code> values where the lines cross. We can do this by
          setting the equations of the lines equal to each other and solving for{' '}
          <Code>x</Code>. We can then use this <Code>x</Code> value to find the{' '}
          <Code>y</Code> value.
        </ArticleParagraph>

        <ArticleParagraph>
          Let's say we have 2 line segments. The first line segment is defined
          by the points <Code>(x1, y1)</Code> and <Code>(x2, y2)</Code>. The
          second line segment is defined by the points <Code>(x3, y3)</Code> and{' '}
          <Code>(x4, y4)</Code> (
          <ArticleFigLink fig="line-intersection" />
          ).
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="line-intersection"
            description="A breakdown of the components of the equation for finding the intersection of 2 lines"
            language="rust"
          >
            {`
// Slopes of the lines
let m1 = (y2 - y1) / (x2 - x1);
let m2 = (y4 - y3) / (x4 - x3);

// Y-intercepts of the lines
let b1 = y1 - m1 * x1;
let b2 = y3 - m2 * x3;

// X value of the intersection
let ix = (b2 - b1) / (m1 - m2);

// Y value of the intersection using our original equation
let iy = m1 * x + b1;
            `}
          </ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          Even if the slopes of the lines are so gradual that they are
          effectively parallel they will eventually intersect at some point,
          however precisely parallel lines never will so we need to handle this
          case. Luckily, this is easy to check for by comparing the slopes of
          the lines <ArticleFigLink fig="line-intersection-with-check" />.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="line-intersection-with-check"
            description="Amended code to check if the lines are parallel before finding the intersection point"
            language="rust"
          >
            {`
// Slopes of the lines
let m1 = (y2 - y1) / (x2 - x1);
let m2 = (y4 - y3) / (x4 - x3);

if ((m1 - m2).abs() < f64::EPSILON) {
  // The lines are parallel
  return None;
}
            `}
          </ArticleFigCodeBlock>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Bounds intersection</ArticleHeading>

        <ArticleParagraph>
          Back to the main problem of this article which is working with a line
          segment that exists within a bounded area (a rectangle). We're not
          going to think of this area as a rectangle but as 4 separate line
          segments. With this in mind, it's now easy to use what we've learned
          above to find the intersection of this line with the lines of the
          bounding area.
        </ArticleParagraph>

        <ArticleParagraph>
          Something that you may have realised is that a continuous line drawn
          within the bounds of 4 other continuous lines will always intersect
          with all 4 lines (unless it's parallel to one of them).
        </ArticleParagraph>

        <ArticleParagraph>
          This is a fairly trivial problem to solve, by finding the intersection
          points of all 4 lines and then checking which intersection points are
          within the bounds of the rectangle (
          <ArticleFigLink fig="point-within-bounds-check" />
          ).
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="point-within-bounds-check"
            description="Checking if a point is within the bounds of a rectangle"
            language="rust"
          >{`
let within_x = x >= min_x && x <= max_x;
let within_y = y >= min_y && y <= max_y;
let within_bounds = within_x && within_y;

          `}</ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          In fact, because of this property and because the lines we'll be
          working with are perfectly horizontal or vertical, we can simplify the
          problem further. All we need to do is plug in the parallel axis value
          to the line equation to find the intersection point. For example (
          <ArticleFigLink fig="intersection-of-bounds-line-segments" />
          ).
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="intersection-of-bounds-line-segments"
            description="Checking if a point is within the bounds of a rectangle"
            language="rust"
          >{`
let m = (y2 - y1) / (x2 - x1);
let b = y1 - m * x1;
let x = |y: f64| (y - b) / m;
let y = |x: f64| m * x + b;

// The points of intersection with the bounds lines
let x_for_min_y = x(min_y);
let x_for_max_y = x(max_y);
let y_for_min_x = y(min_x);
let y_for_max_x = y(max_x);

// Find which bound line segments the line segment intersects with
let intercepts_min_y = x_for_min_y >= min_x && x_for_min_y <= max_x;
let intercepts_max_y = x_for_max_y >= min_x && x_for_max_y <= max_x;
let intercepts_min_x = y_for_min_x >= min_y && y_for_min_x <= max_y;
let intercepts_max_x = y_for_max_x >= min_y && y_for_max_x <= max_y;
`}</ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          With the above code, we can now find the intersection points on a
          bounds line segments. For example when <Code>intercepts_min_y</Code>{' '}
          is <Code>true</Code>, then we know our <Code>ix1</Code> value is{' '}
          <Code>x_for_min_y</Code> and <Code>iy1</Code> value is{' '}
          <Code>min_y</Code>.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>A rotational bug</ArticleHeading>

        <ArticleParagraph>
          In the code above, we used the <Code>y1</Code> and <Code>x1</Code> as
          the starting point of the line segment. This is fine and produces the
          same result as using the <Code>y2</Code> and <Code>x2</Code> but the
          now inferred direction of the line has some implications.
        </ArticleParagraph>

        <ArticleParagraph>
          To not introduce any graphical and animation bugs down the line by
          accidentally flipping the line segment, we need to make sure that the
          extended line segment points returned are in the given direction.
        </ArticleParagraph>

        <ArticleParagraph>
          In fact, as well as annotating a reflective transform, I needed to
          annotate rotational transforms too (
          <ArticleFigLink fig="rotational-tiling-transformation" />
          ). The problem with this is that I only needed to extend the line
          segment in one direction and therefor needed to control which point
          was the point that extended.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            id="rotational-tiling-transformation"
            description="Live rendered example of an annotated rotational transform"
          >
            <TilingRenderer
              height="300px"
              options={tilingRendererOptions}
              notation="3-3-6-3-3,3/r(h16)/r60"
            />
          </ArticleFig>
        </ArticleFigs>

        <ArticleParagraph>
          I figured two ways to solve this problem, and I think it's matter of
          preference which one you choose.
        </ArticleParagraph>

        <ArticleParagraph>
          <Text strong>Method 1: Using distance</Text> alone by determining
          whichever points is closest. A point that extended away in the
          direction from another point will always be closer than the point at
          the end of the line segment. This is because the point at the end of
          the line segment is the same distance away plus the length of the line
          segment.
        </ArticleParagraph>

        <ArticleParagraph>
          <Text strong>Method 2: Using angles</Text> by determining the angle
          between the center of the line segment and the points, we can then
          know which bounding line segment they are pointing at.
        </ArticleParagraph>

        <ArticleParagraph>
          I went with <Text strong>Method 2</Text>, because I had already
          implemented this before I thought of <Text strong>Method 1</Text>. I
          plan to benchmark the two methods to see which is faster, and maybe
          I'll come back and swap these. But they essentially do the same thing.
        </ArticleParagraph>

        <ArticleCallout title="atan2">
          This mathematical function gives us the angular value of a point
          relative to another point. This other point we can think of as the
          center of a circle. Unlike when we think of a clock face, where 12
          o'clock is 0 degrees, in atan2, 3 o'clock is 0 degrees. Going
          clockwise decreasing from 0 to a bounded value of <Code>-π</Code>, and
          anticlockwise increases from 0 to a bounded value of <Code>π</Code>.
          At 9 o'clock it jumps from <Code>-π</Code> to <Code>π</Code>.
        </ArticleCallout>

        <ArticleFigs>
          <ArticleFigCodeBlock
            id="intersection-of-bounds-line-segments"
            description="Checking if a point is within the bounds of a rectangle"
            language="rust"
          >{`
// The mid point of the line segment
let cx = (x1 + x2) * 0.5;
let cy = (y1 + y2) * 0.5;

// The angular values of the points relative to the center
let a1 = (y1 - cy).atan2(x1 - cx);

// For the top bounding line intersection
if intercepts_min_y {
  // Check to see if the first point we were
  // given is the point that extends upwards
  if atan_p1 < 0.0 {
    ix1 = x_for_min_y;
    iy1 = min_y;
  } else {
    ix2 = x_for_min_y;
    iy2 = min_y;
  }
}
`}</ArticleFigCodeBlock>
        </ArticleFigs>

        <ArticleParagraph>
          Those assigning conditions need to be done for each of the 4 bounding
          lines. The code above is just a snippet, but essentially we need to
          just check that the direction of the point and the line segment match
          up.
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Summary</ArticleHeading>
        <ArticleParagraph>
          That's it! The full implementation can be found{' '}
          <Link
            href="https://github.com/HHogg/hogg.io/blob/master/workspaces/line-segment-extending/src-rust/extend_line_segment.rs"
            target="_blank"
          >
            here
          </Link>
          , and you can play around with the example on this page that uses that
          Rust implementation through Wasm.
        </ArticleParagraph>
      </ArticleSection>
    </ArticlePage>
  );
};

export default Article;
