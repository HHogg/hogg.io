import React, { FunctionComponent } from 'react';
import NodeValidationBadge from '../Node/NodeBadge';
import { ValidationRuleResult } from '../useGraph';

interface Props {
  validation: ValidationRuleResult;
}

const NodeValidationMessage: FunctionComponent<Props> = ({ validation }) => {
  const { message } = validation;

  const parts = message
    .split(/[[\]]/g)
    .map((part, index) =>
      index % 2 === 1 ? (
        <NodeValidationBadge key={index}>{part}</NodeValidationBadge>
      ) : (
        part
      )
    );

  return <>{parts}</>;
};

export default NodeValidationMessage;
