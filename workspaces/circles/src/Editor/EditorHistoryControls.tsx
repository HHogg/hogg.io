import { RotateCcw, RotateCwIcon } from 'lucide-react';
import { Appear, Box, Button, Buttons, Text } from 'preshape';
import useEditorContext from './useEditorContext';

export default function EditorHistoryControls() {
  const { editorHistory } = useEditorContext();

  return (
    <Box absolute="top-left" padding="x4">
      <Buttons gap="x4">
        <Appear visible={editorHistory.canUndo || editorHistory.canRedo}>
          <Button
            gap="x2"
            disabled={!editorHistory.canUndo}
            onClick={editorHistory.pop}
            variant="tertiary"
          >
            <RotateCcw size={16} />
            <Text>Undo</Text>
          </Button>
        </Appear>

        <Appear visible={editorHistory.canRedo}>
          <Button
            gap="x2"
            disabled={!editorHistory.canRedo}
            onClick={editorHistory.replay}
            variant="tertiary"
          >
            <RotateCwIcon size={16} />
            <Text>Redo</Text>
          </Button>
        </Appear>
      </Buttons>
    </Box>
  );
}
