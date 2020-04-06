import * as React from 'react';
import { Route } from 'react-router-dom';
import { Flex, FlexProps, Icon, Link, Text, ThemeSwitcher } from 'preshape';
import { RootContext } from '../Root';

interface Props extends FlexProps {
  title?: string;
}

const Header = (props: Props) => {
  const { title, ...rest } = props;
  const { onChangeTheme, theme } = React.useContext(RootContext);

  return (
    <Flex { ...rest }
        alignChildrenHorizontal="between"
        direction="horizontal"
        gap="x3"
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

      { title && (
        <React.Fragment>
          <Flex>
            <Text strong>|</Text>
          </Flex>

          <Flex grow>
            <Text strong>{ title }</Text>
          </Flex>
        </React.Fragment>
      ) }

      <Flex>
        <ThemeSwitcher onChange={ onChangeTheme } theme={ theme } />
      </Flex>
    </Flex>
  );
};

export default Header;
