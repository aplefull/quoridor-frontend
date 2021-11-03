import React, { useCallback, useEffect } from 'react';
import { ELEMENTS, PLAYFIELD_INITIAL_STATE, ROW_TYPES } from '../constants';
import cx from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { hover, move, place, Position, postGameData, rejoinRoom, restartGame } from '../redux/slices/playfiedSlice';
import { toast, ToastContainer } from 'react-toastify';
import { RootState } from '../redux/store';
import { some } from 'lodash';
import { useLocation } from 'react-router-dom';
import {
  doesPlayerHaveWalls,
  getFromLocalStorage,
  getWallCoords,
  isBlockingPath,
  isCurrentPlayerTurn,
  isLegalMove,
  isLegalWallPlacement,
  wallClassName,
} from '../utils/utils';

import 'react-toastify/dist/ReactToastify.css';

const Playfield = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const playfieldState = useSelector((state: RootState) => state.playfield);
  const {
    hovered,
    placed,
    winner,
    turn,
    player,
    roomId,
    playerOneWallsLeft,
    playerTwoWallsLeft,
    playerOnePos,
    playerTwoPos,
  } = playfieldState;

  const renderElement = useCallback(
    ({ row, col }: Position) => {
      const name = PLAYFIELD_INITIAL_STATE[row].content[col].type;
      const isWall = name === ELEMENTS.HORIZONTAL_WALL || name === ELEMENTS.VERTICAL_WALL;
      const containsPlayer = row === playerOnePos.row && col === playerOnePos.col;
      const containsEnemy = row === playerTwoPos.row && col === playerTwoPos.col;

      const className = cx({
        tile: name === ELEMENTS.TILE,
        wall: isWall,
        horizontal: name === ELEMENTS.HORIZONTAL_WALL,
        vertical: name === ELEMENTS.VERTICAL_WALL,
        intersection: name === ELEMENTS.INTERSECTION,
        hovered: some(hovered, { row, col }),
        placed: some(placed, { row, col }),
        [wallClassName(name, hovered, placed, { row, col })]: true,
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
          isLegalWallPlacement(newWallCoords, placed) &&
          doesPlayerHaveWalls(player, playerOneWallsLeft, playerTwoWallsLeft) &&
          isCurrentPlayerTurn(turn, player)
        ) {
          dispatch(hover(newWallCoords));
        }
      };

      const handleClick = (type: string) => () => {
        const newWallCoords = getWallCoords({ row, col }, type);

        if (isBlockingPath(playerOnePos, playerTwoPos, newWallCoords, placed) && isCurrentPlayerTurn(turn, player)) {
          toast("You can't place a wall here!");
          return;
        }

        if (
          isLegalWallPlacement(newWallCoords, placed) &&
          doesPlayerHaveWalls(player, playerOneWallsLeft, playerTwoWallsLeft) &&
          isCurrentPlayerTurn(turn, player)
        ) {
          dispatch(place(newWallCoords));
        }
      };

      const handleTileClick = () => () => {
        if (
          isLegalMove(playerOnePos, playerTwoPos, { row, col }, player, placed) &&
          isCurrentPlayerTurn(turn, player)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playfieldState]
  );

  const handleRestart = useCallback(() => {
    dispatch(restartGame({ roomId }));
  }, [roomId, dispatch]);

  useEffect(() => {
    if (roomId !== null) {
      dispatch(
        postGameData({
          playerOnePos: playerOnePos,
          playerTwoPos: playerTwoPos,
          playerOneWallsLeft: playerOneWallsLeft,
          playerTwoWallsLeft: playerTwoWallsLeft,
          placed: placed,
          turn: turn,
          winner: winner,
          id: roomId,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerOnePos, playerTwoPos, playerOneWallsLeft, playerTwoWallsLeft]);

  useEffect(() => {
    if (location.pathname === '/play' && getFromLocalStorage('roomId') && getFromLocalStorage('player')) {
      const roomId = getFromLocalStorage('roomId');
      const player = getFromLocalStorage('player');

      dispatch(rejoinRoom({ roomId, player }));
    }
  }, []);

  return (
    <div className="container">
      {!winner && (
        <>
          <p className="current-turn">{isCurrentPlayerTurn(turn, player) ? 'Your turn' : 'Enemy turn'}</p>
          <p className="walls-count">{`Enemy walls: ${player === 'Two' ? playerOneWallsLeft : playerTwoWallsLeft}`}</p>
          <div className={cx('playfield', { upsideDown: player === 'Two' })}>
            {PLAYFIELD_INITIAL_STATE.map((row, i) => (
              <div key={`${i}-row`} className={cx({ row, small: row.type === ROW_TYPES.SMALL })}>
                {row.content.map((el, j) => (
                  <React.Fragment key={`${j}-element`}>{renderElement({ row: i, col: j })}</React.Fragment>
                ))}
              </div>
            ))}
          </div>
          <p className="walls-count">{`Your walls: ${player === 'One' ? playerOneWallsLeft : playerTwoWallsLeft}`}</p>
        </>
      )}
      {winner && (
        <div className="end-screen">
          {winner === player ? <p>You won, congrats!</p> : <p>You'll get it next time...</p>}
          <img src="https://gifgifmagazine.com/uploads/gif/content_image_5fe780e452618.gif" alt="" />
          <button onClick={handleRestart}>Restart!</button>
        </div>
      )}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        pauseOnFocusLoss={false}
        draggable={true}
        pauseOnHover={false}
        limit={3}
        closeButton={false}
        toastClassName="toast-body"
        bodyClassName="toast-content"
        className="toast-container"
        progressClassName="toast-progress-bar"
      />
    </div>
  );
};

export default Playfield;
