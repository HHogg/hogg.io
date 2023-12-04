import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Link, Text } from 'preshape';

export type PageChangeButtonProps = {
  description?: string;
  direction: 'next' | 'previous';
  title: string;
  to: string;
};

export default function PageChangeButton({
  to,
  title,
  description,
  direction,
}: PageChangeButtonProps) {
  return (
    <Link
      alignChildrenVertical="middle"
      flex="horizontal"
      gap="x4"
      to={to}
      size="x3"
      style={{ maxWidth: 420 }}
      textColorActive="text-shade-1"
      textColorHover="text-shade-1"
    >
      {direction === 'previous' && <ChevronLeftIcon size="3rem" />}

      <Text basis="0" grow minWidth={0} size="x4">
        <Text margin="x1" size="x4" weight="x3">
          {title}
        </Text>

        {description && (
          <Text size="x3" weight="x1">
            {description}
          </Text>
        )}
      </Text>

      {direction === 'next' && <ChevronRightIcon size="3rem" />}
    </Link>
  );
}
