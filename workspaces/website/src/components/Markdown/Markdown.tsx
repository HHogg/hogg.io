import { Link } from 'preshape';
import ReactMarkdown, { Components } from 'react-markdown';

type Props = {
  children?: string;
};

const customComponents: Components = {
  a: ({ children, href }) => (
    <Link href={href} onClick={(e) => e.stopPropagation()} target="_blank">
      {children}
    </Link>
  ),
};

export default function Markdown({ children }: Props) {
  return (
    <ReactMarkdown components={customComponents}>{children}</ReactMarkdown>
  );
}
