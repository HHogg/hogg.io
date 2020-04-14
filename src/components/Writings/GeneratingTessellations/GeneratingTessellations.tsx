import * as React from 'react';
import groupBy from 'lodash.groupby';
import {
  BulletPoint,
  BulletPoints,
  Image,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
} from 'preshape';
import data from '../../../data';
import configurations from './configurations-sample.json';
import WritingFig from '../../WritingPage/WritingFig';
import WritingFigs from '../../WritingPage/WritingFigs';
import WritingHeading from '../../WritingPage/WritingHeading';
import WritingPage from '../../WritingPage/WritingPage';
import WritingParagraph from '../../WritingPage/WritingParagraph';
import WritingSection from '../../WritingPage/WritingSection';

const configurationsGrouped = groupBy(configurations, 'vertices');

const GeneratingTesselations = () => {
  return (
    <WritingPage { ...data.writings.GeneratingTessellations }>
      <WritingSection>
        <WritingParagraph>
          <Link href="https://en.wikipedia.org/wiki/Euclidean_tilings_by_convex_regular_polygons" target="GTInfo" underline>Euclidean tilings</Link> are
          constantly applied to many fields of engineering
          (mechanical, civil, etc.). These tessellations are usually named after
          Cundy & Rollett's notation. However, this notation has two main problems
          related to ambiguous conformation and uniqueness. This
          explains the GomJau-Hogg’s notation for generating all of the regular,
          semiregular (uniform) and demiregular (k-uniform, up to at least k=3) in a
          consistent, unique and unequivocal manner. Moreover, it's implemented
          in the <Link href="https://antwerp.hogg.io" target="Antwerp" underline>Antwerp application</Link>, which
          is publicly shared to prove that all the basics tilings can be obtained
          directly from the GomJau-Hogg’s notation.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingHeading>
          1 Introduction
        </WritingHeading>

        <WritingParagraph>
          Euclidean tiling is the covering of a plane where the repetition of regular
          polygons make up tiles, which through symmetry operations can be extended
          indefinitely without any overlapping [1]. There are three types of tilings:
        </WritingParagraph>

        <BulletPoints margin="x4">
          <BulletPoint>
            <Text inline strong>Regular</Text> tilings consist of a single polygon type,
            with each vertex surrounded by the same kinds of polygons (vertex-transitive).
            There are only 3 of them, having six equilateral triangles,
            four squares or three regular hexagons at any vertex.
          </BulletPoint>

          <BulletPoint>
            <Text inline strong>Semiregular</Text> tilings (Archimedean or uniform)
            are polymorphic (several polygon types) and also vertex-transitive.
            There are only 8 of them.
          </BulletPoint>

          <BulletPoint>
            <Text inline strong>Demiregular</Text> tilings (k-uniform) like semiregular
            tilings are polymorphic but are not vertex-transitive. For instance,
            there are 20 2-uniform tessellations and there are 61 3-uniform
            (22 are 2-vertex and 39 are 3-vertex types).
          </BulletPoint>
        </BulletPoints>
      </WritingSection>

      <WritingFigs maxWidth="900px">
        <WritingFig description="Semiregular tiling 3².4.3.4" number={ 1 } >
          <Image src={ require('./writings-tiling-1.svg') } />
        </WritingFig>

        <WritingFig description="2-Uniform tiling 3.4.6.4; 3.4².6" number={ 2 } >
          <Image src={ require('./writings-tiling-1.svg') } />
        </WritingFig>

        <WritingFig description="Semiregular tiling 4.6.12" number={ 3 } >
          <Image src={ require('./writings-tiling-1.svg') } />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          Tiling configurations are usually named using Cundy & Rollett's notation [2],
          which adapted the <Link href="https://en.wikipedia.org/wiki/Schl%C3%A4fli_symbol" target="GTInfo" underline>Schläfli symbol</Link>. This notation represents i) the number of
          vertices, ii) the number of polygons around each vertex (arranged clockwise)
          and iii) the number of sides to each of those polygons. For example: 3⁶;3⁶;3⁴.6,
          tells us there are 3 vertices with 2 different vertex types, so this
          tiling would be classed as a '3-uniform (2-vertex types)' tiling.
          Broken down, 3⁶;3⁶, or (3⁶)², tells us that there are 2 vertices (denoted
          by the superscript 2), each with 6 equilateral triangles. With a final
          vertex 3⁴.6 of 4 more 3 contiguous equilateral triangles and a single
          regular hexagon.
        </WritingParagraph>

        <WritingParagraph>
          However, this notation has two main problems. First, when it comes to
          k-uniform tilings, the notation does not explain the relationships between
          the vertices. This makes it impossible to generate a covered plane given
          the notation alone.
        </WritingParagraph>

        <WritingParagraph>
          Let’s take the above notation as an example, (3⁶)²; 3⁴.6: If a single
          vertex was placed, surrounded by 4 triangles and a hexagon, there would
          be 3 other vertices with 2 triangles. From here either the vertex type
          of (3⁶)² or 3⁴.6 is possible, and the notation gives no indication to
          which is correct. Both tessellations, with the same nomenclature, are
          represented in Fig. 1. Therefore, the second problem is that this
          nomenclature is not unique for each tessellation [3].
        </WritingParagraph>
      </WritingSection>

      <WritingFigs>
        <WritingFig description="3-Uniform tiling (3⁶)²; 3⁴.6" number={ 4 }>
          <Image src={ require('./writings-tiling-4.svg') } />
        </WritingFig>

        <WritingFig description="3-Uniform tiling (3⁶)²; 3⁴.6" number={ 5 }>
          <Image src={ require('./writings-tiling-5.svg') } />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingHeading>2 GomJau-Hogg’s notation: a new notation</WritingHeading>

        <WritingParagraph>
          Here we present the GomJau-Hogg’s notation, a slightly modified version
          of the research and notation presented by Gómez-Jáuregui et al. [3], about
          the generation and nomenclature of tessellations and double-layer grids.
          The origin of that notation is inspired by Otero’s work [1] about domes
          and spatial frames. The present work allows for the infinite generation
          of regular polygon tilings through a set of shape placement stages and
          iterative rotation and reflection operations.
        </WritingParagraph>

        <WritingParagraph>
          Several examples will be used in the following sections. The above mentioned
          (3⁶)²; 3⁴.6 (one of the two variants) is translated to 6-3-3/m30/r30(2e).
          The stages are represented as blocks separated by a forward-slash (/).
          When split up, the very first block is the "Shape placement" stage,
          which takes care of placing the first regular polygons on the plane.
          The blocks after this are the transformation functions, of which there
          will be two or more of.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>Stage 1: Shape placement</WritingParagraph>

        <WritingParagraph>
          The shape placement stage is made up of a series of hyphen (-) separated
          phases. Similar to the Cundy & Rollett's notation, each number represents
          the number of sides on the polygon. The very first phase will always
          contain a single number of either 3, 4, 6, 8 or 12 (there are seventeen
          combinations of regular polygons whose internal angles add up to 360°,
          however only eleven of these can occur in regular polygon tilings).
          This defines the ‘seed polygon’, which is the first shape to be
          placed at the origin of the area to be covered.
        </WritingParagraph>

        <WritingParagraph>
          The seed polygon is always (except for the 3 sided polygon, equilateral
          triangle) placed at the origin of the plane so that the two sides that
          intersect the horizontal axis "x", stay perpendicular to that axis"
          (Fig. 6, left). For an equilateral triangle the left-hand edge will be
          the one perpendicular to the x axis and will be aligned with the vertical
          axis 'y' [3]. There are some variations, when letters B (Bottom), L (Left),
          M (Middle) or a combination of them are added to the seed polygon. For
          instance, 4BL means that the origin of the tessellation is at the
          Bottom Left vertex of the square, and 3ML means that the origin of the
          tessellation is at the Middle of the Left edge.
        </WritingParagraph>

        <WritingParagraph>
          Following the seed polygon phase, shapes are systematically placed
          clockwise around the available sides of the previously placed phase
          of shapes, using 0 to skip a side of a polygon.
        </WritingParagraph>

        <WritingParagraph>
          Let’s use the above configuration example (3⁶)²; 3⁴.6, in its former
          notation, which would become 6-3-3/m30/r30(2e) in GomJau-Hogg’s
          notation (Fig. 6). With this new notation as shown above, the shape
          placement stages consist of:
        </WritingParagraph>

        <BulletPoints margin="x4" numbered>
          <BulletPoint>
            A seed polygon with 6 sides (a hexagon)
          </BulletPoint>
          <BulletPoint>
            A following phase with a 3 sided shape (equilateral triangle);
            placed on the first side clockwise of the y axis
          </BulletPoint>
          <BulletPoint>
            Followed by a final phase of one triangle; placed on the
            first available side clockwise, of the previously placed triangle.
          </BulletPoint>
        </BulletPoints>
      </WritingSection>

      <WritingFigs>
        <WritingFig description="Equation formatting: 6-...(left); 6-3...(center); 6-3-3...(right)" number={ 6 }>
          <Image src={ require('./writings-tiling-6.svg') } />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph strong>Stage 2: Transformation functions</WritingParagraph>

        <WritingParagraph>
          The stages following the first shape placement stage are a series of
          transformation functions that take all of the shapes currently placed on
          the plane and either rotate or reflect them by a specified angle
          (when no angle is specified it defaults to 180°). The center of the
          transformation can also be specified, which defaults to the origin of
          the coordinate system.
        </WritingParagraph>

        <WritingParagraph>
          The type of transformation is represented in the notation by a single
          character. An 'm' (mirror) applies a reflection transformation and a 'r'
          applies a rotation transformation. When specifying the center of the
          transformation (between parentheses), it also slightly changes the
          behaviour of the ensuing transformation result. There are 3 types of
          transformation centers, explained in following lines.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>Origin 1. Origin of the coordinate system</WritingParagraph>

        <WritingParagraph>
          This is the default center type and, when used, the transformation is
          applied continuously by incrementing the angle on each transformation
          by a factor of 2. This is done while the accumulated angle is less than
          a full rotation on the plane (e.g. 360°). This is the case for both
          reflection and rotation transforms. With every iteration of the transform,
          all shapes on the plane including those from previous iterations of the
          same transform are then duplicated (there may be overlapping of a
          polygon over the same shape, which would be automatically merged).
        </WritingParagraph>

        <BulletPoints margin="x4" numbered>
          <BulletPoint>
            Reflect 30° the elements of the previous phase (Fig. 6, right)
          </BulletPoint>
          <BulletPoint>
            Reflect 60° (30° x2) the result of the previous transformation
          </BulletPoint>
          <BulletPoint>
            Reflect 120° (60° x2) the result of the previous transformation
          </BulletPoint>
          <BulletPoint>
            Reflect 240° (120° x2) the result of the previous transformation.
            This is the last reflection as 240° x2 is 480° and is above the
            360° limit
          </BulletPoint>
        </BulletPoints>
      </WritingSection>

      <WritingFigs maxWidth="900px">
        <WritingFig description="Repeating the transformation m30 (or Mirror 30°)" number={ 7 }>
          <Image src={ require('./writings-tiling-7.svg') } />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph strong>Origin 2. Edge of a polygon (e)</WritingParagraph>

        <WritingParagraph>
          There will always be a need for two or more transforms to completely
          cover a plane. At least one of these transform functions will need to
          shift the transform’s center from the origin of the coordinate
          system in order to expand the collection of shapes out to increase
          the area coverage. One option is doing it by shifting the transform’s
          center to the edge (e) of another shape.
        </WritingParagraph>

        <WritingParagraph>
          Unlike when the transform’s center is at the origin of the plane,
          transforms with its center elsewhere are not continuous. In other
          words, they are performed only once before moving onto the
          next transform.
        </WritingParagraph>

        <WritingParagraph>
          The notation for shifting the transform’s center to a shape's edge is done
          by specifying the angle between the center-origin line and the y axis and
          then counting how many intersecting edges from the origin of the plane
          it is. For example, let’s take the transform function r30(2e), ‘e’ meaning
          edge, of the above mention example 6-3-3/m30/r30(2e) (Fig. 8).
          Let’s imagine a line drawn starting from the origin of the plane with an
          endpoint at 30°. The second edge intersecting that line would become the
          transform's center, in which the shapes are then rotated by 180°. A
          variation is using the particle 'v' for vertex.
        </WritingParagraph>

        <WritingParagraph>
          When shifting the transform’s center to the edge of a polygon for a
          reflection transform (m), it will never be needed to provide a
          transformation angle. This is because anything other than the angle
          of the intersecting edge will result in an incorrect overlapping
          and invalid tessellations. The only valid and correct angle can
          easily be inferred from the angle of the intersecting edge.
        </WritingParagraph>
      </WritingSection>

      <WritingFigs>
        <WritingFig description="Transformation function r30(2e)" number={ 8 }>
          <Image src={ require('./writings-tiling-8.svg') } />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph strong>Origin 3. Center of a polygon (c)</WritingParagraph>

        <WritingParagraph>
          Similar to shifting the transform’s center to the edge of a shape, it can
          also be shifted to the center (c) point of a polygon. However, there are
          a couple of differences. The format of the notation is very similar,
          except this origin type is represented by a ‘c’ (for center) instead
          of an ‘e’ (for edge). Instead of specifying the number of intersecting
          edges, it is simply the number of intersecting shapes (excluding the
          seed polygon). This also allows for some flexibility in the angle of the
          intersection line as it does not have to target the center point of the
          shape exactly. The polygon simply needs to be intersected by that line.
          Unlike the edge center type (e), when this is applied on a reflection
          transform (m), the angle of the transform is always respected.
        </WritingParagraph>

        <WritingParagraph>
          In the [3³.4²; 3².4.3.4]¹ configuration (Fig. 9), which becomes
          the 4-3,3-4,3/r90/m60(2c) in GomJau-Hogg’s notation, the second
          transformation function is m60(2c). This means that there is a
          mirror reflection over a line perpendicular to the intersection
          angle (60°), at the center of the second intersecting polygon.
        </WritingParagraph>
      </WritingSection>

      <WritingFigs>
        <WritingFig description="Transformation function m60(2c)" number={ 9 }>
          <Image src={ require('./writings-tiling-9.svg') } />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph strong>Origin 4. Halfway of an edge (h)</WritingParagraph>

        <WritingParagraph>
          Another option for choosing the transform’s center is selecting the
          halfway (h) or middle point of an edge. Sometimes, the line drawn
          from the origin at a certain angle has the same direction as an
          edge between two polygons; therefore, both are collinear. Then,
          it can be useful to select the halfway point of that edge. Thus,
          instead of selecting the letters ‘e’ or ‘c’, the particle ‘h’
          will be added after the number of edges intersected by the line
          starting at the origin.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>Stage 3: Repeating the transformations</WritingParagraph>

        <WritingParagraph>
          This is the final stage to completing the tiling, and it consists on repeating
          over the transformation functions as many times as are needed. This
          should not result in any incorrect shape overlaps (apart from those merged
          from the transformation functions), and it should continuously and
          indefinitely grow. Using the above example, both transformation
          functions m60 and r30(2e) are continuously repeated, each time
          taken the shapes that are currently on the plane (Fig. 4).
        </WritingParagraph>
      </WritingSection>

      <WritingSection
          backgroundColor="background-shade-2"
          padding="x6"
          size="x1">
        <WritingParagraph>
          <Text inline strong>Table 1.</Text> Transformation
          of Cundy & Rollett’s notation to GomJau-Hogg’s notation, up to k=2.
        </WritingParagraph>

        <Table size="x1" >
          <TableHeader>
            <TableRow>
              <TableHeaderCell>
                Cundy & Rollett
              </TableHeaderCell>

              <TableHeaderCell>
                GomJau-Hogg
              </TableHeaderCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            { Object
              .entries(configurationsGrouped)
              .map(([groupKey, configurations]) => (
                <React.Fragment key={ groupKey }>
                  <TableRow>
                    <TableCell colSpan={ 2 }>
                      <Text strong uppercase>{ groupKey }</Text>
                    </TableCell>
                  </TableRow>

                  { configurations.map(({ cundyRollett, gomJauHogg }, index) => (
                    <TableRow key={ index }>
                      <TableCell>
                        { cundyRollett }
                      </TableCell>

                      <TableCell>
                        { gomJauHogg }
                      </TableCell>
                    </TableRow>
                  )) }
                </React.Fragment>
              )) }
          </TableBody>
        </Table>
      </WritingSection>

      <WritingSection>
        <Text margin="x6">
          <Text strong>Harrison Hogg</Text>
          <Text>Software Engineer</Text>
        </Text>

        <Text>
          <Text strong>Valentin Gomez Jauregui</Text>
          <Text>Professor of Graphic Expression in Engineering</Text>
          <Text>University of Cantabria</Text>
        </Text>
      </WritingSection>

      <WritingSection>
        <WritingHeading>
          References
        </WritingHeading>

        <BulletPoints margin="x4" numbered>
          <BulletPoint>
            Otero, C. (1990). Diseño geométrico de cúpulas no esféricas aproximadas
            por mallas triangulares con un número mínimo de longitudes de barra.
            PhD Thesis, Univ. Cantabria, Spain.
          </BulletPoint>

          <BulletPoint>
            Cundy, H. M., and Rollett, A. P. (1981). Mathematical Models, Tarquin, Stradbroke, UK.
          </BulletPoint>

          <BulletPoint>
            Gomez-Jauregui, V., Otero, C., Arias, R., Manchado, C. (2012). Generation
            and Nomenclature of Tessellations and Double-Layer Grids. Journal of
            Structural Engineering. Pp. 138.843–852. 10.1061/(ASCE)ST.1943-541X.0000532.
          </BulletPoint>
        </BulletPoints>
      </WritingSection>
    </WritingPage>
  );
};

export default GeneratingTesselations;
