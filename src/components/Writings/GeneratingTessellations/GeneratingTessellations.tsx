import * as React from 'react';
import groupBy from 'lodash.groupby';
import { Antwerp } from '@hhogg/antwerp';
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
import configurations from '@hhogg/antwerp/configurations.json';
import AntwerpExample from './AntwerpExample';
import WritingFig from '../../WritingPage/WritingFig';
import WritingFigs from '../../WritingPage/WritingFigs';
import WritingHeading from '../../WritingPage/WritingHeading';
import WritingPage from '../../WritingPage/WritingPage';
import WritingParagraph from '../../WritingPage/WritingParagraph';
import WritingSection from '../../WritingPage/WritingSection';

const configurationsGrouped = groupBy(configurations, 'vertices');

const GeneratingTessellations = () => {
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
          <AntwerpExample
              configuration="4-3-3,4/r90/r(4)"
              shapeSize={ 50 } />
        </WritingFig>

        <WritingFig description="2-Uniform tiling 3.4.6.4; 3.4².6" number={ 2 } >
          <AntwerpExample
              configuration="6-4-3,4-6/m30/r(15)"
              shapeSize={ 50 } />
        </WritingFig>

        <WritingFig description="Semiregular tiling 4.6.12" number={ 3 } >
          <AntwerpExample
              configuration="12-6,4/m30/r(10)"
              shapeSize={ 50 } />
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
          which is correct. All three tessellations, with the same nomenclature, are
          represented in Fig. 4, 5 & 6. Therefore, the second problem is that this
          nomenclature is not unique for each tessellation [3].
        </WritingParagraph>
      </WritingSection>

      <WritingFigs maxWidth="900px">
        <WritingFig description="3-Uniform tiling [(3⁶)²; 3⁴.6]¹" number={ 4 }>
          <AntwerpExample
              configuration="6-3-3/m30/r(9)"
              shapeSize={ 50 } />
        </WritingFig>

        <WritingFig description="3-Uniform tiling [(3⁶)²; 3⁴.6]²" number={ 5 }>
          <AntwerpExample
              configuration="6-3-3-3-0,3/m30/r(3)"
              shapeSize={ 50 } />
        </WritingFig>

        <WritingFig description="3-Uniform tiling [(3⁶)²; 3⁴.6]³" number={ 6 }>
          <AntwerpExample
              configuration="6-3-3,3-3-3-0,3/r60/r(14)"
              shapeSize={ 50 } />
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
          (3⁶)²; 3⁴.6 (one of the three variants) is translated to 6-3-3/m30/r(9).
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
          (Fig. 7). For an equilateral triangle the left-hand edge will be
          the one perpendicular to the x axis and will be aligned with the vertical
          axis 'y' [3].
        </WritingParagraph>

        <WritingParagraph>
          Following the seed polygon phase, shapes are systematically placed
          clockwise around the available sides of the previously placed phase
          of shapes, using 0 to skip a side of a polygon.
        </WritingParagraph>

        <WritingParagraph>
          Let’s use the above configuration example (3⁶)²; 3⁴.6, in its former
          notation, which would become 6-3-3/m30/r(9) in GomJau-Hogg’s
          notation (Fig. 7). With this new notation as shown above, the shape
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
        <WritingFig description="Equation formatting: 6-3-3" number={ 7 }>
          <AntwerpExample
              animate
              configuration="6-3-3"
              shapeSize={ 100 }
              showAxis90 />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph strong>Stage 2: Transformation functions</WritingParagraph>

        <WritingParagraph>
          The stages following the first shape placement stage are a series of
          transformation functions that take all of the shapes currently placed on
          the plane and either rotate or reflect them by a specified angle
          (when no angle is specified it defaults to 180°). The origin of the
          transformation can also be specified, which defaults to the center of
          the coordinate system.
        </WritingParagraph>

        <WritingParagraph>
          The type of transformation is represented in the notation by a single
          character. An 'm' (mirror) applies a reflection transformation and a 'r'
          applies a rotation transformation. When specifying the center of the
          transformation (between parentheses), it also slightly changes the
          behaviour of the ensuing transformation result. There are 2 types of
          transformation centers, explained in following lines.
        </WritingParagraph>
      </WritingSection>

      <WritingSection>
        <WritingParagraph strong>Origin 1. Center of the coordinate system</WritingParagraph>

        <WritingParagraph>
          This is the default origin type and, when used, the transformation is
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
            Reflect 30° the elements of the previous phase (Fig. 7)
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
        <WritingFig description="Repeating the transformation m30 (or Mirror 30°) in 6-3-3/m30" number={ 8 }>
          <AntwerpExample
              animate
              configuration="6-3-3/m30"
              shapeSize={ 100 }
              showTransforms />
        </WritingFig>

        <WritingFig description="Repeating the transformation r90 (or Rotate 90°) in 4-3-3,4/r90" number={ 9 }>
          <AntwerpExample
              animate
              configuration="4-3-3,4/r90"
              shapeSize={ 100 }
              showTransforms />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph strong>Origin 2. Vertices</WritingParagraph>

        <WritingParagraph>
          There will always be a need for two or more transforms to completely
          cover a plane. At least one of these transform functions will need to
          shift the transform’s origin from the center of the coordinate
          system in order to expand the collection of shapes out to increase
          the area coverage. This is done by shifting the transform’s
          origin to the vertex of either, a vertex of a shape, the centroid of
          a shape or a midpoint of a line segment of a shape.
        </WritingParagraph>

        <WritingParagraph>
          Unlike when the transform’s origin is at the center of the plane,
          transforms with its origin elsewhere are not continuous. In other
          words, they are performed only once before moving onto the
          next transform.
        </WritingParagraph>

        <WritingParagraph>
          The notation for shifting the transform’s origin is done
          by specifying the vertex index. The vertices available for a transform
          are systematically indexed prior to the transformation and are ordered by their
          distance and angle, relative to the center of the coordinate system.
        </WritingParagraph>

        <WritingParagraph>
          Taking the configuration 3-6 (Fig 10), there are 16 vertices in total,
          made up of 2 shape centroids, 6 shape vertices (the endpoints of the line
          segments) and 8 line segment midpoints. Excluding the coordinate system center
          vertex.
        </WritingParagraph>

        <WritingParagraph>
          Starting at 0° of the coordinate system, there are 4 vertices that exist at this
          angle, labelled 1, 2, 3 and 4 in order of the shortest distance to the origin. Followed
          by vertex 5 which is next in turn by angle to the origin, and so on. As an example
          it would then be possible to reflect over the 12th vertex by specifying m(12) in the
          notation (Fig 11), and the vertices would be reindexed for the next transformation
          function.
        </WritingParagraph>
      </WritingSection>

      <WritingFigs maxWidth="900px">
        <WritingFig description="Equation formatting: 6-3-3" number={ 10 }>
          <AntwerpExample
              configuration="3-6"
              shapeSize={ 100 }
              showAxis90
              showVertices />
        </WritingFig>

        <WritingFig description="Equation formatting: 6-3-3/m(12)" number={ 11 }>
          <AntwerpExample
              configuration="3-6/m(12)"
              shapeSize={ 100 }
              showAxis90
              showTransforms
              showVertices />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph>
          When specifying the vertex of a shapes centroid (Fig 12) or vertex (Fig 13), the angle that
          is used for the transformation is inferred from the angle of that vertex
          relative to the center of the coordinate system. However, when using
          the midpoint of line segment (the shapes edge, as shown in Fig 11), the angle for the transform
          is inferred from the angle of that edge because any other angle would result in an
          incorrect overlapping and an invalid tesselation.
        </WritingParagraph>
      </WritingSection>

      <WritingFigs maxWidth="900px">
        <WritingFig description="Equation formatting: 3-6/m30/r(9)" number={ 12 }>
          <AntwerpExample
              configuration="3-6/m30/r(9)"
              maxRepeat={ 0 }
              shapeSize={ 50 }
              showAxis90
              showTransforms />
        </WritingFig>

        <WritingFig description="Equation formatting: 12-3,4-3,3/m30/r(3)" number={ 13 }>
          <AntwerpExample
              configuration="12-3,4-3,3/m30/r(3)"
              maxRepeat={ 0 }
              shapeSize={ 100 }
              showAxis90
              showTransforms />
        </WritingFig>
      </WritingFigs>

      <WritingSection>
        <WritingParagraph strong>Stage 3: Repeating the transformations</WritingParagraph>

        <WritingParagraph>
          This is the final stage to completing the tiling, and it consists on repeating
          over the transformation functions as many times as are needed, each time taken
          the shapes that are currently on the plane. This
          should not result in any incorrect shape overlaps (apart from those merged
          from the transformation functions), and it should continuously and
          indefinitely grow. As show in Fig 14.
        </WritingParagraph>
      </WritingSection>

      <WritingFigs maxWidth="900px">
        <WritingFig description="Equation formatting: 4-3-3-0,4/r90/r(5)" number={ 14 }>
          <AntwerpExample
              animate
              configuration="4-3-3-0,4/r90/r(5)"
              shapeSize={ 75 }
              showTransforms />
        </WritingFig>
      </WritingFigs>

      <WritingSection
          backgroundColor="background-shade-2"
          padding="x6"
          size="x1">
        <WritingParagraph>
          <Text inline strong>Table 1.</Text> Transformation
          of Cundy & Rollett’s notation to GomJau-Hogg’s notation, up to { configurations[configurations.length - 1].vertices }
          . All of these can be seen in the Tilings explorer application <Link href="https://antwerp.hogg.io/library" target="_Antwerp">https://antwerp.hogg.io/library</Link>
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

export default GeneratingTessellations;
