import { ChevronLeftIcon } from 'lucide-react';
import {
  Box,
  BoxProps,
  Link,
  Text,
  ThemeSwitcher,
  useMatchMedia,
} from 'preshape';
import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';

interface Props extends BoxProps {
  description?: string;
  themeable?: boolean;
  title?: string;
}

const Header = (props: Props) => {
  const { description, themeable = true, title, ...rest } = props;
  const match = useMatchMedia(['800px']);

  const location = useLocation();
  const isOnSubPage = location.pathname.split('/').length > 2;

  return (
    <Box
      {...rest}
      alignChildrenHorizontal="between"
      flex={match('800px') ? 'horizontal' : 'vertical'}
      gap={match('800px') ? 'x10' : 'x4'}
      margin="x4"
    >
      <Box alignChildrenVertical="middle" flex="horizontal">
        <Box alignSelf="middle" grow>
          {isOnSubPage && (
            <Link display="block" paddingVertical="x4" to="/">
              <Box flex="horizontal">
                <Box>
                  <ChevronLeftIcon size="24px" />
                </Box>
                <Box>
                  <Text weight="x2">Back</Text>
                </Box>
              </Box>
            </Link>
          )}
        </Box>

        {themeable && !match('800px') && (
          <Box>
            <ThemeSwitcher />
          </Box>
        )}
      </Box>

      {title && (
        <Fragment>
          <Box basis="0" grow>
            <Text size="x5" weight="x2">
              {title}
            </Text>

            {description && <Text>{description}</Text>}
          </Box>
        </Fragment>
      )}

      {themeable && match('800px') && (
        <Box>
          <ThemeSwitcher />
        </Box>
      )}
    </Box>
  );
};

export default Header;
