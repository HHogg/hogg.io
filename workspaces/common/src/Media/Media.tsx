import { Box, BoxProps } from 'preshape';
import { FresnelMedial } from './MediaProvider';

type Props = BoxProps & typeof FresnelMedial.defaultProps;

export default function Media({
  children,
  at,
  lessThan,
  greaterThan,
  greaterThanOrEqual,
  between,
  ...rest
}: Props) {
  const fresnelProps = {
    at,
    lessThan,
    greaterThan,
    greaterThanOrEqual,
    between,
  };

  return (
    <FresnelMedial {...deleteEmptyProps(fresnelProps)}>
      {(className, renderChildren) => (
        <Box className={`fresnel-container ${className}`} {...rest}>
          {renderChildren ? children : undefined}
        </Box>
      )}
    </FresnelMedial>
  );
}

/**
 * Fresnel has got some weird error handling
 * where it doesn't like the prop to be defined as undefined.
 */
function deleteEmptyProps<T>(props: T): T {
  const newProps = { ...props };

  for (const key in newProps) {
    if (newProps[key] === undefined) {
      delete newProps[key];
    }
  }

  return newProps;
}
