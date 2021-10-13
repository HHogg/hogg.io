import { Box, BoxProps, Icon, Link, Text, ThemeSwitcher, useMatchMedia } from 'preshape';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { RootContext } from '../Root';

interface Props extends BoxProps {
  description?: string;
  themeable?: boolean;
  title?: string;
}

const Header = (props: Props) => {
  const { description, themeable = true, title, ...rest } = props;
  const { onChangeTheme, theme } = React.useContext(RootContext);
  const match = useMatchMedia(['800px']);

  return (
    <Box { ...rest }
        alignChildrenHorizontal="between"
        flex={ match('800px') ? 'horizontal' : 'vertical' }
        gap={ match('800px') ? 'x10' : 'x4' }
        margin="x4">
      <Box alignChildrenVertical="middle" flex="horizontal">
        <Box alignSelf="middle" grow>
          <Route path="/:nested">
            <Link display="block" paddingVertical="x4" to="/">
              <Box flex="horizontal">
                <Box>
                  <Icon name="ChevronLeft" size="24px" />
                </Box>
                <Box>
                  <Text strong>Back</Text>
                </Box>
              </Box>
            </Link>
          </Route>
        </Box>

        { themeable && !match('800px') && (
          <Box>
            <ThemeSwitcher onChange={ onChangeTheme } theme={ theme } />
          </Box>
        ) }
      </Box>

      { title && (
        <React.Fragment>
          <Box basis="0" grow>
            <Text size="x4" strong>{ title }</Text>

            { description && (
              <Text>{ description }</Text>
            ) }
          </Box>
        </React.Fragment>
      ) }

      { themeable && match('800px') && (
        <Box>
          <ThemeSwitcher onChange={ onChangeTheme } theme={ theme } />
        </Box>
      ) }
    </Box>
  );
};

export default Header;
