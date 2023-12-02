import classNames from 'classnames';
import { saveAs } from 'file-saver';
import { Box, useResizeObserver } from 'preshape';
import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';
import useGraph, { Circle } from '../../IntersectionExplorer/useGraph';
import { CircleArtData } from '../types';
import {
  CURSOR_DEFAULT,
  CURSOR_DRAW,
  CURSOR_FILL,
  CURSOR_MOVE,
  getCursor,
  setCursor,
} from '../utils/cursor';
import isPointOverCircleEdge from '../utils/math/isPointOverCircleEdge';
import isPointWithinCircle from '../utils/math/isPointWithinCircle';
import EditorCircle from './EditorCircle';
import EditorControls from './EditorControls';
import EditorIntersection from './EditorIntersection';
import EditorToolbar from './EditorToolbar';
import useEditorHistory from './useEditorHistory';
import './Editor.css';

export type TypeMode = 'draw' | 'fill' | 'view';

type MinimalEvent = {
  clientX: number;
  clientY: number;
  target: null | EventTarget;
  type: string;
};

type Props = {
  data?: CircleArtData;
  onChange: () => void;
};

const COPY_OFFSET = 25;
const TOLERANCE_CREATE_CIRCLE = 30;
const TOLERANCE_SELECT_CIRCLE = 3;

const onMouseDownGlobal = () => {
  document.body.style.userSelect = 'none';
};

const onMouseUpGlobal = () => {
  document.body.style.userSelect = '';
};

const minimalEvent = (event: TouchEvent | React.TouchEvent): MinimalEvent => ({
  clientX: event.touches[0]?.clientX,
  clientY: event.touches[0]?.clientY,
  target: event.target,
  type: event.type,
});

