import { Link, Text } from 'preshape';
import React from 'react';
import { Writing } from '../../types';
import { fromISO } from '../../utils/date';

interface Props extends Writing {}

const WritingComponent = (props: Props) => {
  const { date, description, title, to } = props;

  return (
    <Link
      backgroundColor="background-shade-2"
      borderRadius="x3"
      display="block"
      margin="x3"
      padding="x6"
      to={to}
    >
      <Text margin="x1" strong>
        {title}
      </Text>
      <Text margin="x1">{description}</Text>
      <Text margin="x2" size="x3" strong>
        {fromISO(date)}
      </Text>
    </Link>
  );
};

export default WritingComponent;
