import { FunctionComponent } from 'react';
import { ValidationRuleResult } from '../../useGraph';
import NodeBade from '../Node/NodeBadge';

type Props = {
  validation: ValidationRuleResult;
};

const NodeValidationMessage: FunctionComponent<Props> = ({ validation }) => {
  const { message } = validation;

  const parts = message
    .split(/[[\]]/g)
    .map((part, index) =>
      index % 2 === 1 ? <NodeBade key={index}>{part}</NodeBade> : part
    );

  return <>{parts}</>;
};

export default NodeValidationMessage;
