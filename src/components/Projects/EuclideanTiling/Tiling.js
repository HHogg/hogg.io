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
    height: PropTypes.string.isRequired,
    onError: PropTypes.func,
    onRender: PropTypes.func,
    planeRotation: PropTypes.number,
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
      height,
      onError,
      onRender,
      planeRotation,
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
                      height={ height }
                      onError={ onError }
                      onRender={ onRender }
                      planeRotation={ planeRotation }
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
