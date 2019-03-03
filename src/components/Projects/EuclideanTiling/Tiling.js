import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Bounds, Flex, InView } from 'preshape';
import TilingRenderer from './TilingRenderer';
import './Tiling.css';

export default class Tiling extends Component {
  static propTypes = {
    animate: PropTypes.bool,
    colorScale: PropTypes.func.isRequired,
    configuration: PropTypes.object.isRequired,
    devmode: PropTypes.bool,
    disableColoring: PropTypes.bool,
    disableRepeating: PropTypes.bool,
    fadeConnectedShapes: PropTypes.bool,
    height: PropTypes.string.isRequired,
    onError: PropTypes.func,
    onRender: PropTypes.func,
    showAxis: PropTypes.bool,
    showConfiguration: PropTypes.bool,
    showTransforms: PropTypes.bool,
    size: PropTypes.number.isRequired,
  };

  render() {
    const {
      animate,
      colorScale,
      configuration,
      devmode,
      disableColoring,
      disableRepeating,
      fadeConnectedShapes,
      height,
      onError,
      onRender,
      showAxis,
      showConfiguration,
      showTransforms,
      size,
      ...rest
    } = this.props;

    return (
      <InView enabled={ animate }>
        { ({ isInView, ref }) => (
          <Flex borderColor borderSize="x1" { ...rest }
              backgroundColor="shade-1"
              container
              grow
              height={ height }
              innerRef={ ref }>
            <Bounds Component={ Flex }
                absolute="fullscreen"
                className="Tiling"
                direction="vertical">
              { ({ height, width }) => (
                !!width && (
                  <TilingRenderer
                      animate={ animate && isInView }
                      colorScale={ colorScale }
                      configuration={ configuration }
                      devmode={ devmode }
                      disableColoring={ disableColoring }
                      disableRepeating={ disableRepeating }
                      fadeConnectedShapes={ fadeConnectedShapes }
                      height={ height }
                      onError={ onError }
                      onRender={ onRender }
                      showAxis={ showAxis }
                      showConfiguration={ showConfiguration }
                      showTransforms={ showTransforms }
                      size={ size }
                      width={ width } />
                )
              ) }
            </Bounds>
          </Flex>
        ) }
      </InView>
    );
  }
}
