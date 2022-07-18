import { Box } from 'preshape';
import React from 'react';
import { ValidationRuleResult } from '../useGraph';

interface Props {
  validation: ValidationRuleResult;
}

const NodeValidationIndicator = ({ validation }: Props) => {
  const { isValid } = validation;
  const backgroundColor =
    (isValid === null && 'text-shade-3') ||
    (isValid === true && 'positive-shade-4') ||
    'negative-shade-4';

  return (
    <Box
      backgroundColor={backgroundColor}
      className="NodeValidation__indicator"
      height={20}
      width={20}
    />
  );
};

export default NodeValidationIndicator;