const Editor = ({ data, onChange }: Props) => {
  const [{ width, height }, ref] = useResizeObserver();

  const refActiveCircle = useRef<Circle | null>(null);
  const refCirclesContainer = useRef<SVGGElement>(null);
  const refContainer = useRef<SVGSVGElement>(null);
  const refIsAdding = useRef(false);
  const refIsDirty = useRef(false);
  const refIsMoving = useRef(false);
  const refIsPointerDown = useRef(false);
  const refIsResizing = useRef(false);
  const refNotifyChange = useRef(false);
  const refPointerPosition = useRef<[number, number]>([-1, -1]);
  const refQueueActiveUpdate = useRef(false);

  const [activeCircle, setActiveCircle] = useState<Circle | null>(null);
  const [toolbarRect, setToolbarRect] = useState<DOMRect | null>(null);
  const [fills, setFills] = useState(data?.fills || {});
  const [mode, setMode] = useState<TypeMode>('view');

  const [circles, setCircles] = useState<Circle[]>([]);
  const editorHistory = useEditorHistory();

  const { graph } = useGraph(circles, {
    findTraversalsOnUpdate: mode === 'fill' || mode === 'view',
  });

  const handleSetCircles: typeof setCircles = useCallback(
    (circles) => {
      setCircles(circles);
      refNotifyChange.current && onChange();
    },
    [setCircles, onChange]
  );

  const handleSetFills: typeof setFills = useCallback(
    (fills) => {
      setFills(fills);
      refNotifyChange.current && onChange();
    },
    [onChange]
  );

  const getScaledCircles = useCallback(
    (data: CircleArtData) => {
      const scale = Math.min(width / data.width, height / data.height);
      const tx = (width - data.width * scale) * 0.5;
      const ty = (height - data.height * scale) * 0.5;

      return data.circles.map(({ id, radius, x, y }) => ({
        id,
        radius: radius * scale,
        x: x * scale + tx,
        y: y * scale + ty,
      }));
    },
    [height, width]
  );

  const handleSaveJSON = () => {
    saveAs(
      new Blob(
        [
          JSON.stringify(
            {
              height,
              width,
              circles,
              fills,
            },
            null,
            2
          ),
        ],
        {
          type: 'text/json;charset=utf-8',
        }
      ),
      `CircleArt-export_${Date.now()}.json`
    );
  };

  const handleSavePNG = () => {
    if (refContainer.current) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(refContainer.current);

      saveAs(
        new Blob(
          [
            `<?xml version="1.0" encoding="UTF-8"?>
${svgString}
`,
          ],
          {
            type: 'text/svg;charset=utf-8',
          }
        ),
        `CircleArt-export_${Date.now()}.svg`
      );
    }
  };

  const handleClear = () => {
    handleSetCircles([]);
    setMode('draw');
    handleSetActiveCircle(null);
    handleSetToolbarRect(null);
    editorHistory.commit();
  };

  const handleSetMode = (nextMode: TypeMode) => {
    const currentMode = mode;
    refIsDirty.current = true;
    editorHistory.push(
      () => {
        setMode(nextMode);
        handleSetActiveCircle(null);
        handleSetToolbarRect(null);
      },
      {
        undo: () => {
          setMode(currentMode);
        },
      }
    );
  };

  const handleSetToolbarRect = (circle: Circle | null) => {
    if (circle && refContainer.current) {
      const { left, top } = refContainer.current.getBoundingClientRect();
      const { x, y, radius } = circle;

      setToolbarRect(
        new DOMRect(
          left + (x - radius),
          top + (y - radius),
          radius * 2,
          radius * 2
        )
      );
    } else {
      setToolbarRect(null);
    }
  };

  const getNewCircle = (
    x: number,
    y: number,
    radius: number = 0,
    id = v4()
  ): Circle => ({
    id,
    radius,
    x,
    y,
  });

  const getActiveCircleElement = () => {
    if (refCirclesContainer.current && refActiveCircle.current) {
      for (const element of refCirclesContainer.current.children) {
        if (element.id === refActiveCircle.current.id) {
          return element;
        }
      }
    }

    return null;
  };

  const getCircleAtCoordinates = useCallback(
    (x: number, y: number, padding: number) => {
      for (let i = graph.circles.length - 1; i >= 0; i--) {
        const { x: cx, y: cy, radius } = graph.circles[i];

        if (isPointWithinCircle(x, y, cx, cy, radius, padding)) {
          return graph.circles[i];
        }
      }

      return null;
    },
    [graph.circles]
  );

  const getRelativeCoordinates = ({ clientX, clientY }: MinimalEvent) => {
    if (refContainer.current) {
      const { left, top } = refContainer.current.getBoundingClientRect();
      const x = clientX - left;
      const y = clientY - top;
      const [startX, startY] = refPointerPosition.current;
      const deltaX = x - startX;
      const deltaY = y - startY;

      return {
        deltaX,
        deltaY,
        x,
        y,
      };
    }

    return {
      deltaX: 0,
      deltaY: 0,
      x: 0,
      y: 0,
    };
  };

  const handleSetActiveCircle = useCallback((circle: Circle | null) => {
    refActiveCircle.current = circle;
    setActiveCircle(circle);
  }, []);

  const handleAddCircle = useCallback(
    (circle: Circle) => {
      handleSetCircles((circles) => [...circles, circle]);
      handleSetActiveCircle(circle);
    },
    [handleSetCircles, handleSetActiveCircle]
  );

  const handleRemoveCircle = useCallback(
    (circle: Circle) => {
      editorHistory.push(
        () => {
          handleSetCircles((circles) =>
            circles.filter(({ id }) => circle.id !== id)
          );
          handleSetActiveCircle(null);
          handleSetToolbarRect(null);
        },
        {
          undo: () => {
            handleAddCircle(circle);
          },
        }
      );
    },
    [editorHistory, handleAddCircle, handleSetCircles, handleSetActiveCircle]
  );

  const handleUpdateCircle = useCallback(
    (update: Circle) => {
      handleSetCircles((circles) =>
        circles.map((circle) => (circle.id === update.id ? update : circle))
      );
    },
    [handleSetCircles]
  );

  const handleCopyActiveCircle = () => {
    if (refActiveCircle.current) {
      const circle = getNewCircle(
        refActiveCircle.current.x + COPY_OFFSET,
        refActiveCircle.current.y + COPY_OFFSET,
        refActiveCircle.current.radius
      );

      editorHistory.push(
        () => {
          handleAddCircle(circle);
          handleSetToolbarRect(circle);
        },
        {
          undo: () => handleRemoveCircle(circle),
        }
      );
    }
  };

  const handleMoveActiveCircle = useCallback(
    (deltaX: number, deltaY: number) => {
      const circle = refActiveCircle.current;
      const element = getActiveCircleElement();

      if (circle && element) {
        const x = circle.x + deltaX;
        const y = circle.y + deltaY;

        element.setAttribute('cx', x.toString());
        element.setAttribute('cy', y.toString());

        refQueueActiveUpdate.current = true;
      }
    },
    []
  );

  const handleRemoveActiveCircle = useCallback(() => {
    if (refActiveCircle.current) {
      handleRemoveCircle(refActiveCircle.current);
    }
  }, [handleRemoveCircle]);

  const handleResizeActiveCircle = useCallback((x: number, y: number) => {
    const circle = refActiveCircle.current;
    const element = getActiveCircleElement();

    if (circle && element) {
      const radius = Math.hypot(x - circle.x, y - circle.y);

      element.setAttribute('r', radius.toString());

      refQueueActiveUpdate.current = true;
    }
  }, []);

  const handleToggleFilled = (id: string) => {
    editorHistory.push(
      () => {
        handleSetFills((fills) => ({ ...fills, [id]: !fills[id] }));
      },
      {
        undo: () => {
          handleSetFills((fills) => ({ ...fills, [id]: !fills[id] }));
        },
      }
    );
  };

  const handleMouseDown = useCallback(
    (event: MinimalEvent) => {
      refIsPointerDown.current = true;
      onMouseDownGlobal();

      if (mode === 'draw') {
        const { x, y } = getRelativeCoordinates(event);
        const circle = getCircleAtCoordinates(x, y, TOLERANCE_SELECT_CIRCLE);

        handleSetActiveCircle(circle);

        if (circle) {
          refPointerPosition.current = [x, y];

          if (
            isPointOverCircleEdge(
              x,
              y,
              circle.x,
              circle.y,
              circle.radius,
              TOLERANCE_SELECT_CIRCLE
            )
          ) {
            refIsResizing.current = true;
          } else {
            refIsMoving.current = true;
          }
        }
      }
    },
    [getCircleAtCoordinates, handleSetActiveCircle, mode]
  );

  const handleMouseUp = useCallback(() => {
    onMouseUpGlobal();

    if (refActiveCircle.current) {
      if (refQueueActiveUpdate.current) {
        const element = getActiveCircleElement();

        if (element) {
          const currentCircle = refActiveCircle.current;
          const updatedCircle: Circle = {
            id: currentCircle.id,
            radius: parseFloat(element.getAttribute('r') || '0'),
            x: parseFloat(element.getAttribute('cx') || '0'),
            y: parseFloat(element.getAttribute('cy') || '0'),
          };

          const update = (circle: Circle) => {
            handleUpdateCircle(circle);
            handleSetActiveCircle(circle);
            handleSetToolbarRect(circle);
          };

          if (updatedCircle.radius < TOLERANCE_CREATE_CIRCLE) {
            handleRemoveActiveCircle();
          } else if (refIsAdding.current) {
            editorHistory.push(() => update(updatedCircle), {
              undo: () => handleRemoveCircle(updatedCircle),
              redo: () => {
                handleAddCircle(updatedCircle);
                handleSetToolbarRect(updatedCircle);
              },
            });
          } else {
            editorHistory.push(() => update(updatedCircle), {
              undo: () => update(currentCircle),
            });
          }
        }
      } else {
        handleSetToolbarRect(refActiveCircle.current);
      }
    } else {
      handleSetToolbarRect(null);
    }

    refIsAdding.current = false;
    refIsPointerDown.current = false;
    refIsMoving.current = false;
    refIsResizing.current = false;
  }, [
    editorHistory,
    handleAddCircle,
    handleUpdateCircle,
    handleRemoveActiveCircle,
    handleRemoveCircle,
    handleSetActiveCircle,
  ]);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      handleMouseUp();

      if (refContainer.current?.contains(event.target as Node)) {
        event.preventDefault();
      }
    },
    [handleMouseUp]
  );

  const handleDrag = useCallback(
    (event: MinimalEvent) => {
      if (mode === 'draw') {
        const { deltaX, deltaY, x, y } = getRelativeCoordinates(event);

        if (refActiveCircle.current) {
          setToolbarRect(null);

          if (refIsResizing.current) {
            handleResizeActiveCircle(x, y);
          } else {
            handleMoveActiveCircle(deltaX, deltaY);
          }
        } else if (Math.hypot(deltaX, deltaY) > TOLERANCE_CREATE_CIRCLE) {
          handleAddCircle(getNewCircle(x, y));
          refIsAdding.current = true;
          refIsResizing.current = true;
        }
      }
    },
    [handleAddCircle, handleMoveActiveCircle, handleResizeActiveCircle, mode]
  );

  const handleMouseMoveDraw = useCallback(
    (event: MinimalEvent) => {
      const { x, y } = getRelativeCoordinates(event);
      const circle = getCircleAtCoordinates(x, y, TOLERANCE_SELECT_CIRCLE);

      if (circle) {
        if (
          isPointOverCircleEdge(
            x,
            y,
            circle.x,
            circle.y,
            circle.radius,
            TOLERANCE_SELECT_CIRCLE
          )
        ) {
          setCursor(refContainer.current, getCursor(x, y, circle.x, circle.y));
        } else {
          setCursor(refContainer.current, CURSOR_MOVE);
        }
      } else {
        setCursor(refContainer.current, CURSOR_DRAW);
      }
    },
    [getCircleAtCoordinates]
  );

  const handleMouseMoveFill = useCallback(
    (event: MinimalEvent) => {
      const { x, y } = getRelativeCoordinates(event);
      const circle = getCircleAtCoordinates(x, y, TOLERANCE_SELECT_CIRCLE);

      if (circle) {
        setCursor(refContainer.current, CURSOR_FILL);
      } else {
        setCursor(refContainer.current, CURSOR_DEFAULT);
      }
    },
    [getCircleAtCoordinates]
  );

  const handleMouseMove = useCallback(
    (event: MinimalEvent) => {
      if (refIsPointerDown.current) {
        return handleDrag(event);
      }

      if (mode === 'draw') handleMouseMoveDraw(event);
      if (mode === 'fill') handleMouseMoveFill(event);
    },
    [handleDrag, handleMouseMoveDraw, handleMouseMoveFill, mode]
  );

  useEffect(() => {
    if (width && height && data) {
      refNotifyChange.current = false;
      handleSetCircles(getScaledCircles(data));
      handleSetFills(data.fills);
      refNotifyChange.current = true;
    }
  }, [data, width, height, handleSetCircles, getScaledCircles, handleSetFills]);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchEnd]);

  const classes = classNames('CircleArt', `CircleArt--mode-${mode}`);

  return (
    <Box className={classes} flex="vertical" grow ref={ref}>
      <Box basis="0" container grow minHeight="400px" overflow="hidden">
        <Box
          absolute="center"
          height={height}
          onMouseDown={handleMouseDown}
          onTouchMove={(e) => handleMouseMove(minimalEvent(e))}
          onTouchStart={(e) => handleMouseDown(minimalEvent(e))}
          preserveAspectRatio="xMidYMid meet"
          ref={refContainer}
          tag="svg"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
        >
          {mode === 'draw' && (
            <g ref={refCirclesContainer}>
              {graph.circles
                .sort((a, b) => b.radius - a.radius)
                .map(({ id, radius, x, y }) => (
                  <EditorCircle
                    active={activeCircle?.id === id}
                    id={id}
                    key={id}
                    radius={radius}
                    x={x}
                    y={y}
                  />
                ))}
            </g>
          )}

          {(mode === 'fill' || mode === 'view') && (
            <g>
              {graph.traversals.map((traversal) => (
                <EditorIntersection
                  filled={fills[traversal.bitset.toString()]}
                  graph={graph}
                  key={traversal.bitset.toString()}
                  onClick={
                    mode === 'fill'
                      ? () => handleToggleFilled(traversal.bitset.toString())
                      : undefined
                  }
                  traversal={traversal}
                />
              ))}

              {graph.circles
                .filter((_, i) =>
                  graph.edges.every(({ circle }) => circle !== i)
                )
                .map(({ id, radius, x, y }) => (
                  <EditorCircle
                    active={activeCircle?.id === id}
                    filled={id ? fills[id] : undefined}
                    id={id}
                    key={id}
                    onClick={
                      mode === 'fill' && id
                        ? () => handleToggleFilled(id)
                        : undefined
                    }
                    radius={radius}
                    x={x}
                    y={y}
                  />
                ))}
            </g>
          )}
        </Box>
      </Box>

      <EditorToolbar
        rect={toolbarRect}
        onCopy={handleCopyActiveCircle}
        onDelete={handleRemoveActiveCircle}
      />

      <EditorControls
        canRedo={editorHistory.canRedo}
        canUndo={editorHistory.canUndo}
        mode={mode}
        onChangeMode={handleSetMode}
        onClear={handleClear}
        onRedo={editorHistory.replay}
        onSaveJSON={handleSaveJSON}
        onSavePNG={handleSavePNG}
        onUndo={editorHistory.pop}
      />
    </Box>
  );
};

export default Editor;
