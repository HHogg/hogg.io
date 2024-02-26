import { FileJsonIcon, FileImageIcon } from 'lucide-react';
import { MenuConfigEntryAction, ConfigMenu, Box } from 'preshape';
import useEditorContext from './useEditorContext';

const canSave = typeof window !== 'undefined' && window.Blob !== undefined;

export default function EditorDownloadMenu() {
  const { isDownloadMenuOpen, saveAsJson, saveAsSvg } = useEditorContext();

  const undoConfig: MenuConfigEntryAction = {
    label: 'JSON',
    icon: FileJsonIcon,
    type: 'action',
    disabled: !canSave,
    onAction: saveAsJson,
  };

  const redoConfig: MenuConfigEntryAction = {
    label: 'SVG',
    icon: FileImageIcon,
    type: 'action',
    disabled: !canSave,
    onAction: saveAsSvg,
  };

  return (
    <Box
      absolute="top-right"
      padding="x4"
      style={{ pointerEvents: isDownloadMenuOpen ? undefined : 'none' }}
    >
      <ConfigMenu
        config={[undoConfig, redoConfig]}
        visible={isDownloadMenuOpen}
        title="Export options"
      />
    </Box>
  );
}
