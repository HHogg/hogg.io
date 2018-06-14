import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Label, Labels, Markdown, Text } from 'preshape';
import projectsMap from '../Projects/projectsMap';

export default class ProjectDescription extends Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
  };

  render() {
    const {
      description,
      github,
      labels,
      name,
      year,
    } = projectsMap[this.props.code];

    return (
      <Fragment>
        <Text margin="x1" size="title">
          { name } <Text inline size="small" superscript>({ year })</Text>
        </Text>

        <Text color="shade-3">
          <Markdown>{ `${description} ${ github ? `[[${github}](${github})]` : ''}` }</Markdown>
        </Text>

        <Labels margin="x2">
          { labels && labels.map((label) => typeof label === 'string'
              ? <Label key={ label }>{ label }</Label>
              : <Label key={ label.label } title={ label.title }>{ label.label }</Label>
          ) }
        </Labels>
      </Fragment>
    );
  }
}
