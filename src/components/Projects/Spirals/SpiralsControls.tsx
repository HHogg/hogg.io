import { Box, CheckBox, Input, InputLabel, RadioButton, Text } from 'preshape';
import React, { FormEvent, useState } from 'react';
import {
  getArchimedesSpiral,
  getFermatSpiral,
  getUlamSpiral,
  getVogelSpiral,
  ZeroSpiral,
  TypeAlgorithm,
} from './Algorithms';
import { Config } from './Spirals';

interface Props {
  config: Config;
  onConfigChange: (config: Partial<Config>) => void;
}

export const algorithms: [string, TypeAlgorithm][] = [
  ['Zero', ZeroSpiral],
  ['Archimedes Spiral', getArchimedesSpiral],
  ['Fermat Spiral', getFermatSpiral],
  ['Ulam Spiral', getUlamSpiral],
  ['Vogel Spiral', getVogelSpiral],
];

const SysPlotControls = (props: Props) => {
  const { config, onConfigChange } = props;
  const [{ padding, shapeCount, vectorCount }, setState] = useState({
    padding: config.padding,
    shapeCount: config.shapeCount,
    vectorCount: config.vectorCount,
  });

  const handleNumberChange = (
    event: FormEvent<HTMLInputElement>,
    prop: string,
    min = -Infinity,
    max = Infinity
  ) => {
    const { value } = event.target as HTMLInputElement;
    const number = Math.max(min, Math.min(max, parseFloat(value)));

    setState({ ...config, [prop]: value });

    if (!isNaN(number)) {
      onConfigChange({ [prop]: number });
    }
  };

  return (
    <>
      <Box margin="x8">
        <Text margin="x4" strong>
          Plotting Algorithms
        </Text>

        {algorithms.map(([algorithmName, algorithm]) => (
          <RadioButton
            checked={config.algorithm === algorithm}
            key={algorithmName}
            margin="x2"
            onChange={() => onConfigChange({ algorithm })}
          >
            {algorithmName}
          </RadioButton>
        ))}
      </Box>

      <Box margin="x8">
        <Text margin="x4" strong>
          Configuration
        </Text>

        <CheckBox
          checked={config.showVectors}
          margin="x2"
          onChange={() => onConfigChange({ showVectors: !config.showVectors })}
        >
          Show Vectors
        </CheckBox>

        <CheckBox
          checked={config.showShapes}
          margin="x2"
          onChange={() => onConfigChange({ showShapes: !config.showShapes })}
        >
          Show Shapes
        </CheckBox>

        <InputLabel label="Padding" margin="x2">
          <Input
            onChange={(e: any) => handleNumberChange(e, 'padding')}
            placeholder="Padding..."
            type="number"
            value={padding}
          />
        </InputLabel>

        <InputLabel label="Shape Count" margin="x2">
          <Input
            disabled
            onChange={(e: any) => handleNumberChange(e, 'shapeCount', 0, 200)}
            placeholder="Shape count..."
            type="number"
            value={shapeCount}
          />
        </InputLabel>

        <InputLabel label="Vector Count" margin="x2">
          <Input
            disabled
            onChange={(e: any) => handleNumberChange(e, 'vectorCount', 0, 200)}
            placeholder="Vector count..."
            type="number"
            value={vectorCount}
          />
        </InputLabel>
      </Box>
    </>
  );
};

export default SysPlotControls;
