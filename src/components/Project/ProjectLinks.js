import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Icon, Link, List, ListItem } from 'preshape';
import projectsMap from '../Projects/projectsMap';

export default class ProjectLinks extends Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
  };

  render() {
    const { github, link } = projectsMap[this.props.code];

    return (
      <List separator="~">
        { github && (
          <ListItem>
            <Link href={ github } title={ github }>
              <Icon name="Github" size="1.5rem" />
            </Link>
          </ListItem>
        ) }

        { link && (
          <ListItem>
            <Link href={ link } title={ link }>
              <Icon name="ExternalLink" size="1.5rem" />
            </Link>
          </ListItem>
        ) }
      </List>
    );
  }
}
