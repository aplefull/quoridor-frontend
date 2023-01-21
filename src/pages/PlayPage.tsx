// LIBRARIES
import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
// REDUX
import { Player, restartGame, AppDispatch, RootState } from '@redux';
// UTILS
import { getRandomGif, isCurrentPlayerTurn } from '@utils';
// COMPONENTS
import { Playfield } from '@components';
// STYLES
import styles from '@styles/pages/play-page.module.scss';
import 'react-toastify/dist/ReactToastify.css';

type TEndScreenProps = {
  winner: Player;
  player: Player;
};

const EndScreen = ({ winner, player }: TEndScreenProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleRestart = () => {
    dispatch(restartGame());
  };

  return (
    <div className={styles.endScreen}>
      {winner === player ? <p>You won, congrats!</p> : <p>You'll get it next time...</p>}
      <img src={getRandomGif(winner === player)} alt="" />
      <button onClick={handleRestart}>Restart!</button>
    </div>
  );
};

type TPlayScreenProps = {
  player: Player;
  turn: Player;
  playerOneWallsLeft: number;
  playerTwoWallsLeft: number;
};

const PlayScreen = ({ player, playerTwoWallsLeft, playerOneWallsLeft, turn }: TPlayScreenProps) => {
  const opponentWalls = player === 'Two' ? playerOneWallsLeft : playerTwoWallsLeft;
  const ownWalls = player === 'Two' ? playerTwoWallsLeft : playerOneWallsLeft;
  const turnText = isCurrentPlayerTurn(player, turn) ? 'Your turn' : "Opponent's turn";

  return (
    <>
      <p className={styles.currentTurn}>{turnText}</p>
      <p className={styles.wallsCount}>{`Opponent's walls: ${opponentWalls}`}</p>
      <Playfield />
      <p className={styles.wallsCount}>{`Your walls: ${ownWalls}`}</p>
    </>
  );
};

export const PlayPage = () => {
  const { winner, turn, player, playerOneWallsLeft, playerTwoWallsLeft } = useSelector(
    (state: RootState) => state.playfield
  );
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (!params.player && player) {
      navigate(`/play/${params.roomId}/${player}`);
    }
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {!winner && (
          <PlayScreen
            turn={turn}
            player={player}
            playerOneWallsLeft={playerOneWallsLeft}
            playerTwoWallsLeft={playerTwoWallsLeft}
          />
        )}
        {winner && <EndScreen winner={winner} player={player} />}
        <ToastContainer
          newestOnTop
          closeOnClick
          draggable
          hideProgressBar={false}
          pauseOnFocusLoss={false}
          pauseOnHover={false}
          closeButton={false}
          autoClose={3000}
          limit={3}
          position="bottom-right"
          toastClassName="toast-body"
          bodyClassName="toast-content"
          className="toast-container"
          progressClassName="toast-progress-bar"
        />
      </div>
    </div>
  );
};
