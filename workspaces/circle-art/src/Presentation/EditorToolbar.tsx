import { CopyIcon, Trash2Icon } from 'lucide-react';
import { Button, Buttons, Placement, PlacementContent } from 'preshape';
import EditorToolbarReference from './EditorToolbarReference';
import useEditorContext from './useEditorContext';

export default function EditorToolbar() {
  const { toolbarRect, copyActiveCircle, removeActiveCircle } =
    useEditorContext();

  return (
    <Placement placement="top" open={!!toolbarRect}>
      <EditorToolbarReference rect={toolbarRect} />

      <PlacementContent
        backgroundColor="text-shade-1"
        padding="x1"
        textColor="background-shade-1"
        withArrow
      >
        <Buttons>
          <Button
            onClick={copyActiveCircle}
            variant="tertiary"
            textColor="background-shade-1"
          >
            <CopyIcon size="1.25rem" />
          </Button>

          <Button
            onClick={removeActiveCircle}
            variant="tertiary"
            textColor="background-shade-1"
          >
            <Trash2Icon size="1.25rem" />
          </Button>
        </Buttons>
      </PlacementContent>
    </Placement>
  );
}
