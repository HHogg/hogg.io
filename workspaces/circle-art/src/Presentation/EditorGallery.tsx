import { Grid } from 'preshape';
import EditorGalleryItem from './EditorGalleryItem';
import configurations, { GalleryItem } from './configurations';

export type EditorGalleryProps = {
  onSelect: (item: GalleryItem) => void;
};

export default function EditorGallery({ onSelect }: EditorGalleryProps) {
  return (
    <Grid gap="x4" repeatWidthMin="160px" repeatWidthMax="1fr">
      {configurations.map((item) => (
        <EditorGalleryItem
          item={item}
          key={item.name}
          onSelect={() => onSelect(item)}
        />
      ))}
    </Grid>
  );
}
