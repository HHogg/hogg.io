import * as React from 'react';
import { Route } from 'react-router-dom';
import { Box, BoxProps, Icon, Link, Text, ThemeSwitcher } from 'preshape';
import { RootContext } from '../Root';

interface Props extends BoxProps {
  description?: string;
  themeable?: boolean;
  title?: string;
}

const Header = (props: Props) => {
  const { description, themeable = true, title, ...rest } = props;
  const { onChangeTheme, theme } = React.useContext(RootContext);

  return (
    <Box { ...rest }
        alignChildrenHorizontal="between"
        flex="horizontal"
        gap="x4"
        margin="x6">
      <Box alignSelf="middle">
        <Route path="/:nested">
          <Link to="/">
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

      { title && (
        <React.Fragment>
          <Box borderSize="x1" />

          <Box grow>
            <Text size="x3" strong>{ title }</Text>

            { description && (
              <Text>{ description }</Text>
            ) }
          </Box>
        </React.Fragment>
      ) }

      { themeable && (
        <Box>
          <ThemeSwitcher onChange={ onChangeTheme } theme={ theme } />
        </Box>
      ) }
    </Box>
  );
};

export default Header;
