import { TypeColor } from 'preshape';

export default function getSequenceColor(
  isSymmetrical: boolean,
  index = 3
): TypeColor {
  return (
    isSymmetrical ? `positive-shade-${index}` : `negative-shade-${index}`
  ) as TypeColor;
}
