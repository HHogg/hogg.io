import * as React from 'react';
import { Route } from 'react-router-dom';
import { Flex, FlexProps, Icon, Link, Text, ThemeSwitcher } from 'preshape';
import { RootContext } from '../Root';

interface Props extends FlexProps {
  description?: string;
  themeable?: boolean;
  title?: string;
}

const Header = (props: Props) => {
  const { description, themeable = true, title, ...rest } = props;
  const { onChangeTheme, theme } = React.useContext(RootContext);

  return (
    <Flex { ...rest }
        alignChildrenHorizontal="between"
        direction="horizontal"
        gap="x4"
        margin="x6">
      <Flex alignSelf="middle">
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
          <Flex borderSize="x1" />

          <Flex grow>
            <Text strong>{ title }</Text>

            { description && (
              <Text size="x1">{ description }</Text>
            ) }
          </Flex>
        </React.Fragment>
      ) }

      { themeable && (
        <Flex>
          <ThemeSwitcher onChange={ onChangeTheme } theme={ theme } />
        </Flex>
      ) }
    </Flex>
  );
};

export default Header;
