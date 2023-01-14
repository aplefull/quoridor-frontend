import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Player, restartGame } from '../redux/slices/playfiedSlice';
import { ToastContainer } from 'react-toastify';
import { AppDispatch, RootState } from '../redux/store';
import { useNavigate, useParams } from 'react-router-dom';
import { getRandomGif, isCurrentPlayerTurn } from '../utils/utils';

import globalStyles from '../css/global.module.scss';
import styles from '../css/pages/play.module.scss';
import 'react-toastify/dist/ReactToastify.css';
import { Playfield } from '../components/Playfield';

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

const Play = () => {
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
    <div className={globalStyles.wrapper}>
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
