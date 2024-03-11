import { Link } from 'preshape';

type Props = {
  fig: number;
};

export default function ArticleFigLink({ fig }: Props) {
  return (
    <Link to={`#Fig${fig}`} underline>
      Fig. {fig}
    </Link>
  );
}
