import {
  ArticleFig,
  ArticleFigLink,
  ArticleFigs,
  ArticleHeading,
  ArticlePage,
  ArticleParagraph,
  ArticleSection,
  InView,
} from '@hogg/common';
import { Code, CodeBlock, Link } from 'preshape';
import { useCallback } from 'react';
import { getUlamSpiral, useSpiralsContext } from '../Presentation';
import SineWavesCirclePlot from './figs/SineWavesCirclePlot';
import SineWaves from './figs/SineWavesPlot';
import ArticleFigYPlot from './figs/YPlotFig';

const Article = () => {
  const { setRotate, setPointAlgorithm, setPointsAlgorithm, pointCount } =
    useSpiralsContext();

  const handleSetAlgorithmCircle = useCallback(() => {
    setRotate(true);
    setPointAlgorithm((i) => {
      const theta = (i / pointCount) * Math.PI * 2;
      const x = Math.cos(theta);
      const y = Math.sin(theta);

      return [x, y];
    });
  }, [pointCount, setPointAlgorithm, setRotate]);

  const handleSetAlgorithmUlam = useCallback(() => {
    setRotate(false);
    setPointsAlgorithm(getUlamSpiral);
  }, [setPointsAlgorithm, setRotate]);

  //
  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Trigonometry recap</ArticleHeading>

        <ArticleParagraph>
          Back to the trigonometry days of high school, the sine function is the
          foundation of plotting from polar coordinates to the Cartesian
          coordinates, which we're going to be doing a little bit of here.
        </ArticleParagraph>

        <ArticleParagraph>
          It's simply the ratios of the sides of a right-angled triangle. The
          sine function being the ratio of the opposite side to the hypotenuse,
          and the cosine function is the ratio of the adjacent side to the
          hypotenuse (adjacent to the 90° angle).
        </ArticleParagraph>

        <ArticleParagraph>
          As an engineer, these are functions that accept a numerical value in
          radians and return a value between -1 and 1. The difference between
          the two functions is that the sine function starts at 0 and the cosine
          function starts at 1.
        </ArticleParagraph>

        <ArticleParagraph>
          When dealing with angles in school I only ever remember using degrees,
          and never heard of the word "theta" or "radians", but in the world of
          programming and mathematics these are what we're going to want to know
          and use.
        </ArticleParagraph>

        <ArticleParagraph>
          It's pretty simple, radians are the unit of PI (π), π radians is
          equivalent to 180° (degrees), so 2π radians is equivalent to 360°.
          Theta is just the named variable for a value that represents an angle.
        </ArticleParagraph>

        <ArticleFigs theme="night">
          <ArticleFig
            id="math.cos"
            description="Math.cos and Math.sin"
            padding="x0"
          >
            <CodeBlock
              language={'typescript'}
              padding="x6"
              size="x3"
              overflow="auto"
            >
              {`
Math.cos(theta) // X coordinate
Math.sin(theta) // Y coordinate

// Example
Math.cos(0) // 1
Math.sin(0) // 0

Math.cos(Math.PI) // -1
Math.sin(Math.PI) // 0
`}
            </CodeBlock>
          </ArticleFig>
        </ArticleFigs>

        <ArticleParagraph>
          There's 2 ways I find useful to visualise cosine and sine. The first
          is to see their wave form overlaid on each other, where the X axis is
          the increasing theta value (radians) and the Y axis is the the
          corresponding <Code>Math.sin(x)</Code> or <Code>Math.cos(x)</Code>{' '}
          value
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            id="sine-waves"
            description="Sine and Cosine"
            padding="x12"
          >
            <SineWaves />
          </ArticleFig>
        </ArticleFigs>

        <ArticleParagraph>
          The second is to see them together as a point on a circle, where theta
          is the angle around the circle and the value of{' '}
          <Code>Math.sin(x)</Code> or <Code>Math.cos(x)</Code> is the X or Y
          coordinate of the point on the circle. Note if the radius of the
          circle is not 1, then we just multiply the results of the sine and
          cosine functions by the radius.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            id="sine-waves-circle-plot"
            description="Sine and Cosine"
            padding="x12"
          >
            <InView onEnter={handleSetAlgorithmCircle}>
              <SineWavesCirclePlot />
            </InView>
          </ArticleFig>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>The Archimedes Spiral</ArticleHeading>

        <ArticleParagraph>
          We now know how to get an <Code>x</Code> and <Code>y</Code> coordinate
          for a circle with a radius between -1 and 1. Let's create an
          Archimedes spiral (to begin with). This is a spiral that increases
          linearly with the angle.
        </ArticleParagraph>

        <ArticleFigYPlot
          id="spiral"
          rotate
          r={(x) => x}
          t={(x) => x * 0.01}
          withCode
          withCodeXY
        />

        <ArticleParagraph>
          Well that was easy, we have an Archimedes spiral. However, we have{' '}
          {pointCount} particles here so lets space these out a bit more. Let's
          try multiplying the index by 2 so it skips 1 points along the spiral
          before placing the next point.
        </ArticleParagraph>

        <ArticleFigYPlot
          id="spiral-spaced"
          rotate
          r={(x) => x}
          t={(x) => x * 0.01 * 2}
          withCode
        />

        <ArticleParagraph>
          That's kind of worked on the outside but the center of the spiral is
          still far too packed. It doesn't look like we're getting equal spacing
          between the particles so there seems to be a scaling problem here.
          Notice how by increasing the rate of the theta value, we've also
          gained more arms to the spiral.
        </ArticleParagraph>

        <ArticleFigYPlot
          id="spiral-linear-equation"
          dashed
          rotate
          r={(x) => x}
          t={(x) => x * 0.01}
          withChart
        />

        <ArticleParagraph>
          <ArticleFigLink fig="spiral-linear-equation" /> shows our linear
          equation <Code>y = x</Code>. Where the x axis is the index of the
          point and the y axis is the corresponding radius/theta values. What it
          shows is that while the index increases, the radius/theta increases at
          the same rate, and this is exactly what we don't want.
        </ArticleParagraph>

        <ArticleFigYPlot
          id="spiral-squared-equation"
          dashed
          rotate
          r={(x) => x ** 2}
          t={(_r, x) => x * 0.01}
          withChart
        />

        <ArticleParagraph>
          Using the many mathematical functions available to us, we can create
          equations that cause values to scale at different rates, and use those
          to inform our rate of change for both our variables. For example,
          using <Code>y = x²</Code> for the radius (
          <ArticleFigLink fig="spiral-squared-equation" />
          ), starts off slow and gradually increases over time. This is called a
          logarithmic spiral.
        </ArticleParagraph>

        <ArticleParagraph>
          This isn't what we need though, in fact it's the complete opposite!
        </ArticleParagraph>

        <ArticleFigYPlot
          id="spiral-bit-shift-equation"
          dashed
          rotate
          r={(x) => x >> 4}
          t={(_r, x) => Math.floor(x / 16)}
          withChart
        />

        <ArticleParagraph>
          Graphing equations can even be useful to help understand the bitwise
          operators. Like shifting a number to the right by 4 bits is the same
          as dividing it by 16 and flooring the result, which creates a step
          scale (<ArticleFigLink fig="spiral-bit-shift-equation" />
          ). This creates some more definitive points that a whole bunch of our
          coloured particles can be grouped around.
        </ArticleParagraph>

        <ArticleFigYPlot
          id="spiral-bit-and-equation"
          dashed
          rotate
          r={(x) => x * (x & 4)}
          t={(r) => r * 0.01}
          withChart
        />

        <ArticleParagraph>
          Using the & operator to get the remainder of a division by 4, which
          combined with multiplying by the index creates an oscillation between
          0 and linear growth (<ArticleFigLink fig="spiral-bit-and-equation" />
          ), and causes our points on the spiral to form groups of 4. However,
          we're not fixing the issue of the center of the spiral being too
          dense. We're after the rate of change to be faster at the beginning
          and then slow down as the index increases.
        </ArticleParagraph>

        <ArticleFigYPlot
          id="spiral-square-root-equation"
          dashed
          rotate
          r={(x) => Math.sqrt(x)}
          t={(r) => r}
          withChart
        />

        <ArticleParagraph>
          Using the square root of the index (
          <ArticleFigLink fig="spiral-square-root-equation" />) might not look
          any different at first, but at the center of spiral the spacing
          between the particles is less dense, but the rest are still too close
          together.
        </ArticleParagraph>

        <ArticleFigYPlot
          id="spiral-archimedes-equation"
          dashed
          rotate
          r={(x) => Math.sqrt(x)}
          t={(r) => r * Math.PI}
          withCode
        />

        <ArticleParagraph>
          Remember earlier we scaled our value by multiplying it by 2 and the
          effect it had on the spacing of particles? We can do the same again
          and scale up our theta value. We'll also scale it up by π so that the
          dots all align (<ArticleFigLink fig="spiral-archimedes-equation" />
          ).
        </ArticleParagraph>

        <ArticleFigYPlot
          id="spiral-bit-and-square-root-equation"
          dashed
          rotate
          r={(x) => Math.sqrt(x * (x & 4))}
          t={(r) => r}
          withCode
        />

        <ArticleParagraph>
          We can also apply this same square root technique to the bitwise
          operator equation (<ArticleFigLink fig="spiral-bit-and-equation" />)
          to get the same oscillation effect, but with the added benefit of the
          center of the spiral being less dense (
          <ArticleFigLink fig="spiral-bit-and-square-root-equation" />
          ).
        </ArticleParagraph>

        <ArticleFigYPlot
          id="spiral-pi-snapping-equation"
          dashed
          rotate={false}
          r={(x) => x}
          t={(_, x) => x * Math.PI}
          withCode
        />

        <ArticleParagraph>
          Finally for this section, just one more pattern I came across which I
          found interesting is to increase the radius linearly and the theta
          value by π (<ArticleFigLink fig="spiral-pi-snapping-equation" />
          ).
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Vogel spiral</ArticleHeading>

        <ArticleParagraph>
          Another spiral that gets a lot of attention is one that described more
          recently in 1979 by a mathematician called Helmut Vogel, and thus
          named the Vogel Spiral.
        </ArticleParagraph>

        <ArticleParagraph>
          He explains that this particular spiral is the maths that drives the
          structure of sunflower seeds, and the number of spirals in each
          direction are always consecutive Fibonacci numbers.
        </ArticleParagraph>

        <ArticleFigYPlot
          id="spiral-fermat-equation"
          dashed
          rotate
          r={(x) => Math.sqrt(x)}
          t={(_, x) => x * 2.39998131}
          withChart
          withCode
        />

        <ArticleParagraph>
          Notice we're still using the square root of the index for the radius (
          <ArticleFigLink fig="spiral-fermat-equation" />
          ), but we're multiplying the theta value by a number that appears to
          be a random number, but this is actually produces something called the
          Golden Angle , which is linked to the ratio of consecutive Fibonacci
          numbers.
        </ArticleParagraph>

        <ArticleFigs theme="night">
          <ArticleFig id="golden-angle" description="Golden angle calculation">
            <CodeBlock language="typescript">{`
              Math.PI * (3 - Math.sqrt(5));
            `}</CodeBlock>
          </ArticleFig>
        </ArticleFigs>

        <ArticleParagraph>
          We can play around with this multiplier to get slightly different
          results (<ArticleFigLink fig="spiral-one-point-five-equation" />
          ).
        </ArticleParagraph>

        <ArticleFigYPlot
          id="spiral-one-point-five-equation"
          dashed
          rotate
          r={(x) => Math.sqrt(x)}
          t={(_, x) => x * 1.5}
          withCode
        />
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Ulam spiral</ArticleHeading>

        <ArticleParagraph>
          This one is a little different, and is also known as a Prime spiral.
          Instead of using polar coordinates, we're going to use a grid and plot
          points on it. Starting at the center, we're going to move right, then
          up, then left, then down, and repeat. If the number we're on is a
          prime number, we're going to plot a point at that position.
        </ArticleParagraph>

        <ArticleFigs theme="night">
          <ArticleFig
            id="ulam-spiral"
            description="Ulam spiral implementation"
            padding="x0"
            onEnter={handleSetAlgorithmUlam}
          >
            <CodeBlock
              language="typescript"
              maxHeight="400px"
              overflow="auto"
              padding="x6"
            >{`
let n = 100; // Number of points
let direction = 0;
let index = 0;
let shiftCount = 1;
let shiftTotal = 1;
let x = 0;
let y = 0;

const points: Point[] = [];

while (n > 0) {
  if (isPrimeNumber(index)) {
    n--;
    points.push([x, y]);
  }

  // shiftCount is used to determine how many steps
  // to take in a direction, once it reaches 0, we change
  // direction.
  if (shiftCount === 0) {
    direction = (direction + 1) % 4;
    shiftCount = direction == 0 || direction == 2
      ? shiftTotal++
      : shiftTotal;
  }

  shiftCount--;
  index++;

  if (direction === 0) x++; // Right
  if (direction === 1) y--; // Up
  if (direction === 2) x--; // Left
  if (direction === 3) y++; // Down
}

return points;
            `}</CodeBlock>
          </ArticleFig>
        </ArticleFigs>

        <ArticleParagraph>
          What's interesting about this spiral is that there are clear patterns
          that emerge, where the prime numbers are more likely to be found on
          diagonals, columns and rows and some that have exactly none. This has
          a perfectly rational explanation due to these lines landing on
          multiples.{' '}
          <Link
            href="https://www.youtube.com/watch?v=EK32jo7i5LQ"
            target="_blank"
            underline
          >
            3Blue1Brown has a great video on this
          </Link>
          .
        </ArticleParagraph>
      </ArticleSection>
    </ArticlePage>
  );
};

export default Article;
