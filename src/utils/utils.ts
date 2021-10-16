import { Player, Position } from '../redux/slices/playfiedSlice';
import { filter, intersectionWith, isEqual, isEmpty } from 'lodash';
import { ELEMENTS, PLAYFIELD_SIZE } from '../constants';

const isBetween = (num: number, val1: number, val2: number) => {
  const min = Math.min(val1, val2);
  const max = Math.max(val1, val2);

  return num > min && num < max;
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

export const isLegalWallPlacement = (newCoords: Position[], walls: Position[]) => {
  return isEmpty(intersectionWith(walls, newCoords, isEqual));
};

export const isCurrentPlayerTurn = (turn: Player, currentPlayer: Player) => {
  return turn === currentPlayer;
};

export const getWallCoords = (desirablePos: Position, wallType: string) => {
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
