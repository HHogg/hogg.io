import React, { Component } from 'react';
import {
  Code,
  BulletPoint,
  BulletPoints,
  Flex,
  Grid,
  GridItem,
  Link,
  Responsive,
  Text,
} from 'preshape';
import {
  interpolateGnBu,
  interpolateOrRd,
  interpolatePuBu,
  interpolateRdPu,
} from 'd3-scale-chromatic';
import { widthSmall, widthMedium } from '../../Root';
import Project from '../../Project/Project';
import Tiling from './Tiling';
import { findByA } from './findConfigurations';
import TilingEditor from './TilingEditor';

const exampleConfig = '(3⁶)²; 3⁴.6';

export default class EuclideanTiling extends Component {
  render() {
    return (
      <Project { ...this.props } gap="x10" maxWidth={ widthMedium }>
        <Flex>
          <TilingEditor configuration={ findByA('[3⁶; 3⁴.6]²') } />
        </Flex>

        <Flex>
          <Text margin="x4">
            Euclidean tiling are a covering of a plane where the repetition of
            polygons make up tiles, which through symmetry operations can be
            extended indefinitely without any overlapping.
            There are three types of tilings:
          </Text>

          <BulletPoints>
            <BulletPoint>
              <Link href="https://en.wikipedia.org/wiki/Euclidean_tilings_by_convex_regular_polygons#Regular_tilings" underline>Regular tilings</Link> consist
              of a single polygon type, with each vertex surrounded by the same kinds of polygons (<Link href="https://en.wikipedia.org/wiki/Isogonal_figure" underline>vertex-transitive</Link>).
            </BulletPoint>

            <BulletPoint>
              <Link href="https://en.wikipedia.org/wiki/Euclidean_tilings_by_convex_regular_polygons#Archimedean,_uniform_or_semiregular_tilings" underline>Semiregular tilings (uniform)</Link> are
              polymorphic and like regular tilings are vertex-transitive.
            </BulletPoint>

            <BulletPoint>
              <Link href="https://en.wikipedia.org/wiki/Euclidean_tilings_by_convex_regular_polygons#k-uniform_tilings" underline>Demiregular tilings (k-uniform)</Link> like
              semiregular tilings are polymorphic but are not vertex-transitive.
            </BulletPoint>
          </BulletPoints>
        </Flex>

        <Responsive queries={ [widthSmall] }>
          { (match) => (
            <Grid
                columnCount={ match(widthSmall) ? '3' : '1' }
                columnWidth="1fr"
                gap="x4">
              <Tiling
                  colorScale={ interpolatePuBu }
                  configuration={ findByA('[3³.4²; 3².4.3.4]¹') }
                  height="16rem"
                  showConfiguration
                  size={ 64 }
                  theme="day" />

              <Tiling
                  colorScale={ interpolateOrRd }
                  configuration={ findByA('3.4.6.4; 3.4².6') }
                  height="16rem"
                  showConfiguration
                  size={ 64 }
                  theme="day" />

              <Tiling
                  colorScale={ interpolateGnBu }
                  configuration={ findByA('4.6.12') }
                  height="16rem"
                  showConfiguration
                  size={ 64 }
                  theme="day" />
            </Grid>
          ) }
        </Responsive>

        <Flex>
          <Text margin="x4">
            Tiling configurations are usually named using a notation,
            which represents the number of vertices; the number of polygons
            around each vertex (arranged clockwise) and the number of sides to each
            of those polygons. For example:
          </Text>

          <Text align="middle" margin="x8" size="x3">
            <Code>(3⁶)²; 3⁴.6</Code>
          </Text>

          <Text margin="x4">
            This notation (Cundy & Rollett's) tells us there are 3 vertices with 2 different
            vertex types, so this tiling would be classed as a '3-uniform (2 vertex types)' tiling.
            Broken down, <Code>(3⁶)²</Code> tells us there are 2 vertices (denoted by the superscript 2),
            each with 6, 3 sided polygons (equilateral triangles). With a final vertex (<Code>3⁴.6</Code>)
            of 4 more 3 sided polygons and a single 6 sided polygon (hexagon).
          </Text>

          <Text margin="x4">
            However, this notation has a problem. When it comes to k-uniform tilings,
            the notation does not explain the relationships between the vertices. This
            makes it impossible to generate a covered plane given the notation alone.
            Taking the above <Code>{ exampleConfig }</Code> notation as an example. If a single
            vertex was placed, surrounded by 4, 3 sided polygons and a 6 sided polygon,
            there would be 3 other vertices with 2, 3 sided polygons. From here either
            the vertex type of <Code>(3⁶)²</Code> or <Code>3⁴.6</Code> is possible, and
            the notation gives no indication to which is correct.
          </Text>
        </Flex>

        <Flex>
          <Tiling
              colorScale={ interpolateRdPu }
              configuration={ findByA('3⁶; 3².4.3.4') }
              height="10rem"
              showConfiguration
              size={ 64 }
              theme="day" />
        </Flex>

        <Flex>
          <Text heading margin="x4" size="x5">An Expressive and Generative Notation</Text>

          <Text margin="x4">
            This is a slightly modified version of the research and notation presented
            by <Link href="https://www.researchgate.net/profile/Valentin_Gomez-Jauregui" underline>Valentin Gomez-Jauregui</Link>,
            in <Link href="https://www.researchgate.net/publication/228781975_Generation_and_Nomenclature_of_Tessellations_and_Double-Layer_Grids" underline>Generation
            and nomenclature of tessellations and double-layer grids</Link>,
            that allows for the infinite generation of regular polygon tilings through a
            set of shape placement stages and iterative rotation and reflection operations.
          </Text>

          <Text margin="x4">
            The stages are represented as forward-slash (<Code>/</Code>) separated blocks. When
            split up, the very first block is the "Shape placement" stage, this
            takes care of placing the regular polygons on the plane. The blocks
            after this are the transformation functions, of which there can be two or more of.
          </Text>
        </Flex>

        <Flex>
          <Text heading margin="x4" size="x4">Stage 1: Shape placement</Text>

          <Text margin="x4">
            The shape placement stage is made up of a series of hyphen (<Code>-</Code>) separated
            phases. Similar to the Cundy & Rollett's notation, each number
            represents the number of sides on the polygon. The very first phase
            will always contain a single number of either 3, 4, 6, 8 or 12* (see 'Angles' at the end to
            understand why these are the only possible shapes). This defines the
            'seed' shape which is the first shape to be placed at the center of the
            area to be covered.
          </Text>

          <Text margin="x4">
            The seed shape is always (except for 3 sided polygon) placed at the
            center of the plane so that "the two sides that intersect the horizontal
            axis "x", stay perpendicular to that axis" <Text emphasis inline>(V. Gomez-Jauregui, 2012)</Text>, as shown below.
            For a 3 sided polygon "the left-hand edge will be the one perpendicular
            to the x axis and will be aligned with the vertical axis 'y'" <Text emphasis inline>(V. Gomez-Jauregui, 2012)</Text>.
          </Text>
        </Flex>

        <Flex>
          <Responsive queries={ [widthSmall] }>
            { (match) => (
              <Grid
                  alignChildren="middle"
                  columnCount={ match(widthSmall) ? '5' : '3' }
                  columnWidth="1fr"
                  gap="x4">
                { ['3', '4', '6', '8', '12'].map((type) => (
                  <GridItem key={ type }>
                    <Tiling
                        borderSize={ null }
                        colorScale={ interpolateRdPu }
                        configuration={ { b: type } }
                        height="8rem"
                        showAxis
                        size={ 64 } />

                    <Text align="middle" margin="x2" size="x1" strong>
                      { type } Sides
                    </Text>
                  </GridItem>
                )) }
              </Grid>
            ) }
          </Responsive>
        </Flex>

        <Flex>
          <Text margin="x4">
            Following the seed shape phase, shapes are systematically placed clockwise
            around the available sides of the previously placed phase of shapes,
            using <Code>0</Code> to skip a side of a polygon.
          </Text>
        </Flex>

        <Flex alignChildren="middle" direction="vertical">
          <Flex width="8rem">
            <Tiling
                animate
                borderSize={ null }
                colorScale={ interpolateRdPu }
                configuration={ { b: findByA(exampleConfig).b.split('/')[0] } }
                disableRepeating
                height="8rem"
                showAxis
                size={ 64 } />
          </Flex>

          <Text align="middle" margin="x2" size="x3">
            <Code>{ findByA(exampleConfig).b.split('/')[0] }/...</Code>
          </Text>

          <Text margin="x4" maxWidth="36rem">
            Using the <Code>{ exampleConfig }</Code> configuration as an example. With
            this new notation as shown above, the shape placement stages consist of:
          </Text>

          <BulletPoints maxWidth="36rem" numbered>
            <BulletPoint>
              A seed shape with 6 sides (a hexagon).
            </BulletPoint>

            <BulletPoint>
              A following phase with a 3 sided shape (triangle); placed
              on the first side clockwise of the y axis
            </BulletPoint>

            <BulletPoint>
              Followed by a final phase of two 3 sided shapes; placed on the only
              two available sides from the previously placed triangle.
            </BulletPoint>
          </BulletPoints>
        </Flex>

        <Flex>
          <Text heading margin="x4" size="x4">Stage 2: Transformation functions</Text>

          <Text margin="x4">
            The stages following the first shape placement stage are a series
            of transformation functions that take all of the shapes currently
            placed on the plane and either rotate or reflect them by a specified
            angle (when no angle is specified it defaults to 180°). The origin of the transformation can also be specified, which
            defaults to the center of the plane.
          </Text>

          <Text margin="x4">
            The type of transformation is represented in the notation by a single
            character. An '<Code>m</Code>' (mirror) applies a reflection transformation
            and a '<Code>r</Code>' applies a rotation transformation. When
            specifying the origin of the transformation, it also slightly changes
            the behaviour of the ensuing transformation result.
          </Text>

          <Text margin="x4">
            There are 3 types of transformation origins...
          </Text>
        </Flex>

        <Flex>
          <Text margin="x4" strong>Origin 1. Center of the plane</Text>

          <Text margin="x4">
            This is the default origin type and when used, the transformation is
            applied continuously by incrementing the angle on each transformation by
            a factor of 2. This is done while the accumulated angle is less than
            360°. This is the case for both reflection and rotation transforms. With
            every iteration of the transform, all shapes on the plane including those
            from previous iterations of the same transform are then duplicated.
          </Text>
        </Flex>

        <Flex alignChildren="middle" direction="vertical">
          <Flex width="8rem">
            <Tiling
                animate
                borderSize={ null }
                colorScale={ interpolateRdPu }
                configuration={ { b: findByA(exampleConfig).b.split('/').slice(0, 2).join('/') } }
                disableRepeating
                height="8rem"
                showAxis
                showTransforms
                size={ 64 } />
          </Flex>

          <Text align="middle" size="x3">
            <Code>{ findByA(exampleConfig).b.split('/').slice(0, 2).join('/') }/...</Code>
          </Text>

          <Text margin="x4" maxWidth="36rem">
            Using the <Code>{ exampleConfig }</Code> configuration as an example.
            The first transformation operation is <Code>m60</Code> (reflect at the
            center of the plane by 60°). So all of the transformational
            operations performed would be:
          </Text>

          <BulletPoints maxWidth="36rem" numbered>
            <BulletPoint>Reflect 60°</BulletPoint>
            <BulletPoint>Reflect 120° (60° x2)</BulletPoint>
            <BulletPoint>Reflect 240° (120° x2). This is the last reflection as 240° x2 is 480° and is above the 360° limit.</BulletPoint>
          </BulletPoints>
        </Flex>

        <Flex>
          <Text margin="x4" strong>Origin 2. Edge of a shape</Text>

          <Text margin="x4">
            There will always be a need for two or more transforms in order to completely
            cover a plane. At least one of these transform functions will need to
            shift the origin in order to expand the collection of shapes out to
            increase the area coverage. One way to do this is by shifting the origin
            to the edge of another shape.
          </Text>

          <Text margin="x4">
            Unlike when the origin is at the center of the plane, transforms with
            it's origin elsewhere are not continuous. In other words they are performed
            only once before moving onto the next transform.
          </Text>

          <Text margin="x4">
            The notation for shifting the origin to a shape's edge is done by specifying at
            what angle the point of origin is from the y axis and how many intersecting
            edges from the center point of the plane it is. For example, take the
            transform function <Code>r30(2e)</Code>. Imagine a line drawn starting
            from the center of the plane with an endpoint at 30°. The second edge
            intersecting that line would become the transform's new point of origin. In
            which the shapes are then rotated by 180°. However this 180° is now relative
            to the intersecting line, and the center point of the plane becomes 0°.
          </Text>
        </Flex>

        <Flex alignChildren="middle" direction="vertical">
          <Flex width="14rem">
            <Tiling
                animate
                borderSize={ null }
                colorScale={ interpolateRdPu }
                configuration={ { b: findByA(exampleConfig).b } }
                disableRepeating
                height="20rem"
                showAxis
                showTransforms
                size={ 64 } />
          </Flex>

          <Text align="middle" margin="x2" size="x3">
            <Code>{ findByA(exampleConfig).b }</Code>
          </Text>

          <Text margin="x4" maxWidth="36rem">
            Using the <Code>{ exampleConfig }</Code> configuration as an example.
            The second transformation function is <Code>r30(2e)</Code> (rotate 180° at the
            edge of the second intersecting shape at 30°).
          </Text>

          <Text margin="x4">
            When shifting the origin to the edge of a shape for a reflection transform,
            it will never be needed to provide a transformation angle. This is because
            anything other the angle of the intersecting edge will result in an
            overlapping and invalid tessellations. The only valid and correct angle
            can easily be inferred from the angle of the intersecting edge.
          </Text>
        </Flex>

        <Flex>
          <Text margin="x4" strong>Origin 3. Center of a shape</Text>

          <Text margin="x4">
            Similar to shifting the point of origin to the edge of a shape, the
            origin can also be shifted to the center point of a shape. However
            there are a couple of differences. The format of the notation is
            very similar, for example <Code>r30(2c)</Code>, except this origin type
            is represented by a `<Code>c</Code>`. Instead of specifying the number
            of intersecting edges, it's simply the number of intersecting shapes (excluding
            the seed shape). This also allows for some flexibility in the angle
            of the intersection line as it does not have to target the center
            point of the shape directly. The shape simply needs to intersect on that line.
          </Text>

          <Text margin="x4">
            Unlike the edge origin type, when this is applied on a reflection transform
            the angle of the transform is always respected.
          </Text>
        </Flex>

        <Flex alignChildren="middle" direction="vertical">
          <Flex width="24rem">
            <Tiling
                animate
                borderSize={ null }
                colorScale={ interpolateGnBu }
                configuration={ findByA('[3³.4²; 3².4.3.4]¹') }
                disableRepeating
                height="20rem"
                showAxis
                showTransforms
                size={ 64 } />
          </Flex>

          <Text align="middle" margin="x2" size="x3">
            <Code>{ findByA('[3³.4²; 3².4.3.4]¹').b }</Code>
          </Text>

          <Text margin="x4" maxWidth="36rem">
            Using the <Code>[3³.4²; 3².4.3.4]¹</Code> configuration as an example.
            The second transformation function is <Code>m60(2c)</Code> (reflect over
            a line 180° relative to the intersection angle, at the center of the
            second intersecting shape at 60°).
          </Text>
        </Flex>

        <Flex>
          <Text heading margin="x4" size="x4">Stage 3: Repeating the transformations</Text>

          <Text margin="x4">
            This is the final stage to completing the tiling, and it's simply
            repeating over the transformation functions as many times as are
            needed. Providing the configuration is correct, this should not
            result in any shape overlaps (apart from those excluded from the
            transformation functions), and it should continuously and indefinitely grow.
          </Text>
        </Flex>

        <Flex>
          <Tiling
              animate
              colorScale={ interpolateRdPu }
              configuration={ findByA(exampleConfig) }
              height="20rem"
              showAxis
              showTransforms
              size={ 64 }
              theme="day" />

          <Text align="middle" margin="x4" size="x3">
            <Code>{ findByA(exampleConfig).b }</Code>
          </Text>

          <Text margin="x4" maxWidth="36rem">
            Using the <Code>{ exampleConfig }</Code> configuration as an example.
            Both transformation functions <Code>m60</Code> and <Code>r30(2e)</Code>
            are continuously repeated, each time taken the shapes that are currently
            on the plane.
          </Text>
        </Flex>

        <Flex>
          <Text emphasis margin="x4" size="x1">
            * Angles - For a valid tessellation that produces no gaps, the sum
            of the interior angles of every shape around a vertex must equal
            360°. For example, the interior angle of an equilateral triangle
            is <Code>180°/3=60°</Code>, therefore you can have 6 triangles
            around a vertex as <Code>360°/60°=6</Code>.
          </Text>

          <Text emphasis margin="x4" size="x1">
            Taking the pentagon (unusable for regular tessellations) as an example
            the interior angle is <Code>540°/5=108°</Code>. While you could place this
            around a vertex with a regular square and a icosagon (108°+90°+162°=360°),
            the next available vertices would not allow for this same configuration.
          </Text>

          <Text emphasis margin="x4" size="x1">
            In total, there are seventeen combinations of regular polygons whose internal
            angles add up to 360°. However only eleven of these can occur in regular
            polygon tilings.
          </Text>
        </Flex>

        <Flex>
          <Text heading margin="x4" size="x3">References</Text>

          <Text emphasis margin="x4" size="x1">
            Gomez-Jauregui, Valentin & Otero, César & Arias, Ruben & Manchado,
            Cristina. (2012). Generation and Nomenclature of Tessellations and
            Double-Layer Grids. Journal of Structural Engineering.
            138. 843–852. 10.1061/(ASCE)ST.1943-541X.0000532.
          </Text>
        </Flex>
      </Project>
    );
  }
}
