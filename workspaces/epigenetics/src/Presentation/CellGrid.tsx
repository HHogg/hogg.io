import { Box } from 'preshape';
import { useState, useRef } from 'react';
import { UseSimulationWorkerResult } from '../worker/useSimulationWorker';
import Cell from './Cell';

export type CellGridProps = {
  simulationWorker: UseSimulationWorkerResult;
  width: number;
  height: number;
};

export default function CellGrid({
  simulationWorker,
  width,
  height,
}: CellGridProps) {
  const { dataConfig, readBufferSlice } = simulationWorker;
  const [hoveredCellIndex, setHoveredCellIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!dataConfig) {
    return null;
  }

  const { cellSize } = dataConfig;

  const cellsPerRow = Math.floor(width / cellSize);
  const cellsPerColumn = Math.floor(height / cellSize);

  // Distribute any leftover pixels evenly across all cells
  // This gives us the actual cell dimensions that fill the entire canvas
  const actualCellWidth = width / cellsPerRow;
  const actualCellHeight = height / cellsPerColumn;

  const calculateCellIndex = (
    clientX: number,
    clientY: number
  ): number | null => {
    if (!containerRef.current) {
      return null;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    // Calculate which cell the mouse is over
    const cellX = Math.floor(relativeX / actualCellWidth);
    const cellY = Math.floor(relativeY / actualCellHeight);

    // Clamp to valid cell indices
    const clampedCellX = Math.min(Math.max(0, cellX), cellsPerRow - 1);
    const clampedCellY = Math.min(Math.max(0, cellY), cellsPerColumn - 1);

    // Calculate cell index
    return clampedCellX + clampedCellY * cellsPerRow;
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const cellIndex = calculateCellIndex(event.clientX, event.clientY);
    setHoveredCellIndex(cellIndex);
  };

  const handleMouseLeave = () => {
    setHoveredCellIndex(null);
  };

  const handleCellClick = (cellIndex: number) => {
    // Read all relevant per-cell buffers
    const cellBuffers = [
      'genotype_weights',
      'genotype_weights_shifts',
      'phenotype_weights',
      'fitness_scores',
      'partnership_selection_weights',
      'partnership_indexes',
    ];

    cellBuffers.forEach((label) => {
      readBufferSlice(label, cellIndex);
    });
  };

  const cellX =
    hoveredCellIndex !== null ? hoveredCellIndex % cellsPerRow : null;
  const cellY =
    hoveredCellIndex !== null
      ? Math.floor(hoveredCellIndex / cellsPerRow)
      : null;
  const posX = cellX !== null ? cellX * actualCellWidth : 0;
  const posY = cellY !== null ? cellY * actualCellHeight : 0;

  return (
    <Box
      ref={containerRef}
      absolute="edge-to-edge"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {hoveredCellIndex !== null && (
        <Cell
          width={actualCellWidth}
          height={actualCellHeight}
          x={posX}
          y={posY}
          cellIndex={hoveredCellIndex}
          onClick={handleCellClick}
        />
      )}
    </Box>
  );
}
