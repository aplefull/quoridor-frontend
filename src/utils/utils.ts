// LIBRARIES
import path from 'ngraph.path';
import createGraph from 'ngraph.graph';
import { filter, intersectionWith, isEqual, isEmpty, concat, some, sample } from 'lodash';
// REDUX
import { Player, Position } from '@redux';
// CONSTANTS
import { ELEMENTS, PLAYFIELD_INITIAL_STATE, PLAYFIELD_SIZE, gifs } from '@constants';

const isBetween = (num: number, val1: number, val2: number) => {
  const min = Math.min(val1, val2);
  const max = Math.max(val1, val2);

  return num > min && num < max;
};

const notNull = <T>(value: T | null): value is T => {
  return value !== null;
};

const getMoveDirection = (currentPos: Position, desirablePos: Position) => {
  const rowOffset = currentPos.row - desirablePos.row;
  const colOffset = currentPos.col - desirablePos.col;

  switch (true) {
    case rowOffset < 0:
      return 'DOWN';

    case rowOffset > 0:
      return 'UP';

    case colOffset < 0:
      return 'RIGHT';

    case colOffset > 0:
      return 'LEFT';

    default:
      return null;
  }
};

export const isLegalMove = (
  playerOnePos: Position,
  playerTwoPos: Position,
  desirablePos: Position,
  currentPlayer: Player,
  walls: Position[]
) => {
  const currentPlayerPosition = currentPlayer === 'One' ? playerOnePos : playerTwoPos;
  const enemyPosition = currentPlayer === 'One' ? playerTwoPos : playerOnePos;

  const rowDiff = Math.abs(desirablePos.row - currentPlayerPosition.row);
  const colDiff = Math.abs(desirablePos.col - currentPlayerPosition.col);

  const tooFar = rowDiff + colDiff > 2;
  const samePos = rowDiff + colDiff === 0;
  const enemyObstructing = isEqual(desirablePos, enemyPosition);

  if (tooFar || samePos || enemyObstructing) return false;

  const direction = getMoveDirection(currentPlayerPosition, desirablePos);
  if (direction === 'LEFT' || direction === 'RIGHT') {
    return !filter(walls, (el) => el.row === currentPlayerPosition.row).some((el) =>
      isBetween(el.col, currentPlayerPosition.col, desirablePos.col)
    );
  } else {
    return !filter(walls, (el) => el.col === currentPlayerPosition.col).some((el) =>
      isBetween(el.row, currentPlayerPosition.row, desirablePos.row)
    );
  }
};

export const availableMoves = (currentPosition: Position, walls: Position[]) => {
  const possiblePositions: Position[] = [
    { row: currentPosition.row - 2, col: currentPosition.col },
    { row: currentPosition.row + 2, col: currentPosition.col },
    { row: currentPosition.row, col: currentPosition.col - 2 },
    { row: currentPosition.row, col: currentPosition.col + 2 },
  ];

  return possiblePositions.filter((position) => {
    return isLegalMove(currentPosition, currentPosition, position, 'One', walls) && !isOutOfBounds(position);
  });
};

export const availableMovesWithPlayer = (
  playerOnePos: Position,
  playerTwoPos: Position,
  currentPlayer: Player,
  walls: Position[]
) => {
  const currentPosition = currentPlayer === 'One' ? playerOnePos : playerTwoPos;
  const enemyPosition = currentPlayer === 'One' ? playerTwoPos : playerOnePos;

  const possiblePositions: Position[] = [
    { row: currentPosition.row - 2, col: currentPosition.col },
    { row: currentPosition.row + 2, col: currentPosition.col },
    { row: currentPosition.row, col: currentPosition.col - 2 },
    { row: currentPosition.row, col: currentPosition.col + 2 },
  ].filter(
    (position) => isLegalMove(playerOnePos, playerTwoPos, position, currentPlayer, walls) && !isOutOfBounds(position)
  );

  if (isEnemyNearby(playerOnePos, playerTwoPos)) {
    const moveDir = getMoveDirection(currentPosition, enemyPosition);
    let newMove;
    switch (moveDir) {
      case 'UP':
        newMove = { row: currentPosition.row - 4, col: currentPosition.col };
        break;
      case 'DOWN':
        newMove = { row: currentPosition.row + 4, col: currentPosition.col };
        break;
      case 'LEFT':
        newMove = { row: currentPosition.row, col: currentPosition.col - 4 };
        break;
      case 'RIGHT':
        newMove = { row: currentPosition.row, col: currentPosition.col + 4 };
        break;
      default:
        newMove = { row: currentPosition.row - 4, col: currentPosition.col };
    }

    if (!isOutOfBounds(newMove) && isLegalMove(enemyPosition, enemyPosition, newMove, currentPlayer, walls)) {
      possiblePositions.push(newMove);
    } else {
      getFourAdjacentPositions(enemyPosition)
        .filter((pos) => {
          return isLegalMove(enemyPosition, currentPosition, pos, 'One', walls);
        })
        .forEach((pos) => {
          possiblePositions.push(pos);
        });
    }
  }

  return possiblePositions;
};

