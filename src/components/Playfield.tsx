import cx from 'classnames';
import { some } from 'lodash';
import { availableMovesWithPlayer, doesPlayerHaveWalls, isCurrentPlayerTurn } from '../utils/utils';
import { PlayfieldElement } from './PlayfieldElement';
import React, { useMemo, useState } from 'react';
import { PLAYFIELD_INITIAL_STATE } from '../constants/constants';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Position } from '../redux/slices/playfiedSlice';
import styles from '../css/components/playfield.module.scss';

export const Playfield = () => {
  const [hovered, setHovered] = useState<Position[]>([]);
  const { placed, turn, player, playerOneWallsLeft, playerTwoWallsLeft, playerOnePos, playerTwoPos } = useSelector(
    (state: RootState) => state.playfield
  );

  const availableMoves = useMemo(() => {
    return availableMovesWithPlayer(playerOnePos, playerTwoPos, player, placed);
  }, [playerOnePos, playerTwoPos, player, placed]);

  const newGrid = PLAYFIELD_INITIAL_STATE.map((row) => row.content).flat();

  const getRowCol = (index: number) => {
    const row = Math.floor(index / 17);
    const col = index % 17;

    return { row, col };
  };

  return (
    <div
      className={cx(styles.playfield, { [styles.upsideDown]: player === 'Two' })}
      style={{ gridTemplateColumns: '6fr 1fr 6fr 1fr 6fr 1fr 6fr 1fr 6fr 1fr 6fr 1fr 6fr 1fr 6fr 1fr 6fr' }}
    >
      {newGrid.map((el, i) => {
        const position = getRowCol(i);
        const { row, col } = position;

        const isHovered = some(hovered, position);
        const canPlace =
          doesPlayerHaveWalls(player, playerOneWallsLeft, playerTwoWallsLeft) && isCurrentPlayerTurn(turn, player);

        const containsPlayerOne = row === playerOnePos.row && col === playerOnePos.col;
        const containsPlayerTwo = row === playerTwoPos.row && col === playerTwoPos.col;

        return (
          <PlayfieldElement
            position={position}
            /*@ts-ignore*/
            type={el.type}
            isActive={el.isActive}
            isHovered={isHovered}
            canPlace={canPlace}
            isPlaced={some(placed, position)}
            onHover={setHovered}
            containsPlayerOne={containsPlayerOne}
            containsPlayerTwo={containsPlayerTwo}
            canGoHere={some(availableMoves, position)}
            isCurrentTurn={isCurrentPlayerTurn(turn, player)}
            key={i}
          />
        );
      })}
    </div>
  );
};
