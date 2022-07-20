export default {
  name: '❓Math.random',
  average: 110,
  points: 4,
  score: 6,
  content: `/**
 * The heuristic function will be run on every cell, and should return a number. The number that is returned will be used to determine the path of the snake.
 *
 * @param [number, number] cell Coordinates of the cell to return a value for
 * @param number xLength The number of cells across the x axis
 * @param number yLength The number of cells across the y axis
 * @param [number, number][] snake Coordinates of the position of the snake from head to tail. E.g. [[4, 1], [3, 1]]
 * @param [number, number] point Coordinates of the point.
 *
 * @returns number The value for the cell
 */
function heuristic(cell, xLength, yLength, snake, point) {
  return Math.random();
}`,
};
