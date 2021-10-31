import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PLAYFIELD_SIZE } from '../../constants';
import { deleteFromLocalStorage, setToLocalStorage } from '../../utils/utils';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { RootState } from '../store';
import { cloneDeep } from 'lodash';
import { db } from '../../App';

export type Position = {
  row: number;
  col: number;
};

export type Player = 'One' | 'Two';

export type InitialPlayfieldStateType = {
  hovered: Position[];
  placed: Position[];
  playerOnePos: Position;
  playerTwoPos: Position;
  playerOneWallsLeft: number;
  playerTwoWallsLeft: number;
  player: Player;
  turn: Player;
  isGameStarted: boolean;
  roomId: string | null;
  winner: Player | null;
};

const initialState: InitialPlayfieldStateType = {
  hovered: [],
  placed: [],
  playerOnePos: { row: 16, col: 8 },
  playerTwoPos: { row: 0, col: 8 },
  playerOneWallsLeft: 10,
  playerTwoWallsLeft: 10,
  player: 'One',
  turn: 'One',
  isGameStarted: false,
  roomId: null,
  winner: null,
};

export const postGameData = createAsyncThunk('game/postData', async (data: any) => {
  const { id } = data;

  const docRef = doc(db, 'rooms', id);

  await setDoc(
    docRef,
    {
      playerOnePos: data.playerOnePos,
      playerTwoPos: data.playerTwoPos,
      playerOneWallsLeft: data.playerOneWallsLeft,
      playerTwoWallsLeft: data.playerTwoWallsLeft,
      turn: data.turn,
      winner: data.winner,
      placed: data.placed,
      roomId: data.id,
    },
    {
      merge: true,
    }
  );
});
export const createNewRoom = createAsyncThunk('game/createNewRoom', async (data: any, { dispatch }) => {
  const {
    numberOfPlayers,
    player,
    id,
    turn,
    isGameStarted,
    playerOneWallsLeft,
    playerTwoWallsLeft,
    playerOnePos,
    playerTwoPos,
    placed,
    winner,
  } = data;

  const docRef = doc(db, 'rooms', id);

  await setDoc(docRef, {
    numberOfPlayers,
    initialPlayer: player,
    roomId: id,
    turn,
    isGameStarted,
    playerOneWallsLeft,
    playerTwoWallsLeft,
    playerOnePos,
    playerTwoPos,
    placed,
    winner,
  });

  onSnapshot(docRef, (doc) => {
    console.log('new data: ', doc.data());
    dispatch(setData(doc.data()));
  });
});
export const joinRoom = createAsyncThunk('game/joinRoom', async (data: any, { dispatch }) => {
  const { id } = data;

  const docRef = doc(db, 'rooms', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    await setDoc(
      docRef,
      {
        numberOfPlayers: data.numberOfPlayers + 1,
        isGameStarted: true,
      },
      {
        merge: true,
      }
    );

    if (data.roomId !== null) {
      dispatch(
        setInitialData({
          turn: data.turn,
          player: data.initialPlayer === 'One' ? 'Two' : 'One',
        })
      );
      setToLocalStorage('roomId', id);
    }

    onSnapshot(docRef, (doc) => {
      console.log('new data: ', doc.data());
      dispatch(setData(doc.data()));
    });
  }
});
export const rejoinRoom = createAsyncThunk('game/rejoinRoom', async (data: any) => {});
export const leaveRoom = createAsyncThunk('game/leaveRoom', async (data: any) => {
  const { id } = data;

  const docRef = doc(db, 'rooms', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    await setDoc(
      docRef,
      {
        numberOfPlayers: data.numberOfPlayers - 1,
      },
      {
        merge: true,
      }
    );
  }
});

export const move = createAsyncThunk('game/move', async (data: any, { getState, dispatch }) => {
  const state = (getState() as RootState).playfield;
  const newState = cloneDeep(state);

  if (state.player === 'One') {
    newState.playerOnePos = data;
  } else {
    newState.playerTwoPos = data;
  }

  if (data.row === 0 && state.player === 'One') newState.winner = 'One';
  if (data.row === PLAYFIELD_SIZE && state.player === 'Two') newState.winner = 'Two';

  if (state.winner) {
    deleteFromLocalStorage('id');
    dispatch(leaveRoom(state.roomId));
  }

  if (state.turn === 'One') {
    newState.turn = 'Two';
  } else {
    newState.turn = 'One';
  }
  console.log('state:', newState);
  dispatch(
    postGameData({
      playerOnePos: newState.playerOnePos,
      playerTwoPos: newState.playerTwoPos,
      playerOneWallsLeft: newState.playerOneWallsLeft,
      playerTwoWallsLeft: newState.playerTwoWallsLeft,
      placed: newState.placed,
      turn: newState.turn,
      winner: newState.winner,
      id: newState.roomId,
    })
  );
  return newState;
});

const playfieldSlice = createSlice({
  name: 'playfield',
  initialState,
  reducers: {
    hover: (state, action) => {
      state.hovered = action.payload;
    },
    place: (state, action) => {
      state.placed.push(...action.payload);
      if (state.player === 'One') {
        state.playerOneWallsLeft--;
      } else {
        state.playerTwoWallsLeft--;
      }

      if (state.turn === 'One') {
        state.turn = 'Two';
      } else {
        state.turn = 'One';
      }
    },
    selectPlayer: (state, action) => {
      state.player = action.payload;
    },
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setInitialData: (state, action) => {
      state.player = action.payload.player;
      state.turn = action.payload.turn;
    },
    setData: (state, action) => {
      state.turn = action.payload.turn;
      state.roomId = action.payload.roomId;
      state.isGameStarted = action.payload.isGameStarted;
      state.placed = action.payload.placed;
      state.playerOneWallsLeft = action.payload.playerOneWallsLeft;
      state.playerTwoWallsLeft = action.payload.playerTwoWallsLeft;
      state.winner = action.payload.winner;
      //  change them separately so order of keys is not changed
      state.playerOnePos.row = action.payload.playerOnePos.row;
      state.playerOnePos.col = action.payload.playerOnePos.col;
      state.playerTwoPos.row = action.payload.playerTwoPos.row;
      state.playerTwoPos.col = action.payload.playerTwoPos.col;
    },
  },
});

export const { hover, place, selectPlayer, setInitialData, setRoomId, setData } = playfieldSlice.actions;

export default playfieldSlice.reducer;
