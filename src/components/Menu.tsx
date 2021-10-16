import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPlayer, setData, setInitialData, setRoomId, startGame } from '../redux/slices/playfiedSlice';
import { v4, validate } from 'uuid';
import { createNewRoom, joinRoom } from '../redux/slices/playfiedSlice';
import { RootState } from '../redux/store';
import { socket } from '../utils/api';
import { useHistory } from 'react-router-dom';

const Menu = () => {
  const [state, setState] = useState('initial');
  const id = useMemo(() => v4(), []);
  const dispatch = useDispatch();
  const history = useHistory();

  const {
    isGameStarted,
    player,
    roomId,
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
    [id]
  );

  useEffect(() => {
    console.log(winner);
    if (state === 'waiting') {
      dispatch(setRoomId(id));
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
  }, [state, id, player]);

  useEffect(() => {
    if (isGameStarted) history.push('/play');
  }, [history, isGameStarted]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected');
    });

    socket.on('message', (data) => {
      dispatch(setData(data));
    });

    socket.on('initialData', (data) => {
      if (roomId !== null) {
        dispatch(
          setInitialData({
            turn: data.turn,
            player: data.initialPlayer === 'One' ? 'Two' : 'One',
          })
        );
        dispatch(startGame());

        socket.emit('startGame', { isGameStarted: true, id: roomId });
      }
    });
  }, [roomId]);

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
          <>
            <p>Paste in your code:</p>
            <input type="text" onChange={handleIdInput} />
          </>
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
          <>
            <p>Waiting for second player to join...</p>
            <p>Copy this code and send to second player:</p>
            <div>
              <p>{id}</p>
              <button>Copy</button>
            </div>
          </>
        );
      default:
        return null;
    }
  }, []);

  return <div className="menu">{renderContent(state)}</div>;
};

export default Menu;
