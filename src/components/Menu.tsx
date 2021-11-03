import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPlayer, setRoomId } from '../redux/slices/playfiedSlice';
import { v4, validate } from 'uuid';
import { createNewRoom, joinRoom } from '../redux/slices/playfiedSlice';
import { RootState } from '../redux/store';
import { useHistory } from 'react-router-dom';
import { getFromLocalStorage, setToLocalStorage } from '../utils/utils';

const Menu = () => {
  const [state, setState] = useState('initial');
  const id = useMemo(() => v4(), []);
  const dispatch = useDispatch();
  const history = useHistory();

  const {
    isGameStarted,
    player,
    playerOnePos,
    playerTwoPos,
    playerOneWallsLeft,
    playerTwoWallsLeft,
    placed,
    winner,
  } = useSelector((state: RootState) => state.playfield);

  const handlePlayerSelect = useCallback(
    (value: string) => () => {
      dispatch(selectPlayer(value));
      setState('waiting');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleIdInput = useCallback(
    (e) => {
      if (validate(e.target.value)) {
        dispatch(
          joinRoom({
            id: e.target.value,
          })
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(id);
  }, [id]);

  useEffect(() => {
    if (state === 'waiting') {
      dispatch(setRoomId(id));
      setToLocalStorage('roomId', id);
      setToLocalStorage('player', player);
      dispatch(
        createNewRoom({
          id,
          player,
          numberOfPlayers: 1,
          turn: 'One',
          isGameStarted: false,
          playerOnePos,
          playerTwoPos,
          playerOneWallsLeft,
          playerTwoWallsLeft,
          placed,
          winner,
        })
      );
    }
    /// TODO check if adding other deps doesn't break anything
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, id, player]);

  useEffect(() => {
    if (isGameStarted) history.push('/play');
  }, [history, isGameStarted]);

  useEffect(() => {
    const savedRoomId = getFromLocalStorage('roomId');
    if (savedRoomId) dispatch(setRoomId(savedRoomId));
  });

  const renderContent = useCallback((type: string) => {
    switch (type) {
      case 'initial':
        return (
          <>
            <button className="create-new" onClick={() => setState('select')}>
              Create new room
            </button>
            <button className="join" onClick={() => setState('join')}>
              Join room
            </button>
          </>
        );
      case 'join':
        return (
          <div className="join-container">
            <p>Paste in your code:</p>
            <input type="text" onChange={handleIdInput} />
          </div>
        );
      case 'select':
        return (
          <>
            <p>Select your color. (Whites go first)</p>
            <div className="player-select">
              <div className="white" onClick={handlePlayerSelect('One')} />
              <div className="black" onClick={handlePlayerSelect('Two')} />
            </div>
          </>
        );
      case 'waiting':
        return (
          <div className="waiting">
            <p>Waiting for second player to join...</p>
            <p>Copy this code and send to second player:</p>
            <div>
              <p className="id">{id}</p>
              <button onClick={handleCopy}>Copy</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [handleIdInput, handlePlayerSelect, id]);

  return <div className="menu">{renderContent(state)}</div>;
};

export default Menu;
