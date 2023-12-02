import {
  DownloadIcon,
  DropletIcon,
  Edit2Icon,
  EyeIcon,
  FileIcon,
  RotateCcwIcon,
  RotateCwIcon,
} from 'lucide-react';
import { useMatchMedia, Button, Buttons, Box } from 'preshape';
import { TypeMode } from './Editor';

const canSave = typeof window !== 'undefined' && window.Blob !== undefined;

interface Props {
  canRedo: boolean;
  canUndo: boolean;
  mode: TypeMode;
  onChangeMode: (mode: TypeMode) => void;
  onClear: () => void;
  onRedo: () => void;
  onSaveJSON: () => void;
  onSavePNG: () => void;
  onUndo: () => void;
}

const EditorControls = (props: Props) => {
  const match = useMatchMedia(['600px', '800px']);
  const {
    canUndo,
    canRedo,
    mode,
    onChangeMode,
    onClear,
    onRedo,
    onSaveJSON,
    onSavePNG,
    onUndo,
  } = props;

  return (
    <Box
      alignChildrenHorizontal="between"
      alignChildrenVertical="middle"
      flex={match('800px') ? 'horizontal' : 'vertical'}
      gap={match('800px') ? 'x6' : 'x3'}
      onMouseUp={(event) => event.nativeEvent.stopPropagation()}
      padding="x6"
      width="100%"
    >
      <Box flex={match('800px') ? 'horizontal' : 'vertical'} gap="x4">
        <Buttons joined>
          <Button
            active={mode === 'draw'}
            gap="x1"
            grow={!match('800px')}
            onClick={() => onChangeMode('draw')}
          >
            <Box>
              <Edit2Icon size="1rem" />
            </Box>
            <Box>Draw</Box>
          </Button>

          <Button
            active={mode === 'fill'}
            gap="x1"
            grow={!match('800px')}
            onClick={() => onChangeMode('fill')}
          >
            <Box>
              <DropletIcon size="1rem" />
            </Box>
            <Box>Fill</Box>
          </Button>

          <Button
            active={mode === 'view'}
            gap="x1"
            grow={!match('800px')}
            onClick={() => onChangeMode('view')}
          >
            <Box>
              <EyeIcon size="1rem" />
            </Box>
            <Box>View</Box>
          </Button>
        </Buttons>

        <Buttons joined>
          <Button
            disabled={!canUndo}
            gap="x1"
            grow={!match('800px')}
            onClick={() => onUndo()}
          >
            <Box>
              <RotateCcwIcon size="1rem" />
            </Box>
            <Box>Undo</Box>
          </Button>

          <Button
            disabled={!canRedo}
            gap="x1"
            grow={!match('800px')}
            onClick={() => onRedo()}
          >
            <Box>
              <RotateCwIcon size="1rem" />
            </Box>
            <Box>Redo</Box>
          </Button>
        </Buttons>
      </Box>

      <Box flex={match('800px') ? 'horizontal' : 'vertical'} gap="x4">
        <Buttons joined>
          <Button
            disabled={!canSave}
            gap="x1"
            grow={!match('800px')}
            onClick={() => onSaveJSON()}
          >
            <Box>
              <DownloadIcon size="1rem" />
            </Box>
            <Box>JSON</Box>
          </Button>

          <Button
            disabled={!canSave}
            gap="x1"
            grow={!match('800px')}
            onClick={() => onSavePNG()}
          >
            <Box>
              <DownloadIcon size="1rem" />
            </Box>
            <Box>SVG</Box>
          </Button>
        </Buttons>

        <Buttons joined>
          <Button
            color="negative"
            gap="x1"
            grow={!match('800px')}
            onClick={() => onClear()}
          >
            <Box>
              <FileIcon size="1rem" />
            </Box>
            <Box>Clear</Box>
          </Button>
        </Buttons>
      </Box>
    </Box>
  );
};

export default EditorControls;
