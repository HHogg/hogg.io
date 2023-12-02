import { Link, Text } from 'preshape';
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
        <Text basis="0" grow margin="x1" weight="x2">
          {title}
        </Text>

        <Text size="x2" weight="x2">
          {journal}
        </Text>
      </Text>

      <Text margin="x1">{description}</Text>

      <Text margin="x2" size="x3" weight="x2">
        by{' '}
        {authors.map((author, index) => (
          <Text tag="span" key={author}>
            {author}{' '}
            <Text tag="span" superscript>
              [{index + 1}]
            </Text>
            {index === authors.length - 1 ? ' ' : ', '}
          </Text>
        ))}
      </Text>

      <Text margin="x2" size="x3" weight="x2">
        {fromISO(date)}
      </Text>
    </Link>
  );
};

export default PublicationComponent;
