import { LucideIcon } from 'lucide-react';
import { Button, ButtonProps, Tooltip } from 'preshape';

type ProjectControlProps = {
  Icon: LucideIcon;
  title: string;
};

export default function ProjectControl({
  Icon,
  title,
  variant = 'tertiary',
  ...rest
}: ButtonProps & ProjectControlProps) {
  return (
    <Tooltip content={title} delay={300}>
      <Button {...rest} variant={variant}>
        <Icon size="1.5rem" />
      </Button>
    </Tooltip>
  );
}
