import type { ClientRectObject } from '@floating-ui/utils';
import { CopyIcon, Trash2Icon } from 'lucide-react';
import { Button, Buttons, Placement, PlacementContent } from 'preshape';
import EditorToolbarReference from './EditorToolbarReference';

interface Props {
  rect: ClientRectObject | null;
  onCopy: () => void;
  onDelete: () => void;
}

export default function EditorToolbar({ rect, onCopy, onDelete }: Props) {
  return (
    <Placement placement="top" open={!!rect}>
      <EditorToolbarReference rect={rect} />

      <PlacementContent
        backgroundColor="text-shade-1"
        padding="x1"
        textColor="background-shade-1"
        theme="night"
        withArrow
      >
        <Buttons>
          <Button
            onClick={onCopy}
            variant="tertiary"
            textColor="background-shade-1"
          >
            <CopyIcon size="1.25rem" />
          </Button>

          <Button
            onClick={onDelete}
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