export const getFourAdjacentPositions = (position: Position): Position[] => {
  return [
    { row: position.row - 2, col: position.col },
    { row: position.row + 2, col: position.col },
    { row: position.row, col: position.col - 2 },
    { row: position.row, col: position.col + 2 },
  ];
};

export const isOutOfBounds = (position: Position) => {
  return !(position.col >= 0 && position.col <= PLAYFIELD_SIZE && position.row >= 0 && position.row <= PLAYFIELD_SIZE);
};

export const isEnemyNearby = (playerOnePos: Position, playerTwoPos: Position) => {
  const rowDiff = Math.abs(playerOnePos.row - playerTwoPos.row);
  const colDiff = Math.abs(playerOnePos.col - playerTwoPos.col);

  return rowDiff + colDiff <= 2;
};

export const isLegalWallPlacement = (newCoords: Position[], walls: Position[]) => {
  return isEmpty(intersectionWith(walls, newCoords, isEqual));
};

export const isCurrentPlayerTurn = (turn: Player, currentPlayer: Player) => {
  return turn === currentPlayer;
};

export const doesPlayerHaveWalls = (player: Player, playerOneWalls: number, playerTwoWalls: number) => {
  if (player === 'One') return playerOneWalls > 0;
  else return playerTwoWalls > 0;
};

export const getWallCoords = (desirablePos: Position, wallType: string): Position[] => {
  if (wallType === ELEMENTS.VERTICAL_WALL) {
    return desirablePos.row === PLAYFIELD_SIZE
      ? [
          { row: desirablePos.row, col: desirablePos.col },
          { row: desirablePos.row - 1, col: desirablePos.col },
          { row: desirablePos.row - 2, col: desirablePos.col },
        ]
      : [
          { row: desirablePos.row, col: desirablePos.col },
          { row: desirablePos.row + 1, col: desirablePos.col },
          { row: desirablePos.row + 2, col: desirablePos.col },
        ];
  } else if (wallType === ELEMENTS.HORIZONTAL_WALL) {
    return desirablePos.col === PLAYFIELD_SIZE
      ? [
          { row: desirablePos.row, col: desirablePos.col },
          { row: desirablePos.row, col: desirablePos.col - 1 },
          { row: desirablePos.row, col: desirablePos.col - 2 },
        ]
      : [
          { row: desirablePos.row, col: desirablePos.col },
          { row: desirablePos.row, col: desirablePos.col + 1 },
          { row: desirablePos.row, col: desirablePos.col + 2 },
        ];
  }
  return [];
};

export const isBlockingPath = (
  playerOnePos: Position,
  playerTwoPos: Position,
  newCoords: Position[],
  placed: Position[]
) => {
  const allWalls = concat(newCoords, placed);
  const graph = createGraph();

  const playerOneGoal = PLAYFIELD_INITIAL_STATE[0]
    .map((el, i) => (el === ELEMENTS.TILE ? `0-${i}` : null))
    .filter(notNull);
  const playerTwoGoal = PLAYFIELD_INITIAL_STATE[PLAYFIELD_SIZE].map((el, i) =>
    el === ELEMENTS.TILE ? `16-${i}` : null
  ).filter(notNull);

  const allPositions = PLAYFIELD_INITIAL_STATE.map((row, i) =>
    row.map((el, j) => (el === ELEMENTS.TILE ? { row: i, col: j } : null))
  )
    .flat()
    .filter(notNull);

  const nodes = allPositions.map((pos) => `${pos.row}-${pos.col}`);

  nodes.forEach((node) => {
    graph.addNode(node);
  });

  allPositions.forEach((position) => {
    availableMoves(position, allWalls)
      .map((pos) => `${pos.row}-${pos.col}`)
      .forEach((node) => {
        graph.addLink(`${position.row}-${position.col}`, node);
      });
  });

  const pathFinder = path.aStar(graph);

  const canPlayerOneReachGoal = playerOneGoal.some(
    (node) => pathFinder.find(`${playerOnePos.row}-${playerOnePos.col}`, node).length > 0
  );
  const canPlayerTwoReachGoal = playerTwoGoal.some(
    (node) => pathFinder.find(`${playerTwoPos.row}-${playerTwoPos.col}`, node).length > 0
  );

  return !(canPlayerOneReachGoal && canPlayerTwoReachGoal);
};

export const isHorizontalIntersection = (wall: Position, walls: Position[]) => {
  const { row, col } = wall;
  return some(walls, { row: row, col: col + 1 }) && some(walls, { row: row, col: col - 1 });
};

export const isVerticalIntersection = (wall: Position, walls: Position[]) => {
  const { row, col } = wall;
  return some(walls, { row: row + 1, col: col }) && some(walls, { row: row - 1, col: col });
};

export const getRandomGif = (isWinner: boolean) => {
  return isWinner ? sample(gifs.win) : sample(gifs.lose);
};
