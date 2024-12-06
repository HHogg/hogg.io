import {
  ArticleFig,
  ArticleFigCodeBlock,
  ArticleFigLink,
  ArticleFigs,
  ArticlePage,
  ProjectPageLink,
} from '@hogg/common';
import { ColorMode, TilingRenderer, meta as tilingsMeta } from '@hogg/tilings';
import {
  ArticleHeading,
  ArticleParagraph,
  ArticleSection,
  Code,
  Link,
  Text,
  sizeX12Px,
} from 'preshape';

const Article = () => {
  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Introduction</ArticleHeading>

        {/* <ArticleParagraph>
          While working on my <ProjectPageLink project={tilingsMeta} /> project,
          I was needing to build up a list of distinct shape arrangements (
          <ArticleFigLink fig="dodecagon-shape-arrangement" />
          ). This needed a way to check an arrangement against a list of
          previously seen arrangements.
        </ArticleParagraph>

        <ArticleParagraph>
          The complexity and interesting part of this problem came because the
          shapes could be arranged cyclicly, and there was no defined start or
          end point. This meant that the same arrangement could be represented
          in multiple ways. I was also dealing with an infinite amount of these
          arrangements, and 100,000s of them every second.
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            id="dodecagon-shape-arrangement"
            description="Shape arrangement of a dodecagon at the center, with alternating triangles, squares and hexagons on it's edges."
          >
            <TilingRenderer
              height="200px"
              notation="12-3,4,6,4,3,4,6,4,3,4,6,4"
              options={{
                colorMode: ColorMode.None,
              }}
            />
          </ArticleFig>
        </ArticleFigs> */}
      </ArticleSection>
    </ArticlePage>
  );
};

export default Article;
