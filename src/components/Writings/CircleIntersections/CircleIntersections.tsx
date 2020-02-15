import * as React from 'react';
import { Flex, Image, Link, Text } from 'preshape';
import WritingHeading from '../../WritingPage/WritingHeading';
import WritingPage from '../../WritingPage/WritingPage';
import WritingParagraph from '../../WritingPage/WritingParagraph';
import WritingSection from '../../WritingPage/WritingSection';

const CircleIntersections = () => {
  return (
    <WritingPage
        date={ 1534460400000 }
        description="An experiment into calculating all of the regions of intersecting circles
          using a computational geometric algorithm."
        image={ require('../../../assets/circles.png') }
        title="Identifying the areas of intersecting circles with computational geometry">
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
          One of the few geomtric steps of this algorithm is to calculate
          the point of intersection of every pair of intersecting circles. This
          is already a <Link href="http://mathworld.wolfram.com/Circle-CircleIntersection.html" underline>well solved problem</Link>.
          With the intersection points calculated and reference to the intersecting
          circles, we are able to divide the circles into segments.
        </WritingParagraph>

        <WritingParagraph>
          For each of these segments we should then <Link href="http://mathworld.wolfram.com/Mid-ArcPoints.html" underline>calculate the midpoint</Link>
          of the arc and assign it an identifier, as an incrementing numerical value.
        </WritingParagraph>
      </WritingSection>

      <WritingSection figure>
        <Flex
            alignChildren="middle"
            direction="vertical"
            backgroundColor="light-shade-1"
            padding="x6">
          <Image src={ require('./Image1.svg') } />
        </Flex>
        <Text margin="x2">
          Arrangement of three intersecting circles.
          Circles labelled cⁿ, the points of intersection labelled vⁿ and arcs
          labelled aⁿ.
        </Text>
      </WritingSection>

      <WritingSection>
        <WritingParagraph>
          The above data set, provides us with a way to navigate from point to point and
          start to create a path, of arcs, that define the intersecting regions. We can
          then use a set of three conditions that will all us to form only the valid regions
          and also ensure that the algorithm is as efficient as possible by not unnecessarily
          traversing* arcs that will lead to an invalid region.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>The conditions for a valid region</WritingHeading>

        <WritingParagraph strong>
          1. An arc cannot be a continuation of the previously traversed arc
        </WritingParagraph>

        <WritingParagraph>
          A continuation of arcs means traversing around the same circle twice.
          This implies either traversing back to the previous vector or
          traversing across the intersection of another region, and thus
          forming an invalid region.
        </WritingParagraph>
      </WritingSection>

      <WritingSection figure>
        <Flex
            alignChildren="middle"
            direction="vertical"
            backgroundColor="light-shade-1"
            padding="x6">
          <Image src={ require('./Image2.svg') } />
        </Flex>

        <Text margin="x2">
          For example, using the same arrangement of
          circles displayed above, taking the arc a2 (traversing from v1 to v4) the
          connecting arcs are a2, a3, a10 and a11. This condition allows us to exclude
          arcs a2 and a3.
        </Text>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>
          2. The same two arcs cannot have been traversed before
        </WritingParagraph>

        <WritingParagraph>
          Intersecting regions consist of 2 or more arcs, and each intersecting
          region can be identified as unique from as few as 2 of it’s arcs,
          in other words no 2 arcs can be traversed, in any direction, twice.
          Each arc can be identified by the assigned numerical value (from the
          initialisation phase), and can be represented in binary form as a
          Bitset. Each valid traversal of an intersecting region can then be
          stored in a map as a bitwise OR of the two Bitsets. This is then used
          to exit early out of traversals that have been traversed before.
        </WritingParagraph>
      </WritingSection>

      <WritingSection figure>
        <Flex
            alignChildren="middle"
            direction="vertical"
            backgroundColor="light-shade-1"
            padding="x6">
          <Image src={ require('./Image3.svg') } />
        </Flex>

        <Text margin="x2">
          For example, taking a traversal from v1 to v4 to v5 across segments a2
          and a10, would give us a Bitset of ‘10000000100` which is the bitwise
          OR of ‘100` (4) and ‘10000000000` (10). With this Bitset stored, in a
          later traversal, starting from v5 to v4, across segment a10. The next
          connecting segments are again a2, a3, a10 and a11. This condition allows
          us to exclude the segment a2, because even though the traversal of v5
          to v4 to v1 is different to the original traversal of v1 to v4 to v5,
          the Bitsets remain the same.
        </Text>
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

      <WritingSection figure>
        <Flex
            alignChildren="middle"
            direction="vertical"
            backgroundColor="light-shade-1"
            padding="x6">
          <Image src={ require('./Image4.svg') } />
        </Flex>

        <Text margin="x2">
          For example, again using the arrangement of circles from above.
          A traversal of v1 to v4 along a2, we can say that the midpoint of a2
          exists within the circles of c2 and outside the circle c3. From v4,
          the connecting arcs are a2, a3, a10 and a11. The first condition
          rules out a3 and a2, from there we can choose either a10 or a11.
          Both of the midpoints for these arcs validate this condition,
          because they are both inside the circle of c2 and are outside or
          traversing the circumference of c3. For this example let us use a11
          which is traversal to v6. From v6 the next connecting arcs are a6, a7,
          a11 and a12. The first condition again rules out a11 and a12. Using
          this condition, we can rule out a7 because the midpoint exists
          outside the circle of c3. Leaving us with only a6 as a valid
          traversal, and for this specific example this happens to connect
          us back to v1 our starting vector, and thus completing a valid region.
        </Text>
      </WritingSection>

      <WritingSection>
        <WritingParagraph emphasis textColor="text-shade-3">
          * A ‘traversal’ is defined starting from a single intersecting point,
          vⁿ, navigating to another connecting point along an arc.
          The traversal ends when it reaches the traversals starting point
          forming a valid region.
        </WritingParagraph>
      </WritingSection>
    </WritingPage>
  );
};

export default CircleIntersections;
