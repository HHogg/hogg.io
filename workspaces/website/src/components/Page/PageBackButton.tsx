import { ArrowLeft } from 'lucide-react';
import { Button } from 'preshape';

type PageBackButtonProps = {
  title: string;
  path: string;
};

export default function PageBackButton({ path }: PageBackButtonProps) {
  return (
    <Button
      backgroundColor="background-shade-1"
      backgroundColorHover="background-shade-1"
      backgroundColorActive="background-shade-1"
      borderColor="text-shade-1"
      borderSize="x0"
      gap="x2"
      size="x4"
      textColor="text-shade-1"
      to={path}
      padding="x0"
      variant="tertiary"
    >
      <ArrowLeft size="3rem" />
    </Button>
  );
}
