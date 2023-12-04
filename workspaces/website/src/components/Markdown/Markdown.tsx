import { Link } from 'preshape';
import ReactMarkdown, { Components } from 'react-markdown';

type Props = {
  children?: string;
};

const customComponents: Components = {
  a: ({ children, href }) => (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      underline
      underlineSize="x1"
      target="_blank"
      weight="x2"
    >
      {children}
    </Link>
  ),
};

export default function Markdown({ children }: Props) {
  return (
    <ReactMarkdown components={customComponents}>{children}</ReactMarkdown>
  );
}
