import classNames from 'classnames';
import { Box } from 'preshape';
import { MinimalEvent } from './EditorProvider';
import EditorToolbar from './EditorToolbar';
import EditorViewer from './EditorViewer';
import useEditorContext from './useEditorContext';
import './Editor.css';

const minimalEvent = (event: TouchEvent | React.TouchEvent): MinimalEvent => ({
  clientX: event.touches[0]?.clientX,
  clientY: event.touches[0]?.clientY,
  target: event.target,
  type: event.type,
});

const EditorCanvas = () => {
  const {
    activeCircle,
    fills,
    graph,
    height,
    mode,
    refCirclesContainer,
    refSizeContainer,
    refSvgContainer,
    width,
    closeDownloadMenu,
    mouseDown,
    mouseMove,
    toggleFill,
  } = useEditorContext();

  const classes = classNames('CircleArt', `CircleArt--mode-${mode}`);

  return (
    <Box
      className={classes}
      flex="vertical"
      grow
      onClick={closeDownloadMenu}
      ref={refSizeContainer}
    >
      <EditorViewer
        activeCircle={activeCircle}
        fills={fills}
        graph={graph}
        mode={mode}
        width={width}
        height={height}
        refContainer={refSvgContainer}
        refCirclesContainer={refCirclesContainer}
        onIntersectionClick={mode === 'fill' ? toggleFill : undefined}
        onMouseDown={mouseDown}
        onTouchMove={(e) => mouseMove(minimalEvent(e))}
        onTouchStart={(e) => mouseDown(minimalEvent(e))}
      />

      <EditorToolbar />
    </Box>
  );
};

export default EditorCanvas;
