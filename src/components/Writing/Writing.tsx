import * as React from 'react';
import { Flex, Link, LinkProps, Text } from 'preshape';
import { DateTime } from 'luxon';

interface Props extends LinkProps {
  date: number;
  description: string;
  title: string;
}

const Writing = (props: Props) => {
  const { date, description, title, ...rest } = props;

  return (
    <Link { ...rest } display="block" margin="x6">
      <Text margin="x1" strong>{ title }</Text>
      <Text margin="x1" size="x1">{ description }</Text>
      <Text margin="x2" size="x1" strong>{ DateTime.fromMillis(date).toFormat('dd MMM yyyy') }</Text>
    </Link>
  );
};

export default Writing;
