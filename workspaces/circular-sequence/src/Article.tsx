import {
  ArticleHeading,
  ArticlePage,
  ArticleParagraph,
  ProjectPageLink,
} from '@hogg/common';
import { meta as tilingsMeta } from '@hogg/tilings';

type Props = {};

const Article = ({}: Props) => {
  return (
    <ArticlePage>
      <ArticleHeading>Introduction</ArticleHeading>
      <ArticleParagraph>
        While working on my <ProjectPageLink project={tilingsMeta} /> project, I
        came across a problem that needed a solution to compare the arrangements
        of shapes connected to a shape in the center.
      </ArticleParagraph>
    </ArticlePage>
  );
};

export default Article;
