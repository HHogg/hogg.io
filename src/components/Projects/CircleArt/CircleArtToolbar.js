import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  Icon,
  Placement,
  PlacementManager,
  PlacementReferenceElement,
  Toolbar,
  ToolbarAction,
  ToolbarActionGroup,
} from 'preshape';

export default class CircleArtToolbar extends Component {
  static propTypes = {
    onCopy: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    targetRect: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      render: false,
      visible: false,
    };
  }

  componentDidMount() {
    const boundariesElement = document.getElementById('CircleArtBoundary');

    this.modifiers = {
      flip: {
        enabled: true,
        boundariesElement: boundariesElement,
      },
      preventOverflow: {
        enabled: true,
        boundariesElement: boundariesElement,
      },
    };
  }

  componentDidUpdate(prevProps) {
    const { targetRect } = this.props;

    if (targetRect !== prevProps.targetRect) {
      if (targetRect) {
        this.setState({
          render: true,
          visible: true,
        });
      } else {
        this.setState({
          visible: false,
        });
      }
    }
  }

  render() {
    const { render, visible } = this.state;
    const { onCopy, onDelete, targetRect } = this.props;
    const referenceElement = targetRect && new PlacementReferenceElement(targetRect);

    if (!render) {
      return null;
    }

    return (
      <PlacementManager>
        <Placement
            eventsEnabled={ false }
            modifiers={ this.modifiers }
            placement="top"
            referenceElement={ referenceElement }>
          <Toolbar
              onExited={ () => this.setState({ render: false }) }
              visible={ visible }>
            <ToolbarActionGroup>
              <ToolbarAction onClick={ onCopy }>
                <Icon name="Copy" size="1rem" />
              </ToolbarAction>
            </ToolbarActionGroup>

            <ToolbarActionGroup>
              <ToolbarAction
                  color="negative"
                  onClick={ onDelete }>
                <Icon name="Delete" size="1rem" />
              </ToolbarAction>
            </ToolbarActionGroup>
          </Toolbar>
        </Placement>
      </PlacementManager>
    );
  }
}
