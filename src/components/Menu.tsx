// LIBRARIES
import { ChangeEvent, memo, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4, validate } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Button, Paper, TextInput } from '@mantine/core';
// REDUX
import { Player, selectPlayer, setRoomId, createNewRoom, AppDispatch, RootState } from '@redux';
// STYLES
import styles from '../css/components/menu.module.scss';

// TODO move to constants
const MENU_STATES = {
  INITIAL: 'INITIAL',
  SELECT_PLAYER: 'SELECT_PLAYER',
  JOIN_ROOM: 'JOIN_ROOM',
  WAITING: 'WAITING',
} as const;

type TMenuContentSwitchProps = {
  id: string;
  menuState: keyof typeof MENU_STATES;
  handleStateChange: (state: keyof typeof MENU_STATES) => void;
};

const MenuContentSwitch = memo(({ id, menuState, handleStateChange }: TMenuContentSwitchProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handlePlayerSelect = (value: Player) => () => {
    dispatch(selectPlayer(value));
    dispatch(setRoomId(id));
    dispatch(
      createNewRoom({
        roomId: id,
        player: value,
      })
    );
    handleStateChange(MENU_STATES.WAITING);
  };

  const handleIdInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (validate(e.target.value)) {
      navigate(`/play/${e.target.value}`);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(id);
  };

  switch (menuState) {
    case MENU_STATES.INITIAL:
      return (
        <>
          <Button radius="lg" className={styles.createNew} onClick={() => handleStateChange(MENU_STATES.SELECT_PLAYER)}>
            Create new room
          </Button>
          <Button radius="lg" className={styles.join} onClick={() => handleStateChange(MENU_STATES.JOIN_ROOM)}>
            Join room
          </Button>
        </>
      );
    case MENU_STATES.SELECT_PLAYER:
      return (
        <>
          <p className={styles.playerSelectText}>Select your color. (Whites go first)</p>
          <div className={styles.playerSelect}>
            {/*TODO use constants for players CHECK ALL USAGES*/}
            <div className={styles.white} onClick={handlePlayerSelect('One')} />
            <div className={styles.black} onClick={handlePlayerSelect('Two')} />
          </div>
        </>
      );
    case MENU_STATES.JOIN_ROOM:
      return (
        <div className={styles.joinContainer}>
          <p>Paste in your code:</p>
          <TextInput onChange={handleIdInput} />
        </div>
      );
    case MENU_STATES.WAITING:
      return (
        <div className={styles.waiting}>
          <p>Waiting for second player to join...</p>
          <p>Copy this code and send to second player:</p>
          <div>
            <p className={styles.id}>{id}</p>
            <Button onClick={handleCopy}>Copy</Button>
          </div>
        </div>
      );
    default:
      return null;
  }
});

export const Menu = memo(() => {
  const [menuState, setMenuState] = useState<keyof typeof MENU_STATES>(MENU_STATES.INITIAL);

  const id = useMemo(() => v4(), []);
  const navigate = useNavigate();

  const { isGameStarted, player } = useSelector((state: RootState) => state.playfield);

  const handleReturn = () => {
    setMenuState(MENU_STATES.INITIAL);
  };

  // TODO maybe use global callback on game start
  useEffect(() => {
    if (isGameStarted) navigate(`/play/${id}/${player}`);
  }, [navigate, isGameStarted, id, player]);

  return (
    <div className={styles.menu}>
      <Paper className={styles.innerContainer} shadow="sm" radius="md" p="sm" withBorder>
        <MenuContentSwitch handleStateChange={setMenuState} menuState={menuState} id={id} />
      </Paper>
      {menuState !== MENU_STATES.INITIAL && (
        <span className={styles.return} onClick={handleReturn}>
          Return
        </span>
      )}
    </div>
  );
});
