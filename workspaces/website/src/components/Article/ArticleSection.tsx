import { Text, TextProps } from 'preshape';

export type Props = TextProps & {};

export default function ArticleSection({ ...props }: Props) {
  return <Text {...props} margin="x16" tag="div" />;
}
