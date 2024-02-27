import {
  ArticleHeading,
  ArticlePage,
  ArticleParagraph,
  ArticleSection,
  ProjectPageLink,
} from '@hogg/common';
import { meta as tilingsMeta } from '@hogg/tilings';

type Props = {};

const Article = ({}: Props) => {
  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Introduction</ArticleHeading>

        <ArticleParagraph>
          While working on my <ProjectPageLink project={tilingsMeta} /> project,
        </ArticleParagraph>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Linear algebra</ArticleHeading>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Line segment interception</ArticleHeading>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>atan2</ArticleHeading>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Bound interception</ArticleHeading>
      </ArticleSection>

      <ArticleSection>
        <ArticleHeading>Summary</ArticleHeading>
      </ArticleSection>
    </ArticlePage>
  );
};

export default Article;
