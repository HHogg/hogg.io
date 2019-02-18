import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Flex, Form, Icon, Link, List, ListItem, Text } from 'preshape';
import { interpolateRdPu } from 'd3-scale-chromatic';
import Tiling from './Tiling';
import TilingEdtorOptions from './TilingEdtorOptions';
import TilingEditorSidePanel from './TilingEditorSidePanel';
import TilingLibrary from './TilingLibrary';
import './TilingEditor.css';

export default class TilingEditor extends Component {
  static propTypes = {
    configuration: PropTypes.shape({
      b: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleUpdateConfiguration = this.handleUpdateConfiguration.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      animate: false,
      configuration: props.configuration,
      disableColoring: false,
      disableRepeating: false,
      isLibraryOpen: true,
      isOptionsOpen: false,
      planeRotation: 0,
      showAxis: false,
      showTransforms: false,
      value: props.configuration.b,
    };
  }

  handleCloseSidePanel() {
    this.setState({
      isLibraryOpen: false,
      isOptionsOpen: false,
    });
  }

  handleInputChange(event) {
    this.setState({ value: event.target.value });
  }

  handleOptionsChange(options) {
    this.setState(options);
  }

  handleUpdateConfiguration() {
    this.setState(({ value }) => ({
      configuration: {
        a: '',
        b: value,
      },
    }));
  }

  handleSetConfig(configuration) {
    this.setState({
      configuration: configuration,
      value: configuration.b,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.handleUpdateConfiguration();
  }

  handleToggleLibrary() {
    this.setState(({ isLibraryOpen }) => ({
      isLibraryOpen: !isLibraryOpen,
      isOptionsOpen: false,
    }));
  }

  handleToggleOptions() {
    this.setState(({ isOptionsOpen }) => ({
      isLibraryOpen: false,
      isOptionsOpen: !isOptionsOpen,
    }));
  }

  render() {
    const {
      animate,
      configuration,
      disableColoring,
      disableRepeating,
      isLibraryOpen,
      isOptionsOpen,
      planeRotation,
      showAxis,
      showTransforms,
      value,
    } = this.state;

    const options = {
      animate,
      disableColoring,
      disableRepeating,
      planeRotation,
      showAxis,
      showTransforms,
    };

    return (
      <Flex borderColor borderSize="x1">
        <Flex backgroundColor color theme="night">
          <Flex
              alignChildrenVertical="middle"
              direction="horizontal"
              gap="x4"
              paddingHorizontal="x4"
              paddingVertical="x2">
            <Flex grow>
              <Text size="x1" strong>Live Editor</Text>
            </Flex>

            <Flex>
              <List>
                <ListItem separator="|">
                  <Link onClick={ () => this.handleToggleLibrary() }>
                    <Icon name="Book" size="1.25rem" />
                  </Link>
                </ListItem>

                <ListItem separator="|">
                  <Link onClick={ () => this.handleToggleOptions() }>
                    <Icon name="Cog" size="1.25rem" />
                  </Link>
                </ListItem>
              </List>
            </Flex>
          </Flex>

          <Flex direction="horizontal">
            <Flex grow initial="none">
              <Tiling
                  animate={ animate }
                  borderSize={ null }
                  colorScale={ interpolateRdPu }
                  configuration={ configuration }
                  devmode
                  disableColoring={ disableColoring }
                  disableRepeating={ disableRepeating }
                  height="32rem"
                  planeRotation={ planeRotation }
                  showAxis={ showAxis }
                  showConfiguration
                  showTransforms={ showTransforms }
                  size={ 96 }
                  theme="day" />
            </Flex>

            <Flex direction="vertical">
              <TilingEditorSidePanel
                  isOpen={ isLibraryOpen || isOptionsOpen }
                  onClose={ () => this.handleCloseSidePanel() }
                  title={
                    (isLibraryOpen && 'Tiling Configurations') ||
                    (isOptionsOpen && 'Editor Options') || ''
                  }>
                { isLibraryOpen && (
                  <TilingLibrary
                      onSelect={ (config) => this.handleSetConfig(config) }
                      selected={ configuration } />
                ) }

                { isOptionsOpen && (
                  <TilingEdtorOptions
                      config={ options }
                      onConfigChange={ (config) => this.handleOptionsChange(config) } />
                ) }
              </TilingEditorSidePanel>
            </Flex>
          </Flex>

          <Flex direction="horizontal" gap="x4">
            <Flex grow>
              <Form onSubmit={ this.handleSubmit }>
                <Text Component="input"
                    align="middle"
                    className="TilingEditor__input"
                    monospace
                    onChange={ this.handleInputChange }
                    paddingHorizontal="x4"
                    paddingVertical="x3"
                    strong
                    value={ value } />
              </Form>
            </Flex>

            <Flex className="TilingEditor__update">
              <Link
                  display="block"
                  onClick={ this.handleUpdateConfiguration }
                  paddingHorizontal="x4"
                  paddingVertical="x3"
                  size="x1"
                  strong>Update</Link>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    );
  }
}
