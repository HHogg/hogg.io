import { CodeBlock, CodeBlockProps } from 'preshape';
import ArticleFig, { ArticleFigProps } from './ArticleFig';

type Props = ArticleFigProps & {
  children: string;
  language: CodeBlockProps['language'];
};

export default function ArticleFigCodeBlock({
  children,
  language,
  ...rest
}: Props) {
  return (
    <ArticleFig {...rest} padding="x0">
      <CodeBlock language={language} overflow="auto" padding="x6">
        {children}
      </CodeBlock>
    </ArticleFig>
  );
}
