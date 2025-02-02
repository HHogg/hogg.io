import {
  ArticleFig,
  ArticleFigLink,
  ArticleFigs,
  ArticlePage,
  DeepPartial,
  ProjectPageLink,
} from '@hogg/common';
import { meta as spatialGridMapMeta } from '@hogg/spatial-grid-map';
import { TilingRenderer, meta as tilingsMeta } from '@hogg/tilings';
import { ColorPalette, Options, ScaleMode } from '@hogg/wasm';
import {
  ArticleHeading,
  ArticleParagraph,
  ArticleSection,
  BulletPoint,
  BulletPoints,
  Code,
  Text,
  colorNegativeShade4,
} from 'preshape';

const tilingRendererOptions: DeepPartial<Options> = {
  autoRotate: true,
  scaleMode: ScaleMode.Cover,
};

const tilingRendererOptionsWithOutline: DeepPartial<Options> = {
  autoRotate: true,
  colorPalette: ColorPalette.None,
  scaleMode: ScaleMode.Cover,
  showLayers: {
    PlaneOutline: true,
  },
  styles: {
    shape: {
      opacity: 0.5,
    },
    planeOutline: {
      strokeColor: colorNegativeShade4,
      strokeWidth: 2,
    },
  },
};

const Article = () => {
  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Introduction</ArticleHeading>

        <ArticleParagraph>
          In my project on <ProjectPageLink project={tilingsMeta} />, one of the
          key validation steps involves ensuring that no gaps exist in the final
          tiling. <ArticleFigLink fig="example-tiling-with-gaps" /> illustrates
          an example of a tiling that contains gaps and should therefore fail
          this validation step. This article explains the approach used to
          detect such gaps.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            id="example-tiling-with-gaps"
            description="An example of a tiling with gaps that should fail validation"
          >
            <TilingRenderer
              uid="example-tiling-with-gaps"
              height={200}
              notation="3-4-3-4/r60/m(h2)"
              expansionPhases={4}
              options={tilingRendererOptions}
            />
          </ArticleFig>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Tracking line segment edges</ArticleHeading>

        <ArticleParagraph>
          Each shape in a tiling is composed of multiple line segments. As
          shapes are placed on the plane, it is possible to keep track of each
          line segment encountered and the number of times it appears. Because
          shapes that touch share a boundary, every line segment should appear
          either once or twice:
        </ArticleParagraph>

        <ArticleParagraph>
          <BulletPoints>
            <BulletPoint>
              <Text strong>Once</Text> if it represents an outer edge of the
              tiling.
            </BulletPoint>

            <BulletPoint>
              <Text strong>Twice</Text> if it is shared by two adjacent shapes
              and therefore an internal boundary.
            </BulletPoint>
          </BulletPoints>
        </ArticleParagraph>

        <ArticleParagraph>
          Once we gather all line segments that occur only once, we can
          highlight the potential “outline” of the tiling.{' '}
          <ArticleFigLink fig="example-tiling-with-gaps-with-outline" /> shows a
          tiling with gaps, where the outer edges (the single-seen segments) are
          highlighted in red.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            id="example-tiling-with-gaps-with-outline"
            description="A tiling with gaps, with its outer boundary highlighted in red"
          >
            <TilingRenderer
              uid="example-tiling-with-gaps-with-outline"
              height={200}
              notation="3-4-3-4/r60/m(h2)"
              expansionPhases={4}
              options={tilingRendererOptionsWithOutline}
            />
          </ArticleFig>
        </ArticleFigs>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Finding a complete edge circuit</ArticleHeading>

        <ArticleParagraph>
          The next step is to determine whether these outer edges form a
          complete circuit. Specifically, we look for a sequence of connected
          edges that starts and ends at the same point, without skipping any
          outer edge. In a proper tiling (one without gaps), all single-seen
          edges will fit into exactly one complete loop.
        </ArticleParagraph>

        <ArticleParagraph>
          If, after forming one such complete circuit, there are still edges
          left unvisited, it means that the tiling must contain gaps.
        </ArticleParagraph>

        <ArticleParagraph>
          Using the helpful spatial hashing data structure I wrote about in my{' '}
          <ProjectPageLink project={spatialGridMapMeta} /> project. We can
          create a helpful lookup store where we can quickly find the edges that
          are adjacent to a given edge.
        </ArticleParagraph>

        <ArticleParagraph>
          This article doesn't detail the generation of the edges, or the logic
          for counting their occurrences so this article continues with the
          edges being provided as a{' '}
          <ProjectPageLink project={spatialGridMapMeta}>
            <Code language="rust">{`SpatialGridMap<LineSegment>`}</Code>
          </ProjectPageLink>
          .
        </ArticleParagraph>
      </ArticleSection>
    </ArticlePage>
  );
};

export default Article;
