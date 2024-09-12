import { ArticlePage } from '@hogg/common';
import { ArticleHeading, ArticleParagraph, ArticleSection } from 'preshape';

const Article = () => {
  return (
    <ArticlePage>
      <ArticleSection>
        <ArticleHeading>Introduction</ArticleHeading>

        <ArticleParagraph>Foo</ArticleParagraph>
      </ArticleSection>
    </ArticlePage>
  );
};

export default Article;
