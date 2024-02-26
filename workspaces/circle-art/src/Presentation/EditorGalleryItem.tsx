import { useGraph } from '@hogg/circle-intersections';
import { ProjectBackground } from '@hogg/common';
import { Box, Button } from 'preshape';
import EditorViewer from './EditorViewer';
import { GalleryItem } from './configurations';
import useEditorContext from './useEditorContext';

type EditorGalleryItemProps = {
  item: GalleryItem;
  onSelect: (item: GalleryItem) => void;
};

export default function EditorGalleryItem({
  item,
  onSelect,
}: EditorGalleryItemProps) {
  const { setMode } = useEditorContext();
  const { graph } = useGraph(item.config.circles, {
    findTraversalsOnUpdate: true,
  });

  return (
    <Button
      backgroundColor="background-shade-2"
      borderColor="background-shade-4"
      borderSize="x1"
      borderRadius="x2"
      flex="vertical"
      padding="x0"
      onClick={() => {
        onSelect(item);
        setMode('view');
      }}
    >
      <Box alignChildrenVertical="middle" flex="vertical" grow width="100%">
        <ProjectBackground patternSize={0.5} patternGap={10}>
          <EditorViewer
            fills={item.config.fills}
            graph={graph}
            mode="view"
            minHeight="120px"
            width={item.config.width}
            height={item.config.height}
          />
        </ProjectBackground>
      </Box>
    </Button>
  );
}
