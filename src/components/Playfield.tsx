import cx from 'classnames';
import { some } from 'lodash';
import { availableMovesWithPlayer, doesPlayerHaveWalls, isCurrentPlayerTurn } from '../utils/utils';
import { PlayfieldElement } from './PlayfieldElement';
import React, { useCallback, useMemo, useState } from 'react';
import { PLAYFIELD_INITIAL_STATE } from '../constants/constants';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Position } from '../redux/slices/playfiedSlice';
import styles from '../css/components/playfield.module.scss';
import { useWindowSize } from '../utils/hooks';

export const Playfield = () => {
  const { width } = useWindowSize();
  const [hovered, setHovered] = useState<Position[]>([]);
  const { placed, turn, player, playerOneWallsLeft, playerTwoWallsLeft, playerOnePos, playerTwoPos } = useSelector(
    (state: RootState) => state.playfield
  );

  const availableMoves = useMemo(() => {
    return availableMovesWithPlayer(playerOnePos, playerTwoPos, player, placed);
  }, [playerOnePos, playerTwoPos, player, placed]);

  const grid = PLAYFIELD_INITIAL_STATE.flat();

  const getRowCol = (index: number) => {
    const row = Math.floor(index / 17);
    const col = index % 17;

    return { row, col };
  };

  const handleHover = useCallback((pos: Position[]) => {
    setHovered(pos);
  }, []);

  const cellsInRowCount = 9;
  const cellsInColumnCount = 9;
  const verticalWallsInRowCount = 8;
  const horizontalWallsInColumnCount = 8;
  const totalMargin = 4;
  const totalPlayfieldPadding = 30;

  const playfieldSize = width > 763 ? 700 : width * 0.9;
  const adjustedPlayfieldSize = playfieldSize - totalPlayfieldPadding;

  const cellSize = adjustedPlayfieldSize / 11;
  const verticalWallWidth =
    (adjustedPlayfieldSize - cellSize * cellsInRowCount) / verticalWallsInRowCount - totalMargin;
  const verticalWallHeight = cellSize;
  const horizontalWallWidth = cellSize;
  const horizontalWallHeight =
    (adjustedPlayfieldSize - cellSize * cellsInColumnCount) / horizontalWallsInColumnCount - totalMargin;

  const sizes = useMemo(() => {
    return {
      cellSize: Math.floor(cellSize),
      verticalWallWidth: Math.floor(verticalWallWidth),
      verticalWallHeight: Math.floor(verticalWallHeight),
      horizontalWallWidth: Math.floor(horizontalWallWidth),
      horizontalWallHeight: Math.floor(horizontalWallHeight),
    };
  }, [cellSize, verticalWallWidth, verticalWallHeight, horizontalWallWidth, horizontalWallHeight]);

  const style = {
    width: `${playfieldSize}px`,
    height: `${playfieldSize}px`,
  };

  return (
    <div
      className={cx(styles.playfield, { [styles.upsideDown]: player === 'Two' })}
      style={style}
    >
      {grid.map((el, i) => {
        const position = useMemo(() => getRowCol(i), [i]);
        const { row, col } = position;

        const isHovered = some(hovered, position);
        const isPlaced = some(placed, position);
        const canGoHere = some(availableMoves, position);
        const isCurrentTurn = isCurrentPlayerTurn(turn, player);
        const canPlace = doesPlayerHaveWalls(player, playerOneWallsLeft, playerTwoWallsLeft) && isCurrentTurn;

        const containsPlayerOne = row === playerOnePos.row && col === playerOnePos.col;
        const containsPlayerTwo = row === playerTwoPos.row && col === playerTwoPos.col;

        return (
          <PlayfieldElement
            position={position}
            type={el}
            isHovered={isHovered}
            canPlace={canPlace}
            isPlaced={isPlaced}
            onHover={handleHover}
            containsPlayerOne={containsPlayerOne}
            containsPlayerTwo={containsPlayerTwo}
            canGoHere={canGoHere}
            isCurrentTurn={isCurrentTurn}
            key={i}
            sizes={sizes}
          />
        );
      })}
    </div>
  );
};
