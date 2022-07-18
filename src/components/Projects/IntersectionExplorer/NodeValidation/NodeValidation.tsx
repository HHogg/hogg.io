import { Box } from 'preshape';
import React from 'react';
import { Edge, Node } from '../useGraph';
import NodeValidationIndicator from './NodeValidationIndicator';
import './NodeValidation.css';

interface Props {
  node: Edge | Node;
}

const NodeValidation = ({ node }: Props) => {
  const {
    isValid: [, ...results],
  } = node.state;

  return (
    <Box
      borderColor="background-shade-1"
      borderRadius="x1"
      borderSize="x1"
      className="NodeValidation"
      flex="horizontal"
    >
      {results.map((validation, index) => (
        <NodeValidationIndicator key={index} validation={validation} />
      ))}
    </Box>
  );
};

export default NodeValidation;
