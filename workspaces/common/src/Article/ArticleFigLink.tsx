import { Link, Text } from 'preshape';
import { useArticleContext } from './useArticleContext';

type Props = {
  fig: string;
};

export default function ArticleFigLink({ fig }: Props) {
  const { getFigureNumber } = useArticleContext();
  const number = getFigureNumber(fig);

  if (number === null) {
    return (
      <Text textColor="negative-shade-4" tag="span" weight="x2">
        !!! Fig 404 !!!
      </Text>
    );
  }

  return (
    <Link to={`#Fig-${fig}`} underline>
      Fig. {getFigureNumber(fig)}
    </Link>
  );
}
