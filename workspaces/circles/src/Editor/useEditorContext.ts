import { Ref, RefObject, createContext, useContext } from 'react';
import { Circle, Graph } from '../useGraph';
import { CircleArtData, MinimalEvent } from './EditorProvider';
import { Mode } from './EditorViewer';
import { History } from './useEditorHistory';

export type EditorContextProps = {
  activeCircle: Circle | null;
  editorHistory: History;
  fills: CircleArtData['fills'];
  graph: Graph;
  height: number;
  isDownloadMenuOpen: boolean;
  mode: Mode;
  refCirclesContainer: Ref<SVGGElement>;
  refSizeContainer: Ref<Element>;
  refSvgContainer: RefObject<SVGSVGElement>;
  toolbarRect: DOMRect | null;
  width: number;
  clearCanvas: () => void;
  closeDownloadMenu: () => void;
  copyActiveCircle: () => void;
  openDownloadMenu: () => void;
  mouseDown: (e: MinimalEvent) => void;
  mouseMove: (e: MinimalEvent) => void;
  removeActiveCircle: () => void;
  setMode: (mode: Mode) => void;
  saveAsJson: () => void;
  saveAsSvg: () => void;
  toggleFill: (id: string) => void;
};

export const EditorContext = createContext<EditorContextProps>({
  activeCircle: null,
  editorHistory: null!,
  fills: {},
  graph: {
    circles: [],
    edges: [],
    nodes: [],
    traversals: [],
  },
  height: 0,
  isDownloadMenuOpen: false,
  mode: 'view',
  refCirclesContainer: null,
  refSizeContainer: null,
  refSvgContainer: { current: null },
  toolbarRect: null,
  width: 0,

  clearCanvas: () => {},
  closeDownloadMenu: () => {},
  copyActiveCircle: () => {},
  mouseDown: () => {},
  mouseMove: () => {},
  openDownloadMenu: () => {},
  removeActiveCircle: () => {},
  saveAsJson: () => {},
  saveAsSvg: () => {},
  setMode: () => {},
  toggleFill: () => {},
});

export default function useEditorContext() {
  return useContext(EditorContext);
}
