import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Base, Flex, GridItem, Link, List, ListItem, Text } from 'preshape';

export default class ShowcaseItem extends Component {
  static propTypes = {
    author: PropTypes.string,
    authorUrl: PropTypes.string,
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    svg: PropTypes.string,
    theme: PropTypes.string.isRequired,
  };

  render() {
    const {
      author,
      authorUrl,
      name,
      onClick,
      svg,
      theme,
      ...rest
    } = this.props;

    return (
      <GridItem { ...rest }
          Component={ Flex }
          borderColor
          borderSize="x2"
          direction="vertical">
        <Flex
            backgroundColor="shade-2"
            container
            height="8rem">
          <Base
              absolute="fullscreen"
              dangerouslySetInnerHTML={ { __html: svg } }
              style={ { overflow: 'hidden' } } />
        </Flex>

        <Flex
            backgroundColor
            color
            direction="vertical"
            gap="x2"
            grow
            padding="x2"
            theme={ theme }>
          <Flex grow>
            <Text size="x1" strong>{ name }</Text>
            { author && <Text emphasis size="x1">by { author }</Text> }
          </Flex>

          <Flex>
            <List>
              <ListItem separator="|">
                <Link onClick={ onClick }><Text size="x1">Open</Text></Link>
              </ListItem>

              { authorUrl && (
                <ListItem separator="|">
                  <Link href={ authorUrl } target="CircleArtOriginal">
                    <Text size="x1">Original</Text>
                  </Link>
                </ListItem>
              ) }
            </List>
          </Flex>
        </Flex>
      </GridItem>
    );
  }
}
