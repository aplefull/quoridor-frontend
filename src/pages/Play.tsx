import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { postGameData, rejoinRoom, restartGame } from '../redux/slices/playfiedSlice';
import { ToastContainer } from 'react-toastify';
import { AppDispatch, RootState } from '../redux/store';
import { useLocation } from 'react-router-dom';
import { getRandomGif, isCurrentPlayerTurn } from '../utils/utils';

import globalStyles from '../css/global.module.scss';
import styles from '../css/pages/play.module.scss';
import 'react-toastify/dist/ReactToastify.css';
import { Playfield } from '../components/Playfield';

const Play = () => {
  const { placed, winner, turn, player, roomId, playerOneWallsLeft, playerTwoWallsLeft, playerOnePos, playerTwoPos } =
    useSelector((state: RootState) => state.playfield);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const handleRestart = () => {
    dispatch(restartGame({ roomId }));
  };

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
  }, [playerOnePos, playerTwoPos, playerOneWallsLeft, playerTwoWallsLeft]);

  useEffect(() => {
    const path = location.pathname.split('/').filter(Boolean);
    if (path[0] === 'play') {
      const roomId = path[1];
      const player = path[2];
      dispatch(rejoinRoom({ roomId, player }));
    }
  }, []);

  return (
    <div className={globalStyles.wrapper}>
      <div className={styles.container}>
        {!winner && (
          <>
            <p className={styles.currentTurn}>{isCurrentPlayerTurn(turn, player) ? 'Your turn' : "Opponent's turn"}</p>
            <p className={styles.wallsCount}>{`Opponent's walls: ${
              player === 'Two' ? playerOneWallsLeft : playerTwoWallsLeft
            }`}</p>
            <Playfield />
            <p className={styles.wallsCount}>{`Your walls: ${
              player === 'One' ? playerOneWallsLeft : playerTwoWallsLeft
            }`}</p>
          </>
        )}
        {winner && (
          <div className={styles.endScreen}>
            {winner === player ? <p>You won, congrats!</p> : <p>You'll get it next time...</p>}
            <img src={getRandomGif(winner === player)} alt="" />
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
    </div>
  );
};

export default Play;
