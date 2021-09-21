import { isPointInCircle } from './circle';
import { Edge, getOppositeEndNode } from './edge';
import { appendEdgeToPath } from './traversal';
import { GraphContext } from '.';

export interface ValidationRuleResult {
  number: 1 | 2 | 3 | 4;
  isValid: null | boolean;
  message: string;
}

export type Validations = [
  null | boolean,
  ValidationRuleResult,
  ValidationRuleResult,
  ValidationRuleResult,
  ValidationRuleResult,
];

/**
 *
 */
export const validateIsEdgeBacktracking = (edge: Edge, context: GraphContext): ValidationRuleResult => {
  const { index } = edge;
  const { traversalCurrent } = context;

  if (!traversalCurrent || traversalCurrent.path.length <= 1) {
    return {
      number: 1,
      isValid: true,
      message: 'No edges traversed',
    };
  }

  const previousNode = traversalCurrent.path[traversalCurrent.path.length - 3];
  const isValid = traversalCurrent.path[traversalCurrent.path.length - 2] !== index;

  return {
    number: 1,
    isValid: isValid,
    message: isValid
      ? `[Edge ${index}] does not lead to the previous [Node ${previousNode}]`
      : `[Edge ${index}] leads to the previous [Node ${previousNode}]`,
  };
};


/**
 *
 */
export const validateIsEdgeWithinTraversalBounds = (edge: Edge, context: GraphContext): ValidationRuleResult => {
  const { circles, edges, nodes, traversalCurrent } = context;
  const { index } = edge;

  if (traversalCurrent) {
    for (let i = 1; i < traversalCurrent.path.length; i += 2) {
      const e = traversalCurrent.path[i];
      const a = traversalCurrent.path[i - 1];
      const b = traversalCurrent.path[i + 1];
      const pathEdge = edges[e - nodes.length];
      const nodeCircles = new Set([...nodes[a].circles, ...nodes[b].circles]);

      for (const c of nodeCircles) {
        if (edge.circle !== c && pathEdge.circle !== c) {
          const isPreviousEdgeInCircle = isPointInCircle(pathEdge.x, pathEdge.y, circles[c]);
          const isTargetEdgeInCircle = isPointInCircle(edge.x, edge.y, circles[c]);

          if (isPreviousEdgeInCircle !== isTargetEdgeInCircle) {
            return {
              number: 2,
              isValid: false,
              message: isPreviousEdgeInCircle
                ? `[Edge ${index}] leaves [Circle ${c}], which [Edge ${pathEdge.index}] exists within`
                : `[Edge ${index}] enters [Circle ${c}], which [Edge ${pathEdge.index}] exists outside of`,
            };
          }
        }
      }
    }
  }

  return {
    number: 2,
    isValid: true,
    message: `[Edge ${index}] is within the bounds of all previously traversed circles`,
  };
};

/**
 *
 */
export const validateIsTraversalUnique = (edge: Edge, context: GraphContext): ValidationRuleResult => {
  const { traversalCurrent, traversalCurrentNode, traversalsComplete } = context;
  const endNode = getOppositeEndNode(edge, traversalCurrentNode);

  if (traversalsComplete.length && traversalCurrent && traversalCurrent.path.length > 1 && endNode !== null) {
    const { bitset: bitsetNext } = appendEdgeToPath(traversalCurrent, edge);

    for (let i = 0; i < traversalsComplete.length; i++) {
      const { bitset } = traversalsComplete[i];

      if (bitset.or(bitsetNext).equals(bitset)) {
        return {
          number: 3,
          isValid: false,
          message: `[Edge ${edge.index}] would result in a duplication of [Traversal ${i}]`,
        };
      }
    }
  }

  return {
    number: 3,
    isValid: true,
    message: `After traversing to [Edge ${edge.index}] the traversal will still be unique`,
  };
};

/**
 *
 */
export const validateIsEdgeTraversedTwice = (edge: Edge, context: GraphContext): ValidationRuleResult => {
  const { traversalsComplete } = context;

  for (let i = 0, c = 0; i < traversalsComplete.length && c < 2; i++) {
    if (traversalsComplete[i].bitset.get(edge.index) && ++c === 2) {
      return {
        number: 4,
        isValid: false,
        message: `[Edge ${edge.index}] has been traversed twice before`,
      };
    }
  }


  return {
    number: 4,
    isValid: true,
    message: `[Edge ${edge.index}] has only been traversed once`,
  };
};

/**
 * @param {Edge} edge
 * @param {GraphContext} context
 * @returns {Validations}
 */
export const validateEdge = (edge: Edge, context: GraphContext): Validations => {
  const validations: [
    ValidationRuleResult,
    ValidationRuleResult,
    ValidationRuleResult,
    ValidationRuleResult,
  ] = [
    validateIsEdgeBacktracking(edge, context),
    validateIsEdgeWithinTraversalBounds(edge, context),
    validateIsTraversalUnique(edge, context),
    validateIsEdgeTraversedTwice(edge, context),
  ];

  const isValid = validations.every(({ isValid }) => isValid !== false);

  return [isValid, ...validations];
};
