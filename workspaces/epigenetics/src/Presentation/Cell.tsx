import { Button } from 'preshape';

type CellProps = {
  width: number;
  height: number;
  x: number;
  y: number;
  cellIndex: number;
  onClick: (cellIndex: number) => void;
};

export default function Cell({
  width,
  height,
  x,
  y,
  cellIndex,
  onClick,
}: CellProps) {
  return (
    <Button
      absolute="top-left"
      width={width}
      height={height}
      padding="x0"
      style={{ transform: `translate(${x}px, ${y}px)` }}
      variant="tertiary"
      borderRadius="x0"
      borderSize="x1"
      borderColorHover="black"
      borderColorActive="black"
      backgroundColorActive="accent-shade-2"
      onClick={() => onClick(cellIndex)}
    />
  );
}
