import * as React from 'react';
import { Base, CheckBox, Input, RadioButton, Text } from 'preshape';
import {
  Algorithm,
  ArchimedesSpiral,
  ConcentricCircles,
  FermatSpiral,
  UlamSpiral,
  VogelSpiral,
} from './Algorithms';
import { Config } from './Spirals';

interface Props {
  config: Config;
  onConfigChange: (config: Partial<Config>) => void;
}

export const algorithms: [string, Algorithm][] = [
  ['Archimedes Spiral', ArchimedesSpiral],
  ['Concentric Circles', ConcentricCircles],
  ['Fermat Spiral', FermatSpiral],
  ['Ulam Spiral', UlamSpiral],
  ['Vogel Spiral', VogelSpiral],
];

const SysPlotControls = (props: Props) => {
  const { config, onConfigChange } = props;
  const [{ aspectRatio, padding, shapeCount, spread }, setState] = React.useState({
    aspectRatio: config.aspectRatio,
    padding: config.padding,
    spread: config.spread,
    shapeCount: config.shapeCount,
  });

  const handleNumberChange = (event: React.FormEvent<HTMLInputElement>, prop: string, min = -Infinity, max = Infinity) => {
    const { value } = event.target as HTMLInputElement;
    const number = Math.max(min, Math.min(max, parseFloat(value)));

    setState({  ...config, [prop]: value });

    if (!isNaN(number)) {
      onConfigChange({ [prop]: number });
    }
  }

  return (
    <React.Fragment>
      <Base margin="x8">
        <Text margin="x4" strong>Plotting Algorithms</Text>

        { algorithms.map(([algorithmName, algorithm]) => (
          <RadioButton
              checked={ config.algorithm === algorithm }
              key={ algorithmName }
              label={ algorithmName }
              margin="x2"
              onChange={ () => onConfigChange({ algorithmName, algorithm }) } />
        )) }
      </Base>

      <Base margin="x8">
        <Text margin="x4" strong>Configuration</Text>

        <CheckBox
            checked={ config.cover }
            label="Cover"
            margin="x2"
            onChange={ () => onConfigChange({ cover: !config.cover }) } />

        <CheckBox
            checked={ config.proportional }
            label="Preserve Aspect Ratio"
            margin="x2"
            onChange={ () => onConfigChange({ proportional: !config.proportional }) } />

        <CheckBox
            checked={ config.showVectors }
            label="Show Vectors"
            margin="x2"
            onChange={ () => onConfigChange({ showVectors: !config.showVectors }) } />

        <CheckBox
            checked={ config.showShapes }
            label="Show Shapes"
            margin="x2"
            onChange={ () => onConfigChange({ showShapes: !config.showShapes }) } />

        <Input
            label="Aspect Ratio"
            margin="x2"
            onChange={ (e) => handleNumberChange(e, 'aspectRatio', 0) }
            placeholder="Aspect ratio..."
            step="0.05"
            type="number"
            value={ aspectRatio } />

        <Input
            label="Padding"
            margin="x2"
            onChange={ (e) => handleNumberChange(e, 'padding') }
            placeholder="Padding..."
            type="number"
            value={ padding } />

        <Input
            label="Spread"
            margin="x2"
            onChange={ (e) => handleNumberChange(e, 'spread') }
            placeholder="Spread..."
            step="0.05"
            type="number"
            value={ spread } />

        <Input
            label="Shape Count"
            margin="x2"
            onChange={ (e) => handleNumberChange(e, 'shapeCount', 0, 200) }
            placeholder="Shape count..."
            type="number"
            value={ shapeCount } />
      </Base>
    </React.Fragment>
  );
};

export default SysPlotControls;
