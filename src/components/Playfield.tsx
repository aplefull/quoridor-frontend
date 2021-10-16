import React, { useCallback, useEffect } from 'react';
import { ELEMENTS, PLAYFIELD_INITIAL_STATE, ROW_TYPES } from '../constants';
import cx from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { hover, move, place, Position, postGameData } from '../redux/slices/playfiedSlice';
import { RootState } from '../redux/store';
import { some } from 'lodash';
import { getWallCoords, isCurrentPlayerTurn, isLegalMove, isLegalWallPlacement } from '../utils/utils';

const Playfield = () => {
  const dispatch = useDispatch();
  const playfieldState = useSelector((state: RootState) => state.playfield);

  const renderElement = useCallback(
    ({ row, col }: Position) => {
      const name = PLAYFIELD_INITIAL_STATE[row].content[col].type;
      const isWall = name === ELEMENTS.HORIZONTAL_WALL || name === ELEMENTS.VERTICAL_WALL;
      const containsPlayer = row === playfieldState.playerOnePos.row && col === playfieldState.playerOnePos.col;
      const containsEnemy = row === playfieldState.playerTwoPos.row && col === playfieldState.playerTwoPos.col;

      const className = cx({
        tile: name === ELEMENTS.TILE,
        wall: isWall,
        horizontal: name === ELEMENTS.HORIZONTAL_WALL,
        vertical: name === ELEMENTS.VERTICAL_WALL,
        intersection: name === ELEMENTS.INTERSECTION,
        hovered: some(playfieldState.hovered, { row, col }),
        placed: some(playfieldState.placed, { row, col }),
      });

      const playerClassName = cx({
        player: containsEnemy,
        enemy: containsPlayer,
      });

      const selectHandler = (element: string, listener: string) => {
        switch (listener) {
          case 'onMouseEnter':
          case 'onMouseLeave':
            switch (element) {
              case ELEMENTS.HORIZONTAL_WALL:
              case ELEMENTS.VERTICAL_WALL:
                return handleHover(name);

              default:
                return undefined;
            }

          case 'onClick':
            switch (element) {
              case ELEMENTS.HORIZONTAL_WALL:
              case ELEMENTS.VERTICAL_WALL:
                return handleClick(name);
              case ELEMENTS.TILE:
                return handleTileClick();
              default:
                return undefined;
            }

          default:
            return undefined;
        }
      };

      const handleHover = (type: string) => (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.type === 'mouseleave') {
          dispatch(hover([]));
          return;
        }

        const newWallCoords = getWallCoords({ row, col }, type);
        if (
          isLegalWallPlacement(newWallCoords, playfieldState.placed) &&
          playfieldState.playerOneWallsLeft > 0 &&
          isCurrentPlayerTurn(playfieldState.turn, playfieldState.player)
        ) {
          dispatch(hover(newWallCoords));
        }
      };

      const handleClick = (type: string) => () => {
        const newWallCoords = getWallCoords({ row, col }, type);
        if (
          isLegalWallPlacement(newWallCoords, playfieldState.placed) &&
          playfieldState.playerOneWallsLeft > 0 &&
          isCurrentPlayerTurn(playfieldState.turn, playfieldState.player)
        ) {
          dispatch(place(newWallCoords));
        }
      };

      const handleTileClick = () => () => {
        if (
          isLegalMove(
            playfieldState.playerOnePos,
            playfieldState.playerTwoPos,
            { row, col },
            playfieldState.player,
            playfieldState.placed
          ) &&
          isCurrentPlayerTurn(playfieldState.turn, playfieldState.player)
        ) {
          dispatch(move({ row, col }));
        }
      };

      return (
        <div
          className={className}
          onMouseEnter={selectHandler(name, 'onMouseEnter')}
          onMouseLeave={selectHandler(name, 'onMouseLeave')}
          onClick={selectHandler(name, 'onClick')}
        >
          {(containsPlayer || containsEnemy) && <div className={playerClassName} />}
        </div>
      );
    },
    [playfieldState]
  );

  useEffect(() => {
    dispatch(
      postGameData({
        playerOnePos: playfieldState.playerOnePos,
        playerTwoPos: playfieldState.playerTwoPos,
        playerOneWallsLeft: playfieldState.playerOneWallsLeft,
        playerTwoWallsLeft: playfieldState.playerTwoWallsLeft,
        placed: playfieldState.placed,
        turn: playfieldState.turn,
        winner: playfieldState.winner,
        id: playfieldState.roomId,
      })
    );
  }, [
    playfieldState.playerOnePos,
    playfieldState.playerTwoPos,
    playfieldState.playerOneWallsLeft,
    playfieldState.playerTwoWallsLeft,
  ]);

  return (
    <div className="container">
      {!playfieldState.winner && (
        <>
          <div className="info">
            <p>Turn: {playfieldState.turn}</p>
            <p>Player one walls: {playfieldState.playerOneWallsLeft}</p>
            <p>Player two walls: {playfieldState.playerTwoWallsLeft} </p>
          </div>
          <div className={cx('playfield', { upsideDown: playfieldState.player === 'Two' })}>
            {PLAYFIELD_INITIAL_STATE.map((row, i) => (
              <div key={`${i}-row`} className={cx({ row, small: row.type === ROW_TYPES.SMALL })}>
                {row.content.map((el, j) => (
                  <React.Fragment key={`${j}-element`}>{renderElement({ row: i, col: j })}</React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
      {playfieldState.winner && (
        <div className="end-screen">
          {playfieldState.winner === playfieldState.player ? (
            <p>You won, congrats!</p>
          ) : (
            <p>You'll get it next time...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Playfield;
