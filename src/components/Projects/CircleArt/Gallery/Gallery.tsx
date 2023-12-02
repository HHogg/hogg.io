import { Button, Grid, Image } from 'preshape';
import { CircleArtGalleryItem } from '../types';
import configurations from './configurations';

const Gallery = ({
  onSelect,
}: {
  onSelect: (data: CircleArtGalleryItem) => void;
}) => {
  return (
    <Grid basis="0" gap="x3" grow repeatWidthMin="160px">
      {configurations.map((data) => (
        <Button
          backgroundColor="light-shade-1"
          backgroundColorActive="light-shade-1"
          backgroundColorHover="light-shade-1"
          borderColorActive="accent-shade-5"
          borderColorHover="accent-shade-3"
          borderRadius="x3"
          key={data.name}
          onClick={() => onSelect(data)}
          overflow="hidden"
          variant="tertiary"
        >
          <Image
            src={data.thumbnail as string}
            style={{ transform: 'scale(2)' }}
            width="100%"
          />
        </Button>
      ))}
    </Grid>
  );
};

export default Gallery;
