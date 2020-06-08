import * as React from 'react';
import { Base, CheckBox, Input, InputLabel, RadioButton, Text } from 'preshape';
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

    setState({ ...config, [prop]: value });

    if (!isNaN(number)) {
      onConfigChange({ [prop]: number });
    }
  };

  return (
    <React.Fragment>
      <Base margin="x8">
        <Text margin="x4" strong>Plotting Algorithms</Text>

        { algorithms.map(([algorithmName, algorithm]) => (
          <RadioButton
              checked={ config.algorithm === algorithm }
              key={ algorithmName }
              margin="x2"
              onChange={ () => onConfigChange({ algorithmName, algorithm }) }>
            { algorithmName }
          </RadioButton>
        )) }
      </Base>

      <Base margin="x8">
        <Text margin="x4" strong>Configuration</Text>

        <CheckBox
            checked={ config.cover }
            margin="x2"
            onChange={ () => onConfigChange({ cover: !config.cover }) }>
          Cover
        </CheckBox>

        <CheckBox
            checked={ config.proportional }
            margin="x2"
            onChange={ () => onConfigChange({ proportional: !config.proportional }) }>
          Preserve Aspect Ratio
        </CheckBox>

        <CheckBox
            checked={ config.showVectors }
            margin="x2"
            onChange={ () => onConfigChange({ showVectors: !config.showVectors }) }>
          Show Vectors
        </CheckBox>

        <CheckBox
            checked={ config.showShapes }
            margin="x2"
            onChange={ () => onConfigChange({ showShapes: !config.showShapes }) }>
          Show Shapes
        </CheckBox>

        <InputLabel label="Aspect Ratio" margin="x2">
          <Input
              onChange={ (e) => handleNumberChange(e, 'aspectRatio', 0) }
              placeholder="Aspect ratio..."
              step="0.05"
              type="number"
              value={ aspectRatio } />
        </InputLabel>

        <InputLabel label="Padding" margin="x2">
          <Input
              onChange={ (e) => handleNumberChange(e, 'padding') }
              placeholder="Padding..."
              type="number"
              value={ padding } />
        </InputLabel>

        <InputLabel label="Spread" margin="x2">
          <Input
              onChange={ (e) => handleNumberChange(e, 'spread') }
              placeholder="Spread..."
              step="0.05"
              type="number"
              value={ spread } />
        </InputLabel>

        <InputLabel label="Shape Count" margin="x2">
          <Input
              onChange={ (e) => handleNumberChange(e, 'shapeCount', 0, 200) }
              placeholder="Shape count..."
              type="number"
              value={ shapeCount } />
        </InputLabel>
      </Base>
    </React.Fragment>
  );
};

export default SysPlotControls;
