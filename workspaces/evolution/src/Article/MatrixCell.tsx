import { Text } from 'preshape';

type Props = {
  a: string;
  b: string;
  c: string;
};

export default function MatrixCell({ a, b, c }: Props) {
  return (
    <Text gap="x2" grow textColor="text-shade-1" strong>
      <Text>
        {a}
        <Text subscript>
          {b}
          {c}
        </Text>
      </Text>
    </Text>
  );
}
