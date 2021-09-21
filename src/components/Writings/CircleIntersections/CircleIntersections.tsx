import { Alert, Image, Link, Text } from 'preshape';
import * as React from 'react';
import data from '../../../data';
import WritingFig from '../../WritingPage/WritingFig';
import WritingFigs from '../../WritingPage/WritingFigs';
import WritingHeading from '../../WritingPage/WritingHeading';
import WritingPage from '../../WritingPage/WritingPage';
import WritingParagraph from '../../WritingPage/WritingParagraph';
import WritingSection from '../../WritingPage/WritingSection';

const CircleIntersections = () => {
  return (
    <WritingPage { ...data.writings.CircleIntersections }>
      <WritingSection>
        <Alert color="accent" padding="x3">
          <Text strong>
            Please <Link to="/writings/circle-graphs" underline>click here</Link> for
            the rewritten and updated version of this article.
          </Text>
        </Alert>
      </WritingSection>

      <WritingSection>
        <WritingParagraph>
          Calculating these regions can be solved completely geometrically, by iterating
          through all of the circle intersections, and reducing the results into
          intersected and subtracted areas. However, this can be done iteratively
          with only a little geometry and a simple algorithm.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>The points of intersection and arcs</WritingHeading>

        <WritingParagraph>
          One of the few geometric steps of this algorithm is to calculate
          the point of intersection of every pair of intersecting circles. This
          is already a <Link href="http://mathworld.wolfram.com/Circle-CircleIntersection.html" target="CircleIntersections" underline>well solved problem</Link>.
          With the intersection points calculated and reference to the intersecting
          circles, we are able to divide the circles into segments.
        </WritingParagraph>

        <WritingParagraph>
          For each of these segments we should then <Link href="http://mathworld.wolfram.com/Mid-ArcPoints.html" target="CircleIntersections" underline>calculate the midpoint</Link> of
          the arc and assign it an identifier, as an incrementing numerical value.
        </WritingParagraph>
      </WritingSection>

      <WritingFigs>
        <WritingFig description="Arrangement of three intersecting circles. Circles labelled cⁿ, the points of intersection labelled vⁿ and arcs labelled aⁿ." number={ 1 }>
          <Image src={ require('./writings-circles-1.svg') } />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          With all of the intersecting vectors calculated, it provides us with a way to navigate from
          vector to vector and start to create a path of arcs, that define the intersecting regions. We can
          then use a set of three conditions that will allow us to form only the valid regions
          and also ensure that the algorithm is as efficient as possible by not unnecessarily
          traversing arcs that will lead to an invalid region.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>The conditions for a valid region</WritingHeading>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>
          1. An arc cannot be a continuation of the previously traversed arc
        </WritingParagraph>
      </WritingSection>

      <WritingFigs>
        <WritingFig description="Showing the next possible traversals after a traversal of v1 to v4 (a2)." number={ 2 }>
          <Image src={ require('./writings-circles-2.svg') } />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          A continuation of arcs means traversing around the same circle twice.
          This implies either traversing back to the previous vector or
          traversing across the intersection of another region, and thus
          forming an invalid region.
        </WritingParagraph>

        <WritingParagraph>
          For example, as shown in Fig 2 above, taking the arc a2 (traversing from v1 to v4) the
          connecting arcs are a2, a3, a10 and a11. This condition allows us to exclude a2 and a3 as
          next possible traversals.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>
          2. The same two arcs cannot have been traversed before
        </WritingParagraph>

        <WritingParagraph>
          Intersecting regions consist of 2 or more arcs, and each intersecting
          region can be identified as unique from as few as 2 of it’s arcs,
          in other words no 2 arcs can be traversed, in any direction twice.
          Each arc can be identified by the assigned numerical value (from the
          initialisation phase), and can be represented in binary form as a
          Bitset. Each valid traversal of an intersecting region can then be
          stored in a map as a bitwise OR of the two Bitsets. This is then used
          to exit early out of traversals that have been traversed before.
        </WritingParagraph>
      </WritingSection>

      <WritingFigs maxWidth="900px">
        <WritingFig description="A valid region with the traversal path of v1 to v4 (a2), v4 to v5 (a10) and v5 to v1 (a5)." number={ 3 }>
          <Image src={ require('./writings-circles-3.svg') } />
        </WritingFig>

        <WritingFig description="Showing the next possible traversals after a traversal of v5 to v4 (a1)." number={ 4 }>
          <Image src={ require('./writings-circles-4.svg') } />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          For example, taking a traversal of v1 to v4 (a2) and v4 to v5 (a10) from the complete valid
          region show in Fig 3, this would give us a Bitset of ‘10000000100` which is the bitwise
          OR of ‘100` (4) and ‘10000000000` (10). In a later traversal, shown in Fig 4, of v5 to v4 (a10),
          the next connecting arcs are again a2, a3, a10 and a11. This condition allows us to exclude the
          arc a2, because even though the traversal of v5 to v4 to v1 is different to the original
          traversal of v1 to v4 to v5,the Bitsets remain the same and it would lead to the identical region
          shown in Fig 3.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>
          3. The midpoint of an arc must exist inside or outside of the
          non-intersecting circles of the endpoints of all previously traversed arcs
        </WritingParagraph>

        <WritingParagraph>
          Each traversable arc has 3 related circles. 1 is the circle belonging
          to the circumference that is being traversed and the 2 other circles
          that formed the 2 endpoints of the arc. Note that this is not the
          case of 2 intersecting circles, these 3 related circles would only
          reference 2 circles but the relationships still apply.
        </WritingParagraph>

        <WritingParagraph>
          For every valid arc traversal, the midpoints of the arcs can be used
          to determine the space to which all subsequent midpoints must all exist
          inside. If the midpoint lies inside the area of either of the
          non-intersecting circles then all future arc midpoints must also exist
          inside the area of that circle. Likewise, if the midpoint lies outside
          the area of either of the non-intersecting circles then all future arc
          midpoints must also exist outside the area of that circle.
        </WritingParagraph>
      </WritingSection>

      <WritingFigs>
        <WritingFig description="Showing the next possible traversals after a traversal of v1 to v4 (a2) and v4 to v6 (a11)." number={ 5 }>
          <Image src={ require('./writings-circles-5.svg') } />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          Using the same arrangement of circles and, as shown in Fig 5, starting with
          a traversal of v1 to v4 (a2), we can say that the midpoint of a2 exists within the
          circles of c2 and outside of the circle c3. The previous two rules allow us to have
          the traversal v4 to v6 (a11) as a following valid traversal. Using this condition,
          we can rule out a7 because the midpoint exists inside the circle c3, which the first
          arc (a2) midpoint does not. Leaving us with only a6 as a valid traversal, and for
          this specific example connect us back to our starting vector (v1), thus completing
          a valid region.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>Summary</WritingHeading>

        <WritingParagraph>
          If we iterate through all of the intersecting vectors using the method described above
          we can build up a complete set of the intersecting and subtracted areas. To test out
          this theory, I built an online application for creating artwork by filling in the
          intersecting regions of circles, which can be found <Link href="https://circles.hogg.io" target="CircleIntersections" underline>here</Link>.
        </WritingParagraph>
      </WritingSection>
    </WritingPage>
  );
};

export default CircleIntersections;
