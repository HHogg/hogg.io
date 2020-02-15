import * as React from 'react';
import { Route } from 'react-router-dom';
import { Flex, Icon, Link, Text, ThemeSwitcher } from 'preshape';
import { RootContext } from '../Root';

const Header = () => {
  const { onChangeTheme, theme } = React.useContext(RootContext);

  return (
    <Flex
        alignChildrenHorizontal="between"
        direction="horizontal"
        margin="x6">
      <Flex>
        <Route path="/:nested">
          <Link to="/">
            <Flex direction="horizontal">
              <Flex>
                <Icon name="ChevronLeft" size="24px" />
              </Flex>
              <Flex>
                <Text strong>Back</Text>
              </Flex>
            </Flex>
          </Link>
        </Route>
      </Flex>

      <Flex>
        <ThemeSwitcher onChange={ onChangeTheme } theme={ theme } />
      </Flex>
    </Flex>
  );
};

export default Header;
