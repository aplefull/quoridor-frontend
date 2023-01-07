import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPlayer, setRoomId } from '../redux/slices/playfiedSlice';
import { v4, validate } from 'uuid';
import { createNewRoom, joinRoom } from '../redux/slices/playfiedSlice';
import { AppDispatch, RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import { getFromLocalStorage, setToLocalStorage } from '../utils/utils';
import styles from '../css/components/menu.module.scss';

const Menu = () => {
  const [state, setState] = useState('initial');
  const id = useMemo(() => v4(), []);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isGameStarted, player, playerOnePos, playerTwoPos, playerOneWallsLeft, playerTwoWallsLeft, placed, hovered, winner } =
    useSelector((state: RootState) => state.playfield);

  const handlePlayerSelect = useCallback(
    (value: string) => () => {
      dispatch(selectPlayer(value));
      setState('waiting');
    },
    []
  );

  const handleIdInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
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
          roomId: id,
          player,
          turn: 'One',
          isGameStarted: false,
          playerOnePos,
          playerTwoPos,
          playerOneWallsLeft,
          playerTwoWallsLeft,
          placed,
          hovered,
          winner,
        })
      );
    }
    /// TODO check if adding other deps doesn't break anything
  }, [state, id, player]);

  useEffect(() => {
    if (isGameStarted) navigate(`/play/${id}/${player}`);
  }, [navigate, isGameStarted, id, player]);

  const renderContent = useCallback(
    (type: string) => {
      switch (type) {
        case 'initial':
          return (
            <>
              <button className={styles.createNew} onClick={() => setState('select')}>
                Create new room
              </button>
              <button className={styles.join} onClick={() => setState('join')}>
                Join room
              </button>
            </>
          );
        case 'join':
          return (
            <div className={styles.joinContainer}>
              <p>Paste in your code:</p>
              <input type="text" onChange={handleIdInput} />
            </div>
          );
        case 'select':
          return (
            <>
              <p>Select your color. (Whites go first)</p>
              <div className={styles.playerSelect}>
                <div className={styles.white} onClick={handlePlayerSelect('One')} />
                <div className={styles.black} onClick={handlePlayerSelect('Two')} />
              </div>
            </>
          );
        case 'waiting':
          return (
            <div className={styles.waiting}>
              <p>Waiting for second player to join...</p>
              <p>Copy this code and send to second player:</p>
              <div>
                <p className={styles.id}>{id}</p>
                <button onClick={handleCopy}>Copy</button>
              </div>
            </div>
          );
        default:
          return null;
      }
    },
    [handleIdInput, handlePlayerSelect, id, handleCopy]
  );

  return <div className={styles.menu}>{renderContent(state)}</div>;
};

export default Menu;
