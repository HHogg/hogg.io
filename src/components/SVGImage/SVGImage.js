import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import omit from 'lodash.omit';
import { themeDay, themePropNameCSSMap, Base } from 'preshape';

const replaceColors = (svg) =>
  Object.entries(themeDay).reduce((svg, [key, hex]) =>
    svg.replace(new RegExp(`${hex}`, 'gi'), `var(--${themePropNameCSSMap[key]})`)
  , svg);

export default class SVGImage extends PureComponent {
  static propTypes = {
    svg: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      svg: replaceColors(props.svg),
    };
  }

  componentDidUpdate(prevProps) {
    const { svg } = this.props;

    if (svg !== prevProps.svg) {
      this.setState({
        svg: replaceColors(svg),
      });
    }
  }

  render() {
    const { svg } = this.state;

    return (
      <Base { ...omit(this.props, ['svg']) }
          dangerouslySetInnerHTML={ { __html: svg } }
          style={ { overflow: 'hidden' } } />
    );
  }
}
