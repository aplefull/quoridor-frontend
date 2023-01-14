import { memo } from 'react';
import classNames from 'classnames';
import { move, Position } from '../redux/slices/playfiedSlice';
import { some } from 'lodash';
import { availableMovesWithPlayer, isCurrentPlayerTurn } from '../utils/utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import styles from '../css/components/cell.module.scss';

export type TCellProps = {
  containsPlayerOne: boolean;
  containsPlayerTwo: boolean;
  canGoHere: boolean;
  isCurrentTurn: boolean;
  position: Position;
  size: number;
};

const Cell = memo(({ containsPlayerOne, containsPlayerTwo, canGoHere, isCurrentTurn, position, size }: TCellProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { playerOnePos, playerTwoPos, player, placed, turn } = useSelector((state: RootState) => state.playfield);

  const handleClick = () => {
    if (
      some(availableMovesWithPlayer(playerOnePos, playerTwoPos, player, placed), position) &&
      isCurrentPlayerTurn(turn, player)
    ) {
      dispatch(move(position));
    }
  };

  const style = {
    width: `${size}px`,
    height: `${size}px`,
  }

  return (
    <div
      style={style}
      onClick={handleClick}
      className={classNames(styles.tile, { [styles.canGo]: canGoHere, [styles.active]: isCurrentTurn })}
    >
      {containsPlayerOne && <div className={styles.playerOne} />}
      {containsPlayerTwo && <div className={styles.playerTwo} />}
    </div>
  );
});

export default Cell;
