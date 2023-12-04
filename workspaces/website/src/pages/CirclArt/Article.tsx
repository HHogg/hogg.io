import { configurationsByName, useGraph } from '@hogg/circles';
import EditorViewer from '@hogg/circles/src/Editor/EditorViewer';
import { BulletPoint, BulletPoints, Link } from 'preshape';
import { useState } from 'react';
import ArticleFig from '../../components/Article/ArticleFig';
import ArticleFigs from '../../components/Article/ArticleFigs';
import ArticleHeading from '../../components/Article/ArticleHeading';
import ArticlePage from '../../components/Article/ArticlePage';
import ArticleParagraph from '../../components/Article/ArticleParagraph';
import ArticleSection from '../../components/Article/ArticleSection';
import { ProjectKey } from '../../types';

const twitterConfig = configurationsByName.Twitter.config;

export default function Article() {
  const [twitterFigNumber, setTwitterFigNumber] = useState(0);
  const { graph } = useGraph(twitterConfig.circles, {
    findTraversalsOnUpdate: true,
  });

  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Circle intersections</ArticleHeading>

        <ArticleParagraph>
          While stumbling around Reddit I came across{' '}
          <Link
            href="https://www.reddit.com/r/Damnthatsinteresting/comments/963j4n/magic_of_circles/"
            target="_blank"
            underline
          >
            a post that showed a human face made from circles
          </Link>
          . It sparked an interest of a simple web application to draw circles
          and fill the intersection areas to see what else could be created.
        </ArticleParagraph>

        <ArticleParagraph>
          While investigating I also came across a designer called Dorota
          Pankowsa who created a series of{' '}
          <Link
            href="https://dorotapankowska.com/13-animals-13-circles.html"
            target="_blank"
            underline
          >
            animals made from 13 circles
          </Link>{' '}
          that was originally inspired from the Twitter logo that was made from
          13 circles (Fig. {twitterFigNumber})
        </ArticleParagraph>

        <ArticleFigs>
          <ArticleFig
            description="Twitter logo made from circles"
            onNumberChange={setTwitterFigNumber}
          >
            <EditorViewer
              fills={twitterConfig.fills}
              graph={graph}
              mode="fill"
              minHeight="300px"
              width={twitterConfig.width}
              height={twitterConfig.height}
            />
          </ArticleFig>
        </ArticleFigs>

        <ArticleParagraph>
          I have written another article that goes into more detail about a
          novel approach I took to calculate the intersection areas of circles
          using graph data structures, which can be found{' '}
          <Link to={`/${ProjectKey.CircleIntersectionsWithGraphs}`} underline>
            here
          </Link>
          .
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Instructions</ArticleHeading>

        <ArticleParagraph>
          Hopefully the application you see on this page is self-explanatory,
          but here are some instructions to get you started:
        </ArticleParagraph>

        <BulletPoints>
          <BulletPoint>
            The controls at the top allow you to toggle between drawing, filling
            and viewing modes. There are also controls to start a new drawing,
            and save the current drawing as an image or JSON data.
          </BulletPoint>

          <BulletPoint>
            In drawing mode, click and drag to draw a circle. You can also
            duplicate and remove circles using the toolbar when a circle is
            selected.
          </BulletPoint>

          <BulletPoint>
            Place your cursor at the edge of a circle to resize it.
          </BulletPoint>

          <BulletPoint>
            There are 'Undo' and 'Redo' controls to help you if you make a
            mistake.
          </BulletPoint>

          <BulletPoint>
            In fill mode, click on the intersection areas to fill them with a
            color. You can apply the foreground or background color to the
            intersection areas by clicking multiple times to toggle between the
            two colors. A third click will remove the fill.
          </BulletPoint>

          <BulletPoint>
            Check out the gallery for some examples of what can be created,
            including some of the animals from Dorota Pankowsa's series.
          </BulletPoint>
        </BulletPoints>
      </ArticleSection>
    </ArticlePage>
  );
}
