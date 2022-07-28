import { Link, Text } from 'preshape';
import React from 'react';
import { Publication } from '../../types';
import { fromISO } from '../../utils/date';

interface Props extends Publication {}

const PublicationComponent = (props: Props) => {
  const { authors, date, description, journal, title, href } = props;

  return (
    <Link
      backgroundColor="background-shade-2"
      borderRadius="x3"
      display="block"
      href={href}
      margin="x3"
      padding="x6"
    >
      <Text flex="horizontal" gap="x10">
        <Text basis="0" grow margin="x1" strong>
          {title}
        </Text>

        <Text size="x2" strong>
          {journal}
        </Text>
      </Text>

      <Text margin="x1">{description}</Text>

      <Text margin="x2" size="x3" strong>
        by{' '}
        {authors.map((author, index) => (
          <Text inline key={author}>
            {author}{' '}
            <Text inline superscript>
              [{index + 1}]
            </Text>
            {index === authors.length - 1 ? ' ' : ', '}
          </Text>
        ))}
      </Text>

      <Text margin="x2" size="x3" strong>
        {fromISO(date)}
      </Text>
    </Link>
  );
};

export default PublicationComponent;
